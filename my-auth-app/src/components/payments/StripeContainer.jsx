import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { getStripePublishableKey } from '../../config';
import DonationForm from './DonationForm';
import ServicePaymentForm from './ServicePaymentForm';

const StripeContainer = ({ 
  amount, 
  volunteerId, 
  volunteerName, 
  onSuccess, 
  onAuthRequired, 
  isAuthenticated, 
  onBack,
  paymentType = 'service' // 'service' or 'donation'
}) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If not authenticated and the component expects auth, we don't need to load Stripe
    if (onAuthRequired && !isAuthenticated) {
      return;
    }
    
    const loadStripeKey = async () => {
      try {
        const publishableKey = await getStripePublishableKey();
        
        if (!publishableKey) {
          throw new Error('Failed to load Stripe key');
        }
        
        setStripePromise(loadStripe(publishableKey));
      } catch (err) {
        console.error('Error loading Stripe:', err);
        setError('Unable to load payment system. Please try again later.');
      }
    };
    
    loadStripeKey();
  }, []);

  // Debug: Log when payment step is rendered
  useEffect(() => {
    console.log('[StripeContainer] Payment step mounted. Amount:', amount);
  }, [amount]);

  // If component requires authentication but user is not authenticated
  if (onAuthRequired && !isAuthenticated) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Support this Volunteer</h3>
        <p className="text-gray-600 mb-4">
          Your donation helps our volunteers continue their valuable work in the community.
        </p>
        <button
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          onClick={onAuthRequired}
        >
          Login to Donate
        </button>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 my-4">
        <p>{error}</p>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md my-4">
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p className="text-center text-gray-600">Loading payment system...</p>
      </div>
    );
  }

  // Step indicator and Back button UI
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500 font-semibold">
          Step 2 of 3: <span className="text-blue-700">Payment</span>
        </div>
        {onBack && (
          <button
            type="button"
            className="text-blue-600 hover:underline text-sm font-medium"
            onClick={onBack}
          >
            ← Back
          </button>
        )}
      </div>
      {/* Payment UI follows */}
      <Elements stripe={stripePromise}>
        {paymentType === 'service' ? (
          <ServicePaymentForm 
            amount={amount}
            volunteerId={volunteerId} 
            volunteerName={volunteerName} 
            onSuccess={onSuccess} 
          />
        ) : (
          <DonationForm 
            amount={amount}
            volunteerId={volunteerId} 
            volunteerName={volunteerName} 
            onSuccess={onSuccess} 
          />
        )}
      </Elements>
    </div>
  );
};

export default StripeContainer;
