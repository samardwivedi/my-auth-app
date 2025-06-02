const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  // User information
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  userName: { type: String, required: true },
  contact: { type: String, required: true },
  
  // Service details
  message: { type: String, required: true },
  serviceLocation: { type: String },
  serviceCategory: { type: String },
  
  // Service provider/volunteer
  volunteerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Scheduling fields
  scheduledDate: { 
    type: Date
  },
  scheduledTime: {
    type: String
  },
  
  // Urgency level
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Status tracking
  status: { 
    type: String, 
    enum: ['requested', 'accepted', 'in_progress', 'completed', 'paid', 'cancelled', 'declined'],
    default: 'requested'
  },

  // Escrow/payment fields
  paymentIntentId: { type: String }, // Stripe or Razorpay payment intent/ID
  paymentStatus: {
    type: String,
    enum: ['held', 'released', 'refunded', 'failed', 'pending'],
    default: 'pending'
  },
  amount: { type: Number },
  currency: { type: String, default: 'INR' },
  refundRequested: { type: Boolean, default: false },
  adminOverride: { type: Boolean, default: false },

  // Escrow workflow fields
  isCompletedByHelper: { type: Boolean, default: false },
  isConfirmedByUser: { type: Boolean, default: false },
  releaseDate: { type: Date },
  disputeRaised: { type: Boolean, default: false },

  // New fields for tracking
  viewedByHelper: { type: Boolean, default: false },
  cancelDeadline: { type: Date },

  // Status history for tracking changes
  statusHistory: [
    {
      status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rescheduled', 'completed', 'cancelled', 'declined']
      },
      updatedAt: { 
        type: Date, 
        default: Date.now 
      },
      updatedBy: { 
        type: String 
      },
      notes: { 
        type: String 
      }
    }
  ],
  
  // Rating and feedback
  rating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  feedback: { 
    type: String 
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

// Pre-save middleware to update updatedAt timestamp
requestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Request', requestSchema);
