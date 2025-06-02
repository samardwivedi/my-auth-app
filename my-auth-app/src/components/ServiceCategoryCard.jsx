import React, { memo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Pre-render SVG icons to avoid runtime calculations
const ServiceIcons = {
  electrician: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  plumber: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  doctor: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  room: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
};

// Helper functions outside component for better performance
function getServiceIcon(name) {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('electrician')) return ServiceIcons.electrician;
  if (nameLower.includes('plumber')) return ServiceIcons.plumber;
  if (nameLower.includes('doctor')) return ServiceIcons.doctor;
  if (nameLower.includes('room')) return ServiceIcons.room;
  return ServiceIcons.electrician; // Default icon instead of null
}

function getDefaultDescription(name) {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('electrician')) return 'Professional electrical service for home and business';
  if (nameLower.includes('plumber')) return 'Expert plumbing solutions for all your needs';
  if (nameLower.includes('doctor')) return 'Healthcare professionals at your service';
  if (nameLower.includes('room')) return 'Find the perfect accommodation for your stay';
  return 'Professional service';
}

const ServiceCategoryCard = memo(({ name, icon, description }) => {
  // Optimize state updates and prevent unnecessary rerenders
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const navigate = useNavigate();

  // Use memoized values to prevent recalculation on every render
  const serviceDescription = description || getDefaultDescription(name);
  const serviceIcon = getServiceIcon(name);
  // Only use icon as image path if it's a string
  const imageSrc = typeof icon === 'string' ? icon : undefined;
  if (icon && typeof icon !== 'string') {
    // Warn in dev if icon is not a string
    if (process.env.NODE_ENV !== 'production') {
      console.warn('ServiceCategoryCard: icon prop should be a string (image path), but received:', icon);
    }
  }
  
  // Use useCallback for event handlers
  const handleClick = useCallback(() => {
    navigate(`/services/${name}`);
  }, [navigate, name]);
  
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);
  
  const handleImageError = useCallback(() => {
    setImageFailed(true);
  }, []);

  return (
    <div 
      className="bg-white overflow-hidden rounded-xl shadow-md hover:shadow-xl will-change-transform w-full cursor-pointer transform-gpu transition-all duration-300 hover:-translate-y-1"
      onClick={handleClick}
      style={{ contain: 'content' }} // CSS containment for better performance
    >
      <div className="relative" style={{ aspectRatio: '16/9' }}>
        {/* Only show gradient when image is loaded */}
        {imageLoaded && 
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 pointer-events-none"></div>
        }
        
        {/* Placeholder shown while image loads */}
        {!imageLoaded && (
          <div className="w-full h-full bg-gray-200 animate-pulse"></div>
        )}
        
        {/* Image with explicit width/height to prevent layout shifts */}
        {imageSrc && !imageFailed && (
          <img 
            src={imageSrc} 
            alt={name}
            loading="lazy" 
            width="400"
            height="225"
            decoding="async"
            fetchpriority="low"
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{
              transition: 'opacity 0.2s',
              display: imageFailed ? 'none' : 'block'
            }}
          />
        )}
        
        {/* Fallback for image load failure */}
        {imageFailed && (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-white">{name}</span>
          </div>
        )}
        
        {/* Service name overlaid on the image */}
          <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
            <h3 className="text-xl font-bold text-white flex items-center">
              {name}
          <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
                Popular
              </span>
            </h3>
          </div>
      </div>
      
      <div className="p-3">
        <div className="flex items-start sm:items-center mb-2">
          <span className="p-1.5 bg-primary-100 rounded-lg text-primary-700 mr-2 flex-shrink-0 shadow-sm" aria-hidden="true">
            {serviceIcon}
          </span>
          <p className="text-sm text-gray-600">{serviceDescription}</p>
        </div>
        
        <div className="mt-2 flex justify-between items-center">
          <div className="flex space-x-1">
            <span className="text-xs font-medium text-primary-700 bg-primary-50 rounded-full px-2 py-0.5 shadow-sm">
              Available Now
            </span>
            <span className="text-xs font-medium text-green-700 bg-green-50 rounded-full px-2 py-0.5 shadow-sm">
              Verified
            </span>
          </div>
          <button className="text-xs font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-md px-2 py-0.5 transition-all duration-300 shadow hover:shadow-md">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
});

// Add display name for better debugging
ServiceCategoryCard.displayName = 'ServiceCategoryCard';

export default ServiceCategoryCard;
