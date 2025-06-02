const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/search/volunteers
router.get('/volunteers', async (req, res) => {
  try {
    const {
      type,
      skills,
      availability,
      rating, // Not implemented in User model, placeholder
      language,
      gender,
      location
    } = req.query;

    // Build query object
    let query = { userType: 'volunteer' }; // Use userType instead of role to match User model
    
    // Handle type search for skills (e.g., "Doctor", "Teacher")
    if (type) {
      query['skills'] = { $regex: type, $options: 'i' };
    }
    
    // Handle other filters
    if (language) query['languages'] = { $regex: language, $options: 'i' };
    if (gender) query['gender'] = gender;
    
    // Prioritize location search
    if (location) {
      query['location'] = { $regex: location, $options: 'i' };
      console.log(`Searching for location: ${location}`);
    }
    
    // Availability and rating can be implemented if present in User model
    console.log('Search query:', JSON.stringify(query));

    const volunteers = await User.find(query).select('-password');
    console.log(`Found ${volunteers.length} volunteers matching the criteria`);
    res.json(volunteers);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;
