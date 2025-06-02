import React from 'react';
import RequestTrendsChart from '../components/RequestTrendsChart';

/**
 * RequestTrendsDemo - A demonstration page for the RequestTrendsChart component
 * 
 * This page showcases the RequestTrendsChart component with its default settings,
 * using dummy data generated internally by the component.
 */
const RequestTrendsDemo = () => {
  // Optional callback for when the range changes in the chart
  const handleRangeChange = (range, customRange) => {
    console.log(`Range changed to: ${range}`);
    if (customRange) {
      console.log(`Custom range: ${customRange.from} to ${customRange.to}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Request Trends Chart Demo</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Default Chart with Dummy Data</h2>
        <p className="text-gray-600 mb-4">
          This chart shows a line graph of request trends over time using randomly generated data.
          You can toggle between 7 days, 30 days, and a custom date range.
        </p>
        
        <RequestTrendsChart 
          onRangeChange={handleRangeChange}
        />
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Usage Instructions</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="font-mono text-sm">
            {`
// Import the component
import RequestTrendsChart from '../components/RequestTrendsChart';

// Use the component with default dummy data
<RequestTrendsChart />

// Or provide your own data and handle range changes
<RequestTrendsChart 
  initialData={yourDataArray}
  onRangeChange={(range, customRange) => {
    // Handle range changes
  }}
/>
            `}
          </p>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-2">Component Features</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Displays line graph showing number of requests per day</li>
          <li>Includes tooltips that show the date and number of requests</li>
          <li>Toggle between 7 days, 30 days, and a custom date range</li>
          <li>Generates realistic dummy data with trends when no data is provided</li>
          <li>Shows summary statistics below the chart</li>
          <li>Fully responsive design that works on all screen sizes</li>
        </ul>
      </div>
    </div>
  );
};

export default RequestTrendsDemo;
