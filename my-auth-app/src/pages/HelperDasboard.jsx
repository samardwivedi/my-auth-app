import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import AvailabilityManager from '../components/AvailabilityManager';
import HelperReviewTab from '../components/HelperReviewTab';
import RequestTrendsChart from '../components/RequestTrendsChart';
import ChatHistory from '../components/ChatHistory';

// Pagination helper
function usePagination(data, itemsPerPage) {
  const [page, setPage] = useState(1);
  // Ensure data is an array before operating on it
  const safeData = Array.isArray(data) ? data : [];
  const maxPage = Math.ceil(safeData.length / itemsPerPage);
  const paginatedData = safeData.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  return { page, setPage, maxPage, paginatedData };
}

// Settings tab placeholder
function SettingsTab() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1 dark:text-gray-200">Change Password</label>
          <input type="password" className="w-full border rounded px-3 py-2 mb-2 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" placeholder="New Password" />
          <button className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Update Password</button>
        </div>
        <div>
          <label className="block font-medium mb-1 dark:text-gray-200">Two-Factor Authentication</label>
          <button className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Enable 2FA</button>
        </div>
        <div>
          <label className="block font-medium mb-1 dark:text-gray-200">Notification Preferences</label>
          <select className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
            <option>Email & Push</option>
            <option>Email Only</option>
            <option>Push Only</option>
            <option>None</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Notification placeholder
function NotificationToast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-4 right-4 bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded shadow-lg z-50 animate-bounce">
      {message}
    </div>
  );
}

// Withdraw Modal
function WithdrawModal({ open, onClose, amount }) {
  const [method, setMethod] = useState('UPI');
  const [details, setDetails] = useState('');
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">✕</button>
        <h2 className="text-xl font-bold mb-4 text-primary-700 dark:text-primary-200">Withdraw Earnings</h2>
        <div className="mb-2">Amount: <span className="font-semibold">${amount}</span></div>
        <div className="mb-2">
          <label className="block mb-1">Method</label>
          <select value={method} onChange={e => setMethod(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="UPI">UPI</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1">Details</label>
          <input value={details} onChange={e => setDetails(e.target.value)} className="w-full border rounded px-3 py-2" placeholder={method === 'UPI' ? 'Enter UPI ID' : method === 'Credit Card' ? 'Enter Card Number' : 'Enter Bank Account'} />
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 w-full">Withdraw</button>
      </div>
    </div>
  );
}

// Helper request row with 'Mark as Completed' button
function HelperRequestRow({ req, onMarkCompleted }) {
  return (
    <tr className="border-b">
      <td className="p-2">{req.userName}</td>
      <td className="p-2">{req.serviceCategory || 'General Service'}</td>
      <td className="p-2">{new Date(req.createdAt).toLocaleDateString()}</td>
      <td className="p-2">{req.status}</td>
      <td className="p-2">
        {!req.isCompletedByHelper && req.status !== 'completed' && req.status !== 'cancelled' && (
          <button onClick={() => onMarkCompleted(req._id)} className="text-green-700 font-semibold">Mark as Completed</button>
        )}
        {req.isCompletedByHelper && <span className="text-xs text-green-600">Marked Completed</span>}
      </td>
    </tr>
  );
}

export default function HelperDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  
  // Data states
  const [volunteerInfo, setVolunteerInfo] = useState({ name: 'Helper' });
  const [payments, setPayments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingAmount: 0,
    completedRequests: 0,
    pendingRequests: 0
  });
  // Payment filter state (moved to top level)
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Filtered payments (move above usePagination)
  const filteredPayments = paymentFilter === 'all' ? payments : payments.filter(p => p.status === paymentFilter);

  // Pagination states
  const REQUESTS_PER_PAGE = 5;
  const PAYMENTS_PER_PAGE = 5;
  const {
    page: reqPage,
    setPage: setReqPage,
    maxPage: reqMaxPage,
    paginatedData: paginatedRequests
  } = usePagination(requests, REQUESTS_PER_PAGE);
  const {
    page: payPage,
    setPage: setPayPage,
    maxPage: payMaxPage,
    paginatedData: paginatedPayments
  } = usePagination(filteredPayments, PAYMENTS_PER_PAGE);

  // Lazy load tab content
  const [tabLoaded, setTabLoaded] = useState({ overview: true });
  useEffect(() => {
    setTabLoaded((prev) => ({ ...prev, [activeTab]: true }));
  }, [activeTab]);

  const [notification, setNotification] = useState('');
  // Gamification: badge/level logic
  const badge = stats.completedRequests > 10 ? 'Top Helper' : stats.completedRequests > 3 ? 'Trusted Helper' : 'New Helper';
  const badgeColor = badge === 'Top Helper' ? 'bg-yellow-400' : badge === 'Trusted Helper' ? 'bg-blue-400' : 'bg-gray-300';

  // Notification effect (simulate real-time)
  useEffect(() => {
    if (!tabLoaded.requests) return;
    const timer = setTimeout(() => {
      setNotification('You have a new service request!');
      setTimeout(() => setNotification(''), 4000);
    }, 8000);
    return () => clearTimeout(timer);
  }, [tabLoaded.requests]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user info
        try {
          const userResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            headers: { 'x-auth-token': token }
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setVolunteerInfo(userData);
          } else {
            console.error('Failed to fetch profile:', await userResponse.text());
          }
        } catch (profileError) {
          console.error('Profile fetch error:', profileError);
        }
        
        // Fetch statistics with error handling
        try {
          const statsResponse = await fetch(`${API_BASE_URL}/api/stats`, {
            headers: { 'x-auth-token': token }
          });
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            // Ensure statsData has all required fields with defaults
            setStats({
              totalEarnings: statsData.totalEarnings || 0,
              pendingAmount: statsData.pendingAmount || 0,
              completedRequests: statsData.completedRequests || 0,
              pendingRequests: statsData.pendingRequests || 0
            });
          } else {
            console.error('Failed to fetch stats:', await statsResponse.text());
          }
        } catch (statsError) {
          console.error('Stats fetch error:', statsError);
        }
        
        // Try to fetch requests for the helper, with fallback mock data
        try {
          // First try using the general requests endpoint
          const requestsResponse = await fetch(`${API_BASE_URL}/api/requests`, {
            headers: { 'x-auth-token': token }
          });
          
          if (requestsResponse.ok) {
            const allRequests = await requestsResponse.json();
            // Filter requests for this helper/volunteer
            const helperRequests = allRequests.filter(req => 
              req.volunteerId === volunteerInfo._id || 
              req.helperId === volunteerInfo._id
            );
            setRequests(helperRequests);
          } else {
            console.warn('Could not fetch requests from main endpoint, using mock data instead');
            
            // Fallback: Use mock data for demonstration
            const mockRequests = [
              {
                _id: 'mock1',
                userName: 'John Doe',
                contact: 'john@example.com',
                message: 'Need help with plumbing repair',
                status: 'pending',
                createdAt: new Date().toISOString()
              },
              {
                _id: 'mock2',
                userName: 'Jane Smith',
                contact: 'jane@example.com',
                message: 'Electrical wiring issue',
                status: 'in_progress',
                createdAt: new Date(Date.now() - 86400000).toISOString() // yesterday
              },
              {
                _id: 'mock3',
                userName: 'Robert Johnson',
                contact: 'robert@example.com',
                message: 'Leaking faucet needs repair',
                status: 'completed',
                createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
              }
            ];
            setRequests(mockRequests);
            
            // Also add mock payments data if we're using mock requests
            const mockPayments = [
              {
                _id: 'pay1',
                amount: 45,
                status: 'completed',
                paymentMethod: 'Credit Card',
                createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
              },
              {
                _id: 'pay2',
                amount: 60,
                status: 'pending',
                paymentMethod: 'UPI',
                createdAt: new Date(Date.now() - 86400000).toISOString() // yesterday
              }
            ];
            setPayments(mockPayments);
          }
        } catch (requestsError) {
          console.error('Requests fetch error:', requestsError);
          // Set empty array to prevent further errors
          setRequests([]);
          
          // Add mock data for demonstration purposes even if API call fails completely
          const mockRequests = [
            {
              _id: 'mock1',
              userName: 'John Doe',
              contact: 'john@example.com',
              message: 'Need help with plumbing repair',
              status: 'pending',
              createdAt: new Date().toISOString()
            },
            {
              _id: 'mock2',
              userName: 'Jane Smith',
              contact: 'jane@example.com',
              message: 'Electrical wiring issue',
              status: 'in_progress',
              createdAt: new Date(Date.now() - 86400000).toISOString() // yesterday
            }
          ];
          setRequests(mockRequests);
          
          // Add mock payments
          const mockPayments = [
            {
              _id: 'pay1',
              amount: 45,
              status: 'completed',
              paymentMethod: 'Credit Card',
              createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
            }
          ];
          setPayments(mockPayments);
        }
        
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Request status update handler
  const handleStatusChange = (reqId, newStatus) => {
    setRequests(prev => prev.map(r => r._id === reqId ? { ...r, status: newStatus } : r));
    // TODO: Add API call to update status in backend
  };

  // Mark request as viewed by helper (call backend)
  const markAsViewed = async (reqId) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE_URL}/api/requests/${reqId}/viewed`, {
        method: 'PATCH',
        headers: { 'x-auth-token': token }
      });
      setRequests(prev => prev.map(r => r._id === reqId ? { ...r, viewedByHelper: true } : r));
    } catch (err) {
      // Optionally show error
    }
  };

  // Mark as completed handler
  const handleMarkCompleted = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE_URL}/api/requests/${id}/mark-completed`, {
        method: 'PATCH',
        headers: { 'x-auth-token': token },
      });
      setRequests(prev => prev.map(req => req._id === id ? { ...req, isCompletedByHelper: true } : req));
      setNotification('Marked as completed!');
    } catch (err) {
      setNotification('Failed to mark as completed');
    }
  };

  // Calculate available balance (90% of completed payments)
  const availableBalance = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Math.round(p.amount * 0.9), 0);

  // Earnings summary
  const pendingEarnings = payments.filter(p => p.status === 'held').reduce((sum, p) => sum + (p.amount || 0), 0);
  const releasedEarnings = payments.filter(p => p.status === 'released').reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 bg-white dark:bg-gray-950 min-h-screen transition-colors">
      <NotificationToast message={notification} />
      {/* Page Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary-700 dark:text-primary-300">Helper Dashboard</h1>
          <p className="text-sm sm:text-base">Welcome back, <span className="text-primary-600 dark:text-primary-200 font-semibold">{volunteerInfo?.name || 'Helper'}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${badgeColor}`}>{badge}</span>
          <button onClick={() => navigate('/profile')} className="px-3 py-1 bg-primary-600 text-white rounded shadow hover:bg-primary-700 transition">Edit Profile</button>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <div className="mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex flex-wrap gap-1 sm:gap-2 md:gap-4 overflow-x-auto">
          <button className={`py-2 px-4 rounded-t ${activeTab === 'overview' ? 'bg-primary-100 text-primary-700 font-bold' : 'hover:bg-gray-100'}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`py-2 px-4 rounded-t ${activeTab === 'requests' ? 'bg-primary-100 text-primary-700 font-bold' : 'hover:bg-gray-100'}`} onClick={() => setActiveTab('requests')}>Requests</button>
          <button className={`py-2 px-4 rounded-t ${activeTab === 'payments' ? 'bg-primary-100 text-primary-700 font-bold' : 'hover:bg-gray-100'}`} onClick={() => setActiveTab('payments')}>Payments</button>
          <button className={`py-2 px-4 rounded-t ${activeTab === 'analytics' ? 'bg-primary-100 text-primary-700 font-bold' : 'hover:bg-gray-100'}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
          <button className={`py-2 px-4 rounded-t ${activeTab === 'messaging' ? 'bg-primary-100 text-primary-700 font-bold' : 'hover:bg-gray-100'}`} onClick={() => setActiveTab('messaging')}>Messaging</button>
          <button className={`py-2 px-4 rounded-t ${activeTab === 'availability' ? 'bg-primary-100 text-primary-700 font-bold' : 'hover:bg-gray-100'}`} onClick={() => setActiveTab('availability')}>Availability</button>
          <button className={`py-2 px-4 rounded-t ${activeTab === 'reviews' ? 'bg-primary-100 text-primary-700 font-bold' : 'hover:bg-gray-100'}`} onClick={() => setActiveTab('reviews')}>Ratings & Reviews</button>
          <button className={`py-2 px-4 rounded-t ${activeTab === 'settings' ? 'bg-primary-100 text-primary-700 font-bold' : 'hover:bg-gray-100'}`} onClick={() => setActiveTab('settings')}>Settings</button>
        </nav>
      </div>

      {/* Overview Tab - Key Metrics + Gamification */}
      {activeTab === 'overview' && tabLoaded.overview && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-4">
          <div className="p-4 bg-primary-100 dark:bg-primary-900 rounded shadow text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="font-bold text-xl text-primary-700 dark:text-primary-200">${stats.totalEarnings}</div>
            <div className="dark:text-gray-200">Total Earnings</div>
          </div>
          <div className="p-4 bg-green-100 dark:bg-green-900 rounded shadow text-center">
            <div className="text-3xl mb-2">⏳</div>
            <div className="font-bold text-xl text-green-700 dark:text-green-300">${stats.pendingAmount}</div>
            <div className="dark:text-gray-200">Pending Payments</div>
          </div>
          <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded shadow text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="font-bold text-xl text-blue-700 dark:text-blue-300">{stats.completedRequests}</div>
            <div className="dark:text-gray-200">Completed Requests</div>
          </div>
          <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded shadow text-center">
            <div className="text-3xl mb-2">📋</div>
            <div className="font-bold text-xl text-yellow-700 dark:text-yellow-300">{stats.pendingRequests}</div>
            <div className="dark:text-gray-200">Pending Requests</div>
          </div>
        </div>
        <div className="mt-4 sm:mt-6 flex flex-col md:flex-row gap-2 sm:gap-4 items-center justify-between">
          <div className="bg-white dark:bg-gray-900 rounded shadow p-4 flex-1">
            <div className="text-lg font-semibold mb-2">Available Balance</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">${availableBalance}</div>
            <div className="text-xs text-gray-500 mb-2">(90% of completed payments, 10% platform fee deducted)</div>
            <button onClick={() => setWithdrawModalOpen(true)} className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Withdraw</button>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 rounded shadow p-4 flex-1">
            <div className="text-lg font-semibold mb-2">Platform Fee</div>
            <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">10%</div>
            <div className="text-xs text-gray-500">Deducted from each payment and held by admin</div>
          </div>
        </div>
        <WithdrawModal open={withdrawModalOpen} onClose={() => setWithdrawModalOpen(false)} amount={availableBalance} />
        </>
      )}

      {/* Analytics Tab - Request Trends Chart */}
      {activeTab === 'analytics' && tabLoaded.analytics && (
        <div className="my-6 sm:my-8">
          <RequestTrendsChart />
        </div>
      )}

      {/* Messaging Tab - Chat History */}
      {activeTab === 'messaging' && tabLoaded.messaging && (
        <div className="my-6 sm:my-8">
          <ChatHistory isAuthenticated={true} userType="helper" />
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && tabLoaded.settings && <SettingsTab />}

      {/* Requests Tab - Table with Status Management and Pagination */}
      {activeTab === 'requests' && tabLoaded.requests && (
        <div>
          <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">My Service Requests</h2>
          <div className="mb-2 sm:mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="bg-yellow-50 p-2 sm:p-3 rounded-lg text-xs sm:text-base">
              <span className="font-semibold">Pending Earnings:</span> ₹{pendingEarnings}
            </div>
            <div className="bg-green-50 p-2 sm:p-3 rounded-lg text-xs sm:text-base">
              <span className="font-semibold">Released Earnings:</span> ₹{releasedEarnings}
            </div>
          </div>
          <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Service</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map(req => (
                  <HelperRequestRow key={req._id} req={req} onMarkCompleted={handleMarkCompleted} />
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls (if needed) */}
        </div>
      )}

      {/* Payments Tab - Table with Filtering and Pagination */}
      {activeTab === 'payments' && tabLoaded.payments && (
        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-primary-700 dark:text-primary-200">Payment History</h2>
          <div className="mb-2 flex flex-col sm:flex-row gap-2 sm:gap-4">
            <label className="mr-2 dark:text-gray-200">Filter:</label>
            <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 w-full sm:w-auto">
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="bg-primary-50 dark:bg-primary-900 border-b dark:border-gray-700">
                  <th className="p-2 text-left dark:text-gray-200">Amount</th>
                  <th className="p-2 text-left dark:text-gray-200">Status</th>
                  <th className="p-2 text-left dark:text-gray-200">Method</th>
                  <th className="p-2 text-left dark:text-gray-200">Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map(payment => (
                  <tr key={payment._id} className="border-b dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900 transition">
                  <td className="p-2 dark:text-gray-100">${payment.amount}</td>
                  <td className="p-2 dark:text-gray-100">{payment.status}</td>
                  <td className="p-2 dark:text-gray-100">{payment.paymentMethod}</td>
                  <td className="p-2 dark:text-gray-100">{new Date(payment.createdAt).toLocaleDateString()}</td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {payMaxPage > 1 && (
            <div className="flex justify-end items-center mt-2 gap-2">
              <button onClick={() => setPayPage(p => Math.max(1, p - 1))} disabled={payPage === 1} className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900 disabled:opacity-50">Prev</button>
              <span className="text-sm dark:text-gray-200">Page {payPage} of {payMaxPage}</span>
              <button onClick={() => setPayPage(p => Math.min(payMaxPage, p + 1))} disabled={payPage === payMaxPage} className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900 disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}

      {/* Availability Tab - Weekly Calendar */}
      {activeTab === 'availability' && tabLoaded.availability && (
        <AvailabilityManager 
          volunteerInfo={volunteerInfo} 
          onAvailabilityUpdated={(data) => {
            setVolunteerInfo(prev => ({
              ...prev,
              isAvailable: data.isAvailable,
              availabilitySchedule: data.availabilitySchedule
            }));
          }}
          showCalendar={true}
        />
      )}

      {/* Reviews Tab - Reviews with Response */}
      {activeTab === 'reviews' && tabLoaded.reviews && (
        <HelperReviewTab providerId={volunteerInfo?._id} allowResponse={true} />
      )}
    </div>
  );
}
