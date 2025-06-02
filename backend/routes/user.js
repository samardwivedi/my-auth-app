const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// @route   GET api/user/notifications
// @desc    Get user notifications
// @access  Private
router.get('/notifications', auth, async (req, res) => {
  try {
    // Extract user ID from auth middleware
    const userId = req.user.userId;
    
    // For demo purposes, returning some mock notifications
    // In a production app, these would come from a database
    const notifications = [
      {
        _id: '1',
        message: 'Your request has been accepted',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        isRead: false
      },
      {
        _id: '2',
        message: 'Payment received for your recent service',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        isRead: true
      },
      {
        _id: '3',
        message: 'New feature: You can now rate your helpers!',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
        isRead: true
      }
    ];
    
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
