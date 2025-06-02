const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Request = require('../models/Request');
const auth = require('../middleware/auth');

// Middleware to check if user is an admin
const adminAuth = async (req, res, next) => {
  try {
    // Get user from auth middleware
    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin rights required.' });
    }
    next();
  } catch (err) {
    console.error('Admin auth error:', err);
    res.status(500).json({ error: 'Server error during admin authorization.' });
  }
};

// @route   GET api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    // Get query parameters for filtering
    const { role, status, search, location } = req.query;
    
    // Build query object
    const query = {};
    
    // Apply filters if provided
    if (role && role !== 'all') {
      query.userType = role;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (location && location !== 'all') {
      query.location = location;
    }
    
    // Search in name and email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query
    const users = await User.find(query).select('-password');
    
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error while fetching users.' });
  }
});

// @route   PUT api/admin/users/:id/status
// @desc    Update user status (activate/suspend)
// @access  Admin
router.put('/users/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error updating user status:', err);
    res.status(500).json({ error: 'Server error while updating user status.' });
  }
});

// @route   PUT api/admin/users/:id/role
// @desc    Change user role
// @access  Admin
router.put('/users/:id/role', auth, adminAuth, async (req, res) => {
  try {
    const { userType } = req.body;
    
    if (!['customer', 'volunteer', 'admin'].includes(userType)) {
      return res.status(400).json({ error: 'Invalid role value.' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { userType },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ error: 'Server error while updating user role.' });
  }
});

// @route   PUT api/admin/users/:id/verify
// @desc    Verify a volunteer
// @access  Admin
router.put('/users/:id/verify', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    if (user.userType !== 'volunteer') {
      return res.status(400).json({ error: 'Only volunteers can be verified.' });
    }
    
    user.status = 'active';
    user.isVerifiedProvider = true;
    
    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error('Error verifying volunteer:', err);
    res.status(500).json({ error: 'Server error while verifying volunteer.' });
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Server error while deleting user.' });
  }
});

// @route   DELETE api/admin/users/all
// @desc    Delete all users and volunteers except admins
// @access  Admin
router.delete('/users/all', auth, adminAuth, async (req, res) => {
  try {
    // Find and delete all users except admins
    const deleteResult = await User.deleteMany({ userType: { $ne: 'admin' } });
    
    console.log('Delete operation result:', deleteResult);
    
    res.json({ 
      message: 'Successfully deleted all non-admin users and volunteers', 
      deletedCount: deleteResult.deletedCount 
    });
  } catch (err) {
    console.error('Error deleting users:', err);
    res.status(500).json({ error: 'Server error while deleting users' });
  }
});

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Admin
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    // Get counts for different user types and statuses
    const totalUsers = await User.countDocuments({ userType: 'customer' });
    const totalVolunteers = await User.countDocuments({ userType: 'volunteer' });
    const totalAdmins = await User.countDocuments({ userType: 'admin' });
    const pendingVolunteers = await User.countDocuments({ 
      userType: 'volunteer', 
      status: 'pending' 
    });
    const activeVolunteers = await User.countDocuments({ 
      userType: 'volunteer', 
      status: 'active' 
    });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    
    // Get request stats
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const acceptedRequests = await Request.countDocuments({ status: 'accepted' });
    const completedRequests = await Request.countDocuments({ status: 'completed' });
    const cancelledRequests = await Request.countDocuments({ status: 'cancelled' });
    
    res.json({
      totalUsers,
      totalVolunteers,
      totalAdmins,
      pendingVolunteers,
      activeVolunteers,
      suspendedUsers,
      requests: {
        pending: pendingRequests,
        accepted: acceptedRequests,
        completed: completedRequests,
        cancelled: cancelledRequests,
        total: pendingRequests + acceptedRequests + completedRequests + cancelledRequests
      }
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Server error while fetching admin dashboard data.' });
  }
});

// @route   GET api/admin/requests
// @desc    Get all service requests with user and volunteer details
// @access  Admin
router.get('/requests', auth, adminAuth, async (req, res) => {
  try {
    const { status, search } = req.query;
    
    // Build query object
    const query = {};
    
    // Apply status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Apply search filter if provided
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get requests with populated volunteer details
    const requests = await Request.find(query)
      .populate('volunteerId', 'name email phone location')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    console.error('Error fetching service requests:', err);
    res.status(500).json({ error: 'Server error while fetching service requests.' });
  }
});

// @route   PUT api/admin/requests/:id/status
// @desc    Update request status by admin
// @access  Admin
router.put('/requests/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    // Validate status value
    const validStatuses = ['requested', 'accepted', 'in_progress', 'completed', 'paid', 'cancelled', 'declined'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Update status
    request.status = status;
    
    // Add status history entry
    request.statusHistory.push({
      status,
      updatedAt: new Date(),
      updatedBy: 'admin',
      notes: notes || `Status updated to ${status} by admin`
    });
    
    // If setting to completed status, handle payment release
    if (status === 'completed' && request.paymentIntentId && request.paymentStatus === 'held') {
      try {
        // Make a request to payment release API
        const paymentReleaseResponse = await fetch(`${process.env.API_BASE_URL || ''}/api/payments/release`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': req.header('x-auth-token')
          },
          body: JSON.stringify({ requestId: req.params.id })
        });
        
        if (!paymentReleaseResponse.ok) {
          console.error('Error releasing payment:', await paymentReleaseResponse.text());
        }
      } catch (paymentError) {
        console.error('Error calling payment release API:', paymentError);
      }
    }
    
    await request.save();
    
    res.json(request);
  } catch (err) {
    console.error('Error updating request status:', err);
    res.status(500).json({ error: 'Server error while updating request status.' });
  }
});

// @route   PUT api/admin/requests/:id/reassign
// @desc    Reassign request to different volunteer
// @access  Admin
router.put('/requests/:id/reassign', auth, adminAuth, async (req, res) => {
  try {
    const { volunteerId, notes } = req.body;
    
    if (!volunteerId) {
      return res.status(400).json({ error: 'Volunteer ID is required' });
    }
    
    // Validate volunteer exists and is actually a volunteer
    const volunteer = await User.findOne({ 
      _id: volunteerId,
      userType: 'volunteer'
    });
    
    if (!volunteer) {
      return res.status(400).json({ error: 'Invalid volunteer ID or user is not a volunteer' });
    }
    
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Store previous volunteer ID
    const previousVolunteerId = request.volunteerId;
    
    // Update volunteer ID
    request.volunteerId = volunteerId;
    
    // Add status history entry
    request.statusHistory.push({
      status: request.status,
      updatedAt: new Date(),
      updatedBy: 'admin',
      notes: notes || `Request reassigned to ${volunteer.name} by admin`
    });
    
    await request.save();
    
    res.json({
      message: 'Request reassigned successfully',
      request,
      previousVolunteerId,
      newVolunteerId: volunteerId
    });
  } catch (err) {
    console.error('Error reassigning request:', err);
    res.status(500).json({ error: 'Server error while reassigning request.' });
  }
});

// @route   POST api/admin/payment/release/:requestId
// @desc    Admin manually release payment to helper
// @access  Admin
router.post('/payment/release/:requestId', auth, adminAuth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (!request.paymentIntentId) {
      return res.status(400).json({ error: 'No payment associated with this request' });
    }
    
    if (request.paymentStatus === 'released') {
      return res.status(400).json({ error: 'Payment already released' });
    }
    
    if (request.paymentStatus === 'refunded') {
      return res.status(400).json({ error: 'Payment already refunded' });
    }
    
    // Update payment status
    request.paymentStatus = 'released';
    request.status = 'paid';
    request.adminOverride = true;
    
    // Add to status history
    request.statusHistory.push({
      status: 'paid',
      updatedAt: new Date(),
      updatedBy: 'admin',
      notes: req.body.notes || 'Payment manually released by admin'
    });
    
    await request.save();
    
    res.json({
      success: true,
      message: 'Payment manually released by admin',
      request
    });
  } catch (err) {
    console.error('Error in admin payment release:', err);
    res.status(500).json({ error: 'Server error in admin payment release' });
  }
});

// @route   POST api/admin/payment/refund/:requestId
// @desc    Admin refund payment to user
// @access  Admin
router.post('/payment/refund/:requestId', auth, adminAuth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (!request.paymentIntentId) {
      return res.status(400).json({ error: 'No payment associated with this request' });
    }
    
    if (request.paymentStatus === 'refunded') {
      return res.status(400).json({ error: 'Payment already refunded' });
    }
    
    if (request.paymentStatus === 'released') {
      return res.status(400).json({ error: 'Payment already released to helper' });
    }
    
    // Update payment status
    request.paymentStatus = 'refunded';
    request.adminOverride = true;
    
    // Add to status history
    request.statusHistory.push({
      status: request.status,
      updatedAt: new Date(),
      updatedBy: 'admin',
      notes: req.body.notes || 'Payment refunded by admin due to dispute'
    });
    
    await request.save();
    
    res.json({
      success: true,
      message: 'Payment refunded by admin',
      request
    });
  } catch (err) {
    console.error('Error in admin payment refund:', err);
    res.status(500).json({ error: 'Server error in admin payment refund' });
  }
});

// @route   PUT api/admin/requests/:id/flag
// @desc    Flag a request as suspicious or abusive
// @access  Admin
router.put('/requests/:id/flag', auth, adminAuth, async (req, res) => {
  try {
    const { isFlagged, flagReason } = req.body;
    
    if (isFlagged === undefined) {
      return res.status(400).json({ error: 'isFlagged field is required' });
    }
    
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Add flagged properties if they don't exist
    if (!request.isFlagged) {
      request.isFlagged = isFlagged;
    } else {
      request.isFlagged = isFlagged;
    }
    
    // Add flag reason if provided
    if (flagReason && isFlagged) {
      request.flagReason = flagReason;
    }
    
    // Add status history entry if flagged
    if (isFlagged) {
      request.statusHistory.push({
        status: request.status,
        updatedAt: new Date(),
        updatedBy: 'admin',
        notes: flagReason || 'Request flagged as suspicious or abusive by admin'
      });
    }
    
    await request.save();
    
    res.json({
      message: isFlagged ? 'Request flagged successfully' : 'Request unflagged successfully',
      request
    });
  } catch (err) {
    console.error('Error flagging request:', err);
    res.status(500).json({ error: 'Server error while flagging request.' });
  }
});

module.exports = router;
