import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthModal from '../auth/AuthModal';
import { useTheme } from '../../contexts/ThemeContext';

export default function Navbar({ onLogout }) {
  const { darkMode, toggleTheme } = useTheme();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('customer');
  const navigate = useNavigate();

  // Check auth status and set up auth state listeners
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const rawUser = localStorage.getItem('user');
      setIsLoggedIn(!!token);
      
      if (token && rawUser) {
        try {
          const user = JSON.parse(rawUser);
          setUserType(user.userType || 'customer');
        } catch (err) {
          console.error('Error parsing user data:', err);
        }
      }
    };
    
    // Initial check
    checkAuthStatus();
    
    // Set up listeners for auth state changes
    const handleAuthLogin = () => {
      checkAuthStatus();
    };
    
    const handleAuthStateChanged = (e) => {
      checkAuthStatus();
    };
    
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuthStatus();
      }
    };
    
    // Add event listeners
    window.addEventListener('auth:login', handleAuthLogin);
    window.addEventListener('auth:stateChanged', handleAuthStateChanged);
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up
    return () => {
      window.removeEventListener('auth:login', handleAuthLogin);
      window.removeEventListener('auth:stateChanged', handleAuthStateChanged);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Detect scrolling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    if (onLogout) onLogout();
    navigate('/');
  };

  return (
    <nav className={`fixed w-full top-0 z-40 ${
      isScrolled 
        ? 'bg-white dark:bg-gray-800 shadow-lg' 
        : 'bg-gradient-to-r from-primary-700 to-primary-600 dark:from-primary-900 dark:to-primary-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/images/brandlogo.png" alt="Logo" className="h-8 w-auto mr-2" />
            <span className={`text-lg font-bold ${
              isScrolled ? 'text-primary-600 dark:text-primary-200' : 'text-white'
            }`}>
              Helpora
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/" className={`px-2 py-1 rounded text-sm ${
              isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
            }`}>Home</Link>
            
            <Link to="/chat" className={`px-2 py-1 rounded text-sm ${
              isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
            }`}>Chat with us</Link>
            
            {isLoggedIn && userType === 'customer' && (
              <Link to="/become-helper" className={`px-2 py-1 rounded text-sm ${
                isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
              }`}>Become a Helper</Link>
            )}
            
            {isLoggedIn && (
              <Link to={userType === 'admin' ? '/admin' : userType === 'volunteer' ? '/volunteer-dashboard' : '/user-dashboard'} 
                className={`px-2 py-1 rounded text-sm ${
                  isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
                }`}>
                {userType === 'admin' ? 'Admin Dashboard' : userType === 'volunteer' ? 'Helper Dashboard' : 'User Dashboard'}
              </Link>
            )}
            
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className={`px-2 py-1 rounded text-sm ${
                  isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
                }`}>
                Logout
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={isScrolled
                  ? 'bg-primary-600 text-white px-3 py-1 rounded text-sm'
                  : 'bg-white text-primary-600 dark:bg-gray-800 dark:text-primary-300 px-3 py-1 rounded text-sm'
                }>
                Login/Signup
              </button>
            )}
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={isScrolled
                ? 'p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                : 'p-1 rounded-full bg-primary-500 text-white'
              }
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className={`mt-2 py-2 md:hidden ${
            isScrolled ? 'bg-white dark:bg-gray-800' : 'bg-primary-600 dark:bg-primary-800'
          }`}>
            <Link to="/" 
              className={`block px-3 py-2 ${
                isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            
            <Link to="/chat" 
              className={`block px-3 py-2 ${
                isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}>
              Chat with us
            </Link>
            
            {isLoggedIn && userType === 'customer' && (
              <Link to="/become-helper" 
                className={`block px-3 py-2 ${
                  isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}>
                Become a Helper
              </Link>
            )}
            
            {isLoggedIn && (
              <Link to={userType === 'admin' ? '/admin' : userType === 'volunteer' ? '/volunteer-dashboard' : '/user-dashboard'} 
                className={`block px-3 py-2 ${
                  isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}>
                {userType === 'admin' ? 'Admin Dashboard' : userType === 'volunteer' ? 'Helper Dashboard' : 'User Dashboard'}
              </Link>
            )}
            
            {isLoggedIn ? (
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 ${
                  isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
                }`}>
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 ${
                  isScrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white'
                }`}>
                Login / Sign Up
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
}
