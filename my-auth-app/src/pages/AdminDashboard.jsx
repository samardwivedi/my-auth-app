import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminDashboardAnalytics from './AdminDashboardAnalytics';
import RequestTrendsChart from '../components/charts/RequestTrendsChart';
import ConversionFunnel from '../components/charts/ConversionFunnel';

// ActionDropdown component for grouping actions in a dropdown menu
function ActionDropdown({ request, onAction }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // {action, label}

  const irreversibleActions = ['releasePayment', 'refundPayment', 'delete', 'complete'];
  const actionList = [
    { key: 'viewDetails', label: '👁 View Details' },
    { key: 'accept', label: '✔ Accept' },
    { key: 'reject', label: '✖ Reject' },
    { key: 'markInProgress', label: '⏳ In Progress' },
    { key: 'complete', label: '🏁 Complete' },
    { key: 'releasePayment', label: '💸 Release Payment' },
    { key: 'refundPayment', label: '↩ Refund Payment' },
  ];

  const handleAction = (action) => {
    if (irreversibleActions.includes(action.key)) {
      setConfirm(action);
    } else {
      setOpen(false);
      onAction(action.key, request._id);
    }
  };

  const handleConfirm = () => {
    setOpen(false);
    onAction(confirm.key, request._id);
    setConfirm(null);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="inline-flex items-center px-2 py-1 rounded hover:bg-gray-200 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="text-xl">⋮</span>
      </button>
      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {actionList.map(action => (
              <button
                key={action.key}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                onClick={() => handleAction(action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full">
            <h3 className="font-bold text-lg mb-2">Are you sure?</h3>
            <p className="mb-4 text-sm text-gray-700">
              This action (<b>{confirm.label}</b>) is irreversible. Continue?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setConfirm(null)}
              >Cancel</button>
              <button
                className="px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={handleConfirm}
              >Yes, Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Withdraw Modal for Admin
function AdminWithdrawModal({ open, onClose, amount }) {
  const [method, setMethod] = useState('Bank Transfer');
  const [details, setDetails] = useState('');
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">✕</button>
        <h2 className="text-xl font-bold mb-4 text-primary-700">Withdraw Platform Fees</h2>
        <div className="mb-2">Amount: <span className="font-semibold">${amount}</span></div>
        <div className="mb-2">
          <label className="block mb-1">Method</label>
          <select value={method} onChange={e => setMethod(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1">Details</label>
          <input value={details} onChange={e => setDetails(e.target.value)} className="w-full border rounded px-3 py-2" placeholder={method === 'UPI' ? 'Enter UPI ID' : 'Enter Bank Account'} />
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 w-full">Withdraw</button>
      </div>
    </div>
  );
}

// Admin request row with payment/dispute/timeline
function AdminRequestRow({ req, onAction }) {
  // Timeline steps
  const timelineSteps = ['requested', 'accepted', 'completed', 'confirmed'];
  const currentStep = timelineSteps.indexOf(req.status);

  // Dispute toggle handler
  const handleDisputeToggle = () => {
    // You would call an API here in a real app
    alert(`Dispute flag toggled for request ${req._id}`);
  };

  return (
    <tr className="border-b dark:border-gray-800">
      <td className="p-2">{req.userName}</td>
      <td className="p-2">{req.serviceCategory || 'General Service'}</td>
      <td className="p-2">{new Date(req.createdAt).toLocaleDateString()}</td>
      <td className="p-2">
        <span
          className={
            `inline-block px-2 py-1 rounded-full text-xs font-semibold ` +
            (req.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
             req.status === 'canceled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
             req.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
             'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200')
          }
        >
          {req.status}
        </span>
      </td>
      <td className="p-2">
        <span
          className={
            `inline-block px-2 py-1 rounded-full text-xs font-semibold ` +
            (req.paymentStatus === 'held' ? 'bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100' :
             req.paymentStatus === 'released' ? 'bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100' :
             req.paymentStatus === 'refunded' ? 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100' :
             'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200')
          }
        >
          {req.paymentStatus}
        </span>
      </td>
      <td className="p-2">
        {/* Release/Refund buttons always visible for admin */}
        <button
          className="inline-flex items-center px-2 py-1 mr-2 rounded bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
          onClick={() => onAction('releasePayment', req._id)}
        >
          💸 Release Payment
        </button>
        <button
          className="inline-flex items-center px-2 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
          onClick={() => onAction('refundPayment', req._id)}
        >
          ↩ Refund Payment
        </button>
      </td>
      <td className="p-2">
        {/* Timeline visualization */}
        <div className="flex items-center gap-1">
          {timelineSteps.map((step, idx) => (
            <span
              key={step}
              className={`h-2 w-2 rounded-full ${idx <= currentStep ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
              title={step}
            ></span>
          ))}
        </div>
      </td>
      <td className="p-2 text-center">
        <button
          className={`px-2 py-1 rounded-full text-xs font-semibold border ${req.disputeRaised ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700' : 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'}`}
          onClick={handleDisputeToggle}
        >
          {req.disputeRaised ? 'Flagged' : 'Flag'}
        </button>
      </td>
    </tr>
  );
}

// ActionDropdown component for grouping actions in a dropdown menu
function UserActionDropdown({ user, onAction }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // {action, label}

  const irreversibleActions = ['delete'];
  const actionList = [
    { key: 'edit', label: '🖉 Edit' },
    { key: 'delete', label: '🗑 Delete' },
    // Add more actions as needed
  ];

  const handleAction = (action) => {
    if (irreversibleActions.includes(action.key)) {
      setConfirm(action);
    } else {
      setOpen(false);
      onAction(action.key, user._id);
    }
  };

  const handleConfirm = () => {
    setOpen(false);
    onAction(confirm.key, user._id);
    setConfirm(null);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="inline-flex items-center px-2 py-1 rounded hover:bg-gray-200 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="text-xl">⋮</span>
      </button>
      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {actionList.map(action => (
              <button
                key={action.key}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                onClick={() => handleAction(action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full">
            <h3 className="font-bold text-lg mb-2">Are you sure?</h3>
            <p className="mb-4 text-sm text-gray-700">
              This action (<b>{confirm.label}</b>) is irreversible. Continue?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setConfirm(null)}
              >Cancel</button>
              <button
                className="px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={handleConfirm}
              >Yes, Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [requestSearchTerm, setRequestSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminWithdrawOpen, setAdminWithdrawOpen] = useState(false);

  // Check for admin access on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Dispatch event to show auth message
      window.dispatchEvent(new CustomEvent('app:requireAuth', {
        detail: { message: 'Please login to access the admin dashboard' }
      }));
      navigate('/', { replace: true });
      return;
    }
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Check if user is an admin
        if (user.userType !== 'admin') {
          // Dispatch event to show auth message
          window.dispatchEvent(new CustomEvent('app:requireAuth', {
            detail: { message: 'You need admin privileges to access this page' }
          }));
          // Navigate to appropriate dashboard based on user type
          if (user.userType === 'volunteer') {
            navigate('/volunteer-dashboard', { replace: true });
          } else {
            navigate('/user-dashboard', { replace: true });
          }
          return;
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        navigate('/', { replace: true });
        return;
      }
    } else {
      // No user data found, redirect to home
      window.dispatchEvent(new CustomEvent('app:requireAuth', {
        detail: { message: 'Please login to access the admin dashboard' }
      }));
      navigate('/', { replace: true });
      return;
    }
  }, [navigate]);

  // Filter users helper function
  const filterUsers = (role, status, searchTerm) => {
    let filtered = [...users];
    
    // Apply role filter
    if (role !== 'all') {
      filtered = filtered.filter(user => user.userType === role);
    }
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(user => user.status === status);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        user => 
          user.name.toLowerCase().includes(term) || 
          user.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredUsers(filtered);
  };

  // Add filterRequests helper similar to filterUsers
  const filterRequests = (status, searchTerm) => {
    let filtered = [...requests];
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(request => request.status === status);
    }
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        request =>
          request.userName.toLowerCase().includes(term) ||
          (request.volunteerId && request.volunteerId.name && request.volunteerId.name.toLowerCase().includes(term)) ||
          (request.service && request.service.toLowerCase().includes(term))
      );
    }
    setFilteredRequests(filtered);
  };

  // Fetch users
  useEffect(() => {
    if (activeTab !== 'users' && activeTab !== 'analytics') return;
    
    fetchUsers();
  }, [activeTab]);

  // Fetch requests
  useEffect(() => {
    if (activeTab !== 'requests' && activeTab !== 'analytics') return;
    
    fetchRequests();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:5003/api/admin/users', {
        headers: {
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      setLoading(false);
    }
  };
  
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:5003/api/admin/requests', {
        headers: {
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch requests: ${response.status}`);
      }
      
      const data = await response.json();
      setRequests(data);
      setFilteredRequests(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.message || 'Failed to fetch requests');
      setLoading(false);
    }
  };

  const handleUserAction = async (action, userId) => {
    alert(`User action: ${action} for user ${userId}`);
    // Implementation would call the API endpoints we created
  };
  
  const handleRequestAction = async (action, requestId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      
      if (action === 'viewDetails') {
        alert(`View details for request ${requestId}`);
        return;
      }
      
      let endpoint;
      let method = 'PUT';
      let body = {};
      
      switch(action) {
        case 'accept':
          endpoint = `/api/admin/requests/${requestId}/status`;
          body = { status: 'accepted', notes: 'Status updated by admin' };
          break;
        case 'reject':
          endpoint = `/api/admin/requests/${requestId}/status`;
          body = { status: 'declined', notes: 'Request declined by admin' };
          break;
        case 'markInProgress':
          endpoint = `/api/admin/requests/${requestId}/status`;
          body = { status: 'in_progress', notes: 'Marked as in progress by admin' };
          break;
        case 'complete':
          endpoint = `/api/admin/requests/${requestId}/status`;
          body = { status: 'completed', notes: 'Marked as completed by admin' };
          break;
        case 'releasePayment':
          endpoint = `/api/admin/payment/release/${requestId}`;
          method = 'POST';
          body = { notes: 'Payment manually released by admin' };
          break;
        case 'refundPayment':
          endpoint = `/api/admin/payment/refund/${requestId}`;
          method = 'POST';
          body = { notes: 'Payment refunded by admin due to dispute' };
          break;
        default:
          alert(`Unknown action: ${action}`);
          return;
      }
      
      // Display confirmation based on action
      let confirmMessage = `Are you sure you want to ${action} this request?`;
      
      if (action === 'releasePayment') {
        confirmMessage = 'Are you sure you want to RELEASE payment to the service provider? This cannot be undone.';
      } else if (action === 'refundPayment') {
        confirmMessage = 'Are you sure you want to REFUND payment to the user? This cannot be undone.';
      }
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
      
      const response = await fetch(`http://localhost:5003${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} request`);
      }
      
      alert(`Request ${action} successful!`);
      
      // Refresh the requests data
      fetchRequests();
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error('Error performing request action:', error);
    }
  };

  // Calculate platform fee (10% of all released/held payments)
  const platformFee = requests
    .filter(r => r.paymentStatus === 'held' || r.paymentStatus === 'released')
    .reduce((sum, r) => sum + Math.round((r.amount || 100) * 0.1), 0); // fallback amount for demo

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Admin Payment Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 rounded shadow p-4 flex flex-col items-center">
          <div className="text-lg font-semibold mb-2">Platform Fees Collected</div>
          <div className="text-2xl font-bold text-yellow-700 mb-2">${platformFee}</div>
          <button onClick={() => setAdminWithdrawOpen(true)} className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Withdraw</button>
        </div>
        <div className="bg-blue-50 rounded shadow p-4 flex flex-col items-center">
          <div className="text-lg font-semibold mb-2">Payments Held</div>
          <div className="text-xl font-bold text-blue-700 mb-2">{requests.filter(r => r.paymentStatus === 'held').length}</div>
        </div>
        <div className="bg-green-50 rounded shadow p-4 flex flex-col items-center">
          <div className="text-lg font-semibold mb-2">Payments Released</div>
          <div className="text-xl font-bold text-green-700 mb-2">{requests.filter(r => r.paymentStatus === 'released').length}</div>
        </div>
      </div>
      <AdminWithdrawModal open={adminWithdrawOpen} onClose={() => setAdminWithdrawOpen(false)} amount={platformFee} />
      
      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users & Volunteers
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'requests' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Service Requests
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'analytics' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics & Insights
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'helper' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          onClick={() => setActiveTab('helper')}
        >
          Helper
        </button>
      </div>
      
      {/* Users Tab Content */}
      {activeTab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl">User Management</h2>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete ALL non-admin users and volunteers? This action cannot be undone.')) {
                  alert('Delete functionality would be implemented here');
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete All Non-Admin Users
            </button>
          </div>
          
          {/* Search & Filter Controls for Users */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full p-2 border rounded"
                value={userSearchTerm}
                onChange={(e) => {
                  setUserSearchTerm(e.target.value);
                  const term = e.target.value.toLowerCase();
                  setFilteredUsers(
                    users.filter(
                      user => 
                        user.name.toLowerCase().includes(term) || 
                        user.email.toLowerCase().includes(term)
                    )
                  );
                }}
              />
            </div>
            
            <div>
              <label className="block mb-1">Filter by Role</label>
              <select 
                className="w-full p-2 border rounded"
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  filterUsers(e.target.value, userStatusFilter, userSearchTerm);
                }}
              >
                <option value="all">All Roles</option>
                <option value="customer">Users</option>
                <option value="volunteer">Volunteers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1">Filter by Status</label>
              <select 
                className="w-full p-2 border rounded"
                value={userStatusFilter}
                onChange={(e) => {
                  setUserStatusFilter(e.target.value);
                  filterUsers(userRoleFilter, e.target.value, userSearchTerm);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          
          <table className="min-w-full bg-gray-50 border rounded-xl shadow-sm">
            <thead>
              <tr className="bg-white">
                <th className="p-4 text-left font-semibold">Name</th>
                <th className="p-4 text-left font-semibold">Email <span className='block text-xs font-normal text-gray-400'>Contact</span></th>
                <th className="p-4 text-center font-semibold">Role</th>
                <th className="p-4 text-center font-semibold">Status</th>
                <th className="p-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id} className="border-t hover:bg-white/80 transition-all">
                  <td className="p-4 font-semibold">{user.name}</td>
                  <td className="p-4">
                    <span className="font-semibold">{user.email}</span>
                    <span className="block text-xs text-gray-500">{user.status}</span>
                  </td>
                  <td className="p-4 text-center font-semibold capitalize">{user.userType}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-700' : user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span>
                  </td>
                  <td className="p-4 text-center">
                    <UserActionDropdown user={user} onAction={handleUserAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Requests Tab Content */}
      {activeTab === 'requests' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Service Requests</h2>
          {/* --- Service Requests Filters --- */}
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Status Filter */}
            <div>
              <label className="block mb-1 text-sm font-medium">Filter by Status</label>
              <select
                className="p-2 border rounded bg-white dark:bg-gray-900 dark:text-gray-100"
                value={requestStatusFilter}
                onChange={e => {
                  setRequestStatusFilter(e.target.value);
                  setFilteredRequests(
                    e.target.value === 'all'
                      ? requests
                      : requests.filter(r => r.status === e.target.value)
                  );
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
            {/* Payment Filter */}
            <div>
              <label className="block mb-1 text-sm font-medium">Filter by Payment</label>
              <select
                className="p-2 border rounded bg-white dark:bg-gray-900 dark:text-gray-100"
                value={requestSearchTerm}
                onChange={e => {
                  setRequestSearchTerm(e.target.value);
                  setFilteredRequests(
                    e.target.value === 'all'
                      ? requests
                      : requests.filter(r => r.paymentStatus === e.target.value)
                  );
                }}
              >
                <option value="all">All Payments</option>
                <option value="held">Held</option>
                <option value="released">Released</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl shadow bg-white dark:bg-gray-900 border dark:border-gray-700">
            <table className="w-full min-w-[800px] text-sm text-gray-800 dark:text-gray-100">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="text-left p-3 font-semibold">User</th>
                  <th className="text-left p-3 font-semibold">Service</th>
                  <th className="text-left p-3 font-semibold">Date</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Payment</th>
                  <th className="text-left p-3 font-semibold">Action</th>
                  <th className="text-left p-3 font-semibold">Timeline</th>
                  <th className="text-left p-3 font-semibold">Dispute</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400 dark:text-gray-500">No service requests found.</td>
                  </tr>
                ) : (
                  filteredRequests.map(req => (
                    <AdminRequestRow key={req._id} req={req} onAction={handleRequestAction} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Analytics Tab Content */}
      {activeTab === 'analytics' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl">Analytics & Insights Dashboard</h2>
            <Link
              to="/request-trends-demo"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Request Trends Demo
            </Link>
          </div>
          
          {/* Request Trends Chart */}
          <div className="mb-8">
            <RequestTrendsChart />
          </div>
          
          {/* Render the AdminDashboardAnalytics component */}
          <AdminDashboardAnalytics 
            users={users} 
            requests={requests} 
            analyticsTimeframe="month" 
            setAnalyticsTimeframe={() => {}} 
          />
          
          {/* Platform Metrics and other Analytics (without duplicate chart) */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Platform Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded shadow p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{users?.length || 0}</div>
                <div className="text-gray-500">Total Users</div>
              </div>
              <div className="bg-white rounded shadow p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {users?.filter(user => user?.userType === "volunteer")?.length || 0}
                </div>
                <div className="text-gray-500">Active Volunteers</div>
              </div>
              <div className="bg-white rounded shadow p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{requests?.length || 0}</div>
                <div className="text-gray-500">Total Requests</div>
              </div>
              <div className="bg-white rounded shadow p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">97%</div>
                <div className="text-gray-500">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* Service Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Top Services</h3>
              <ul className="divide-y divide-gray-100">
                <li className="py-2 flex justify-between"><span>Plumbing</span><span className="font-bold">1,120</span></li>
                <li className="py-2 flex justify-between"><span>Healthcare</span><span className="font-bold">980</span></li>
                <li className="py-2 flex justify-between"><span>Electrical</span><span className="font-bold">790</span></li>
                <li className="py-2 flex justify-between"><span>Room Cleaning</span><span className="font-bold">650</span></li>
              </ul>
            </div>
            <div className="bg-white rounded shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Volunteer Leaderboard</h3>
              <ul className="divide-y divide-gray-100">
                <li className="py-2 flex justify-between"><span>Sarah Johnson</span><span className="font-bold text-green-600">48 jobs</span></li>
                <li className="py-2 flex justify-between"><span>Emma Brown</span><span className="font-bold text-green-600">44 jobs</span></li>
                <li className="py-2 flex justify-between"><span>James Wilson</span><span className="font-bold text-green-600">39 jobs</span></li>
                <li className="py-2 flex justify-between"><span>Linda Smith</span><span className="font-bold text-green-600">35 jobs</span></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Helper Tab Content */}
      {activeTab === 'helper' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Accepted Requests & Earnings</h2>
          {/* Earnings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900 rounded shadow p-4 flex flex-col items-center">
              <div className="text-lg font-semibold mb-2">Pending Earnings</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-200 mb-2">
                ${requests.filter(r => r.status === 'accepted' && r.paymentStatus === 'held').reduce((sum, r) => sum + (r.amount || 0), 0)}
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900 rounded shadow p-4 flex flex-col items-center">
              <div className="text-lg font-semibold mb-2">Released Earnings</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-200 mb-2">
                ${requests.filter(r => r.status === 'completed' && r.paymentStatus === 'released').reduce((sum, r) => sum + (r.amount || 0), 0)}
              </div>
            </div>
          </div>
          {/* Accepted Requests Table */}
          <div className="overflow-x-auto rounded-xl shadow bg-white dark:bg-gray-900 border dark:border-gray-700">
            <table className="w-full min-w-[700px] text-sm text-gray-800 dark:text-gray-100">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="text-left p-3 font-semibold">User</th>
                  <th className="text-left p-3 font-semibold">Service</th>
                  <th className="text-left p-3 font-semibold">Date</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Earning</th>
                  <th className="text-left p-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.filter(r => r.status === 'accepted' || r.status === 'completed').length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400 dark:text-gray-500">No accepted requests found.</td>
                  </tr>
                ) : (
                  requests.filter(r => r.status === 'accepted' || r.status === 'completed').map(req => (
                    <tr key={req._id} className="border-b dark:border-gray-800">
                      <td className="p-2">{req.userName}</td>
                      <td className="p-2">{req.serviceCategory || 'General Service'}</td>
                      <td className="p-2">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="p-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${req.status === 'accepted' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>{req.status}</span>
                      </td>
                      <td className="p-2">${req.amount || 0}</td>
                      <td className="p-2">
                        {req.status === 'accepted' && (
                          <button
                            className="inline-flex items-center px-2 py-1 rounded bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                            onClick={() => handleRequestAction('complete', req._id)}
                          >
                            🏁 Mark as Completed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
