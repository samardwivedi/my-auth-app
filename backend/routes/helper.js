const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Set up storage for profile photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'profilePhoto-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
  }
});
const upload = multer({ storage });

// @route   POST /api/helpers
// @desc    Submit a new helper (volunteer) application
// @access  Private (must be logged in)
router.post('/', auth, upload.single('profilePhoto'), async (req, res) => {
  try {
    // Use req.body for fields, req.file for the photo
    const {
      fullName,
      email,
      phone,
      address,
      skills,
      specializations,
      experience,
      emergencyAvailability,
      maxRequestsPerDay,
      languages,
      bio,
      serviceAreas,
      termsAccepted,
      about // Added about field
    } = req.body;

    // Debug: Log request body and types
    console.log('Helper application request body:', req.body);
    console.log('Types:', {
      fullName: typeof fullName,
      email: typeof email,
      phone: typeof phone,
      address: typeof address,
      skills: Array.isArray(skills) ? 'array' : typeof skills,
      serviceAreas: Array.isArray(serviceAreas) ? 'array' : typeof serviceAreas,
      termsAccepted: typeof termsAccepted,
      termsAcceptedValue: termsAccepted
    });

    // Accept skills as string (comma separated) or array
    let parsedSkills = skills;
    if (typeof parsedSkills === 'string') {
      parsedSkills = parsedSkills.split(',').map(s => s.trim()).filter(Boolean);
    }
    // Accept specializations as string or array
    let parsedSpecializations = specializations;
    if (typeof parsedSpecializations === 'string') {
      parsedSpecializations = parsedSpecializations.split(',').map(s => s.trim()).filter(Boolean);
    }
    // Accept languages as string (comma separated) or array
    let parsedLanguages = languages;
    if (typeof parsedLanguages === 'string') {
      parsedLanguages = parsedLanguages.split(',').map(l => l.trim()).filter(Boolean);
    }
    // Accept termsAccepted as boolean true or string 'true'
    const termsAcceptedValue = (termsAccepted === true || termsAccepted === 'true');

    // Enhanced validation: check for empty arrays/strings and report which field is missing
    const missingFields = [];
    if (!fullName) missingFields.push('fullName');
    if (!email) missingFields.push('email');
    if (!phone) missingFields.push('phone');
    if (!address) missingFields.push('address');
    if (!parsedSkills || !Array.isArray(parsedSkills) || parsedSkills.length === 0) missingFields.push('skills');
    if (!parsedLanguages || !Array.isArray(parsedLanguages) || parsedLanguages.length === 0) missingFields.push('languages');
    if (!termsAcceptedValue) missingFields.push('termsAccepted (not true)');
    if (missingFields.length > 0) {
      return res.status(400).json({ error: 'Missing or invalid required fields', missingFields });
    }

    // Find user by id from token if available, else by email
    let user = null;
    if (req.user && req.user.userId) {
      user = await User.findById(req.user.userId);
    }
    if (!user && email) {
      user = await User.findOne({ email });
    }
    // If user is already a volunteer, block re-application
    if (user && user.userType === 'volunteer') {
      return res.status(400).json({ error: 'You have already applied as a helper.' });
    }

    // Add photo URL if uploaded
    let photoUrl = '';
    if (req.file) {
      photoUrl = '/uploads/' + req.file.filename;
    }

    // Map fields to match User model
    const userFields = {
      name: fullName,
      email,
      phone,
      location: address,
      skills: parsedSkills,
      specializations: parsedSpecializations,
      experience,
      languages: parsedLanguages,
      termsAccepted: termsAcceptedValue,
      userType: 'volunteer',
      status: 'active', // Set status to active immediately
      about,
      photoUrl,
      // Optionally add other fields if needed
    };
    if (user) {
      Object.assign(user, userFields);
    } else {
      // Set a random password for new volunteers (they must reset it)
      userFields.password = Math.random().toString(36).slice(-8);
      user = new User(userFields);
    }

    await user.save();
    res.status(201).json({ message: 'Helper application submitted successfully', user });
  } catch (err) {
    console.error('Error submitting helper application:', err);
    // Return the actual error message for debugging
    res.status(500).json({ error: 'Failed to submit helper application', details: err.message || err });
  }
});

module.exports = router;
