const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminVerify = require('../middleware/adminVerify');
const Payment = require('../models/Payment');
const Request = require('../models/Request');
const User = require('../models/User');
const logger = require('../utils/logger');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @route   POST api/payments
// @desc    Create a new payment
// @access  Private
router.post('/', auth, async (req, res) => {
  const { requestId, amount, paymentMethod, notes } = req.body;
  
  try {
    // Verify the request exists
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Create new payment
    const newPayment = new Payment({
      volunteerId: request.volunteerId,
      requestId,
      amount,
      paymentMethod,
      notes
    });
    
    await newPayment.save();
    
    res.status(201).json(newPayment);
  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/payments
// @desc    Get all payments (can be filtered by userId query param)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (userId) {
      // First get all requests for this user
      const Request = require('../models/Request');
      const requests = await Request.find({ userId });
      const requestIds = requests.map(req => req._id);
      
      // Then find all payments associated with these requests
      const payments = await Payment.find({ requestId: { $in: requestIds } })
        .populate('requestId', 'userName message status')
        .populate('volunteerId', 'name')
        .sort({ createdAt: -1 });
      
      // Transform the data to include helper name
      const formattedPayments = payments.map(payment => ({
        _id: payment._id,
        amount: payment.amount,
        status: payment.status,
        helperName: payment.volunteerId ? payment.volunteerId.name : null,
        date: payment.createdAt,
        requestId: payment.requestId._id,
        requestStatus: payment.requestId.status
      }));
      
      return res.json(formattedPayments);
    }
    
    // If no userId provided, just get all payments (for admin)
    const payments = await Payment.find()
      .populate('requestId', 'userName message')
      .populate('volunteerId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/payments/volunteer/:volunteerId
// @desc    Get all payments for a volunteer
// @access  Private
router.get('/volunteer/:volunteerId', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ volunteerId: req.params.volunteerId })
      .populate('requestId', 'userName message')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error('Error fetching volunteer payments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/payments/me
// @desc    Get all payments for the logged in volunteer
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ volunteerId: req.user.userId })
      .populate('requestId', 'userName message')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error('Error fetching volunteer payments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/payments/:id
// @desc    Get a specific payment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('requestId', 'userName message')
      .populate('volunteerId', 'name email');
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (err) {
    console.error('Error fetching payment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT api/payments/:id
// @desc    Update payment status
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, transactionId, paymentDate } = req.body;
    
    // Find payment
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Update fields
    if (status) payment.status = status;
    if (transactionId) payment.transactionId = transactionId;
    if (paymentDate) payment.paymentDate = paymentDate;
    
    await payment.save();
    
    res.json(payment);
  } catch (err) {
    console.error('Error updating payment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE api/payments/:id
// @desc    Delete a payment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    await payment.remove();
    
    res.json({ message: 'Payment removed' });
  } catch (err) {
    console.error('Error deleting payment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/payments/stats/me
// @desc    Get payment statistics for the logged in volunteer
// @access  Private
router.get('/stats/me', auth, async (req, res) => {
  try {
    // Get total earnings
    const totalEarnings = await Payment.aggregate([
      { $match: { volunteerId: req.user.userId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get pending payments
    const pendingPayments = await Payment.aggregate([
      { $match: { volunteerId: req.user.userId, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get count by payment method
    const paymentMethodStats = await Payment.aggregate([
      { $match: { volunteerId: req.user.userId, status: 'completed' } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
    ]);
    
    // Get monthly earnings for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyEarnings = await Payment.aggregate([
      { 
        $match: { 
          volunteerId: req.user.userId, 
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            month: { $month: '$createdAt' }, 
            year: { $year: '$createdAt' } 
          },
          earnings: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({
      totalEarnings: totalEarnings.length ? totalEarnings[0].total : 0,
      pendingAmount: pendingPayments.length ? pendingPayments[0].total : 0,
      paymentMethodStats,
      monthlyEarnings
    });
  } catch (err) {
    console.error('Error fetching payment statistics:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST api/payments/intent
// @desc    Create a payment intent (hold funds in escrow)
// @access  Private
router.post('/intent', auth, async (req, res) => {
  const { requestId, amount, currency } = req.body;
  try {
    // TODO: Integrate with Stripe or Razorpay to create a payment intent and hold funds
    // Example: const paymentIntent = await stripe.paymentIntents.create({ ... });
    // Save paymentIntentId and status to Request
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    // Simulate payment intent creation
    const paymentIntentId = 'simulated_intent_' + Date.now();
    request.paymentIntentId = paymentIntentId;
    request.paymentStatus = 'held';
    request.amount = amount;
    request.currency = currency || 'INR';
    request.status = 'requested';
    await request.save();
    res.json({ paymentIntentId, status: 'held' });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST api/payments/escrow - User pays, admin holds (escrow)
router.post('/escrow', auth, async (req, res) => {
  const { requestId, amount, paymentMethod } = req.body;
  try {
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    // Simulate escrow by marking payment as held
    const payment = new Payment({
      volunteerId: request.volunteerId,
      requestId,
      amount,
      paymentMethod,
      status: 'escrow',
      escrow: true
    });
    await payment.save();
    request.paymentStatus = 'held';
    await request.save();
    res.json({ success: true, escrow: true, payment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create escrow payment' });
  }
});

// @route   POST api/payments/release - Admin releases payment to helper, deducts 10% fee
router.post('/release', auth, adminVerify, async (req, res) => {
  const { paymentId } = req.body;
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.status !== 'escrow') return res.status(400).json({ error: 'Payment not in escrow' });
    const fee = Math.round(payment.amount * 0.10);
    const payout = payment.amount - fee;
    payment.status = 'released';
    payment.escrow = false;
    payment.released = true;
    payment.adminFee = fee;
    await payment.save();
    // Optionally, update request status
    await Request.findByIdAndUpdate(payment.requestId, { paymentStatus: 'released', status: 'paid' });
    res.json({ success: true, payout, fee });
  } catch (err) {
    res.status(500).json({ error: 'Failed to release payment' });
  }
});

// @route   POST api/payments/refund - Admin refunds user
router.post('/refund', auth, adminVerify, async (req, res) => {
  const { paymentId } = req.body;
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    payment.status = 'refunded';
    payment.escrow = false;
    payment.refunded = true;
    await payment.save();
    // Optionally, update request status
    await Request.findByIdAndUpdate(payment.requestId, { paymentStatus: 'refunded', status: 'cancelled' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to refund payment' });
  }
});

module.exports = router;
