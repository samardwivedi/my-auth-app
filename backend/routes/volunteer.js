// Volunteer profile route to allow volunteers to view their own profile even if status is 'pending'.
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/volunteer/:id - Get volunteer profile (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user || user.userType !== 'volunteer') {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    // Only show volunteers with status 'active' (ignore 'pending')
    if (user.status !== 'active') {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
