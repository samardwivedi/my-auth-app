import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import AvailabilityManager from '../components/AvailabilityManager';
import TransactionHistory from '../components/payments/TransactionHistory';

const DEFAULT_PHOTO = '/images/avatar-placeholder.jpg';

export default function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState([]);
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilitySchedule, setAvailabilitySchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [showAvailabilitySettings, setShowAvailabilitySettings] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [languages, setLanguages] = useState('');
  const [bio, setBio] = useState('');
  const [serviceAreas, setServiceAreas] = useState('');
  const navigate = useNavigate();
  
  const validateField = (name, value) => {
    let errorMessage = '';
    
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errorMessage = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
        if (value && !phoneRegex.test(value)) {
          errorMessage = 'Please enter a valid phone number (10 digits)';
        }
        break;
      case 'location':
        if (value && value.length < 3) {
          errorMessage = 'Location must be at least 3 characters';
        }
        break;
      default:
        break;
    }
    
    return errorMessage;
  };

  // Fetch user profile when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // If no token, redirect to login
    if (!token) {
      navigate('/login');
      return;
    }
    
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch profile');
        }
        
        // Update state with fetched profile data
        setName(data.name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setLocation(data.location || '');
        setSkills(Array.isArray(data.skills) ? data.skills : (data.skills ? [data.skills] : []));
        setDescription(data.description || '');
        setIsAvailable(data.isAvailable !== undefined ? data.isAvailable : true);
        setAvailabilitySchedule(data.availabilitySchedule || []);
        setProfilePhoto(data.profilePhoto || '');
        setLanguages(Array.isArray(data.languages) ? data.languages : (data.languages ? [data.languages] : []));
        setBio(data.bio || '');
        setServiceAreas(data.serviceAreas || '');
        
        // Determine user role
        if (data.role === 'admin') {
          setUserRole('admin');
        } else if (data.role === 'volunteer' || data.isVolunteer || (Array.isArray(data.skills) && data.skills.length > 0)) {
          setUserRole('volunteer');
          setIsVolunteer(true);
        } else {
          setUserRole('user');
        }
      } catch (err) {
        setError(err.message);
        // If token is invalid, redirect to login
        if (err.message.includes('Invalid token')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchProfile();
  }, [navigate]);

  const validateForm = () => {
    const newFieldErrors = {};
    
    newFieldErrors.email = validateField('email', email);
    newFieldErrors.phone = validateField('phone', phone);
    newFieldErrors.location = validateField('location', location);
    
    // Filter out empty error messages
    const filteredErrors = Object.fromEntries(
      Object.entries(newFieldErrors).filter(([_, value]) => value !== '')
    );
    
    // Return true if no errors
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Validate form first
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ name, email, phone, location, skills, description }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      
      // Update localStorage with new user data
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...user, name: data.name, email: data.email }));
      
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
      // If token is invalid, redirect to login
      if (err.message.includes('Invalid token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto px-2 sm:px-6 py-6 sm:py-12">
      {initialLoading ? (
        <div className="flex justify-center">
          <p className="text-lg">Loading profile data...</p>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-primary mb-6 text-center flex items-center justify-center">
            {userRole === 'volunteer' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                'Your Volunteer Profile'
                <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Volunteer</span>
              </>
            ) : userRole === 'admin' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                'Admin Profile'
                <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Admin</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                'Your User Profile'
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">User</span>
              </>
            )}
          </h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}
          
          <div className="flex flex-col items-center mb-6">
            <img
              src={profilePhoto ? (profilePhoto.startsWith('http') ? profilePhoto : `${API_BASE_URL}/uploads/${profilePhoto}`) : DEFAULT_PHOTO}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-400 shadow mb-2"
              onError={e => { e.target.onerror = null; e.target.src = DEFAULT_PHOTO; }}
            />
            <div className="text-lg font-semibold text-gray-800 mt-1">{name}</div>
            <div className="text-sm text-gray-500">{email}</div>
          </div>

          {/* Helper Details Section */}
          {userRole === 'volunteer' && (
            <div className="mb-6 bg-blue-50 rounded-xl p-4 shadow">
              <div className="mb-2"><span className="font-medium text-gray-700">Languages:</span> {languages.length ? languages.join(', ') : 'N/A'}</div>
              <div className="mb-2"><span className="font-medium text-gray-700">Bio:</span> {bio || 'N/A'}</div>
              <div className="mb-2"><span className="font-medium text-gray-700">Service Areas:</span> {serviceAreas || 'N/A'}</div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Full Name
                </div>
              </label>
              <input
                type="text"
                id="name"
                className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </div>
              </label>
              <input
                type="email"
                id="email"
                className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Phone Number
                </div>
              </label>
              <input
                type="tel"
                id="phone"
                className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location
                </div>
              </label>
              <input
                type="text"
                id="location"
                className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your location (e.g., Delhi, Mumbai)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Enter your city name for better search results
              </p>
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Skills
                </div>
              </label>
              <input
                type="text"
                id="skills"
                className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter skills you can offer (e.g., tutoring, cooking), separated by commas"
                value={Array.isArray(skills) ? skills.join(', ') : skills}
                onChange={(e) => setSkills(e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill))}
                required
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.isArray(skills) && skills.map((skill, index) => (
                  <span key={index} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Enter multiple skills separated by commas
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Description
                </div>
              </label>
              <textarea
                id="description"
                className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tell us a little about yourself and why you want to volunteer"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white py-2 px-3 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {loading ? 'Updating Profile...' : 'Submit Profile'}
              </div>
            </button>
            
            {/* Availability Toggle Button */}
            <div className="mt-6">
              <button
                type="button"
                className="w-full border border-blue-500 text-blue-600 hover:bg-blue-50 py-1.5 px-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center"
                onClick={() => setShowAvailabilitySettings(!showAvailabilitySettings)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {showAvailabilitySettings ? 'Hide Availability Settings' : 'Manage Your Availability'}
              </button>
            </div>
          
          {/* Transaction History Toggle Button (Only for volunteers) */}
          {isVolunteer && (
            <div className="mt-3">
              <button
                type="button"
                className="w-full border border-indigo-500 text-indigo-600 hover:bg-indigo-50 py-1.5 px-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center"
                onClick={() => setShowTransactionHistory(!showTransactionHistory)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                {showTransactionHistory ? 'Hide Transaction History' : 'View Your Transaction History'}
              </button>
            </div>
          )}
        </form>

          {/* Availability Settings Section */}
          {showAvailabilitySettings && (
            <div className="mt-6 bg-white p-4 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Availability Settings
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Schedule
                </span>
              </h3>
              <AvailabilityManager 
                volunteerInfo={
                  {
                    isAvailable, 
                    availabilitySchedule,
                    name,
                    email,
                    phone,
                    location,
                    skills,
                    description
                  }
                }
                onAvailabilityUpdated={(data) => {
                  setSuccessMessage('Availability updated successfully!');
                  // Update local state with the new availability settings
                  setIsAvailable(data.isAvailable);
                  setAvailabilitySchedule(data.availabilitySchedule);
                }}
              />
            </div>
          )}
          
          {/* Transaction History Section */}
          {showTransactionHistory && isVolunteer && (
            <div className="mt-6 bg-white p-4 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Transaction History
                <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Payments
                </span>
              </h3>
              <TransactionHistory />
            </div>
          )}
        </>
      )}
    </div>
  );
}
