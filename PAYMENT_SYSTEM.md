# Transaction & Donation System

This document provides information about the payment system implementation in the VolunteerHub Service Marketplace.

## Overview

The Transaction & Donation System allows:

1. Users to make donations to volunteers using Stripe
2. Volunteers to view their transaction history
3. Recording of all payments in the database

## Features

- **Stripe Integration**: Secure credit card processing
- **Donation Form**: User-friendly interface for making donations
- **Transaction History**: Detailed view of past transactions
- **Volunteer Support**: Direct financial support for volunteer services

## Technical Implementation

### Backend

- **Payment Model**: Records payment details, status, and transaction IDs
- **Stripe API Integration**: Handles payment intents and confirmations
- **REST Endpoints**:
  - `/api/stripe/create-payment-intent`: Creates a payment intent
  - `/api/stripe/payment-success`: Records successful payments
  - `/api/stripe/publishable-key`: Provides the public key to the frontend

### Frontend

- **DonationForm Component**: Collects payment details and processes donations
- **TransactionHistory Component**: Displays past transactions with details
- **StripeContainer**: Handles Stripe Elements integration
- **PaymentDetailsModal**: Shows detailed information about transactions

## How to Use

### For Users Making Donations

1. Navigate to a volunteer's profile
2. Find the donation form in the sidebar
3. Enter the donation amount and any notes
4. Click "Continue to Payment"
5. Enter your credit card details
6. Click "Pay Now" to complete the transaction

### For Volunteers Viewing Transaction History

1. Log in to your account
2. Go to your Profile page
3. Click "View Your Transaction History"
4. Review the list of transactions
5. Click "View Details" on any transaction for more information

## Configuration

The system uses the following environment variables:

```
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret  # Optional, for webhook integration
```

Replace these with your actual Stripe API keys from your Stripe Dashboard.

## Security Considerations

- Credit card information is never stored on our servers
- All transactions use Stripe's secure processing
- Payment details are transmitted using HTTPS
- Backend validation ensures proper transaction recording

## Future Enhancements

- PayPal integration as an alternative payment method
- Recurring donations
- Donation goals and campaigns
- Tax receipt generation
- Direct deposit options for volunteers
