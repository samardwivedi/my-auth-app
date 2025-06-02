import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { API_BASE_URL } from '../../config';
// QRCode import removed as it was causing issues

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

const ServicePaymentForm = ({ amount, volunteerId, onSuccess }) => {
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe', 'razorpay', or 'upi'
  const [upiId, setUpiId] = useState('');
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [upiTransactionRef, setUpiTransactionRef] = useState(null);
  const [showUpiForm, setShowUpiForm] = useState(false);
  const [showUpiIdInput, setShowUpiIdInput] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    // When the component loads, make sure the form is enabled
    setDisabled(false);
    setError(null);
    setSucceeded(false);
    setProcessing(false);
  }, []);
  
  // When payment method changes, clear any previous errors and setup appropriate state
  useEffect(() => {
    setError(null);
    // Reset client secret when changing payment method
    if (paymentMethod !== 'stripe') {
      setClientSecret('');
    }
    // Set UPI form when selecting UPI payment method
    if (paymentMethod === 'upi') {
      setShowUpiForm(true);
      setShowUpiIdInput(false); // Initially hide UPI ID input
    } else {
      setShowUpiForm(false);
      setShowUpiIdInput(false); 
      setUpiTransactionRef(null);
      setUpiTransactionId('');
    }
  }, [paymentMethod]);

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
      const response = await fetch(`${API_BASE_URL}/api/payments/service-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ 
          amount,
          volunteerId, 
          paymentMethod
        })
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

        const response = await fetch(`${API_BASE_URL}/api/payments/service-success`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({
            paymentIntentId: payload.paymentIntent.id,
            amount: payload.paymentIntent.amount,
            volunteerId
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

  // UPI payment handling
  const handleInitiateUpiPayment = async () => {
    console.log('Starting UPI payment initiation');
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to pay');
        setProcessing(false);
        return;
      }

      console.log('Making API call to upi-initiate endpoint');
      console.log('API_BASE_URL:', API_BASE_URL);
      
      // Directly use the full URL to avoid path issues
      const apiUrl = `${API_BASE_URL}/api/payments/upi-initiate`;
      console.log('Full API URL:', apiUrl);
      
      // Call the backend to initiate UPI payment
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          amount,
          volunteerId,
          upiId,
          note: 'Service Payment'
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || 'Failed to initiate UPI payment');
      }

      const data = await response.json();
      console.log('API success response:', data);
      
      // Create a properly structured upiTransactionRef object
      const paymentData = {
        transactionRef: data.transactionRef || `MOCK-${Date.now()}`,
        amount: amount,
        upiId: upiId || 'demo@upi',
        merchantName: 'Demo Merchant'
      };
      
      setUpiTransactionRef(paymentData);
      setError(null);
      setProcessing(false);
      console.log('UPI payment initiation completed successfully');
    } catch (error) {
      console.error('UPI payment initiation error:', error);
      // Create a mock UPI transaction reference for testing
      const mockData = {
        transactionRef: `MOCK-${Date.now()}`,
        amount: amount,
        upiId: upiId || 'demo@upi',
        merchantName: 'Demo Merchant'  
      };
      
      console.log('Using mock data due to error:', mockData);
      setUpiTransactionRef(mockData);
      setError(`Debug mode: Using mock data. Original error: ${error.message || 'Failed to initiate UPI payment'}`);
      setProcessing(false);
    }
  };

  // Handle UPI payment verification
  const handleVerifyUpiPayment = async () => {
    console.log('Starting UPI payment verification');
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to verify payment');
        setProcessing(false);
        return;
      }

      if (!upiTransactionId || !upiTransactionRef) {
        setError('Missing transaction details');
        setProcessing(false);
        return;
      }

      // Validate the transaction ID format
      if (upiTransactionId.trim().length < 5) {
        setError('Please enter a valid UPI transaction ID (at least 5 characters)');
        setProcessing(false);
        return;
      }

      console.log('Making API call to verify UPI payment');
      console.log('Transaction details:', {
        transactionRef: upiTransactionRef.transactionRef || 'unknown',
        transactionId: upiTransactionId,
        amount,
        volunteerId: volunteerId || 'Not provided'
      });
      
      // Call the backend to verify UPI payment
      const response = await fetch(`${API_BASE_URL}/api/payments/upi-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          transactionRef: upiTransactionRef.transactionRef,
          transactionId: upiTransactionId,
          amount,
          volunteerId,
          upiId
        })
      });

      console.log('Verify response status:', response.status);
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Verification error response:', responseData);
        
        // Handle specific error messages from the server
        let errorMessage = 'Failed to verify UPI payment';
        if (responseData.error) {
          errorMessage = responseData.error;
          // If we have detailed validation errors, show them
          if (responseData.details && Array.isArray(responseData.details)) {
            errorMessage += ': ' + responseData.details.join(', ');
          }
        }
        
        throw new Error(errorMessage);
      }

      console.log('Verification success response:', responseData);
      
      setSucceeded(true);
      setProcessing(false);
      setError(null);

      console.log('UPI payment verification completed successfully');
      
      // Call the success callback
      if (onSuccess) {
        onSuccess(responseData);
      }
    } catch (error) {
      console.error('UPI payment verification error:', error);
      
      // Only use the mock data in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Debug mode: Simulating successful payment verification');
        
        const mockPaymentData = {
          paymentIntentId: `MOCK-${Date.now()}`,
          amount: amount,
          status: 'completed'
        };
        
        setSucceeded(true);
        setProcessing(false);
        setError(null);
        
        // Call the success callback with mock data
        if (onSuccess) {
          onSuccess(mockPaymentData);
        }
      } else {
        // In production, show the error
        setError(`Payment verification failed: ${error.message}`);
        setProcessing(false);
      }
    }
  };

  // Razorpay payment handling
  const handleRazorpayPayment = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to pay');
        setProcessing(false);
        return;
      }

      // Create a Razorpay order
      const orderResponse = await fetch(`${API_BASE_URL}/api/payments/razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ 
          amount,
          volunteerId
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create Razorpay order');
      }

      const orderData = await orderResponse.json();
      
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const options = {
          key: orderData.razorpayKeyId, // Enter the Key ID generated from the Dashboard
          amount: amount * 100, // Amount is in currency subunits (paise)
          currency: "INR",
          name: "Service Payment",
          description: "Payment for service request",
          order_id: orderData.orderId,
          handler: async function (response) {
            try {
              // Verify the payment
              const verifyResponse = await fetch(`${API_BASE_URL}/api/payments/razorpay-verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-auth-token': token
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  volunteerId
                })
              });
              
              if (!verifyResponse.ok) {
                const errorData = await verifyResponse.json();
                throw new Error(errorData.error || 'Failed to verify Razorpay payment');
              }
              
              const paymentData = await verifyResponse.json();
              setSucceeded(true);
              setProcessing(false);
              
              // Call the success callback
              if (onSuccess) {
                onSuccess(paymentData);
              }
              
            } catch (error) {
              console.error('Error verifying payment:', error);
              setError('Payment verification failed. Please contact support.');
              setProcessing(false);
            }
          },
          prefill: {
            name: "",
            email: "",
            contact: ""
          },
          theme: {
            color: "#3399cc"
          }
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
        setProcessing(false);
      };
      
      script.onerror = () => {
        setError('Failed to load Razorpay. Please try another payment method.');
        setProcessing(false);
      };
      
      document.body.appendChild(script);
      
    } catch (error) {
      console.error('Razorpay payment error:', error);
      setError(error.message || 'Failed to process Razorpay payment');
      setProcessing(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-4">Service Payment</h2>
        <p className="text-gray-600 mb-2">
          You are paying for your service request. Funds will be held securely until the service is completed.
        </p>
        <div className="mb-4 p-2 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded">
          <b>Amount to Pay:</b> ₹{amount}
        </div>
      </div>

      {/* Payment method selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
        <div className="grid grid-cols-3 gap-2">
          <div 
            className={`cursor-pointer rounded-lg text-center p-3 ${
              paymentMethod === 'stripe' 
                ? 'bg-blue-100 ring-2 ring-blue-500 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => {
              setPaymentMethod('stripe');
              setShowUpiForm(false);
            }}
          >
            Credit/Debit Card
          </div>
          <div 
            className={`cursor-pointer rounded-lg text-center p-3 ${
              paymentMethod === 'razorpay' 
                ? 'bg-blue-100 ring-2 ring-blue-500 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => {
              setPaymentMethod('razorpay');
              setShowUpiForm(false);
            }}
          >
            Razorpay
          </div>
          <div 
            className={`cursor-pointer rounded-lg text-center p-3 ${
              paymentMethod === 'upi' 
                ? 'bg-blue-100 ring-2 ring-blue-500 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => {
              setPaymentMethod('upi');
              setShowUpiForm(true);
            }}
          >
            UPI
          </div>
        </div>
      </div>

      {paymentMethod === 'stripe' ? (
        <>
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
        </>
      ) : paymentMethod === 'razorpay' ? (
        <button
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          disabled={processing}
          onClick={handleRazorpayPayment}
          type="button"
        >
          {processing ? 'Processing...' : 'Pay with Razorpay'}
        </button>
      ) : (
        // UPI Payment Form
        <div className="mt-4">
          {/* UPI App Icons */}
          <div className="mb-4 flex justify-center gap-4">
            {/* Google Pay */}
            <button type="button" title="Google Pay" onClick={() => {
              // Use default UPI ID if none provided
              const merchantUpiId = upiId || 'helpora@okaxis';
              
              // Properly format the UPI link with clean parameters
              // This format is more consistently supported across UPI apps
              const cleanAmount = parseFloat(amount).toFixed(2);
              const upiLink = `upi://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent("Helpora")}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent("Service Payment")}`;
              
              // Save UPI ID for later reference
              if (!upiId) setUpiId(merchantUpiId);
              
              try {
                // Try to open the app
                window.location.href = upiLink;
                console.log("Opening Google Pay with UPI ID:", merchantUpiId);
              } catch (error) {
                console.error("Failed to open UPI app:", error);
              }
              
              // Initialize payment in background regardless of whether the UPI app opened successfully
              setTimeout(() => handleInitiateUpiPayment(), 1000);
            }}>
              <img src="/images/icon/Googlepay.png" alt="Google Pay" className="h-10 w-10 rounded-full border" onError={(e) => {e.target.onerror=null;e.target.src='/images/avatar-placeholder.jpg';}} />
              <span className="block text-xs mt-1">Google Pay</span>
            </button>
            
            {/* PhonePe */}
            <button type="button" title="PhonePe" onClick={() => {
              // Use default UPI ID if none provided
              const merchantUpiId = upiId || 'helpora@okaxis';
              
              // Properly format the UPI link with clean parameters
              const cleanAmount = parseFloat(amount).toFixed(2);
              const upiLink = `phonepe://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent("Helpora")}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent("Service Payment")}`;
              
              // Save UPI ID for later reference
              if (!upiId) setUpiId(merchantUpiId);
              
              try {
                // Try to open the app
                window.location.href = upiLink;
                console.log("Opening PhonePe with UPI ID:", merchantUpiId);
              } catch (error) {
                console.error("Failed to open UPI app:", error);
              }
              
              // Initialize payment in background regardless of whether the UPI app opened successfully
              setTimeout(() => handleInitiateUpiPayment(), 1000);
            }}>
              <img src="/images/icon/phonepe.png" alt="PhonePe" className="h-10 w-10 rounded-full border" onError={(e) => {e.target.onerror=null;e.target.src='/images/avatar-placeholder.jpg';}} />
              <span className="block text-xs mt-1">PhonePe</span>
            </button>
            
            {/* Paytm */}
            <button type="button" title="Paytm" onClick={() => {
              // Use default UPI ID if none provided
              const merchantUpiId = upiId || 'helpora@okaxis';
              
              // Properly format the UPI link with clean parameters
              const cleanAmount = parseFloat(amount).toFixed(2);
              const upiLink = `paytmmp://pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent("Helpora")}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent("Service Payment")}`;
              
              // Save UPI ID for later reference
              if (!upiId) setUpiId(merchantUpiId);
              
              try {
                // Try to open the app
                window.location.href = upiLink;
                console.log("Opening Paytm with UPI ID:", merchantUpiId);
              } catch (error) {
                console.error("Failed to open UPI app:", error);
              }
              
              // Initialize payment in background regardless of whether the UPI app opened successfully
              setTimeout(() => handleInitiateUpiPayment(), 1000);
            }}>
              <img src="/images/icon/paytm.png" alt="Paytm" className="h-10 w-10 rounded-full border" onError={(e) => {e.target.onerror=null;e.target.src='/images/avatar-placeholder.jpg';}} />
              <span className="block text-xs mt-1">Paytm</span>
            </button>
            
            {/* BHIM */}
            <button type="button" title="BHIM" onClick={() => {
              // Use default UPI ID if none provided
              const merchantUpiId = upiId || 'helpora@okaxis';
              
              // Properly format the UPI link with clean parameters
              const cleanAmount = parseFloat(amount).toFixed(2);
              const upiLink = `bhim://upi/pay?pa=${encodeURIComponent(merchantUpiId)}&pn=${encodeURIComponent("Helpora")}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent("Service Payment")}`;
              
              // Save UPI ID for later reference
              if (!upiId) setUpiId(merchantUpiId);
              
              try {
                // Try to open the app
                window.location.href = upiLink;
                console.log("Opening BHIM with UPI ID:", merchantUpiId);
              } catch (error) {
                console.error("Failed to open UPI app:", error);
              }
              
              // Initialize payment in background regardless of whether the UPI app opened successfully
              setTimeout(() => handleInitiateUpiPayment(), 1000);
            }}>
              <img src="/images/icon/bhim.png" alt="BHIM" className="h-10 w-10 rounded-full border" onError={(e) => {e.target.onerror=null;e.target.src='/images/avatar-placeholder.jpg';}} />
              <span className="block text-xs mt-1">BHIM</span>
            </button>
          </div>

          <div className="mb-4 text-center">
            <button 
              type="button"
              onClick={() => setShowUpiIdInput(!showUpiIdInput)}
              className="text-blue-600 text-sm font-medium hover:text-blue-800 hover:underline"
            >
              {showUpiIdInput ? 'Hide UPI ID input' : "Don't have these apps? Click here to enter your UPI ID"}
            </button>
            <p className="text-xs text-gray-600 mt-2">
              If your UPI app doesn't open automatically, please use the UPI ID shown after clicking "Generate UPI Payment" below.
            </p>
            
            {showUpiIdInput && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your UPI ID (e.g. yourname@upi)"
                  disabled={processing || succeeded}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to use Helpora's default UPI ID (helpora@okaxis)
                </p>
              </div>
            )}
          </div>
          
          {showUpiForm && !upiTransactionRef ? (
            <button
              type="button"
              disabled={processing || !upiId || succeeded}
              onClick={handleInitiateUpiPayment}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {processing ? 'Processing...' : 'Generate UPI Payment'}
            </button>
          ) : showUpiForm && upiTransactionRef ? (
            <>
              <div className="mb-4 p-3 bg-yellow-50 border rounded border-yellow-200">
                <p className="text-sm text-gray-700 mb-2">
                  Please pay ₹{amount} using any UPI app with the information below:
                </p>
                <div className="p-3 bg-white border rounded-md text-center mb-3">
                  <div id="upi-payment-info" className="flex justify-center mb-3">
                    <div className="border-2 border-gray-300 rounded p-4 bg-blue-50 text-center">
                      <h3 className="font-medium text-lg mb-2">UPI Payment Information</h3>
                      <p className="text-sm mb-1">
                        Use the UPI ID below to make your payment of ₹{parseFloat(amount).toFixed(2)}
                      </p>
                      <p className="font-bold text-xl mt-3 mb-3 text-blue-800">
                        {upiTransactionRef && typeof upiTransactionRef.upiId === 'string' ? upiTransactionRef.upiId : 'helpora@okaxis'}
                      </p>
                      <p className="text-xs text-gray-600">
                        You can copy this ID and paste it in your preferred UPI app
                      </p>
                    </div>
                  </div>
                  <div className="text-left space-y-2">
                    <p><span className="font-medium">UPI ID:</span> {upiTransactionRef.upiId}</p>
                    <p><span className="font-medium">Amount:</span> ₹{amount}</p>
                    <p><span className="font-medium">Reference:</span> {upiTransactionRef.transactionRef}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UPI Transaction ID (After payment completion)
                  </label>
                  <input
                    type="text"
                    value={upiTransactionId}
                    onChange={(e) => setUpiTransactionId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter UPI Transaction ID"
                    disabled={processing || succeeded}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Please enter the transaction ID from your UPI app after completing the payment.
                  </p>
                </div>
                
                <button
                  type="button"
                  disabled={processing || !upiTransactionId || succeeded}
                  onClick={handleVerifyUpiPayment}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {processing ? 'Verifying...' : 'Verify Payment'}
                </button>
              </div>
            </>
          ) : null}
        </div>
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
        Secure payment processed by {
          paymentMethod === 'stripe' ? 'Stripe' : 
          paymentMethod === 'razorpay' ? 'Razorpay' : 
          'UPI'
        }. 
        {paymentMethod !== 'upi' ? 'Your card information is never stored on our servers.' : 'Please make sure to enter the correct UPI transaction ID for verification.'}
      </div>
    </form>
  );
};

export default ServicePaymentForm;
