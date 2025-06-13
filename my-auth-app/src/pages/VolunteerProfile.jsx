import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import StripeContainer from '../components/payments/StripeContainer';
import TransactionHistory from '../components/payments/TransactionHistory';

export default function VolunteerProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  // Date options for scheduling
  const dateOptions = Array(14).fill().map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });
  
  // Time options for scheduling
  const timeSlots = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch volunteer data
        const res = await fetch(`/api/volunteer/${id}`);
        if (!res.ok) throw new Error('Volunteer not found');
        const volunteerData = await res.json();
        setVolunteer(volunteerData);

        // Fetch reviews for this volunteer
        const reviewsRes = await fetch(`/api/reviews/volunteer/${id}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData);
        } else {
          setReviews([]);
        }

        setError(null);
      } catch (err) {
        setError(err.message);
        setVolunteer(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };
  
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };
  
  // State for form fields
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phone: '',
    location: '',
    message: ''
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }
    
    try {
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        setShowLoginPrompt(true);
        return;
      }
      
      // Prepare request data
      const requestData = {
        // User information
        userName: formData.userName,
        contact: `${formData.email}, ${formData.phone}`,
        
        // Service details
        message: formData.message || `Service requested with ${volunteer.name}`,
        serviceLocation: formData.location,
        serviceCategory: volunteer.skills.length > 0 ? volunteer.skills[0] : '',
        
        // Schedule
        scheduledDate: selectedDate.toISOString().split('T')[0],
        scheduledTime: selectedTime,
        
        // Volunteer info
        volunteerId: id
      };
      
      // Submit request to API
      const response = await fetch(`/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(requestData)
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Service request submitted successfully! Request ID: ${result.requestId}`);
        
        // Clear form after successful submission
        setFormData({
          userName: '',
          email: '',
          phone: '',
          location: '',
          message: ''
        });
        setSelectedDate(null);
        setSelectedTime(null);
      } else {
        const errorData = await response.json();
        alert(`Error submitting request: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting service request:', error);
      alert(`Failed to submit service request. Please try again later.`);
    }
  };
  
  const handleDonationClick = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
  };
  
  const redirectToLogin = () => {
    navigate('/login');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  }
  
  if (!volunteer) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 my-8">
      {/* Back Button */}
      <Link to="/volunteers" className="text-blue-600 hover:text-blue-800 flex items-center mb-6">
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to all volunteers
      </Link>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex flex-col md:flex-row md:items-center">
            {/* Show profile photo if available */}
            {volunteer.photo || volunteer.photoUrl ? (
              <img
                src={volunteer.photo || volunteer.photoUrl}
                alt={volunteer.name + " profile"}
                className="w-28 h-28 object-cover rounded-full border-4 border-white shadow-lg mb-4 md:mb-0 md:mr-6"
              />
            ) : null}
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{volunteer.name}</h1>
              <p className="mt-2 text-blue-100">
                <span className="inline-flex items-center">
                  <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {volunteer.location}
                </span>
                
                {volunteer.isVerifiedProvider && (
                  <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
              </p>
              
              {/* Stats */}
              <div className="mt-4 flex space-x-6">
                <div>
                  <span className="text-2xl font-bold">{volunteer.averageRating}</span>
                  <p className="text-sm text-blue-100">Rating</p>
                </div>
                <div>
                  <span className="text-2xl font-bold">{volunteer.reviewCount}</span>
                  <p className="text-sm text-blue-100">Reviews</p>
                </div>
                <div>
                  <span className="text-2xl font-bold">{volunteer.servicesCompleted}</span>
                  <p className="text-sm text-blue-100">Services</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0">
              <a href="#request-section" className="inline-block px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 shadow-sm">
                Request Service
              </a>
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="p-6">
          <div className="mb-4">
            <div className="flex border-b border-gray-200">
              <button 
                onClick={() => document.getElementById('profile-section').scrollIntoView({ behavior: 'smooth' })} 
                className="py-2 px-4 font-medium text-indigo-600 mr-4"
              >
                View Profile
              </button>
              <button 
                onClick={() => document.getElementById('request-section').scrollIntoView({ behavior: 'smooth' })} 
                className="py-2 px-4 font-medium text-indigo-600"
              >
                Request Services
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info - Profile Section */}
            <div className="lg:col-span-2" id="profile-section">
              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <div className="mb-2">Email: {volunteer.email || "Not provided"}</div>
                <div className="mb-2">Phone: {volunteer.phone || "Not provided"}</div>
                <div className="mb-2">Location: {volunteer.location}</div>
              </section>
              
              {/* About */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-600">{volunteer.bio}</p>
              </section>
              
              {/* Skills */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Skills & Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {volunteer.skills.map((skill, idx) => (
                    <span key={idx} className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
              
              {/* Languages */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {volunteer.languages.map((language, idx) => (
                    <span key={idx} className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {language}
                    </span>
                  ))}
                </div>
              </section>
              
              {/* Reviews */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between">
                          <p className="font-medium">{review.userName}</p>
                          <p className="text-gray-500 text-sm">{new Date(review.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center mt-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i}
                              className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet.</p>
                )}
              </section>
            </div>
            
            {/* Request Service */}
            <div className="lg:col-span-1">
              {/* Donation Container */}
              {/* Login Prompt Modal */}
              {showLoginPrompt && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg max-w-md w-full p-6 animate-fade-in">
                    <div className="text-center mb-6">
                      <svg className="mx-auto h-14 w-14 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mt-4">Authentication Required</h3>
                      <p className="text-gray-600 mt-1">
                        You need to be logged in to perform this action.
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => setShowLoginPrompt(false)} 
                        className="flex-1 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={redirectToLogin} 
                        className="flex-1 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Log In
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <StripeContainer 
                  volunteerId={id} 
                  volunteerName={volunteer.name}
                  onSuccess={() => {
                    // Optionally update the UI or show a success message
                    alert("Thank you for your donation!");
                  }}
                  onAuthRequired={() => setShowLoginPrompt(true)}
                  isAuthenticated={isAuthenticated}
                />
              </div>

              <div id="request-section" className="bg-indigo-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-indigo-900 mb-4">Request Services</h2>
                {!isAuthenticated && (
                  <div className="bg-blue-100 p-4 rounded-md mb-4 border-l-4 border-blue-500">
                    <p className="text-blue-700 text-sm">
                      <strong>Note:</strong> You'll need to login to complete your request.
                    </p>
                  </div>
                )}
                <form onSubmit={handleSubmitRequest}>
                  {/* User Information Fields */}
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name*</label>
                      <input
                        type="text"
                        name="userName"
                        value={formData.userName}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address*</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Your contact number"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Location*</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your address"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Details</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Describe what you need help with"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Date*</label>
                    <div className="grid grid-cols-3 gap-2">
                      {dateOptions.slice(0, 6).map((date, idx) => (
                        <button 
                          key={idx}
                          type="button"
                          className={`py-2 px-3 rounded text-center text-sm ${
                            selectedDate && date.toDateString() === selectedDate.toDateString()
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleDateSelect(date)}
                        >
                          <div className="font-medium">{date.getDate()}</div>
                          <div className="text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Time Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Time*</label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`py-2 px-1 rounded text-center text-sm ${
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
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-4">Fields marked with * are required</p>
                  
                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 font-medium mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedDate || !selectedTime}
                  >
                    Request Service
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
