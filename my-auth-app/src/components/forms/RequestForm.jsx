// src/components/RequestForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import StripeContainer from '../components/payments/StripeContainer';

export default function RequestForm({ volunteerId, volunteerName }) {
  const [formData, setFormData] = useState({
    userName: '',
    contact: '',
    message: '',
    serviceLocation: '',
    serviceCategory: '',
    scheduledDate: '',
    scheduledTime: '',
    urgencyLevel: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: form, 2: payment, 3: submit
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [estimatedFee] = useState(499); // Example static fee, replace with dynamic if needed

  // Add a step indicator for debugging and user clarity
  const stepLabels = ['Fill Details', 'Payment', 'Submit'];

  // Add a debug log for step changes
  React.useEffect(() => {
    console.log('Current step:', step);
  }, [step]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (error) setError(null);
    
    // Clear field-specific error
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: null
      });
    }
  };
  
  const validateFields = () => {
    const newFieldErrors = {};
    
    // Validate email or phone in contact field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    
    if (formData.contact && !emailRegex.test(formData.contact) && !phoneRegex.test(formData.contact)) {
      newFieldErrors.contact = 'Please enter a valid email address or phone number';
    }
    
    // Validate location isn't just random characters
    if (formData.serviceLocation && formData.serviceLocation.length < 5) {
      newFieldErrors.serviceLocation = 'Please enter a valid location (minimum 5 characters)';
    }
    
    setFieldErrors(newFieldErrors);
    
    // Return true if no errors
    return Object.keys(newFieldErrors).length === 0;
  };

  // Payment success callback
  const handlePaymentSuccess = (payment) => {
    setPaymentIntentId(payment.paymentIntentId || payment.id);
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    // Validate fields first
    if (!validateFields()) {
      setLoading(false);
      return;
    }

    if (!paymentIntentId) {
      setError('Please complete payment before submitting your request.');
      setLoading(false);
      return;
    }

    try {
      // Check if volunteerId is valid
      if (!volunteerId) {
        throw new Error('Volunteer ID is missing');
      }
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      
      if (token) {
        headers['x-auth-token'] = token;
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/api/requests`,
        { ...formData, volunteerId, paymentIntentId, amount: estimatedFee },
        { headers, timeout: 10000 }
      );
      
      console.log('Request submitted successfully:', response.data);
      setSuccess(true);
      
      // Clear form after successful submission
      setFormData({
        userName: '',
        contact: '',
        message: '',
        serviceLocation: '',
        serviceCategory: '',
        scheduledDate: '',
        scheduledTime: '',
        urgencyLevel: 'medium',
      });
      
      // Automatically clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err.response?.data?.error || err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex justify-center mb-2">
        {stepLabels.map((label, idx) => (
          <div
            key={label}
            className={`px-3 py-1 rounded-full mx-1 text-xs font-semibold ${
              step === idx + 1
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {label}
          </div>
        ))}
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded animate-fade-in">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded animate-fade-in">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>Request submitted successfully! The service provider will contact you shortly.</p>
          </div>
        </div>
      )}
      
      {step === 1 && (
        <form onSubmit={e => { e.preventDefault(); setStep(2); }} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl text-center font-semibold text-gray-800 mb-4">
            {volunteerName ? `Request Service from ${volunteerName}` : 'Request Service'}
          </h2>
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              id="userName"
              name="userName"
              placeholder="Enter your full name"
              value={formData.userName}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
            <input
              type="text"
              id="contact"
              name="contact"
              placeholder="Phone number or email address"
              value={formData.contact}
              onChange={handleChange}
              required
              disabled={loading}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                fieldErrors.contact ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {fieldErrors.contact && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.contact}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="serviceCategory" className="block text-sm font-medium text-gray-700 mb-1">Service Category</label>
            <select
              id="serviceCategory"
              name="serviceCategory"
              value={formData.serviceCategory}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a category</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Transportation">Transportation</option>
              <option value="Childcare">Childcare</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="serviceLocation" className="block text-sm font-medium text-gray-700 mb-1">Service Location</label>
            <input
              type="text"
              id="serviceLocation"
              name="serviceLocation"
              placeholder="Enter address or location"
              value={formData.serviceLocation}
              onChange={handleChange}
              required
              disabled={loading}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                fieldErrors.serviceLocation ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {fieldErrors.serviceLocation && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.serviceLocation}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Request Details</label>
            <textarea
              id="message"
              name="message"
              placeholder="Describe what you're looking for"
              value={formData.message}
              onChange={handleChange}
              required
              disabled={loading}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
              <input
                type="date"
                id="scheduledDate"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} // Prevents past dates
                required
                disabled={loading}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
              <input
                type="time"
                id="scheduledTime"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="urgencyLevel" className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
            <div className="grid grid-cols-3 gap-2">
              <div 
                className={`cursor-pointer rounded-lg text-center p-3 ${
                  formData.urgencyLevel === 'low' 
                    ? 'bg-green-100 ring-2 ring-green-500 text-green-700 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setFormData({ ...formData, urgencyLevel: 'low' })}
              >
                Low
              </div>
              <div 
                className={`cursor-pointer rounded-lg text-center p-3 ${
                  formData.urgencyLevel === 'medium' 
                    ? 'bg-yellow-100 ring-2 ring-yellow-500 text-yellow-700 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setFormData({ ...formData, urgencyLevel: 'medium' })}
              >
                Medium
              </div>
              <div 
                className={`cursor-pointer rounded-lg text-center p-3 ${
                  formData.urgencyLevel === 'high' 
                    ? 'bg-red-100 ring-2 ring-red-500 text-red-700 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setFormData({ ...formData, urgencyLevel: 'high' })}
              >
                High
              </div>
            </div>
          </div>
          
          <div className="my-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded">
            <b>Estimated Fee:</b> ₹{estimatedFee}
          </div>
          
          <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium">
            Continue to Payment
          </button>
        </form>
      )}
      {step === 2 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Secure Payment</h2>
          {/* Back button */}
          <button
            type="button"
            className="mb-4 text-primary-600 underline"
            onClick={() => setStep(1)}
          >
            &larr; Back
          </button>
          {/* StripeContainer with correct props */}
          {StripeContainer ? (
            <StripeContainer
              amount={estimatedFee}
              volunteerId={volunteerId}
              volunteerName={volunteerName}
              onSuccess={handlePaymentSuccess}
              onBack={() => setStep(1)}
              paymentType="service"
            />
          ) : (
            <div className="text-red-600">Payment UI failed to load. Please refresh.</div>
          )}
        </div>
      )}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          {/* Back button */}
          <button
            type="button"
            className="mb-4 text-primary-600 underline"
            onClick={() => setStep(2)}
          >
            &larr; Back
          </button>
          <div className="my-4 p-4 bg-green-50 border-l-4 border-green-400 text-green-800 rounded">
            Payment successful! Now submit your service request.
          </div>
          {/* Estimated Fee and Refund Policy */}
          <div className="my-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded">
            <b>Estimated Fee:</b> ₹{estimatedFee}
          </div>
          <div className="my-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
            <b>Refund/Cancellation Policy:</b>
            <div className="mt-1 text-sm">
              No specific refund/cancellation policy provided by this helper. Contact support for more info.
            </div>
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-medium transition-all">
            Submit Request
          </button>
        </form>
      )}
    </div>
  );
}
