import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Volunteer Card Component
 * Displays information about a volunteer and their services
 */
const VolunteerCard = ({ id, name, photo, location, rating = 0, description, skills = [], isAuthenticated }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  // Format stars for rating display
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<span key={i} className="text-yellow-500">★</span>);
    } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
      stars.push(<span key={i} className="text-yellow-500">★</span>);
    } else {
      stars.push(<span key={i} className="text-gray-300">★</span>);
    }
  }

  // Handle profile view click 
  const handleViewProfileClick = () => {
    // Navigate to volunteer profile page
    navigate(`/volunteers/${id}/profile`);
  };
  
  // Handle request services button click
  const handleRequestServicesClick = () => {
    if (!isAuthenticated) {
      // Dispatch an event to show auth message
      window.dispatchEvent(new CustomEvent('app:requireAuth', {
        detail: { message: 'Please log in to request services from volunteers' }
      }));
      
      // Navigate to home page
      navigate('/', { replace: true });
      return;
    }
    
    // If authenticated, navigate to dedicated request services page
    navigate(`/volunteers/${id}/request`);
  };
  
  return (
    <motion.div 
      className={`bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 ${isHovered ? 'shadow-xl scale-[1.02]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
    >
      {/* Card Image */}
      <div className="h-40 overflow-hidden relative">
        <img 
          src={photo || "https://via.placeholder.com/300x150?text=Volunteer"} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 rounded-full px-1.5 py-0.5 shadow-lg">
            <div className="flex items-center">
              <span className="flex mr-1">{stars}</span>
              <span className="text-sm font-semibold">({rating.toFixed(1)})</span>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-3 left-4">
          <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-md">
            Verified Profile
          </span>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-primary-700">{name}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded-full shadow-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Trusted
          </span>
        </div>
        
        <div className="flex items-center text-gray-500 mb-2 bg-gray-50 px-2 py-1 rounded-lg shadow-sm">
          <svg className="w-4 h-4 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">{location}</span>
        </div>
        
        {/* Description */}
        <p className="text-gray-600 text-xs mb-2">{description || "No description provided"}</p>
        
        {/* Skills/Tags */}
        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {skills.slice(0, 3).map((skill, index) => (
              <span 
                key={index}
                className="px-1.5 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full shadow-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full shadow-sm">
                +{skills.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="mt-2 flex justify-between space-x-2">
          <button
            onClick={handleViewProfileClick}
            className="flex-1 px-2 py-1.5 text-indigo-600 border border-indigo-500 hover:bg-indigo-50 text-xs rounded-md transition-all duration-300 font-medium flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Profile
          </button>
          <button
            onClick={handleRequestServicesClick}
            className="flex-1 px-2 py-1.5 bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white text-xs rounded-md transition-all duration-300 transform hover:shadow-lg font-medium flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Request Services
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default VolunteerCard;
