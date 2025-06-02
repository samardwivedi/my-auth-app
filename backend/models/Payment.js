const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  volunteerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  amount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled', 'released', 'refunded', 'escrow'],
    default: 'pending' 
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'paypal', 'credit_card', 'cash', 'upi'],
    required: true
  },
  transactionId: {
    type: String,
    default: ''
  },
  paymentDate: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  escrow: { type: Boolean, default: false },
  released: { type: Boolean, default: false },
  refunded: { type: Boolean, default: false },
  adminFee: { type: Number, default: 0 },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stripePaymentIntentId: {
    type: String
  },
  receiptUrl: {
    type: String
  },
  refundId: {
    type: String
  },
  timeline: [
    {
      action: { type: String },
      date: { type: Date, default: Date.now },
      by: { type: String }
    }
  ],
});

module.exports = mongoose.model('Payment', paymentSchema);
