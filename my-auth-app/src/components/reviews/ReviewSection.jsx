import React, { useState } from 'react';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

export default function ReviewSection({ providerId, serviceType, requestId }) {
  const [, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Function to handle the submission of a new review
  const handleReviewSubmitted = (newReview) => {
    // Add the new review to the local state so it appears immediately
    setReviews((prevReviews) => [newReview, ...prevReviews]);
    // Hide the form after submission
    setShowForm(false);
  };

  return (
    <div className="mt-10 bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Reviews & Feedback</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-white text-primary-700 rounded-lg shadow hover:bg-primary-50 transition-colors flex items-center"
          >
            {showForm ? (
              <>
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Write a Review
              </>
            )}
          </button>
        </div>
      </div>

      {/* Review Form - Conditionally Rendered */}
      {showForm && (
        <div className="border-b border-gray-200 p-6 bg-gray-50">
          <ReviewForm 
            providerId={providerId} 
            serviceType={serviceType}
            requestId={requestId}
            onReviewSubmitted={handleReviewSubmitted} 
          />
        </div>
      )}

      {/* Review List */}
      <div className="p-6">
        <ReviewList providerId={providerId} />
      </div>
    </div>
  );
}
