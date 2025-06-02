# Payment System Guide

This guide provides complete documentation for the payment system implemented in the application, including all supported payment methods, implementation details, and usage instructions.

## Table of Contents

1. [Overview](#overview)
2. [Payment Methods](#payment-methods)
   - [Credit/Debit Card (Stripe)](#creditdebit-card-stripe)
   - [Razorpay](#razorpay)
   - [UPI](#upi)
3. [Implementation Details](#implementation-details)
   - [Backend Models](#backend-models)
   - [Backend Routes](#backend-routes)
   - [Frontend Components](#frontend-components)
4. [Usage Instructions](#usage-instructions)
5. [Troubleshooting](#troubleshooting)
6. [Developer Guide](#developer-guide)

## Overview

The payment system allows users to pay for services using multiple payment methods. Payments are processed securely, and funds are held in escrow until the service is completed, at which point they are released to the volunteer/service provider.

## Payment Methods

### Credit/Debit Card (Stripe)

Stripe integration allows users to pay using credit or debit cards. The implementation uses Stripe Elements for a secure, PCI-compliant payment form.

**Features:**
- Secure card processing
- Real-time validation
- Support for international cards
- Payment intent system for secure processing

**Setup Requirements:**
- Stripe account
- Stripe API keys configured in `.env`

### Razorpay

Razorpay integration provides a popular Indian payment gateway that supports multiple payment methods including credit cards, debit cards, netbanking, wallets, and UPI.

**Features:**
- Multiple payment options in one interface
- Optimized for Indian users
- Automatic currency handling (INR)

**Setup Requirements:**
- Razorpay account
- Razorpay API keys configured in `.env`

### UPI

UPI (Unified Payments Interface) integration allows direct bank-to-bank transfers using popular Indian payment apps like Google Pay, PhonePe, Paytm, etc.

**Features:**
- Fast and convenient mobile payments
- No card details required
- Preferred payment method in India
- Secure transactions

**Supported UPI Apps:**
- Google Pay
- PhonePe
- Paytm
- BHIM
- Any banking app with UPI support

## Implementation Details

### Backend Models

The Payment model (`backend/models/Payment.js`) handles payment transactions with the following fields:

```javascript
{
  volunteerId: ObjectId,      // Volunteer receiving payment
  requestId: ObjectId,        // Service request being paid for
  amount: Number,             // Payment amount
  status: String,             // 'pending', 'completed', 'cancelled'
  paymentMethod: String,      // 'bank_transfer', 'paypal', 'credit_card', 'cash', 'upi', 'razorpay'
  transactionId: String,      // Payment gateway transaction ID
  paymentDate: Date,          // When payment was made
  notes: String,              // Any additional notes
  createdAt: Date             // Record creation timestamp
}
```

### Backend Routes

The application uses the following payment-related API endpoints:

#### General Payment Routes (`/api/payments`)
- `POST /` - Create a new payment
- `GET /volunteer/:volunteerId` - Get all payments for a volunteer
- `GET /me` - Get all payments for the logged-in volunteer
- `GET /:id` - Get a specific payment
- `PUT /:id` - Update payment status
- `DELETE /:id` - Delete a payment
- `GET /stats/me` - Get payment statistics
- `POST /intent` - Create a payment intent (escrow)
- `POST /release` - Release payment after service completion
- `POST /admin-refund` - Admin override for refunds

#### Service Payment Routes
- `GET /razorpay-key` - Get Razorpay key ID
- `POST /service-intent` - Create a Stripe payment intent
- `POST /service-success` - Handle successful Stripe payment
- `POST /razorpay-order` - Create a Razorpay order
- `POST /razorpay-verify` - Verify Razorpay payment
- `POST /upi-initiate` - Initiate a UPI payment
- `POST /upi-verify` - Verify UPI payment

### Frontend Components

The main payment component is `ServicePaymentForm.jsx`, which handles all payment methods in a unified interface. Key components include:

- `StripeContainer.jsx` - Wrapper for Stripe Elements
- `ServicePaymentForm.jsx` - Main payment form handling all methods
- `PaymentDetailsModal.jsx` - Shows payment details
- `TransactionHistory.jsx` - Lists payment history

## Usage Instructions

### For Customers

#### Credit/Debit Card Payment

1. Select "Credit/Debit Card" payment method
2. Click "Continue to Payment"
3. Enter your card details (card number, expiry date, CVC)
4. Click "Pay Now"
5. Wait for payment confirmation

#### Razorpay Payment

1. Select "Razorpay" payment method
2. Click "Pay with Razorpay"
3. In the Razorpay popup, select your preferred payment method:
   - Credit Card
   - Debit Card
   - NetBanking
   - Wallet
   - UPI
4. Complete the payment process
5. Wait for payment confirmation

#### UPI Payment

1. Select "UPI" payment method
2. Enter your UPI ID (e.g., yourname@ybl, yourname@okhdfcbank)
3. Click "Generate UPI Payment"
4. Pay using one of these methods:
   - Scan the UPI QR code using any UPI app
   - Manually enter the UPI ID and reference in your UPI app
5. After completing the payment in your UPI app, enter the Transaction ID in the form
6. Click "Verify Payment"
7. Wait for payment confirmation

### For Administrators

#### Viewing Payment Records

1. Navigate to Admin Dashboard
2. Select "Payments" tab
3. Use filters to find specific payments
4. View payment details by clicking on a payment record

#### Manual Payment Processing

1. Find the payment record
2. Use "Update Status" option to change payment status
3. Add transaction ID and payment date if applicable
4. Save changes

#### Refunding Payments

1. Find the payment record
2. Select "Refund" option
3. Confirm refund action
4. The system will process the refund based on the payment method

## Troubleshooting

### Common Issues

#### Payment Processing Errors

**Issue**: "Payment processing failed" error message
**Solution**: 
- Check internet connection
- Verify payment details
- Try again after a few minutes

#### Card Declined

**Issue**: Credit/debit card is declined
**Solution**:
- Check card details
- Ensure sufficient funds
- Contact bank if issue persists

#### UPI Payment Not Appearing

**Issue**: Payment made through UPI app but not showing in the system
**Solution**:
- Wait for a few minutes (UPI can have delays)
- Verify the Transaction ID was entered correctly
- Contact support with your UPI Transaction ID

#### Razorpay Popup Not Loading

**Issue**: Razorpay payment window doesn't open
**Solution**:
- Check if pop-up is blocked by browser
- Refresh the page and try again
- Try a different browser

### Developer Troubleshooting

- Check browser console for JavaScript errors
- Verify API endpoints are responding correctly
- Ensure environment variables (API keys) are set properly
- Check payment gateway dashboards for transaction status

## Developer Guide

### Adding a New Payment Gateway

1. Create the backend route in `backend/routes/servicePayment.js`
2. Add the new payment method to the enum in `backend/models/Payment.js`
3. Implement the frontend integration in `ServicePaymentForm.jsx`
4. Update the UI to include the new payment option
5. Add necessary environment variables to `.env`

### Testing Payments in Development

Use the following test credentials:

**Stripe Test Cards:**
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Exp: Any future date
- CVC: Any 3 digits

**Razorpay Test Mode:**
- Enable test mode in Razorpay dashboard
- Use test credentials provided by Razorpay

**UPI Testing:**
- In development, the application uses mock data for UPI transactions
- For testing, any UPI ID and transaction ID will be accepted

## Escrow Payment Flow (Recommended)

### How It Works

1. **User submits a service request and pays upfront** using their preferred payment method (Stripe, Razorpay, or UPI).
2. **Payment is held in escrow** by the platform. The helper/volunteer is notified of the new request but does not receive funds yet.
3. **Service is delivered** by the helper.
4. **User marks the service as “completed”** in the app.
5. **Funds are released to the helper** (volunteer/service provider) by the platform. If there is a dispute or issue, the admin can intervene and refund the user if necessary.

### User Flow

1. Fill out the service request form.
2. On the next step, pay the estimated fee (via Stripe, Razorpay, or UPI). Payment is required to submit the request.
3. The request is submitted and payment is held by the platform (escrow).
4. After the service is completed, mark it as “completed” in your dashboard.
5. Funds are released to the helper. If you have an issue, you can open a dispute before marking as completed.

### Admin/Platform Flow

- Admin can view all held payments and manually release or refund as needed.
- Funds are only released to helpers after user confirmation of completion.
- Refunds/disputes can be managed from the admin dashboard.

### Implementation Notes

- **Backend**: Use payment intent (Stripe) or order (Razorpay) to hold funds. Update request/payment status fields (`held`, `released`, `refunded`).
- **Frontend**: Require payment before request submission. Show clear status in user dashboard (e.g., “Payment Held”, “Completed”, “Refunded”).
- **Security**: Only allow fund release after user marks as completed, or admin override.
