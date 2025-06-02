import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { API_BASE_URL } from '../../config';

const cardStyle = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: 'Arial, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
};

const DonationForm = ({ amount, onSuccess }) => {
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState('');

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    // When the component loads, make sure the form is enabled
    setDisabled(false);
    setError(null);
    setSucceeded(false);
    setProcessing(false);
  }, []);

  const createPaymentIntent = async () => {
    try {
      setProcessing(true);
      // Validate amount
      if (!amount || amount <= 0) {
        setError('Invalid payment amount');
        setProcessing(false);
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to pay');
        setProcessing(false);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ amount })
      });
      const data = await response.json();
      if (response.status !== 200) {
        setError(data.error || 'An error occurred');
        setProcessing(false);
        return;
      }
      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError('Network error. Please try again later.');
      setProcessing(false);
    }
  };

  const handleChange = (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(event.empty);
    setError(event.error ? event.error.message : '');
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    if (!stripe || !elements || processing) {
      return;
    }

    if (!clientSecret) {
      // First, create the payment intent
      await createPaymentIntent();
      return;
    }

    setProcessing(true);

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });

    if (payload.error) {
      setError(`Payment failed: ${payload.error.message}`);
      setProcessing(false);
    } else {
      // Payment succeeded, now record it in our database
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_BASE_URL}/api/stripe/payment-success`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({
            paymentIntentId: payload.paymentIntent.id,
            amount: payload.paymentIntent.amount
          })
        });

        if (response.status === 201) {
          setError(null);
          setSucceeded(true);
          setProcessing(false);

          // Reset the form
          elements.getElement(CardElement).clear();

          // Call the success callback
          if (onSuccess) {
            const payment = await response.json();
            onSuccess(payment);
          }
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Failed to record payment');
        }
      } catch (err) {
        console.error('Error recording payment:', err);
        setError('Payment processed but failed to record in our system. Please contact support.');
        setProcessing(false);
      }
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-4">Service Payment</h2>
        <p className="text-gray-600 mb-2">
          You are paying for your service request. Funds will be held securely until the service is completed.
        </p>
        <div className="mb-2 p-2 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded">
          <b>Amount to Pay:</b> ₹{amount}
        </div>
      </div>

      {!clientSecret && (
        <button
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          disabled={processing || disabled}
          onClick={createPaymentIntent}
          type="button"
        >
          {processing ? 'Processing...' : 'Continue to Payment'}
        </button>
      )}
      {clientSecret && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Details
            </label>
            <div className="p-3 border border-gray-300 rounded-md">
              <CardElement 
                id="card-element" 
                options={cardStyle} 
                onChange={handleChange}
                className="p-2"
              />
            </div>
          </div>

          <button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            disabled={processing || disabled || succeeded}
            type="submit"
          >
            {processing ? 'Processing...' : succeeded ? 'Payment Successful' : 'Pay Now'}
          </button>
        </>
      )}

      {/* Show any error that happens when processing the payment */}
      {error && (
        <div className="mt-4 text-red-500 text-center">
          {error}
        </div>
      )}

      {/* Show a success message upon completion */}
      {succeeded && (
        <div className="mt-4 text-green-500 text-center">
          Thank you for your payment! Your transaction has been processed successfully.
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        Secure payment processed by Stripe. Your card information is never stored on our servers.
      </div>
    </form>
  );
};

export default DonationForm;
