import React, { useState } from 'react';

// Google Places Autocomplete will require a script in index.html and/or a package like @react-google-maps/api
// For now, we use a simple input and leave a placeholder for integration

const AdvancedSearch = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    location: '',
    
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    
    // Immediately trigger search when location changes
    if (name === 'location' && onSearch) {
      onSearch({ ...filters, [name]: value });
    }
    
    // Immediately trigger search when location changes
    if (name === 'location' && onSearch) {
      onSearch({ ...filters, [name]: value });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Make sure we're sending all filter parameters to the backend
    if (onSearch) onSearch(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4 w-full">
      <input
        type="text"
        name="location"
        placeholder="Location (e.g., Delhi, Mumbai)"
        value={filters.location}
        onChange={handleInputChange}
        className="border p-2 rounded flex-1 w-full md:w-auto"
      />
  
      
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full md:w-auto">Search</button>
    </form>
  );
};

export default AdvancedSearch;
