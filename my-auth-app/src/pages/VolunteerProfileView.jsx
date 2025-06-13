import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function VolunteerProfileView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        const res = await fetch(`${API_BASE_URL}/api/volunteer/${id}`);
        if (!res.ok) throw new Error('Volunteer not found');
        const volunteerData = await res.json();
        setVolunteer(volunteerData);

        // Fetch reviews for this volunteer
        const reviewsRes = await fetch(`${API_BASE_URL}/api/reviews/volunteer/${id}`);
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

  const handleRequestServices = () => {
    if (!isAuthenticated) {
      // Show authentication required message
      window.dispatchEvent(new CustomEvent('app:requireAuth', {
        detail: { message: 'Please log in to request services from volunteers' }
      }));
      return;
    }
    
    // Navigate to the request service page
    navigate(`/volunteers/${id}/request`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  }
  
  if (!volunteer) return null;

  return (
    <div className="max-w-3xl mx-auto p-2 my-6">
      {/* Back Button */}
      <Link to="/volunteers" className="text-blue-600 hover:text-blue-800 flex items-center mb-3">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to all volunteers
      </Link>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-1">
              <h1 className="text-xl font-bold flex items-center">
                {volunteer.name}
                {volunteer.isVerifiedProvider && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
              </h1>
              
              <p className="mt-2 text-blue-100 flex items-center">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {volunteer.location}
              </p>
              
              {/* Stats */}
              <div className="mt-2 flex space-x-2">
                <div className="bg-white/20 px-2 py-0.5 rounded-lg">
                  <span className="text-base font-bold">{volunteer.averageRating}</span>
                  <p className="text-xs text-blue-100">Rating</p>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-lg">
                  <span className="text-lg font-bold">{volunteer.reviewCount}</span>
                  <p className="text-xs text-blue-100">Reviews</p>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-lg">
                  <span className="text-lg font-bold">{volunteer.servicesCompleted}</span>
                  <p className="text-xs text-blue-100">Services</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <button 
                onClick={handleRequestServices}
                className="inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                Request Service
              </button>
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="p-3">
          {/* Main Info - Profile Section */}
          <div>
            {/* Contact Information */}
            <section className="mb-4 bg-gray-50 p-2 rounded-lg shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center">
                <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Information
              </h2>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Email:</span> 
                  <span className="text-gray-600">{volunteer.email || "Not provided"}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Phone:</span> 
                  <span className="text-gray-600">{volunteer.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Location:</span> 
                  <span className="text-gray-600">{volunteer.location}</span>
                </div>
              </div>
            </section>
            
            {/* About */}
            <section className="mb-4">
              <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center">
                <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                About
              </h2>
              <p className="text-gray-600 text-sm">{volunteer.bio}</p>
            </section>
            
            {/* Skills */}
            <section className="mb-4">
              <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center">
                <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Skills & Expertise
              </h2>
              <div className="flex flex-wrap gap-1">
                {volunteer.skills.map((skill, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
            
            {/* Languages */}
            <section className="mb-4">
              <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center">
                <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                Languages
              </h2>
              <div className="flex flex-wrap gap-1">
                {volunteer.languages.map((language, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm">
                    {language}
                  </span>
                ))}
              </div>
            </section>
            
            {/* Reviews */}
            <section className="mb-4">
              <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center">
                <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Reviews
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-2">
                  {reviews.map(review => (
                    <div key={review.id} className="bg-gray-50 p-2 rounded-lg shadow-sm">
                      <div className="flex justify-between">
                        <p className="font-medium text-sm">{review.userName}</p>
                        <p className="text-gray-500 text-xs">{new Date(review.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center mt-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-600 text-xs">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No reviews yet.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
