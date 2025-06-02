import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Brush
} from 'recharts';

/**
 * Enhanced RequestTrendsChart - A component to display request trends over time with animations and interactive features
 * 
 * @param {Object} props
 * @param {Array} [props.initialData] - Optional initial data to use instead of generating dummy data
 * @param {Function} [props.onRangeChange] - Optional callback for when the range changes
 * @returns {JSX.Element} The rendered component
 */
const RequestTrendsChart = ({ initialData = null, onRangeChange = null }) => {
  // State for the selected time range
  const [timeRange, setTimeRange] = useState('7');
  
  // State for chart data
  const [requestData, setRequestData] = useState([]);
  
  // State for custom date range
  const [customDateRange, setCustomDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  
  // State for visible metrics and comparison mode
  const [visibleMetrics, setVisibleMetrics] = useState({
    requests: true,
    completions: true,
    cancellations: false
  });
  
  // State for comparison with previous month
  const [compareWithLastMonth, setCompareWithLastMonth] = useState(false);
  const [previousMonthData, setPreviousMonthData] = useState([]);
  const [comparisonStats, setComparisonStats] = useState({
    requests: { percentage: 0, isIncrease: true },
    completions: { percentage: 0, isIncrease: true },
    cancellations: { percentage: 0, isIncrease: true }
  });
  
  // Animation state
  const [chartVisible, setChartVisible] = useState(false);
  const [hoverDot, setHoverDot] = useState(null);
  
  // Make the chart visible after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setChartVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Generate enhanced dummy request data based on the selected range
  useEffect(() => {
    if (initialData) {
      setRequestData(initialData);
      return;
    }

    // Notify parent component of range change if callback provided
    if (onRangeChange) {
      onRangeChange(timeRange);
    }
    
    // If comparison is enabled, generate previous month data
    if (compareWithLastMonth) {
      generatePreviousMonthData();
    }
  }, [timeRange, initialData, onRangeChange, compareWithLastMonth]);
  
  // Effect to calculate comparison stats when data changes
  useEffect(() => {
    if (compareWithLastMonth && requestData.length > 0 && previousMonthData.length > 0) {
      calculateComparisonStats();
    }
  }, [requestData, previousMonthData, compareWithLastMonth]);

  // Apply custom date range with enhanced data
  const applyCustomDateRange = () => {
    const fromDate = new Date(customDateRange.from);
    const toDate = new Date(customDateRange.to);
    const data = [];
    
    // Calculate the number of days between dates
    const diffTime = Math.abs(toDate - fromDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    
    // Generate data for each day in the range
    for (let i = 0; i < diffDays; i++) {
      const date = new Date(fromDate);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      // Generate somewhat realistic data with multiple metrics
      const baseRequestCount = 20 + (Math.sin(i / (diffDays / 2) * Math.PI) * 15);
      const requestRandomVariation = Math.floor(Math.random() * 10);
      const requestCount = Math.max(0, Math.floor(baseRequestCount + requestRandomVariation));
      
      // Generate completion data (usually less than requests)
      const completionBaseCount = baseRequestCount * 0.7;
      const completionRandomVariation = Math.floor(Math.random() * 8);
      const completionCount = Math.max(0, Math.floor(completionBaseCount + completionRandomVariation));
      
      // Generate cancellation data (usually much less than requests)
      const cancellationBaseCount = baseRequestCount * 0.15;
      const cancellationRandomVariation = Math.floor(Math.random() * 4);
      const cancellationCount = Math.max(0, Math.floor(cancellationBaseCount + cancellationRandomVariation));
      
      data.push({
        date: dateString,
        requests: requestCount,
        completions: completionCount,
        cancellations: cancellationCount,
        formattedDate: new Date(dateString).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric'
        })
      });
    }
    
    setRequestData(data);
    
    // Notify parent component of range change if callback provided
    if (onRangeChange) {
      onRangeChange('custom', { from: customDateRange.from, to: customDateRange.to });
    }
  };

  // Generate data for the previous month for comparison
  const generatePreviousMonthData = () => {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const daysToShow = parseInt(timeRange, 10);
    const data = [];
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(lastMonth);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Generate somewhat realistic data with a trend and variations from current month
      const baseRequestCount = 15 + (Math.sin(i / (daysToShow / 2) * Math.PI) * 10);
      const requestRandomVariation = Math.floor(Math.random() * 8);
      const requestCount = Math.max(0, Math.floor(baseRequestCount + requestRandomVariation));
      
      // Generate completion data (usually less than requests)
      const completionBaseCount = baseRequestCount * 0.65; // Slightly worse than current month
      const completionRandomVariation = Math.floor(Math.random() * 7);
      const completionCount = Math.max(0, Math.floor(completionBaseCount + completionRandomVariation));
      
      // Generate cancellation data
      const cancellationBaseCount = baseRequestCount * 0.18; // Slightly worse than current month
      const cancellationRandomVariation = Math.floor(Math.random() * 5);
      const cancellationCount = Math.max(0, Math.floor(cancellationBaseCount + cancellationRandomVariation));
      
      data.push({
        date: dateString,
        requests: requestCount,
        completions: completionCount,
        cancellations: cancellationCount,
        formattedDate: new Date(dateString).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric'
        })
      });
    }
    
    setPreviousMonthData(data);
  };
  
  // Calculate comparison stats between current and previous month
  const calculateComparisonStats = () => {
    const currentTotals = {
      requests: requestData.reduce((sum, item) => sum + item.requests, 0),
      completions: requestData.reduce((sum, item) => sum + item.completions, 0),
      cancellations: requestData.reduce((sum, item) => sum + item.cancellations, 0)
    };
    
    const previousTotals = {
      requests: previousMonthData.reduce((sum, item) => sum + item.requests, 0),
      completions: previousMonthData.reduce((sum, item) => sum + item.completions, 0),
      cancellations: previousMonthData.reduce((sum, item) => sum + item.cancellations, 0)
    };
    
    const newComparisonStats = {
      requests: {
        percentage: previousTotals.requests === 0 ? 100 : 
          Math.round(((currentTotals.requests - previousTotals.requests) / previousTotals.requests) * 100),
        isIncrease: currentTotals.requests >= previousTotals.requests
      },
      completions: {
        percentage: previousTotals.completions === 0 ? 100 : 
          Math.round(((currentTotals.completions - previousTotals.completions) / previousTotals.completions) * 100),
        isIncrease: currentTotals.completions >= previousTotals.completions
      },
      cancellations: {
        percentage: previousTotals.cancellations === 0 ? 0 : 
          Math.round(((currentTotals.cancellations - previousTotals.cancellations) / previousTotals.cancellations) * 100),
        isIncrease: currentTotals.cancellations >= previousTotals.cancellations
      }
    };
    
    setComparisonStats(newComparisonStats);
  };

  // Toggle visibility of a metric
  const toggleMetricVisibility = (metric) => {
    setVisibleMetrics({
      ...visibleMetrics,
      [metric]: !visibleMetrics[metric]
    });
  };
  
  // Toggle comparison with previous month
  const toggleComparisonMode = () => {
    const newState = !compareWithLastMonth;
    setCompareWithLastMonth(newState);
    
    if (newState) {
      generatePreviousMonthData();
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  // Enhanced tooltip component with more info
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-xl rounded-md transition-all duration-300 ease-in-out" style={{
          transform: 'scale(1.02)',
          transition: 'all 0.3s ease'
        }}>
          <p className="font-bold text-gray-800 mb-2">{new Date(label).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              entry.value > 0 && (
                <p key={`item-${index}`} style={{color: entry.color}} className="flex items-center">
                  <span className="w-3 h-3 inline-block mr-2" style={{backgroundColor: entry.color, borderRadius: '50%'}}></span>
                  <span className="capitalize">{entry.name}: </span>
                  <span className="font-semibold ml-1">{entry.value}</span>
                </p>
              )
            ))}
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Custom dot for line chart with CSS transitions
  const CustomDot = (props) => {
    const isActive = hoverDot && hoverDot.cx === props.cx && hoverDot.cy === props.cy;
    
    // Filter out props that cause React warnings
    const { dataKey, payload, cx, cy, index, r, ...filteredProps } = props;
    // Convert any NaN values to strings
    const safeChildren = typeof props.children === 'number' && isNaN(props.children) 
      ? '' 
      : props.children;
    
    return (
      <circle
        {...filteredProps}
        cx={cx}
        cy={cy}
        onMouseEnter={() => setHoverDot(props)}
        onMouseLeave={() => setHoverDot(null)}
        r={isActive ? 8 : 4}
        fillOpacity={isActive ? 0.8 : 0.6}
        className="cursor-pointer transition-all duration-300"
        style={{
          transition: 'r 0.3s ease, fill-opacity 0.3s ease'
        }}
      >
        {safeChildren}
      </circle>
    );
  };

  // Get theme (safely, without relying on global context)
  const [darkMode, setDarkMode] = useState(false);
  
  // Check for dark mode preference using CSS media query
  useEffect(() => {
    // Check if user prefers dark mode at OS level
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mediaQuery.matches);
    
    // Listen for changes in preference
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    // Try to detect theme from body class if available (app specific)
    const hasDarkClass = document.body.classList.contains('dark-theme') 
      || document.body.classList.contains('dark-mode')
      || document.documentElement.classList.contains('dark');
      
    if (hasDarkClass) {
      setDarkMode(true);
    }
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className={`p-4 rounded-lg shadow transition-colors ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Request Trends</h3>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded transition-colors ${timeRange === '7' 
              ? 'bg-blue-600 text-white' 
              : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            onClick={() => handleTimeRangeChange('7')}
          >
            7 Days
          </button>
          <button
            className={`px-3 py-1 rounded transition-colors ${timeRange === '30' 
              ? 'bg-blue-600 text-white' 
              : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            onClick={() => handleTimeRangeChange('30')}
          >
            30 Days
          </button>
          <button
            className={`px-3 py-1 rounded transition-colors ${timeRange === 'custom' 
              ? 'bg-blue-600 text-white' 
              : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            onClick={() => handleTimeRangeChange('custom')}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Custom date range inputs */}
      {timeRange === 'custom' && (
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center">
            <span className={`mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>From:</span>
            <input
              type="date"
              value={customDateRange.to}
              onChange={(e) => setCustomDateRange({ ...customDateRange, to: e.target.value })}
              className="border p-1 rounded"
            />
          </div>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded"
            onClick={applyCustomDateRange}
          >
            Apply
          </button>
        </div>
      )}

      {/* Metric toggle buttons and comparison toggle */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center flex-wrap">
          <h4 className="text-sm font-medium mr-3">Show Metrics:</h4>
          <button
            className={`px-3 py-1 rounded flex items-center space-x-1 ${visibleMetrics.requests ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => toggleMetricVisibility('requests')}
          >
            <span className="w-3 h-3 inline-block rounded-full bg-blue-500"></span>
            <span>Requests</span>
          </button>
          <button
            className={`px-3 py-1 ml-2 rounded flex items-center space-x-1 ${visibleMetrics.completions ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            onClick={() => toggleMetricVisibility('completions')}
          >
            <span className="w-3 h-3 inline-block rounded-full bg-green-500"></span>
            <span>Completions</span>
          </button>
          <button
            className={`px-3 py-1 ml-2 rounded flex items-center space-x-1 ${visibleMetrics.cancellations ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
            onClick={() => toggleMetricVisibility('cancellations')}
          >
            <span className="w-3 h-3 inline-block rounded-full bg-red-500"></span>
            <span>Cancellations</span>
          </button>
        </div>
        
        <div className="flex items-center ml-auto">
          <label className="flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={compareWithLastMonth}
              onChange={toggleComparisonMode}
              className="mr-2 cursor-pointer"
            />
            <span className="text-sm font-medium">Compare with last month</span>
          </label>
        </div>
      </div>

      {/* Line chart with CSS animations */}
      <div 
        className="h-80 transition-all duration-500" 
        style={{ 
          opacity: chartVisible ? 1 : 0, 
          transform: chartVisible ? 'translateY(0)' : 'translateY(20px)'
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={requestData}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.7} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: '10px',
                fontFamily: 'system-ui, sans-serif',
              }}
              formatter={(value) => <span className="text-sm font-medium">{value}</span>}
            />
            
            {/* Dynamic lines based on visible metrics */}
            {visibleMetrics.requests && (
              <Line
                type="monotoneX"
                dataKey="requests"
                name="Requests"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={<CustomDot />}
                activeDot={{ r: 8, stroke: "#2563eb", strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            )}
            
            {visibleMetrics.completions && (
              <Line
                type="monotoneX"
                dataKey="completions"
                name="Completions"
                stroke="#10b981"
                strokeWidth={2}
                dot={<CustomDot />}
                activeDot={{ r: 8, stroke: "#10b981", strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-in-out"
              />
            )}
            
            {visibleMetrics.cancellations && (
              <Line
                type="monotoneX"
                dataKey="cancellations"
                name="Cancellations"
                stroke="#ef4444"
                strokeWidth={2}
                dot={<CustomDot />}
                activeDot={{ r: 8, stroke: "#ef4444", strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={1400}
                animationEasing="ease-in-out"
              />
            )}
            
            <Brush 
              dataKey="date" 
              height={30} 
              stroke="#8884d8"
              startIndex={timeRange === '30' ? Math.max(0, requestData.length - 10) : 0}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced stats summary with comparison */}
      {requestData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total Requests</p>
            <div>
              <p className="text-xl font-bold text-blue-700">
                {requestData.reduce((sum, item) => sum + item.requests, 0)}
              </p>
              {compareWithLastMonth && (
                <p className={`text-sm font-medium ${comparisonStats.requests.isIncrease ? 
                  (comparisonStats.requests.percentage > 0 ? 'text-green-600' : 'text-gray-500') : 
                  'text-red-600'}`}>
                  {comparisonStats.requests.isIncrease ? 
                    (comparisonStats.requests.percentage > 0 ? '📈' : '➡️') : 
                    '📉'} {comparisonStats.requests.isIncrease ? '+' : ''}
                  {comparisonStats.requests.percentage}% vs. last month
                </p>
              )}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Completions</p>
            <div>
              <p className="text-xl font-bold text-green-700">
                {visibleMetrics.completions ? requestData.reduce((sum, item) => sum + item.completions, 0) : '-'}
              </p>
              {compareWithLastMonth && visibleMetrics.completions && (
                <p className={`text-sm font-medium ${comparisonStats.completions.isIncrease ? 
                  (comparisonStats.completions.percentage > 0 ? 'text-green-600' : 'text-gray-500') : 
                  'text-red-600'}`}>
                  {comparisonStats.completions.isIncrease ? 
                    (comparisonStats.completions.percentage > 0 ? '📈' : '➡️') : 
                    '📉'} {comparisonStats.completions.isIncrease ? '+' : ''}
                  {comparisonStats.completions.percentage}% vs. last month
                </p>
              )}
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Cancellations</p>
            <div>
              <p className="text-xl font-bold text-red-700">
                {visibleMetrics.cancellations ? requestData.reduce((sum, item) => sum + item.cancellations, 0) : '-'}
              </p>
              {compareWithLastMonth && visibleMetrics.cancellations && (
                <p className={`text-sm font-medium ${!comparisonStats.cancellations.isIncrease ? 
                  (comparisonStats.cancellations.percentage > 0 ? 'text-green-600' : 'text-gray-500') : 
                  'text-red-600'}`}>
                  {!comparisonStats.cancellations.isIncrease ? 
                    (comparisonStats.cancellations.percentage > 0 ? '📈' : '➡️') : 
                    '📉'} {comparisonStats.cancellations.isIncrease ? '+' : ''}
                  {comparisonStats.cancellations.percentage}% vs. last month
                </p>
              )}
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">Highest Day</p>
            <p className="text-xl font-bold text-purple-700">
              {requestData.reduce((max, item) => Math.max(max, item.requests), 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestTrendsChart;
