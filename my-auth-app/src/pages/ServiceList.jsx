// src/pages/ServiceList.jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VolunteerCard from '../components/VolunteerCard';
import AdvancedSearch from '../components/AdvancedSearch';

export default function ServiceList() {
  const { type } = useParams();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    // Listen for auth changes (like login/logout events)
    const handleAuthChange = (e) => {
      // If this is an auth:stateChanged event with detail
      if (e && e.detail && e.detail.isAuthenticated !== undefined) {
        setIsAuthenticated(e.detail.isAuthenticated);
      } else {
        // Otherwise check localStorage
        const newToken = localStorage.getItem('token');
        setIsAuthenticated(!!newToken);
      }
    };
    
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('app:logout', handleAuthChange);
    window.addEventListener('auth:stateChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('app:logout', handleAuthChange);
      window.removeEventListener('auth:stateChanged', handleAuthChange);
    };
  }, []);

  // Setup event listener for auth requirement messages
  useEffect(() => {
    const handleAuthRequirement = (e) => {
      if (e.detail?.message) {
        // Dispatch the message to App component
        window.dispatchEvent(new CustomEvent('app:requireAuth', {
          detail: { message: e.detail.message }
        }));
      }
    };
    
    window.addEventListener('app:requireAuth', handleAuthRequirement);
    return () => window.removeEventListener('app:requireAuth', handleAuthRequirement);
  }, []);

  // Fetch volunteers based on service type or filters
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        setLoading(true);
        // API call logic (simplified)
        const response = await fetch(`/api/search/volunteers?type=${type || ''}`);
        if (!response.ok) throw new Error('Failed to fetch volunteers');
        const data = await response.json();
        setVolunteers(data);
        setError(null);
      } catch (err) {
        console.error('Error in fetchVolunteers:', err);
        setError(`Failed to load volunteers: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVolunteers();
  }, [type, filters]);

  // Handler for AdvancedSearch
  const handleAdvancedSearch = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Section (simplified) */}
      <div className="mb-8 sm:mb-12 bg-primary-600 p-4 sm:p-8 text-white rounded-lg">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">{type} Services</h1>
        <p className="mb-4 sm:mb-6">Find qualified {type?.toLowerCase()} professionals ready to help.</p>
        <div className="bg-white p-3 sm:p-4 rounded-xl">
          <AdvancedSearch onSearch={handleAdvancedSearch} />
        </div>
      </div>

      {/* Main content */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-8">Available {type} Professionals</h2>
        
        {/* Loading State */}
        {loading && <div className="text-center p-8">Loading...</div>}

        {/* Error State */}
        {error && <div className="bg-red-100 p-4 mb-6">{error}</div>}

        {/* Filtered Volunteers */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {volunteers.map((vol) => (
              <VolunteerCard 
                key={vol._id}
                id={vol._id}
                name={vol.name} 
                location={vol.location || 'Location not specified'} 
                description={vol.description}
                rating={4.5} 
                skills={vol.skills}
                photo={vol.photoUrl}
                /* Pass the authentication status */
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
        
        {/* No results */}
        {!loading && !error && volunteers.length === 0 && (
          <div className="text-center p-8">
            <p className="text-xl text-gray-500">No volunteers found</p>
          </div>
        )}
      </div>
    </div>
  );
}
