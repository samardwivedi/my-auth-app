const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const chatbotAI = require('../utils/chatbotAI');

// Get or create a default chat
router.get('/default-chat', async (req, res) => {
  try {
    // Find or create a default chat
    let defaultChat = await Chat.findOne({ name: 'Default Chat' });
    
    if (!defaultChat) {
      defaultChat = new Chat({
        name: 'Default Chat',
        participants: []
      });
      await defaultChat.save();
    }
    
    res.json({ chatId: defaultChat._id });
  } catch (error) {
    console.error('Error getting default chat:', error);
    res.status(500).json({ error: 'Failed to get default chat' });
  }
});

// Get all messages for a specific chat
router.get('/:chatId', async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .sort({ timestamp: 1 });  // Sort by timestamp in ascending order
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get chat history for a user
router.get('/history/user', auth, async (req, res) => {
  try {
    // Find all chats where the user is a participant
    const chats = await Chat.find({ 
      participants: req.user.id 
    })
    .populate({
      path: 'lastMessage.sender',
      select: 'name'
    })
    .populate({
      path: 'participants',
      select: 'name userType'
    })
    .sort({ updatedAt: -1 });  // Most recent first
    
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Create a new chat
router.post('/chat', async (req, res) => {
  try {
    const { name, participants = [] } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Chat name is required' });
    }
    
    const newChat = new Chat({
      name,
      participants
    });
    
    const savedChat = await newChat.save();
    res.status(201).json(savedChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Update chat status (active/inactive)
router.patch('/chat/:chatId/status', auth, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    if (isActive === undefined) {
      return res.status(400).json({ error: 'isActive status is required' });
    }
    
    const updatedChat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      { isActive },
      { new: true }
    );
    
    if (!updatedChat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json(updatedChat);
  } catch (error) {
    console.error('Error updating chat status:', error);
    res.status(500).json({ error: 'Failed to update chat status' });
  }
});

// Create a new chat session for a user
router.post('/chat/user', auth, async (req, res) => {
  try {
    const { name = 'AI Chat' } = req.body;
    
    // Create a new chat with the user as participant
    const newChat = new Chat({
      name,
      participants: [req.user.id],
      isActive: true
    });
    
    const savedChat = await newChat.save();
    res.status(201).json(savedChat);
  } catch (error) {
    console.error('Error creating user chat:', error);
    res.status(500).json({ error: 'Failed to create user chat' });
  }
});

// Send a new message
router.post('/', async (req, res) => {
  try {
    const { message, chatId, content = 'text', sender = 'user' } = req.body;
    
    // Validate request
    if (!message || !chatId) {
      return res.status(400).json({ error: 'Message and chatId are required' });
    }
    
    // Check if chat exists
    const chatExists = await Chat.findById(chatId);
    if (!chatExists) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Create and save the message
    const newMessage = new Message({
      message,
      chatId,
      content,
      // We're not requiring senderId anymore
      // In a real app with authentication, you would use req.user.id
      sender,
    });
    
    const savedMessage = await newMessage.save();
    
    // Update the lastMessage in the chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        text: message,
        sender: sender === 'user' ? req.user?.id : null,
        timestamp: new Date()
      },
      updatedAt: new Date()
    });
    
    // If the message is from a user, have the AI respond
    if (sender === 'user') {
      // Process the message with AI
      const aiResponse = chatbotAI.processMessage(message);
      
      // Save AI response to database
      const aiMessage = new Message({
        message: aiResponse.message,
        chatId,
        content: 'text',
        sender: 'ai',
        timestamp: new Date()
      });
      
      await aiMessage.save();
      
      // Update the lastMessage in the chat
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: {
          text: aiResponse.message,
          sender: null, // AI sender
          timestamp: new Date()
        },
        updatedAt: new Date()
      });
    }
    
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get AI response to a message
router.post('/ai-response', async (req, res) => {
  try {
    const { message, chatId } = req.body;
    
    // Validate request
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Generate AI response
    const aiResponse = chatbotAI.processMessage(message);
    
    // If chatId is provided, save the response to the database
    if (chatId) {
      // Check if chat exists
      const chatExists = await Chat.findById(chatId);
      if (!chatExists) {
        return res.status(404).json({ error: 'Chat not found' });
      }
      
      // Save AI response to database
      const aiMessage = new Message({
        message: aiResponse.message,
        chatId,
        content: 'text',
        sender: 'ai',
        timestamp: new Date()
      });
      
      await aiMessage.save();
      
      // Update the lastMessage in the chat
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: {
          text: aiResponse.message,
          sender: null, // AI sender
          timestamp: new Date()
        },
        updatedAt: new Date()
      });
    }
    
    res.json(aiResponse);
  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

// Delete a message
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Check if the user is the sender of the message (if senderId exists)
    if (message.senderId && message.senderId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }
    
    await Message.findByIdAndDelete(req.params.messageId);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;
