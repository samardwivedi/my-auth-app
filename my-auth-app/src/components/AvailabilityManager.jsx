import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];

export default function AvailabilityManager({ volunteerInfo, onAvailabilityUpdated }) {
  const [isAvailable, setIsAvailable] = useState(volunteerInfo?.isAvailable || true);
  const [availabilitySchedule, setAvailabilitySchedule] = useState(
    volunteerInfo?.availabilitySchedule || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeDay, setActiveDay] = useState(DAYS_OF_WEEK[0]);
  
  // Initialize schedule if empty
  useEffect(() => {
    if ((availabilitySchedule || []).length === 0) {
      const defaultSchedule = DAYS_OF_WEEK.map(day => ({
        day,
        startTime: '09:00',
        endTime: '17:00'
      }));
      setAvailabilitySchedule(defaultSchedule);
    }
  }, [availabilitySchedule]);

  const saveAvailability = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ isAvailable, availabilitySchedule })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update availability');
      }
      
      const data = await response.json();
      if (onAvailabilityUpdated) {
        onAvailabilityUpdated(data);
      }
      setSuccess('Availability settings saved successfully!');
    } catch (err) {
      setError(err.message || 'Error saving availability');
    } finally {
      setLoading(false);
    }
  };

  const handleDayScheduleChange = (day, field, value) => {
    setAvailabilitySchedule(prev => 
      prev.map(slot => 
        slot.day === day ? { ...slot, [field]: value } : slot
      )
    );
  };

  const getDaySchedule = (day) => {
    return availabilitySchedule.find(slot => slot.day === day) || {
      day,
      startTime: '09:00',
      endTime: '17:00'
    };
  };

  // Toggle a specific time for the active day
  const toggleTimeSlot = (time) => {
    const daySchedule = getDaySchedule(activeDay);
    const startTime = parseInt(daySchedule.startTime.split(':')[0]);
    const endTime = parseInt(daySchedule.endTime.split(':')[0]);
    const slotTime = parseInt(time.split(':')[0]);
    
    // If the time is already within the range, we need to split the range or adjust boundaries
    if (slotTime >= startTime && slotTime < endTime) {
      // If it's at the start, move the start time up one hour
      if (slotTime === startTime) {
        handleDayScheduleChange(activeDay, 'startTime', `${startTime + 1}:00`);
      } 
      // If it's at the end - 1, move the end time down one hour
      else if (slotTime === endTime - 1) {
        handleDayScheduleChange(activeDay, 'endTime', `${endTime - 1}:00`);
      }
      // If it's in the middle, we'd need to split the range - for simplicity, just make it unavailable
      else {
        // This is complex to implement correctly in a simple component
        // For this demo, we'll just show an alert
        alert('Splitting time ranges is not supported in this demo. Please adjust the start or end times instead.');
      }
    } else {
      // If the time is just outside the current range, extend the range
      if (slotTime === endTime) {
        handleDayScheduleChange(activeDay, 'endTime', `${endTime + 1}:00`);
      } else if (slotTime === startTime - 1) {
        handleDayScheduleChange(activeDay, 'startTime', `${startTime - 1}:00`);
      }
      // Otherwise, it's a new detached slot, too complex for this demo
    }
  };

  const isTimeSelected = (time) => {
    const daySchedule = getDaySchedule(activeDay);
    const timeHour = parseInt(time.split(':')[0]);
    const startHour = parseInt(daySchedule.startTime.split(':')[0]);
    const endHour = parseInt(daySchedule.endTime.split(':')[0]);
    
    return timeHour >= startHour && timeHour < endHour;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Availability Settings</h2>

      {/* Overall availability toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Overall Availability</h3>
            <p className="text-sm text-gray-600">When turned off, you won't appear in search results</p>
          </div>
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isAvailable}
                onChange={() => setIsAvailable(!isAvailable)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">{isAvailable ? 'Available' : 'Unavailable'}</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Weekly schedule */}
      <div className={isAvailable ? '' : 'opacity-50 pointer-events-none'}>
        <h3 className="text-lg font-semibold mb-4">Weekly Schedule</h3>
        
        {/* Day selector tabs */}
        <div className="flex flex-wrap border-b mb-4">
          {DAYS_OF_WEEK.map(day => (
            <button
              key={day}
              className={`py-2 px-4 ${activeDay === day ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveDay(day)}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
        
        {/* Time selector for the active day */}
        <div className="mb-6">
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-medium">{activeDay}</span>
            <div className="flex space-x-4">
              <div>
                <label className="text-xs text-gray-600">Start Time</label>
                <select
                  value={getDaySchedule(activeDay).startTime}
                  onChange={(e) => handleDayScheduleChange(activeDay, 'startTime', e.target.value)}
                  className="ml-2 text-sm p-1 border border-gray-300 rounded"
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600">End Time</label>
                <select
                  value={getDaySchedule(activeDay).endTime}
                  onChange={(e) => handleDayScheduleChange(activeDay, 'endTime', e.target.value)}
                  className="ml-2 text-sm p-1 border border-gray-300 rounded"
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Time grid */}
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-13 gap-2 mt-4">
            {TIME_SLOTS.map(time => (
              <div 
                key={time}
                className={`text-center py-2 rounded text-xs sm:text-sm cursor-pointer ${
                  isTimeSelected(time) 
                    ? 'bg-blue-200 text-blue-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => toggleTimeSlot(time)}
              >
                {time}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <p>{success}</p>
        </div>
      )}
      
      {/* Save button */}
      <div className="mt-6 text-right">
        <button
          onClick={saveAvailability}
          disabled={loading}
          className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow transition-colors ${
            loading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Saving...' : 'Save Availability Settings'}
        </button>
      </div>
    </div>
  );
}
