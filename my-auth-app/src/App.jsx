import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { useState, useEffect } from 'react';
import ServiceList from './pages/ServiceList';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Chat from './components/chat/Chat';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SafetyGuidelines from './pages/SafetyGuidelines';
import Blog from './pages/Blog';
import FAQs from './pages/FAQs';
import VolunteerProfile from './pages/VolunteerProfile';
import VolunteerProfileView from './pages/VolunteerProfileView';
import VolunteerRequestService from './pages/VolunteerRequestService';
import VolunteerDashboard from './pages/VolunteerDashboard';
import BeHelperForm from './components/BeHelperForm';
import AuthGuard from './components/AuthGuard';
import AuthMessage from './components/AuthMessage';
import RequestTrendsDemo from './pages/RequestTrendsDemo';

// New pages
import About from './pages/About';
import Help from './pages/Help';
import Policy from './pages/Policy';
import Social from './pages/Social';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Team from './pages/Team';
import Careers from './pages/Careers';
import HowItWorks from './pages/HowItWorks';
import FindingJobs from './pages/FindingJobs';
import Support from './pages/Support';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Watch for authentication state changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const wasAuthenticated = isAuthenticated;
      const isNowAuthenticated = !!token;
      
      // Update authentication state
      setIsAuthenticated(isNowAuthenticated);
      
      // If auth state changed, dispatch an event for other components
      if (wasAuthenticated !== isNowAuthenticated) {
        window.dispatchEvent(new CustomEvent('auth:stateChanged', { 
          detail: { isAuthenticated: isNowAuthenticated } 
        }));
      }
    };
    
    // Check initially
    checkAuth();
    
    // Set up a listener for storage events (for when token is added/removed in another tab)
    window.addEventListener('storage', checkAuth);
    
    // Set up a listener for auth state change events
    window.addEventListener('auth:login', () => {
      setIsAuthenticated(true);
    });
    
    // Set up a listener for custom logout event
    window.addEventListener('app:logout', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setAuthMessage('You have been logged out');
    });
    
    // Set up a listener for auth requirement notifications
    window.addEventListener('app:requireAuth', (e) => {
      const message = e.detail?.message || 'Please log in to access this feature';
      setAuthMessage(message);
    });
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth:login', () => setIsAuthenticated(true));
      window.removeEventListener('app:logout', () => setIsAuthenticated(false));
      window.removeEventListener('app:requireAuth', () => {});
    };
  }, [isAuthenticated]);

  // Force re-check auth on route changes
  useEffect(() => {
    // Call the function to make sure we have a fresh auth check on each component mount
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    // Simulate checking auth status
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="animate-pulse-slow">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <Navbar 
          onLogout={() => {
            // This will be called when user logs out
            setAuthMessage('You have been logged out');
            
            // Dispatch a custom event that our useEffect above will listen for
            window.dispatchEvent(new Event('app:logout'));
          }} 
        />
        
        {/* Auth message notification */}
        <AuthMessage message={authMessage} />
        
        <div className="p-4 pt-20 min-h-screen bg-navy-cyan dark:bg-dark bg-fixed">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={
              <Navigate to="/user-dashboard" replace />
            } />
            
            {/* Public routes, but need auth to use features */}
            <Route path="/services/:type" element={<ServiceList />} />
            
            {/* Protected chat route */}
            <Route path="/chat" element={
              <AuthGuard isAuthenticated={isAuthenticated} setAuthMessage={setAuthMessage}>
                <Chat isAuthenticated={isAuthenticated} />
              </AuthGuard>
            } />
            
            {/* Protected volunteer dashboard route */}
            <Route path="/volunteer-dashboard" element={
              <AuthGuard 
                isAuthenticated={isAuthenticated} 
                setAuthMessage={setAuthMessage}
                requiredRole="volunteer"
              >
                <VolunteerDashboard />
              </AuthGuard>
            } />

            <Route path="/user-dashboard" element={
              <AuthGuard 
                isAuthenticated={isAuthenticated} 
                setAuthMessage={setAuthMessage}
                requiredRole="user"
              >
                <UserDashboard />
              </AuthGuard>
            } />

            <Route path="/become-helper" element={
              <AuthGuard 
                isAuthenticated={isAuthenticated} 
                setAuthMessage={setAuthMessage}
              >
                <BeHelperForm />
              </AuthGuard>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <AuthGuard 
                isAuthenticated={isAuthenticated} 
                setAuthMessage={setAuthMessage}
                requiredRole="admin"
              >
                <AdminDashboard />
              </AuthGuard>
            } />
            
            {/* New public routes */}
            <Route path="/safety" element={<SafetyGuidelines />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/request-trends-demo" element={<RequestTrendsDemo />} />
            <Route path="/volunteers/:id" element={<Navigate to={location => `/volunteers/${location.pathname.split('/')[2]}/profile`} />} />
            <Route path="/volunteers/:id/profile" element={<VolunteerProfileView />} />
            <Route path="/volunteers/:id/request" element={<VolunteerRequestService />} />

            {/* About section and subpages */}
            <Route path="/about" element={<About />}>
              <Route path="about-us" element={<AboutUs />} />
              <Route path="contact-us" element={<ContactUs />} />
              <Route path="team" element={<Team />} />
              <Route path="careers" element={<Careers />} />
            </Route>

            {/* Help section and subpages */}
            <Route path="/help" element={<Help />}>
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="finding-jobs" element={<FindingJobs />} />
              <Route path="support" element={<Support />} />
            </Route>

            {/* Policy section and subpages */}
            <Route path="/policy" element={<Policy />}>
              <Route path="privacy" element={<PrivacyPolicy />} />
              <Route path="terms" element={<TermsOfService />} />
              <Route path="cookies" element={<CookiePolicy />} />
            </Route>

            {/* Social section */}
            <Route path="/social" element={<Social />} />

            {/* Redirect legacy routes to home with modal trigger */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
