# Helpora Payment System & Stripe Connect Guide

This guide explains how payments are handled securely in Helpora using Stripe Connect.

---

## 1. Payment Flow

- **User pays for a service**: Payment is processed via Stripe and held by the platform (admin).
- **Admin holds payment**: Funds are not released to the helper until the service is marked complete.
- **Admin releases payment**: After service completion, admin verifies and releases payment to the helper using Stripe Connect payouts.
- **Auditability**: All payment actions are logged using Winston.

---

## 2. Stripe Connect Setup

- Create a Stripe account and enable Connect.
- Store your Stripe keys in `.env`:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- Each helper must have a Stripe account (use Stripe onboarding links).
- Use Stripe's `PaymentIntent` for user payments and `Transfers` or `Payouts` for releasing funds to helpers.

---

## 3. Example Payment Release Route

```js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminVerify = require('../middleware/adminVerify');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Release payment to helper
router.post('/release', auth, adminVerify, async (req, res) => {
  try {
    const { paymentIntentId, helperStripeAccountId, amount } = req.body;
    // Transfer funds to helper
    const transfer = await stripe.transfers.create({
      amount: amount, // in cents
      currency: 'usd',
      destination: helperStripeAccountId,
      source_transaction: paymentIntentId
    });
    // Log with Winston here
    res.json({ success: true, transfer });
  } catch (err) {
    // Log error with Winston here
    res.status(500).json({ error: 'Payment release failed.' });
  }
});
module.exports = router;
```

---

## 4. Best Practices

- Always verify admin before releasing payments.
- Log all payment actions.
- Never expose Stripe secrets to the frontend.
- Use Stripe webhooks to track payment status.

---

For more, see Stripe docs: https://stripe.com/docs/connect
