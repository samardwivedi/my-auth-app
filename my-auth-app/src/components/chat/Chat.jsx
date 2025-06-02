import React, { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { API_BASE_URL, SOCKET_URL } from '../../config';
import ChatHistory from './ChatHistory';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

export default function Chat({ isAuthenticated = false, userType = null }) {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaultChatId, setDefaultChatId] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [aiTyping, setAiTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [startFreshChat, setStartFreshChat] = useState(true);
  const prevAuthRef = useRef(isAuthenticated);
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    if (prevAuthRef.current !== isAuthenticated) {
      // If logging out, mark chat inactive and clear state
      if (prevAuthRef.current && !isAuthenticated && defaultChatId) {
        try {
          // Try to mark chat as inactive
          axios.patch(`${API_BASE_URL}/api/messages/chat/${defaultChatId}/status`, 
            { isActive: false }
          ).catch(err => console.error('Chat inactive error:', err));
        } catch (error) {
          console.error('Logout cleanup error:', error);
        }
      }
      
      // Reset chat state
      setChatLog([]);
      setDefaultChatId(null);
      setMessage('');
      setStartFreshChat(true);
      
      // Update ref
      prevAuthRef.current = isAuthenticated;
    }
  }, [isAuthenticated, defaultChatId]);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (socketRef.current || !isOnline) return;
    
    try {
      socketRef.current = io(SOCKET_URL, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      socketRef.current.on('connect', () => {
        setConnectionError(null);
      });
      
      socketRef.current.on('connect_error', (error) => {
        setConnectionError('Could not connect to chat server. Please try again later.');
      });

      socketRef.current.on('receive_message', (data) => {
        if (data.sender !== 'user' || !data.fromCurrentUser) {
          setChatLog((prev) => [...prev, data]);
        }
      });
    } catch (error) {
      setConnectionError('Could not initialize chat. Please try again later.');
    }
  }, [isOnline]);

  // Fetch messages for a specific chat
  const fetchMessagesForChat = useCallback(async (chatId) => {
    setLoading(true);
    try {
      const messagesResponse = await axios.get(`${API_BASE_URL}/api/messages/${chatId}`);
      setChatLog(messagesResponse.data.map(msg => ({
        message: msg.message,
        id: msg._id,
        timestamp: msg.timestamp,
        sender: msg.sender
      })));
      setStartFreshChat(false);
    } catch (error) {
      setConnectionError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Handle selecting a chat from history
  const handleSelectChat = useCallback((chat) => {
    setDefaultChatId(chat._id);
    setViewingHistory(false);
    setStartFreshChat(false);
    fetchMessagesForChat(chat._id);
  }, [fetchMessagesForChat]);
  
  // Handle starting a new chat
  const handleNewChat = useCallback((chat) => {
    setDefaultChatId(chat._id);
    setViewingHistory(false);
    setChatLog([]);
    setStartFreshChat(false);
  }, []);

  // Fetch existing messages on load
  useEffect(() => {
    if (!isOnline || viewingHistory) {
      setLoading(false);
      return;
    }
    
    const fetchMessages = async () => {
      try {
        const chatResponse = await axios.get(`${API_BASE_URL}/api/messages/default-chat`);
        const chatId = chatResponse.data.chatId;
        setDefaultChatId(chatId);
        
        if (!startFreshChat) {
          const messagesResponse = await axios.get(`${API_BASE_URL}/api/messages/${chatId}`);
          setChatLog(messagesResponse.data.map(msg => ({
            message: msg.message,
            id: msg._id,
            timestamp: msg.timestamp,
            sender: msg.sender
          })));
        }
      } catch (error) {
        console.error('Message fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    initializeSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [initializeSocket, isOnline, viewingHistory, startFreshChat]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog]);

  // Send message function
  const sendMessage = () => {
    if (!message.trim() || !socketRef.current) return;
    
    const messageData = { 
      message,
      chatId: defaultChatId,
      sender: 'user',
      timestamp: new Date().toISOString(),
      fromCurrentUser: true
    };
    
    try {
      socketRef.current.emit('send_message', messageData);
      setChatLog((prev) => [...prev, messageData]);
      setMessage('');
      setAiTyping(true);
      setTimeout(() => setAiTyping(false), 3000);
    } catch (error) {
      setConnectionError('Failed to send message. Please try again.');
    }
  };

  // If offline or viewing history, show the history component
  if (!isOnline || viewingHistory) {
    return (
      <div>
        {!isOnline && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 mb-4 max-w-md mx-auto">
            <p>You are currently offline. Chat will be available when you're back online.</p>
          </div>
        )}
        <ChatHistory 
          onSelectChat={handleSelectChat} 
          onNewChat={handleNewChat}
          isAuthenticated={isAuthenticated}
          userType={userType}
        />
      </div>
    );
  }

  // Main chat UI
  return (
    <div className="min-h-[60vh] max-w-md mx-auto mt-8 p-6 bg-white rounded-xl shadow-card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-primary-600">Support Chat</h2>
          <div className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Admin</div>
        </div>
        <button 
          onClick={() => setViewingHistory(true)}
          className="text-primary-600 px-3 py-1 text-sm border border-primary-200 rounded-lg flex items-center"
        >
          History
        </button>
      </div>
      
      {/* Error message */}
      {connectionError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4">
          <p>{connectionError}</p>
          <button 
            onClick={() => {
              setLoading(true);
              if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
              }
              initializeSocket();
              setTimeout(() => setLoading(false), 1000);
            }}
          >
            Retry Connection
          </button>
        </div>
      )}
      
      {/* Chat area */}
      <div className="flex-1 bg-gray-50 rounded-xl p-4 mb-5 min-h-[300px] overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-10 h-10 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        ) : chatLog.length > 0 ? (
          <ChatMessages chatLog={chatLog} aiTyping={aiTyping} chatEndRef={chatEndRef} />
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-center">
            <p className="text-gray-500">No messages yet</p>
            <p className="text-gray-400 text-sm mt-1">Start a conversation with the admin for any help or issues.</p>
          </div>
        )}
      </div>
      
      {/* Input area */}
      <ChatInput 
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
        isDisabled={loading || !defaultChatId || !socketRef.current || !isOnline}
        aiTyping={aiTyping}
      />
      
      <div className="mt-3 text-center text-xs text-gray-500">
        <p>This chat connects you directly to the Helpora admin team for support.</p>
      </div>
    </div>
  );
}
