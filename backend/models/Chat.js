const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  name: { type: String, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Track last message for chat preview
  lastMessage: {
    text: { type: String },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date }
  },
  
  // Track typing status
  typingUsers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Track read receipts
  readBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastReadAt: { type: Date, default: Date.now }
  }],
  
  // Track service request if this chat is related to a service
  relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  
  // For search functionality
  searchKeywords: [{ type: String }],
  
  // Chat metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// Method to add typing indicator
chatSchema.methods.addTypingUser = function(userId) {
  // Remove user if already in array
  this.typingUsers = this.typingUsers.filter(user => !user.userId.equals(userId));
  
  // Add user with current timestamp
  this.typingUsers.push({
    userId,
    timestamp: new Date()
  });
  
  return this.save();
};

// Method to remove typing indicator
chatSchema.methods.removeTypingUser = function(userId) {
  this.typingUsers = this.typingUsers.filter(user => !user.userId.equals(userId));
  return this.save();
};

// Method to update read receipt
chatSchema.methods.markReadBy = function(userId) {
  // Find user in readBy array
  const userIndex = this.readBy.findIndex(item => item.userId.equals(userId));
  
  if (userIndex !== -1) {
    // Update existing read receipt
    this.readBy[userIndex].lastReadAt = new Date();
  } else {
    // Add new read receipt
    this.readBy.push({
      userId,
      lastReadAt: new Date()
    });
  }
  
  return this.save();
};

// Index for text search
chatSchema.index({ name: 'text', 'searchKeywords': 'text' });

module.exports = mongoose.model('Chat', chatSchema);
