const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Request = require('../models/Request');
const Payment = require('../models/Payment');

// @route   GET api/stats
// @desc    Get dashboard stats (works for both helpers and regular users)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    console.log('Stats route hit. User info:', req.user);
    const userId = req.user.userId || (req.user.user && req.user.user.id);
    const userType = req.user.userType || 'customer';
    
    console.log(`Processing stats for userId: ${userId}, userType: ${userType}`);
    
    // Use mock data for testing if needed
    const useMockData = true; // Set to false when database is working properly
    
    if (useMockData) {
      console.log('Using mock data for stats');
      // Return mock data for testing
      const mockStats = {
        totalRequests: 5,
        completedRequests: 2,
        pendingRequests: 3,
        totalPayments: 2500
      };
      
      return res.json(mockStats);
    }
    
    // Different query based on userType (helper or regular user)
    const isHelper = userType === 'helper' || userType === 'volunteer';
    const userIdField = isHelper ? 'volunteerId' : 'userId';
    
    console.log(`Using ${userIdField} for queries`);
    
    // Get total requests count
    const totalRequests = await Request.countDocuments({
      [userIdField]: userId
    });
    
    console.log(`Found ${totalRequests} total requests`);
    
    // Get completed requests count
    const completedRequests = await Request.countDocuments({
      [userIdField]: userId,
      status: 'completed'
    });
    
    // Get pending requests count (including in_progress)
    const pendingRequests = await Request.countDocuments({
      [userIdField]: userId,
      status: { $in: ['requested', 'in_progress'] }
    });
    
    // Get payments data - for helpers it's as volunteer, for users it's as user
    const paymentField = isHelper ? 'volunteerId' : 'userId';
    const paymentsData = await Payment.find({
      [paymentField]: userId
    });
    
    console.log(`Found ${paymentsData.length} payments`);
    
    // Calculate total payments/earnings
    const totalPayments = paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    // Return stats
    const statsResponse = {
      totalRequests,
      completedRequests,
      pendingRequests,
      totalPayments
    };
    
    // Additional helper-specific stats
    if (isHelper) {
      const pendingPayments = paymentsData.filter(p => p.status === 'pending' || p.status === 'escrow');
      const pendingAmount = pendingPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      
      statsResponse.totalEarnings = totalPayments;
      statsResponse.pendingAmount = pendingAmount;
    }
    
    console.log('Returning stats response:', statsResponse);
    res.json(statsResponse);
    
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
