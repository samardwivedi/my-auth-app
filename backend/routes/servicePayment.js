const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const Request = require('../models/Request');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');

// @route   GET api/payments/razorpay-key
// @desc    Get Razorpay key ID
// @access  Public
router.get('/razorpay-key', (req, res) => {
  res.json({ razorpayKeyId: process.env.RAZORPAY_KEY_ID });
});

// @route   POST api/payments/service-intent
// @desc    Create a Stripe payment intent for service payments
// @access  Private
router.post('/service-intent', auth, async (req, res) => {
  try {
    const { amount, volunteerId, paymentMethod } = req.body;

    // Check if amount is valid
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid amount' });
    }

    // Verify volunteer exists if provided
    if (volunteerId) {
      const volunteer = await User.findById(volunteerId);
      if (!volunteer) {
        return res.status(404).json({ error: 'Volunteer not found' });
      }
    }

    if (paymentMethod === 'stripe') {
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amount in cents
        currency: 'inr',
        metadata: {
          volunteerId: volunteerId || '',
          userId: req.user.id,
          description: 'Service payment'
        },
        receipt_email: req.user.email // Send receipt to the user's email
      });

      // Return the client secret
      return res.json({ 
        clientSecret: paymentIntent.client_secret 
      });
    } else if (paymentMethod === 'upi') {
      // For UPI, we don't need to create a payment intent,
      // but we'll return a success response to prevent errors
      return res.json({ 
        success: true, 
        message: 'UPI payment method selected',
        upi: true
      });
    } else {
      return res.status(400).json({ error: 'Invalid payment method for service-intent' });
    }
  } catch (err) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST api/payments/service-success
// @desc    Handle successful service payment and record it in the database
// @access  Private
router.post('/service-success', auth, async (req, res) => {
  try {
    const { 
      paymentIntentId, 
      amount, 
      volunteerId
    } = req.body;

    // Verify the payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment has not been completed successfully' });
    }

    // Get or create a request ID
    // In a real implementation, this would be associated with an actual request
    let requestId = paymentIntent.metadata.requestId;
    
    if (!requestId) {
      // Create a temporary request record if needed
      const newRequest = new Request({
        userId: req.user.id,
        volunteerId: volunteerId || '000000000000000000000000', // Placeholder or actual volunteer
        userName: req.user.name,
        contact: req.user.email,
        message: 'Service payment',
        serviceCategory: 'General', // Adding required field
        status: 'requested', // Changed from 'pending' to 'requested' to match the enum values
        paymentStatus: 'held', // changed from 'paid' to 'held'
        paymentIntentId
      });
      
      await newRequest.save();
      requestId = newRequest._id;
    }

    // Create a payment record in our database
    const newPayment = new Payment({
      volunteerId: volunteerId || '000000000000000000000000',
      requestId,
      amount: amount / 100, // Convert back from cents to dollars/rupees
      status: 'completed',
      paymentMethod: 'credit_card',
      transactionId: paymentIntentId,
      paymentDate: new Date(),
      notes: 'Service payment via Stripe'
    });

    // Save payment record to database
    try {
      await newPayment.save();
    } catch (paymentErr) {
      console.error('Error saving payment:', paymentErr);
      return res.status(500).json({ error: 'Failed to save payment', details: paymentErr.message });
    }

    res.status(201).json({
      paymentIntentId,
      amount: amount / 100,
      status: 'completed'
    });
  } catch (err) {
    console.error('Error recording successful payment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST api/payments/razorpay-order
// @desc    Create a Razorpay order for service payments
// @access  Private
router.post('/razorpay-order', auth, async (req, res) => {
  try {
    const { amount, volunteerId } = req.body;
    
    // Check if amount is valid
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid amount' });
    }

    // Verify volunteer exists if provided
    if (volunteerId) {
      const volunteer = await User.findById(volunteerId);
      if (!volunteer) {
        return res.status(404).json({ error: 'Volunteer not found' });
      }
    }

    // Import Razorpay dynamically as it might not be installed yet
    const Razorpay = require('razorpay');
    const razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        userId: req.user.id,
        volunteerId: volunteerId || '',
        paymentType: 'service'
      }
    };
    
    const order = await razorpayInstance.orders.create(options);
    
    // Return the order details needed by the frontend
    res.json({
      orderId: order.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: amount
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

// @route   POST api/payments/upi-initiate
// @desc    Initiate a UPI payment request
// @access  Private
router.post('/upi-initiate', auth, async (req, res) => {
  try {
    const { amount, volunteerId, upiId, note } = req.body;
    
    // Check if amount is valid
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid amount' });
    }
    
    // Verify volunteer exists if provided
    if (volunteerId) {
      const volunteer = await User.findById(volunteerId);
      if (!volunteer) {
        return res.status(404).json({ error: 'Volunteer not found' });
      }
    }
    
    // Generate a unique transaction reference
    const transactionRef = 'UP' + Date.now() + Math.floor(Math.random() * 1000);
    
    // For UPI, we'll just return the payment details that will be used to construct
    // the UPI payment URL or intent on the client side
    res.json({ 
      transactionRef,
      amount,
      upiId: upiId || process.env.DEFAULT_UPI_ID || 'services@ybl',
      merchantName: 'Care Services',
      note: note || 'Service Payment'
    });
  } catch (err) {
    console.error('Error initiating UPI payment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST api/payments/upi-verify
// @desc    Verify UPI payment and save to database
// @access  Private
router.post('/upi-verify', auth, async (req, res) => {
  try {
    const { transactionRef, transactionId, amount, volunteerId, upiId } = req.body;
    
    // Validate required fields
    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    console.log('UPI Verify - Request Body:', req.body);
    console.log('UPI Verify - User:', req.user ? { id: req.user.id, name: req.user.name, email: req.user.email } : 'No user data');
    
    // In a production app, you would verify the transaction with a UPI service
    // Here, we are trusting the client-side verification
    
    try {
      // Create a request record with all required fields
      const newRequest = new Request({
        userId: req.user.id,
        volunteerId: volunteerId || '000000000000000000000000',
        userName: req.user.name || 'Unknown User',
        contact: req.user.email || 'No contact provided',
        message: 'Service payment via UPI',
        serviceCategory: 'General', // Added default value for required field
        status: 'requested',
        paymentStatus: 'held',
        paymentIntentId: transactionId
      });
      
      console.log('UPI Verify - Attempt to save request with data:', {
        userId: req.user.id,
        volunteerId: volunteerId || '000000000000000000000000',
        userName: req.user.name || 'Unknown User'
      });
      
      const savedRequest = await newRequest.save();
      console.log('UPI Verify - Request saved successfully with ID:', savedRequest._id);
      const requestId = savedRequest._id;
      
      // Save payment record to database
      const newPayment = new Payment({
        volunteerId: volunteerId || '000000000000000000000000',
        requestId,
        amount,
        status: 'completed',
        paymentMethod: 'upi',
        transactionId,
        paymentDate: new Date(),
        notes: `Service payment via UPI (${upiId || 'Not provided'})`
      });
      
      console.log('UPI Verify - Attempt to save payment with data:', {
        volunteerId: volunteerId || '000000000000000000000000',
        requestId,
        amount,
        transactionId
      });
      
      const savedPayment = await newPayment.save();
      console.log('UPI Verify - Payment saved successfully with ID:', savedPayment._id);

      // Update paymentStatus of the related request if it exists
      if (requestId) {
        await Request.findByIdAndUpdate(
          requestId,
          { paymentStatus: 'held' },
          { new: true }
        );
      }

      res.status(201).json({
        paymentIntentId: transactionId,
        amount,
        status: 'completed'
      });
    } catch (dbError) {
      console.error('UPI Verify - Database error:', dbError);
      // Check for validation errors
      if (dbError.name === 'ValidationError') {
        const validationErrors = Object.values(dbError.errors).map(err => err.message);
        return res.status(400).json({ 
          error: 'Validation error', 
          details: validationErrors 
        });
      }
      throw dbError; // Rethrow for the outer catch block
    }
  } catch (err) {
    console.error('Error verifying UPI payment:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// @route   POST api/payments/razorpay-verify
// @desc    Verify Razorpay payment and save to database
// @access  Private
router.post('/razorpay-verify', auth, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      volunteerId
    } = req.body;
    
    // Get the key secret from your environment variable
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
      
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }
    
    // Fetch order details to get amount
    const Razorpay = require('razorpay');
    const razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: key_secret
    });
    
    const order = await razorpayInstance.orders.fetch(razorpay_order_id);
    
    // Create or get request ID
    const newRequest = new Request({
      userId: req.user.id,
      volunteerId: volunteerId || '000000000000000000000000', // Placeholder or actual volunteer
      userName: req.user.name,
      contact: req.user.email,
      message: 'Service payment via Razorpay',
      serviceCategory: 'General', // Adding required field
      status: 'requested', // Changed from 'pending' to 'requested' to match the enum values
      paymentStatus: 'held', // changed from 'paid' to 'held'
      paymentIntentId: razorpay_payment_id
    });
    
    await newRequest.save();
    const requestId = newRequest._id;
    
    // Save payment record to database
    const newPayment = new Payment({
      volunteerId: volunteerId || '000000000000000000000000',
      requestId,
      amount: order.amount / 100, // Convert from paise to rupees
      status: 'completed',
      paymentMethod: 'razorpay',
      transactionId: razorpay_payment_id,
      paymentDate: new Date(),
      notes: 'Service payment via Razorpay'
    });
    
    // Save payment record to database
    try {
      await newPayment.save();
    } catch (paymentErr) {
      console.error('Error saving payment:', paymentErr);
      
      // Check for validation errors
      if (paymentErr.name === 'ValidationError') {
        const validationErrors = Object.values(paymentErr.errors).map(err => err.message);
        return res.status(400).json({ 
          error: 'Validation error', 
          details: validationErrors 
        });
      }
      return res.status(500).json({ error: 'Failed to save payment', details: paymentErr.message });
    }
    
    res.status(201).json({
      paymentIntentId: razorpay_payment_id,
      amount: order.amount / 100,
      status: 'completed'
    });
  } catch (err) {
    console.error('Error verifying Razorpay payment:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
