// Configuration file for API endpoints and other environment settings

// With proxy setup in package.json, we can use relative URLs
// This will automatically route API requests to the backend server

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003';

// Socket.io URL - for socket connections we still need the full URL
export const SOCKET_URL = 'http://localhost:5003';

// Other configuration values can be added here
export const DEFAULT_TIMEOUT = 10000; // 10 seconds

// Stripe configuration
export const getStripePublishableKey = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stripe/publishable-key`);
    const data = await response.json();
    return data.publishableKey;
  } catch (error) {
    console.error('Error fetching Stripe publishable key:', error);
    return null;
  }
};

// Razorpay configuration
export const getRazorpayKeyId = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/razorpay-key`);
    const data = await response.json();
    return data.razorpayKeyId;
  } catch (error) {
    console.error('Error fetching Razorpay key ID:', error);
    return null;
  }
};
