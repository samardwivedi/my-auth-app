import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

export default function ReviewResponse({ review, onResponseSubmitted }) {
  const [response, setResponse] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!response.trim()) {
      setError('Please enter a response');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to respond to a review');
      }

      // In a real implementation, we would have a proper API endpoint for review responses
      // For now, we'll simulate adding a response to the review
      const responseData = {
        reviewId: review._id,
        response: response,
        respondedAt: new Date()
      };
      
      // This simulates the API call - in a real implementation you would have:
      // const res = await axios.post(`${API_BASE_URL}/api/reviews/${review._id}/response`, 
      //   { response }, 
      //   { headers: { 'Content-Type': 'application/json', 'x-auth-token': token } }
      // );
      
      // Simulate API success - in production this would be real data from backend
      setTimeout(() => {
        setSuccess(true);
        setIsReplying(false);
        setResponse('');
        
        // Pass the response data to parent component
        if (onResponseSubmitted) {
          onResponseSubmitted({
            ...review,
            providerResponse: responseData
          });
        }

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
        
        setLoading(false);
      }, 500);
      
    } catch (err) {
      console.error('Error submitting response:', err);
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  if (!isReplying && !review.providerResponse) {
    return (
      <div className="mt-2 flex justify-end">
        <button
          onClick={() => setIsReplying(true)}
          className="text-primary-600 hover:text-primary-800 text-sm font-medium inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
          </svg>
          Respond to this review
        </button>
      </div>
    );
  }

  if (review.providerResponse && !isReplying) {
    return (
      <div className="mt-3 pl-6 border-l-2 border-primary-300">
        <div className="flex items-center text-sm text-gray-600 mb-1">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
          </svg>
          <span className="font-medium">Your response:</span>
          <span className="ml-2 text-xs">
            {new Date(review.providerResponse.respondedAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric'
            })}
          </span>
        </div>
        <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{review.providerResponse.response}</p>
      </div>
    );
  }

  return (
    <div className="mt-3 border-t border-gray-200 pt-3">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-2 rounded mb-3 text-sm">
          Your response has been submitted successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-1">
            Your Response
          </label>
          <textarea
            id="response"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows="3"
            placeholder="Write your response to this review..."
            className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
            required
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setIsReplying(false)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-md shadow-sm disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Response'}
          </button>
        </div>
      </form>
    </div>
  );
}
