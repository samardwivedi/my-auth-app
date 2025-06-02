import React from 'react';

/**
 * ConversionFunnel - A component that visualizes the user journey as a horizontal funnel
 * Shows conversion rates between stages: Visitors → Signups → Service Requests → Completed
 * 
 * @param {Object} props
 * @param {Object} props.data - The funnel data with counts for each stage
 * @param {number} props.data.visitors - Number of visitors
 * @param {number} props.data.signups - Number of signups
 * @param {number} props.data.requests - Number of service requests
 * @param {number} props.data.completed - Number of completed services
 * @returns {JSX.Element} The rendered component
 */
const ConversionFunnel = ({ data }) => {
  // Default data if not provided
  const funnelData = data || {
    visitors: 12500,
    signups: 3750,
    requests: 1875,
    completed: 1125
  };
  
  // Calculate percentages and conversion rates
  const maxValue = funnelData.visitors;
  const signupPercentage = (funnelData.signups / maxValue) * 100;
  const requestPercentage = (funnelData.requests / maxValue) * 100;
  const completedPercentage = (funnelData.completed / maxValue) * 100;
  
  const signupConversion = ((funnelData.signups / funnelData.visitors) * 100).toFixed(1);
  const requestConversion = ((funnelData.requests / funnelData.signups) * 100).toFixed(1);
  const completedConversion = ((funnelData.completed / funnelData.requests) * 100).toFixed(1);
  const overallConversion = ((funnelData.completed / funnelData.visitors) * 100).toFixed(1);
  
  // Define stage colors
  const stageColors = {
    visitors: { bg: '#3b82f6', text: '#eff6ff' },   // blue-500 / blue-50
    signups: { bg: '#6366f1', text: '#eef2ff' },    // indigo-500 / indigo-50
    requests: { bg: '#8b5cf6', text: '#f5f3ff' },   // violet-500 / violet-50
    completed: { bg: '#10b981', text: '#ecfdf5' }   // emerald-500 / emerald-50
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Conversion Funnel</h3>
        <div className="text-sm text-gray-500">
          Overall Conversion: <span className="font-bold text-green-600">{overallConversion}%</span>
        </div>
      </div>
      
      {/* Funnel visualization */}
      <div className="space-y-4 mb-6">
        {/* Visitors */}
        <div className="relative">
          <div
            className="h-12 rounded-lg flex items-center justify-between px-4 transition-all duration-500"
            style={{ 
              width: '100%', 
              backgroundColor: stageColors.visitors.bg, 
              color: stageColors.visitors.text 
            }}
          >
            <div className="font-medium">Visitors</div>
            <div className="font-bold">{funnelData.visitors.toLocaleString()}</div>
          </div>
          {/* Arrow down with conversion rate */}
          <div className="absolute right-0 -bottom-4 flex flex-col items-center">
            <div className="text-xs text-gray-500">↓ {signupConversion}%</div>
          </div>
        </div>
        
        {/* Signups */}
        <div className="relative">
          <div
            className="h-12 rounded-lg flex items-center justify-between px-4 transition-all duration-500"
            style={{ 
              width: `${signupPercentage}%`, 
              backgroundColor: stageColors.signups.bg, 
              color: stageColors.signups.text,
              minWidth: '120px'
            }}
          >
            <div className="font-medium">Signups</div>
            <div className="font-bold">{funnelData.signups.toLocaleString()}</div>
          </div>
          {/* Arrow down with conversion rate */}
          <div className="absolute right-0 -bottom-4 flex flex-col items-center">
            <div className="text-xs text-gray-500">↓ {requestConversion}%</div>
          </div>
        </div>
        
        {/* Service Requests */}
        <div className="relative">
          <div
            className="h-12 rounded-lg flex items-center justify-between px-4 transition-all duration-500"
            style={{ 
              width: `${requestPercentage}%`, 
              backgroundColor: stageColors.requests.bg, 
              color: stageColors.requests.text,
              minWidth: '160px'
            }}
          >
            <div className="font-medium">Service Requests</div>
            <div className="font-bold">{funnelData.requests.toLocaleString()}</div>
          </div>
          {/* Arrow down with conversion rate */}
          <div className="absolute right-0 -bottom-4 flex flex-col items-center">
            <div className="text-xs text-gray-500">↓ {completedConversion}%</div>
          </div>
        </div>
        
        {/* Completed */}
        <div className="relative">
          <div
            className="h-12 rounded-lg flex items-center justify-between px-4 transition-all duration-500"
            style={{ 
              width: `${completedPercentage}%`, 
              backgroundColor: stageColors.completed.bg, 
              color: stageColors.completed.text,
              minWidth: '140px'
            }}
          >
            <div className="font-medium">Completed</div>
            <div className="font-bold">{funnelData.completed.toLocaleString()}</div>
          </div>
        </div>
      </div>
      
      {/* Insights section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Insights:</h4>
        <ul className="text-sm space-y-1 text-gray-600">
          {signupConversion < 20 && (
            <li className="flex items-start">
              <span className="text-red-500 mr-1">•</span> 
              Low visitor-to-signup conversion ({signupConversion}%) - Consider improving the signup flow.
            </li>
          )}
          {requestConversion < 40 && (
            <li className="flex items-start">
              <span className="text-amber-500 mr-1">•</span> 
              Only {requestConversion}% of signups make service requests - May need better onboarding.
            </li>
          )}
          {completedConversion < 50 && (
            <li className="flex items-start">
              <span className="text-red-500 mr-1">•</span> 
              Low request completion rate ({completedConversion}%) - Investigate service delivery issues.
            </li>
          )}
          {completedConversion >= 70 && (
            <li className="flex items-start">
              <span className="text-green-500 mr-1">•</span> 
              Strong completion rate ({completedConversion}%) - Service delivery is working well.
            </li>
          )}
          {overallConversion < 10 && (
            <li className="flex items-start">
              <span className="text-red-500 mr-1">•</span> 
              Overall conversion is low at {overallConversion}% - Review the entire user journey.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ConversionFunnel;
