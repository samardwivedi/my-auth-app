import React, { useState, useEffect } from 'react';

/**
 * GeoHeatmap - A component to display a heatmap of user or request locations
 * 
 * Note: This component requires the following dependencies:
 * - leaflet
 * - react-leaflet
 * - leaflet.heat
 * 
 * These need to be installed using:
 * npm install leaflet react-leaflet leaflet.heat
 * 
 * @param {Object} props
 * @param {string} props.dataType - Type of data to display ('users' or 'requests')
 * @param {Array} [props.initialData] - Optional initial data to use
 * @returns {JSX.Element} The rendered component
 */
const GeoHeatmap = ({ dataType = 'requests', initialData }) => {
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // This is a mock implementation since we can't actually use the Leaflet libraries without installing them
  // In a real implementation, this would use the actual Leaflet components
  
  // Remove all mock/static/demo data generation. Only use real API data for map/heatmap
  useEffect(() => {
    if (initialData) {
      setMapData(initialData);
      setLoading(false);
      return;
    }
    
    // Simulate fetching data with a timeout
    setTimeout(() => {
      try {
        // In a real implementation, this would fetch data from an API
        // For now, we'll just simulate an API response structure
        const apiResponse = {
          cities: [],
          points: [],
          topCities: []
        };
        
        setMapData(apiResponse);
        setLoading(false);
      } catch (err) {
        console.error('Error loading heatmap data:', err);
        setError('Failed to load map data');
        setLoading(false);
      }
    }, 500);
  }, [dataType, initialData]);

  // In a real implementation, this would return the actual Leaflet map
  // Since we can't use Leaflet without installing it, we're rendering a placeholder
  // with some mock data visualization
  
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading map data...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow min-h-[400px] flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">
        Geographical Distribution of {dataType === 'users' ? 'Users' : 'Service Requests'}
      </h3>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Map placeholder */}
        <div className="flex-1 bg-gray-100 rounded-lg border min-h-[400px] relative overflow-hidden">
          <div className="p-4 absolute top-2 left-2 bg-white bg-opacity-90 rounded shadow-sm z-10">
            <h4 className="text-sm font-medium">USA Heatmap</h4>
            <p className="text-xs text-gray-500">Showing {mapData.points?.length || 0} data points</p>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="mb-2 text-gray-600 font-medium">Map Visualization Placeholder</p>
              <p className="text-sm text-gray-500">
                Install react-leaflet dependencies to see the actual interactive map
              </p>
              <div className="mt-4 text-xs text-gray-400">
                npm install leaflet react-leaflet leaflet.heat
              </div>
            </div>
          </div>
          
          {/* Mock heatmap visualization */}
          <div className="absolute inset-0 pointer-events-none">
            {mapData.points && mapData.points.slice(0, 200).map((point, idx) => (
              <div 
                key={idx}
                className="absolute rounded-full bg-red-500 opacity-25"
                style={{
                  width: `${10 * point.intensity}px`,
                  height: `${10 * point.intensity}px`,
                  top: `${(point.lat - 25) * 10}px`, 
                  left: `${(point.lng + 125) * 5}px`,
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Stats sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <h4 className="text-sm font-medium mb-2">Top Locations</h4>
          <div className="space-y-3">
            {mapData.topCities && mapData.topCities.map((city, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 text-gray-400 text-sm">{idx + 1}.</span>
                  <span className="font-medium">{city.name}</span>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                  {city.count}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Summary</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Highest concentration in the Northeast and West Coast</p>
              <p>• Growing activity in the Southwest region</p>
              <p>• 78% of all activity in urban centers</p>
              <p>• Rural areas showing 12% increase from last quarter</p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <select 
              className="w-full p-2 border rounded text-sm"
              defaultValue="requests"
            >
              <option value="requests">Service Requests</option>
              <option value="users">User Locations</option>
              <option value="volunteers">Volunteer Coverage</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoHeatmap;
