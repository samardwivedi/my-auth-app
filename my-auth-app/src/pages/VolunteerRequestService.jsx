import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import StripeContainer from '../components/payments/StripeContainer';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import ReviewForm from '../components/ReviewForm';

export default function VolunteerRequestService() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Details form, 2: Payment, 3: Confirmation
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [estimatedFee] = useState(499); // Example static fee, replace with dynamic if needed
  const [success, setSuccess] = useState(false);
  
  // Add a step indicator for user clarity
  const stepLabels = ['Fill Details', 'Payment', 'Submit'];
  
  // Form data
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phone: '',
    location: '',
    message: ''
  });
  
  // Date options
  const dateOptions = Array(7).fill().map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });
  
  // Time slots
  const timeSlots = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

  useEffect(() => {
    if (id) fetchVolunteerData();
  }, [id]);

  const fetchVolunteerData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/volunteer/${id}`);
      if (!res.ok) throw new Error('Volunteer not found');
      const data = await res.json();
      setVolunteer(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (formErrors.date) {
      setFormErrors({ ...formErrors, date: '' });
    }
  };
  
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    if (formErrors.time) {
      setFormErrors({ ...formErrors, time: '' });
    }
  };
  
  // Payment success callback
  const handlePaymentSuccess = (payment) => {
    setPaymentIntentId(payment.paymentIntentId || payment.id);
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      // Validation for step 1
      const errors = {};
      if (!formData.userName) errors.userName = 'Required';
      if (!formData.email) errors.email = 'Required';
      if (!formData.phone) errors.phone = 'Required';
      if (!formData.location) errors.location = 'Required';
      if (!selectedDate) errors.date = 'Select a date';
      if (!selectedTime) errors.time = 'Select a time';
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      
      // Move to payment step
      setStep(2);
      return;
    }

    if (step === 3) {
      // Final submission
      setLoading(true);
      
      // Validate payment is complete
      if (!paymentIntentId) {
        setError('Please complete payment before submitting your request.');
        setLoading(false);
        return;
      }
      
      try {
        // Format date and time for submission
        const scheduledDate = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
        const scheduledTime = selectedTime || '';
        
        // Prepare request data
        const requestData = {
          userName: formData.userName,
          contact: formData.email,
          message: formData.message,
          serviceLocation: formData.location,
          phone: formData.phone,
          volunteerId: id,
          scheduledDate,
          scheduledTime,
          paymentIntentId,
          amount: estimatedFee
        };
        
        // Get token if available
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['x-auth-token'] = token;
        }
        
        // Submit request to API
        const response = await axios.post(
          `${API_BASE_URL}/api/requests`,
          requestData,
          { headers, timeout: 10000 }
        );
        
        setSuccess(true);
        
        // Short delay before redirect
        setTimeout(() => {
          navigate(`/volunteers/${id}/profile`);
        }, 2000);
        
      } catch (err) {
        console.error('Error submitting request:', err);
        setError(err.response?.data?.error || err.message || 'Failed to submit request. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>;
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;
  if (!volunteer) return null;

  return (
    <div className="max-w-md mx-auto p-2 my-4">
      {/* Back Button */}
      <Link 
        to={`/volunteers/${id}/profile`} 
        className="text-blue-600 hover:text-blue-800 flex items-center mb-4 text-sm"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to profile
      </Link>
      
      {/* Step indicator */}
      <div className="flex justify-center mb-4">
        {stepLabels.map((label, idx) => (
          <div
            key={label}
            className={`px-3 py-1 rounded-full mx-1 text-xs font-semibold ${
              step === idx + 1
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {label}
          </div>
        ))}
      </div>
      
      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>Request submitted successfully! Redirecting...</p>
          </div>
        </div>
      )}
      
      {/* Card Form with Shadow */}
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-t-xl">
          <h1 className="text-lg font-bold">Request Services from {volunteer?.name}</h1>
          <p className="mt-1 text-sm text-indigo-100">
            {step === 1 && "Fill out the form below"}
            {step === 2 && "Complete payment to proceed"}
            {step === 3 && "Confirm your request"}
          </p>
        </div>
        
        <div className="p-4">
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Field with Floating Label */}
              <div className="relative">
                <input
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border focus:ring-2 transition-all ${
                    formErrors.userName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder=" "
                />
                <label 
                  htmlFor="userName" 
                  className="absolute text-xs text-gray-500 bg-white px-1 left-2 -top-2"
                >
                  Your Name*
                </label>
                {formErrors.userName && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.userName}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border focus:ring-2 transition-all ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder=" "
                />
                <label 
                  htmlFor="email" 
                  className="absolute text-xs text-gray-500 bg-white px-1 left-2 -top-2"
                >
                  Email Address*
                </label>
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div className="relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border focus:ring-2 transition-all ${
                    formErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder=" "
                />
                <label 
                  htmlFor="phone" 
                  className="absolute text-xs text-gray-500 bg-white px-1 left-2 -top-2"
                >
                  Phone Number*
                </label>
                {formErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                )}
              </div>

              {/* Location Field */}
              <div className="relative">
                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border focus:ring-2 transition-all ${
                    formErrors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder=" "
                />
                <label 
                  htmlFor="location" 
                  className="absolute text-xs text-gray-500 bg-white px-1 left-2 -top-2"
                >
                  Your Location*
                </label>
                {formErrors.location && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>
                )}
              </div>
            </div>

            {/* Message Field */}
            <div className="relative">
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 transition-all"
                placeholder=" "
              ></textarea>
              <label 
                htmlFor="message" 
                className="absolute text-xs text-gray-500 bg-white px-1 left-2 -top-2"
              >
                Service Details
              </label>
            </div>

            {/* Date Selection */}
            <div>
              <div className="flex items-center mb-1">
                <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <label className="text-xs font-medium text-gray-700">Select Date*</label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {dateOptions.slice(0, 6).map((date, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    className={`py-1 px-2 rounded-full text-center text-xs ${
                      selectedDate && date.toDateString() === selectedDate.toDateString()
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleDateSelect(date)}
                  >
                    <div className="font-medium">{date.getDate()}</div>
                    <div className="text-xs">{date.toLocaleDateString('en', { weekday: 'short' })}</div>
                  </button>
                ))}
              </div>
              {formErrors.date && (
                <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
              )}
            </div>
            
            {/* Time Selection */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Select Time*</label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`py-1 px-1 rounded-full text-center text-xs ${
                      selectedTime === time
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
              {formErrors.time && (
                <p className="text-red-500 text-xs mt-1">{formErrors.time}</p>
              )}
            </div>
            
              <div className="my-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded">
                <b>Estimated Fee:</b> ₹{estimatedFee}
              </div>
            
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-full hover:shadow-md transition-all duration-200 text-sm font-medium"
              >
                Continue to Payment
              </button>
            </form>
          )}
          
          {step === 2 && (
            <div>
              {/* Back button */}
              <button
                type="button"
                className="mb-4 text-indigo-600 underline text-sm"
                onClick={() => setStep(1)}
              >
                &larr; Back
              </button>
              
              {/* StripeContainer with correct props */}
              {StripeContainer ? (
                <StripeContainer
                  amount={estimatedFee}
                  volunteerId={id}
                  volunteerName={volunteer?.name}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Back button */}
              <button
                type="button"
                className="mb-4 text-indigo-600 underline text-sm"
                onClick={() => setStep(2)}
              >
                &larr; Back
              </button>
              <div className="my-4 p-4 bg-green-50 border-l-4 border-green-400 text-green-800 rounded">
                <p><b>Payment successful!</b> Please confirm your service request details:</p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li><b>Name:</b> {formData.userName}</li>
                  <li><b>Contact:</b> {formData.email}</li>
                  <li><b>Location:</b> {formData.location}</li>
                  <li><b>Date:</b> {selectedDate ? selectedDate.toLocaleDateString() : 'Not selected'}</li>
                  <li><b>Time:</b> {selectedTime || 'Not selected'}</li>
                  <li><b>Amount Paid:</b> ₹{estimatedFee}</li>
                </ul>
              </div>
              {/* Refund/Cancellation Policy */}
              <div className="my-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
                <b>Refund/Cancellation Policy:</b>
                <div className="mt-1 text-sm">
                  {volunteer?.refundPolicy || 'No specific refund/cancellation policy provided by this helper. Contact support for more info.'}
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-full hover:shadow-md transition-all duration-200 text-sm font-medium"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Confirm and Submit Request'}
              </button>
            </form>
          )}

          {/* Step 4: Review/rating before payment release */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="my-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded">
                <b>Service Completed!</b> Please rate your experience before payment is released to the helper.
              </div>
              <ReviewForm
                providerId={id}
                serviceType="service"
                requestId={/* pass the requestId if available */ null}
                onReviewSubmitted={() => {
                  // After review, show a thank you and trigger payment release logic if needed
                  setStep(5);
                }}
              />
            </div>
          )}

          {/* Step 5: Thank you message after review */}
          {step === 5 && (
            <div className="my-8 p-6 bg-green-100 border-l-4 border-green-500 text-green-800 rounded text-center">
              <h2 className="text-xl font-bold mb-2">Thank you for your feedback!</h2>
              <p>Your rating has been submitted and payment will now be released to the helper.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
