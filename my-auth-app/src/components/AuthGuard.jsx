import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AuthGuard: Protects routes by authentication and (optionally) role.
 * Props:
 *   - isAuthenticated: boolean
 *   - setAuthMessage: function (to show auth messages)
 *   - requiredRole: string (optional, e.g. 'admin', 'user', 'volunteer')
 *   - children: ReactNode
 */
export default function AuthGuard({ isAuthenticated, setAuthMessage, requiredRole, children }) {
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated, redirect to home and show message
    if (!isAuthenticated) {
      if (setAuthMessage) setAuthMessage('Please log in to access this page.');
      navigate('/', { replace: true });
      return;
    }
    // If a role is required, check user type
    if (requiredRole) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.userType !== requiredRole) {
            // Redirect to correct dashboard
            if (setAuthMessage) setAuthMessage('You do not have permission to access this page.');
            if (user.userType === 'admin') {
              navigate('/admin', { replace: true });
            } else if (user.userType === 'volunteer') {
              navigate('/volunteer-dashboard', { replace: true });
            } else {
              navigate('/user-dashboard', { replace: true });
            }
            return;
          }
        } catch (err) {
          // Malformed user data, force logout
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (setAuthMessage) setAuthMessage('Session error. Please log in again.');
          navigate('/', { replace: true });
        }
      } else {
        // No user data, force logout
        localStorage.removeItem('token');
        if (setAuthMessage) setAuthMessage('Session expired. Please log in again.');
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, requiredRole, setAuthMessage, navigate]);

  // If authenticated and role matches (or no role required), render children
  return <>{children}</>;
}
