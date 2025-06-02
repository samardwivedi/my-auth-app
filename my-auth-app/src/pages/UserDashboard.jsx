import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useTheme } from '../contexts/ThemeContext';

// Helper Details Modal
function HelperProfileModal({ open, onClose, helper }) {
  if (!open || !helper) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">✕</button>
        <h2 className="text-xl font-bold mb-2 text-primary-700 dark:text-primary-200">Helper Profile</h2>
        <div className="mb-2 font-semibold">{helper.name}</div>
        <div className="mb-2">Email: {helper.email}</div>
        <div className="mb-2">Phone: {helper.phone}</div>
        <div className="mb-2">Location: {helper.location}</div>
        <div className="mb-2">Bio: {helper.bio}</div>
        <div className="mb-2">Rating: {helper.rating}</div>
      </div>
    </div>
  );
}

// Modular components for summary cards, requests, payments, notifications
function SummaryCard({ icon, label, value, color }) {
  return (
    <div className={`p-4 rounded-lg shadow text-center ${color}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-bold text-xl">{value}</div>
      <div>{label}</div>
    </div>
  );
}

function RequestRow({ req, onCancel, onView, onTrack, onPay, onMarkDone, onConfirmCompletion, onRaiseDispute }) {
  // Calculate cancel window (2 hours from createdAt or cancelDeadline)
  const now = new Date();
  const created = new Date(req.createdAt);
  const cancelDeadline = req.cancelDeadline ? new Date(req.cancelDeadline) : new Date(created.getTime() + 2 * 60 * 60 * 1000);
  const canCancel = (req.status === 'requested' || req.status === 'in_progress') && now <= cancelDeadline;
  return (
    <tr className="border-b">
      <td className="p-2">{req.helperName || 'Unassigned'}
        {req.helperName && req.helperName !== 'Unassigned' && (
          <button
            className="ml-2 text-blue-600 underline text-xs"
            onClick={() => onTrack(req.helperName)}
          >
            Track
          </button>
        )}
        {req.viewedByHelper && (
          <span className="ml-2 text-green-600 text-xs font-semibold">(Viewed)</span>
        )}
      </td>
      <td className="p-2">{req.serviceCategory || 'General Service'}</td>
      <td className="p-2">{new Date(req.createdAt).toLocaleDateString()}</td>
      <td className="p-2">{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
      <td className="p-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
          ${req.status === 'completed' ? 'bg-green-100 text-green-800' : 
            req.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
            req.status === 'requested' ? 'bg-blue-100 text-blue-800' :
            req.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'}`
        }>
          {req.status}
        </span>
      </td>
      <td className="p-2">
        <button onClick={() => onView(req._id)} className="text-blue-600 mr-2">View</button>
        {canCancel && (
          <button onClick={() => onCancel(req._id)} className="text-red-600 mr-2">Cancel</button>
        )}
        {req.status === 'requested' && (
          <button onClick={() => onPay(req._id)} className="text-green-600 mr-2">Pay</button>
        )}
        {req.status === 'in_progress' && (
          <button onClick={() => onMarkDone(req._id)} className="text-indigo-600 mr-2">Work Done</button>
        )}
        {/* Escrow workflow: Confirm Completion */}
        {req.isCompletedByHelper && !req.isConfirmedByUser && (
          <button onClick={() => onConfirmCompletion(req._id)} className="text-green-700 font-semibold mr-2">Confirm Completion</button>
        )}
        {/* Escrow workflow: Raise Dispute */}
        {!req.disputeRaised && (
          <button onClick={() => onRaiseDispute(req._id)} className="text-red-700 font-semibold">Raise Dispute</button>
        )}
        {req.disputeRaised && <span className="text-xs text-red-500 ml-2">Dispute Raised</span>}
      </td>
    </tr>
  );
}

function PaymentRow({ payment }) {
  return (
    <tr className="border-b">
      <td className="p-2">{payment.amount ? `₹${payment.amount}` : '-'}</td>
      <td className="p-2">
        {payment.status}
        {payment.status === 'refunded' && <span className="ml-2 text-red-600">(Refunded)</span>}
        {payment.status === 'released' && payment.receiptUrl && (
          <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">Invoice</a>
        )}
      </td>
      <td className="p-2">{payment.helperName || '-'}</td>
      <td className="p-2">{new Date(payment.date).toLocaleDateString()}</td>
    </tr>
  );
}

function NotificationItem({ notification }) {
  return (
    <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded mb-2 flex items-center">
      <span className="mr-2 text-xl">🔔</span>
      <span>{notification.message}</span>
      <span className="ml-auto text-xs text-gray-400">{new Date(notification.date).toLocaleString()}</span>
    </div>
  );
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  
  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    pendingRequests: 0
  });
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [helperModalOpen, setHelperModalOpen] = useState(false);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Fetch dashboard data
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
        const userResponse = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
          headers: { 'x-auth-token': token }
        });
        setUserInfo(userResponse.data);
        // Fetch statistics
        const statsResponse = await axios.get(`${API_BASE_URL}/api/stats`, {
          headers: { 'x-auth-token': token }
        });
        setStats(statsResponse.data);
        // Fetch requests
        const requestsResponse = await axios.get(`${API_BASE_URL}/api/requests/user`, {
          headers: { 'x-auth-token': token }
        });
        setRequests(requestsResponse.data);
        // Fetch payments
        const paymentsResponse = await axios.get(`${API_BASE_URL}/api/payments/general/?userId=${userResponse.data._id}`, {
          headers: { 'x-auth-token': token }
        });
        setPayments(paymentsResponse.data || []);
        // Fetch notifications
        const notificationsResponse = await axios.get(`${API_BASE_URL}/api/user/notifications`, {
          headers: { 'x-auth-token': token }
        });
        setNotifications(notificationsResponse.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        // Check if it's a 404 error on the profile endpoint - this means user doesn't exist
        if (err.response && err.response.status === 404 && err.response.config.url.includes('/api/auth/profile')) {
          // User doesn't exist in database but has a token - clear token and redirect to login
          console.log('User not found in database. Logging out...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/', { replace: true });
          return; // Stop execution to prevent setting error state
        }
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Helper: fetch helper details (simulate API)
  const fetchHelperDetails = async (helperName) => {
    // Simulate API call with static data
    // In real app, fetch by helper ID
    return {
      name: helperName,
      email: helperName === 'Jane Smith' ? 'jane@helpora.com' : 'mike@helpora.com',
      phone: helperName === 'Jane Smith' ? '9876543210' : '9123456780',
      location: helperName === 'Jane Smith' ? 'New Delhi' : 'Mumbai',
      bio: 'Experienced and trusted helper on Helpora.',
      rating: helperName === 'Jane Smith' ? 4.8 : 4.5
    };
  };

  // Handle request cancellation (calls backend)
  const handleCancelRequest = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`${API_BASE_URL}/api/requests/${id}/cancel`, {}, {
        headers: { 'x-auth-token': token }
      });
      setRequests(prev => prev.map(req => req._id === id ? { ...req, status: 'cancelled' } : req));
      alert('Request cancelled successfully');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel request');
    }
  };

  // Handle payment (calls backend escrow endpoint)
  const handlePay = async (id) => {
    const token = localStorage.getItem('token');
    const req = requests.find(r => r._id === id);
    if (!req) return;
    try {
      await axios.post(`${API_BASE_URL}/api/payments/general/escrow`, {
        requestId: id,
        amount: req.amount,
        paymentMethod: 'upi' // or let user choose
      }, {
        headers: { 'x-auth-token': token }
      });
      alert('Payment successful and held in escrow.');
    } catch (err) {
      alert(err.response?.data?.error || 'Payment failed');
    }
  };

  // Handle mark as done (calls backend to mark completed)
  const handleMarkDone = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API_BASE_URL}/api/requests/${id}`, { status: 'completed' }, {
        headers: { 'x-auth-token': token }
      });
      alert('Marked as done. Awaiting admin payment release.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to mark as done');
    }
  };

  // Escrow workflow: Confirm Completion
  const handleConfirmCompletion = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`${API_BASE_URL}/api/requests/${id}/confirm-completion`, {}, {
        headers: { 'x-auth-token': token }
      });
      setRequests(prev => prev.map(req => req._id === id ? { ...req, isConfirmedByUser: true } : req));
      alert('Completion confirmed. Admin will release payment soon.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to confirm completion');
    }
  };
  // Escrow workflow: Raise Dispute
  const handleRaiseDispute = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`${API_BASE_URL}/api/requests/${id}/raise-dispute`, {}, {
        headers: { 'x-auth-token': token }
      });
      setRequests(prev => prev.map(req => req._id === id ? { ...req, disputeRaised: true } : req));
      alert('Dispute raised. Admin will review your case.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to raise dispute');
    }
  };

  // Payments filter
  const filteredPayments = payments.filter(payment => {
    const date = new Date(payment.date);
    const matchesMonth = filterMonth ? date.getMonth() + 1 === parseInt(filterMonth) : true;
    const matchesYear = filterYear ? date.getFullYear() === parseInt(filterYear) : true;
    return matchesMonth && matchesYear;
  });

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 p-4 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}> 
      <div className="container mx-auto p-2 sm:p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                Welcome to Helpora
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Hello, {userInfo?.name}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
              <button onClick={toggleTheme} className="p-2">
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button onClick={handleLogout} className="text-red-600">
                Logout
              </button>
            </div>
          </div>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-2 sm:p-6">
            <SummaryCard icon="📋" label="Total Requests" value={stats.totalRequests} color="bg-blue-100 dark:bg-blue-900" />
            <SummaryCard icon="✅" label="Completed" value={stats.completedRequests} color="bg-green-100 dark:bg-green-900" />
            <SummaryCard icon="⏳" label="Pending" value={stats.pendingRequests} color="bg-yellow-100 dark:bg-yellow-900" />
            <SummaryCard icon="💰" label="Total Payments" value={`₹${stats.totalPayments || 0}`} color="bg-purple-100 dark:bg-purple-900" />
          </div>
          {/* Request New Service Button */}
          <div className="flex justify-end px-2 sm:px-6 mb-2 sm:mb-4">
            <button
              onClick={() => navigate('/request-service')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 py-2 rounded shadow w-full sm:w-auto"
            >
              + Request New Service
            </button>
          </div>
          {/* Tabs */}
          <div className="px-2 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap space-x-0 sm:space-x-4 gap-2 sm:gap-0 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('requests')} 
                className={`py-2 px-2 sm:px-0 ${activeTab === 'requests' ? 'border-b-2 border-blue-600 font-bold' : ''}`}
              >
                My Requests
              </button>
              <button 
                onClick={() => setActiveTab('payments')} 
                className={`py-2 px-2 sm:px-0 ${activeTab === 'payments' ? 'border-b-2 border-blue-600 font-bold' : ''}`}
              >
                Payments
              </button>
              <button 
                onClick={() => setActiveTab('notifications')} 
                className={`py-2 px-2 sm:px-0 ${activeTab === 'notifications' ? 'border-b-2 border-blue-600 font-bold' : ''}`}
              >
                Notifications
              </button>
              <button 
                onClick={() => setActiveTab('become-helper')} 
                className={`py-2 px-2 sm:px-0 ${activeTab === 'become-helper' ? 'border-b-2 border-blue-600 font-bold' : ''}`}
              >
                Become Helper
              </button>
            </div>
          </div>
          {/* Tab Contents */}
          <div className="p-2 sm:p-6">
            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <>
                <HelperProfileModal open={helperModalOpen} onClose={() => setHelperModalOpen(false)} helper={selectedHelper} />
                {requests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-3">📭</div>
                    <p>You haven't made any requests yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
                    <table className="w-full min-w-[600px] text-sm">
                      <thead>
                        <tr>
                          <th className="text-left p-2">Helper Name</th>
                          <th className="text-left p-2">Service</th>
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Time</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map(req => (
                          <RequestRow
                            key={req._id}
                            req={req}
                            onCancel={handleCancelRequest}
                            onView={id => navigate(`/request/${id}`)}
                            onTrack={async (helperName) => {
                              const details = await fetchHelperDetails(helperName);
                              setSelectedHelper(details);
                              setHelperModalOpen(true);
                            }}
                            onPay={handlePay}
                            onMarkDone={handleMarkDone}
                            onConfirmCompletion={handleConfirmCompletion}
                            onRaiseDispute={handleRaiseDispute}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
                  <select
                    className="border rounded px-2 py-1 w-full sm:w-auto"
                    value={filterMonth}
                    onChange={e => setFilterMonth(e.target.value)}
                  >
                    <option value="">All Months</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                  <select
                    className="border rounded px-2 py-1 w-full sm:w-auto"
                    value={filterYear}
                    onChange={e => setFilterYear(e.target.value)}
                  >
                    <option value="">All Years</option>
                    {[...new Set(payments.map(p => new Date(p.date).getFullYear()))].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-3">💸</div>
                    <p>No payments available.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
                    <table className="w-full min-w-[700px] text-sm">
                      <thead>
                        <tr>
                          <th className="text-left p-2">Amount Paid</th>
                          <th className="text-left p-2">Payment Method</th>
                          <th className="text-left p-2">Transaction ID</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">View Invoice/Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.map(payment => (
                          <tr key={payment._id} className="border-b">
                            <td className="p-2">{payment.amount ? `₹${payment.amount}` : '-'}</td>
                            <td className="p-2">{payment.paymentMethod || '-'}</td>
                            <td className="p-2 break-all">{payment.transactionId || payment._id || '-'}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${payment.status === 'released' ? 'bg-green-100 text-green-800' : payment.status === 'held' ? 'bg-yellow-100 text-yellow-800' : payment.status === 'refunded' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{payment.status}</span>
                            </td>
                            <td className="p-2">
                              {payment.receiptUrl ? (
                                <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Invoice</a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-3">🔔</div>
                    <p>No notifications yet.</p>
                  </div>
                ) : (
                  <div>
                    {notifications.map(n => (
                      <NotificationItem key={n._id} notification={n} />
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Become Helper Tab */}
            {activeTab === 'become-helper' && (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🤝</div>
                <h2 className="text-2xl font-bold mb-2">Become a Helper</h2>
                <p className="mb-4 max-w-md mx-auto">
                  Share your skills and earn by helping others in your community.
                  Register as a service provider and get started today!
                </p>
                <button
                  onClick={() => navigate('/become-helper')}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded shadow"
                >
                  Register as Helper
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
