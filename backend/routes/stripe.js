const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Request = require('../models/Request');
const sendEmail = require('../utils/sendEmail');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// @route   POST api/stripe/create-payment-intent
// @desc    Create a Stripe payment intent for donations
// @access  Private
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, volunteerId, description } = req.body;

    // Check if amount is valid
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid amount' });
    }

    // Verify volunteer exists
    const volunteer = await User.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: 'usd',
      metadata: {
        volunteerId: volunteerId,
        userId: req.user.id,
        description: description || 'Donation'
      },
      receipt_email: req.user.email // Send receipt to the user's email
    });

    // Return the client secret
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST api/stripe/payment-success
// @desc    Handle successful payment and record it in the database
// @access  Private
router.post('/payment-success', auth, async (req, res) => {
  try {
    const { 
      paymentIntentId, 
      volunteerId, 
      amount, 
      description 
    } = req.body;

    // Verify the payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment has not been completed successfully' });
    }

    // Create a payment record in our database
    const newPayment = new Payment({
      volunteerId,
      amount: amount / 100, // Convert back from cents to dollars
      status: 'completed',
      paymentMethod: 'credit_card',
      transactionId: paymentIntentId,
      paymentDate: new Date(),
      notes: description || 'Donation via Stripe',
      // For donations, we create a dummy request or mark it as a donation
      requestId: '000000000000000000000000' // Using a placeholder ObjectId
    });

    await newPayment.save();

    res.status(201).json(newPayment);
  } catch (err) {
    console.error('Error recording successful payment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/stripe/publishable-key
// @desc    Get Stripe publishable key
// @access  Public
router.get('/publishable-key', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// @route   POST api/stripe/webhook
// @desc    Stripe webhook for payment events (escrow workflow)
// @access  Public
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      // Find Payment and Request by paymentIntentId
      const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
      if (payment) {
        payment.status = 'held';
        payment.save();
        // Update request
        await Request.findByIdAndUpdate(payment.requestId, { paymentStatus: 'held' });
        // Email user: payment held
        const user = await User.findById(payment.userId);
        if (user && user.email) {
          await sendEmail(user.email, 'Payment Held in Escrow', `Your payment for request #${payment.requestId} is securely held in escrow.`);
        }
      }
      break;
    }
    case 'payment_intent.amount_capturable_updated': {
      // Funds are ready to be captured (release to helper)
      // You may trigger admin notification here if needed
      break;
    }
    case 'payment_intent.canceled':
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
      if (payment) {
        payment.status = 'failed';
        payment.save();
        await Request.findByIdAndUpdate(payment.requestId, { paymentStatus: 'failed' });
      }
      break;
    }
    case 'charge.refunded': {
      // Handle refund logic
      const charge = event.data.object;
      const payment = await Payment.findOne({ stripePaymentIntentId: charge.payment_intent });
      if (payment) {
        payment.status = 'refunded';
        payment.refundId = charge.refunds.data[0]?.id;
        payment.save();
        await Request.findByIdAndUpdate(payment.requestId, { paymentStatus: 'refunded' });
        // Email user: refund processed
        const user = await User.findById(payment.userId);
        if (user && user.email) {
          await sendEmail(user.email, 'Refund Processed', `Your payment for request #${payment.requestId} has been refunded.`);
        }
      }
      break;
    }
    case 'payment_intent.captured': {
      // Payment released to helper
      const paymentIntent = event.data.object;
      const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
      if (payment) {
        payment.status = 'released';
        payment.save();
        await Request.findByIdAndUpdate(payment.requestId, { paymentStatus: 'released', releaseDate: new Date() });
        // Email user and helper: payment released
        const user = await User.findById(payment.userId);
        const helper = await User.findById(payment.volunteerId);
        if (user && user.email) {
          await sendEmail(user.email, 'Payment Released', `Your payment for request #${payment.requestId} has been released to the helper.`);
        }
        if (helper && helper.email) {
          await sendEmail(helper.email, 'Earnings Released', `Payment for your completed service (request #${payment.requestId}) has been released.`);
        }
        // Generate and email PDF invoice
        if (user && user.email) {
          const doc = new PDFDocument();
          const invoicePath = `./uploads/invoice-${payment._id}.pdf`;
          doc.pipe(fs.createWriteStream(invoicePath));
          doc.fontSize(18).text('Helpora Service Invoice', { align: 'center' });
          doc.moveDown();
          doc.fontSize(12).text(`Invoice #: ${payment._id}`);
          doc.text(`Date: ${new Date().toLocaleDateString()}`);
          doc.text(`User: ${user.name} (${user.email})`);
          doc.text(`Helper: ${helper ? helper.name : ''}`);
          doc.text(`Service Request ID: ${payment.requestId}`);
          doc.text(`Amount: ₹${payment.amount}`);
          doc.text('Thank you for using Helpora!');
          doc.end();
          // Email invoice as attachment (simple version)
          setTimeout(async () => {
            await sendEmail(user.email, 'Your Service Invoice', 'Please find your invoice attached.', invoicePath);
            if (helper && helper.email) {
              await sendEmail(helper.email, 'Service Invoice', 'Please find your invoice attached.', invoicePath);
            }
            fs.unlink(invoicePath, () => {}); // Clean up
          }, 2000);
        }
      }
      break;
    }
    default:
      // Unexpected event type
      break;
  }
  res.json({ received: true });
});

module.exports = router;
