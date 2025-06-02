import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalAnimation, setModalAnimation] = useState('');
  const [closing, setClosing] = useState(false);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  // Define handleClose using useCallback to prevent recreation on every render
  const handleClose = useCallback(() => {
    setClosing(true);
    setModalAnimation('animate-fade-out');
    
    // Wait for animation to complete before fully closing
    setTimeout(() => {
      onClose();
      setClosing(false);
    }, 300);
  }, [onClose]);

  // Handle modal open/close animations
  useEffect(() => {
    if (isOpen) {
      setClosing(false);
      setModalAnimation('animate-fade-in');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && isOpen && !closing) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closing, handleClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen && !closing) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, closing, handleClose]);

  // Email validation using regex
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validate fields
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (!isLogin && username.length < 3) {
      setError('Username must be at least 3 characters');
      setLoading(false);
      return;
    }
    
    try {
      const endpoint = isLogin ? 'login' : 'signup';
      const userData = isLogin 
        ? { email, password }
        : { username, email, password };
      
      console.log(`Attempting to ${endpoint} with:`, userData);
      
      console.log(`API_BASE_URL: ${API_BASE_URL}`);
      const apiUrl = `${API_BASE_URL}/api/auth/${endpoint}`;
      console.log(`Attempting to fetch from: ${apiUrl}`);
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        
        console.log(`Response status: ${response.status}, ${response.statusText}`);
        
        // Check if the server is responding properly
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Non-JSON response received:', contentType);
          throw new Error('Server returned an invalid response. The backend server might not be running or accessible.');
        }
        
        // Parse JSON directly from the response
        const data = await response.json();
        console.log('Parsed JSON data:', data);
      
        if (!response.ok) {
          console.error('Server error response:', data);
          throw new Error(data.error || `Failed to ${isLogin ? 'login' : 'register'}`);
        }
        
        console.log(`${endpoint} successful:`, data);
      
        // Store token and user data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Dispatch authentication events
        window.dispatchEvent(new CustomEvent('auth:login'));
        window.dispatchEvent(new CustomEvent('auth:stateChanged', { 
          detail: { isAuthenticated: true } 
        }));
        
        // Close modal and redirect to user's dashboard based on role
        handleClose();
        
        // Redirect to the appropriate dashboard based on user type
        if (data.user.userType === 'admin') {
          navigate('/admin');
        } else if (data.user.userType === 'volunteer') {
          navigate('/volunteer-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      } catch (error) {
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') || 
            error.message.includes('invalid response') ||
            error.message.includes('Not Found')) {
          setError('Cannot connect to the server. Please make sure the backend server is running.');
          console.error('Connection Error:', error);
        } else {
          throw error; // Re-throw other errors to be caught by the outer catch
        }
      }
      
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  if (!isOpen && !closing) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm ${modalAnimation}`}>
      <div 
        ref={modalRef}
        className={`bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden transform transition-all duration-300 ${
          isLogin ? 'animate-slide-up' : 'animate-slide-down'
        }`}
      >
        {/* Modal Header with Gradient */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-500 px-6 py-5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {isLogin ? 'Welcome Back' : 'Join Our Community'}
          </h2>
          <button 
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors transform hover:rotate-90 duration-300"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 px-4 text-center transition-all duration-300 ${
              isLogin ? 'auth-tab-active' : 'auth-tab-inactive'
            }`}
            onClick={() => isLogin ? null : switchMode()}
          >
            Login
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center transition-all duration-300 ${
              !isLogin ? 'auth-tab-active' : 'auth-tab-inactive'
            }`}
            onClick={() => !isLogin ? null : switchMode()}
          >
            Sign Up
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4 animate-shake">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="floating-label animate-slide-down">
                <input
                  type="text"
                  id="username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:auth-input-focus transition-all"
                  placeholder=" "
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                />
                <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
              </div>
            )}

            <div className={`floating-label ${!isLogin ? "animate-slide-down" : ""}`}>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:auth-input-focus transition-all"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
            </div>

            <div className={`floating-label ${!isLogin ? "animate-slide-down" : ""}`}>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:auth-input-focus transition-all"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] btn-hover-effect ${
                isLogin 
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800' 
                  : 'bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading 
                ? (isLogin ? 'Logging in...' : 'Creating account...') 
                : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin 
                ? "Don't have an account yet?" 
                : "Already have an account?"}
              <button
                type="button"
                onClick={switchMode}
                className="ml-1 text-primary-600 hover:text-primary-800 font-medium transition-colors"
              >
                {isLogin 
                  ? 'Sign up now' 
                  : 'Login instead'}
              </button>
            </p>
          </div>

          {/* Message for new users */}
          {isLogin && (
            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-primary-500 rounded-md animate-slide-up">
              <p className="text-sm text-primary-800">
                <span className="font-medium">New to Helpora?</span> Sign up to join our community and start making a difference today!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
