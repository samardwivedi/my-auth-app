import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Authentication Guard Component
 * 
 * Protects routes/components that require authentication.
 * Redirects unauthenticated users to home page with a message.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components to render if authenticated
 * @param {boolean} props.isAuthenticated - Authentication status from parent
 * @param {Function} props.setAuthMessage - Function to set auth message in parent component
 * @param {string} [props.requiredRole] - Optional: Role required to access this route (admin, volunteer)
 */
const AuthGuard = ({ children, isAuthenticated: propsIsAuthenticated, setAuthMessage, requiredRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [localIsAuthenticated, setLocalIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  // True if either the prop or local state shows authenticated
  const isAuthenticated = propsIsAuthenticated || localIsAuthenticated;

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = (e) => {
      setLocalIsAuthenticated(e.detail.isAuthenticated);
    };
    
    window.addEventListener('auth:stateChanged', handleAuthChange);
    
    // Direct check from localStorage on mount and when dependencies change
    const token = localStorage.getItem('token');
    setLocalIsAuthenticated(!!token);
    
    return () => {
      window.removeEventListener('auth:stateChanged', handleAuthChange);
    };
  }, [propsIsAuthenticated, location.pathname]);

  useEffect(() => {  
    // If user is not authenticated and trying to access a protected route
    if (!isAuthenticated && location.pathname !== '/') {
      // Set auth message to display on home page
      setAuthMessage('Please log in to access this feature');
      
      // Redirect to home page
      navigate('/', { replace: true });
      return;
    }
    
    // If authenticated and specific role is required
    if (isAuthenticated && requiredRole) {
      setLoadingUserData(true);
      
      // Get user data from localStorage
      const userData = localStorage.getItem('user');
      try {
        if (userData) {
          const user = JSON.parse(userData);
          
          // Check if user has required role
          if (user.userType === requiredRole || 
              (requiredRole === 'user' && user.userType === 'customer')) {
            setHasAccess(true);
          } else {
            // Redirect to appropriate dashboard
            window.dispatchEvent(new CustomEvent('app:requireAuth', {
              detail: {
                message: `You need ${requiredRole} privileges to access this page`
              }
            }));
            
            // Navigate to appropriate dashboard based on role
            if (user.userType === 'admin') {
              navigate('/admin', { replace: true });
            } else if (user.userType === 'volunteer') {
              navigate('/volunteer-dashboard', { replace: true });
            } else {
              navigate('/user-dashboard', { replace: true });
            }
          }
        } else {
          // No user data found but has token - force user to re-login
          localStorage.removeItem('token');
          window.dispatchEvent(new CustomEvent('app:requireAuth', {
            detail: { message: 'Please log in again to access this feature' }
          }));
          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        // In case of error, force re-login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('app:requireAuth', {
          detail: { message: 'Please log in again to access this feature' }
        }));
        navigate('/', { replace: true });
      }
      
      setLoadingUserData(false);
    } else if (isAuthenticated) {
      // If no specific role required but user is authenticated
      setHasAccess(true);
      setLoadingUserData(false);
    }
  }, [isAuthenticated, navigate, location.pathname, setAuthMessage, requiredRole, localIsAuthenticated]);

  // If still loading user data, show nothing
  if (loadingUserData) {
    return null;
  }

  // If authenticated and has access (or no role required), render children components
  // Otherwise, render nothing (redirection will happen in useEffect)
  return (isAuthenticated && (!requiredRole || hasAccess)) ? children : null;
};

export default AuthGuard;
