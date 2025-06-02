import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import ReviewResponse from './ReviewResponse';

export default function HelperReviewList({ providerId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0
  });

  useEffect(() => {
    const fetchReviews = async () => {
      if (!providerId) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/reviews/provider/${providerId}`);
        const reviewData = response.data;
        
        setReviews(reviewData);
        
        // Calculate stats
        if (reviewData.length > 0) {
          const totalRating = reviewData.reduce((sum, review) => sum + review.rating, 0);
          setStats({
            averageRating: (totalRating / reviewData.length).toFixed(1),
            totalReviews: reviewData.length
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [providerId]);

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle review response submission
  const handleResponseSubmitted = (updatedReview) => {
    setReviews(reviews.map(review => 
      review._id === updatedReview._id ? updatedReview : review
    ));
  };

  // Get stars display
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg 
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor" 
            viewBox="0 0 20 20" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-pulse-slow" role="status" aria-label="Loading">
          <div className="w-10 h-10 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gradient-to-r from-primary-100 to-secondary-100 p-5 rounded-lg shadow flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-4 sm:mb-0 text-center sm:text-left">
          <h3 className="text-xl font-bold text-gray-800">Your Rating</h3>
          <div className="flex items-center mt-2">
            <span className="text-3xl font-bold text-gray-800 mr-2">{stats.averageRating}</span>
            {renderStars(parseFloat(stats.averageRating))}
          </div>
          <p className="text-sm text-gray-600 mt-1">Based on {stats.totalReviews} reviews</p>
        </div>
        
        <div className="text-center sm:text-right">
          <div className="text-sm text-gray-600">Rating Breakdown</div>
          <div className="flex flex-wrap justify-center sm:justify-end mt-2 gap-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter(review => review.rating === rating).length;
              const percentage = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
              
              return (
                <div key={rating} className="flex items-center">
                  <span className="text-xs font-medium mr-1">{rating}</span>
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="ml-2 h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="ml-1 text-xs text-gray-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Reviews List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800">
          Customer Reviews ({reviews.length})
        </h3>
        
        {reviews.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 mt-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't received any reviews from customers yet.</p>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                      {review.userId?.name ? review.userId.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">{review.userId?.name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                      {review.serviceType}
                    </span>
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{review.comment}</p>
                
                {/* Review Response Component */}
                <ReviewResponse 
                  review={review} 
                  onResponseSubmitted={handleResponseSubmitted} 
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
