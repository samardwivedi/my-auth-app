const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Basic message content
  message: { type: String, required: true },
  
  // Message type - expanded to support more file types
  contentType: { 
    type: String, 
    enum: ['text', 'image', 'video', 'document', 'audio', 'location'], 
    default: 'text' 
  },
  
  // File metadata for attachments
  attachment: {
    url: { type: String },
    filename: { type: String },
    mimetype: { type: String },
    size: { type: Number }, // in bytes
    dimensions: {
      width: { type: Number },
      height: { type: Number }
    }
  },
  
  // Message metadata
  chatId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Chat', 
    required: true 
  },
  
  // User reference instead of just string
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  sender: { 
    type: String, 
    default: 'user' 
  },
  
  // Status tracking
  status: {
    delivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    readBy: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date }
    }]
  },
  
  // For replies and message threading
  replyTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Message' 
  },
  
  // For search functionality
  searchText: { type: String },
  
  // For moderation
  isDeleted: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  editHistory: [{
    message: { type: String },
    editedAt: { type: Date }
  }],
  
  // Timestamps
  timestamp: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

// Pre-save middleware to update searchText for text search
messageSchema.pre('save', function(next) {
  // Update updatedAt timestamp on modification
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  
  // Generate searchText for text-based messages
  if (this.contentType === 'text') {
    this.searchText = this.message;
  }
  
  next();
});

// Index for text search
messageSchema.index({ searchText: 'text' });

// Index for efficient querying
messageSchema.index({ chatId: 1, timestamp: -1 });

module.exports = mongoose.model('Message', messageSchema);
