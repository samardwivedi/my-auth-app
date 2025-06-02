const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   POST api/auth/signup
// @desc    Register a user
// @access  Public
router.post('/signup', async (req, res) => {
  const { username, email, password, userType } = req.body;
  
  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ 
      error: 'Please provide all required fields: username, email, and password' 
    });
  }
  
  try {
    console.log('Signup attempt:', { username, email, userType });
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    user = new User({
      name: username, // Username from frontend maps to name in backend
      email,
      password,
      // Always default to customer user type for new signups
      userType: 'customer', 
      status: 'active', // Set status to active by default
      location: 'Delhi' // Default location
    });
    
    console.log('New user object created:', JSON.stringify(user.toObject({ getters: true, virtuals: true }), null, 2));

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    console.log('Attempting to save user to MongoDB...');
    try {
      await user.save();
      console.log('User created successfully:', user.email);
      console.log('User ID:', user._id);
    } catch (saveError) {
      console.error('Error saving user to database:', saveError);
      return res.status(500).json({ error: 'Failed to save user to database. MongoDB error: ' + saveError.message });
    }

    // Create JWT payload
    const payload = {
      userId: user.id,
      userType: user.userType || 'customer'
    };

    // Sign and return JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'defaultSecretKey',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err);
          return res.status(500).json({ error: 'Error generating authentication token' });
        }
        
        res.json({ 
          token, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email,
            userType: user.userType,
            skills: user.skills,
            location: user.location,
            description: user.description
          } 
        });
      }
    );
  } catch (err) {
    console.error('Signup error:', err);
    console.error('Request body:', req.body);
    res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  console.log('Login attempt received:', req.body);
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json({ 
      error: 'Please provide both email and password' 
    });
  }

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Defensive: check if user.password exists
    if (!user.password) {
      console.error('User found but password field is missing! User:', user);
      return res.status(500).json({ error: 'User record is corrupted: password missing.' });
    }

    // Compare password
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (compareErr) {
      console.error('Error comparing password:', compareErr);
      return res.status(500).json({ error: 'Error comparing password.' });
    }
    console.log('Password match:', isMatch ? 'Yes' : 'No');
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Defensive: check for required user fields before JWT
    if (!user.id || !user.userType) {
      console.error('User record missing id or userType:', user);
      return res.status(500).json({ error: 'User record is corrupted: missing id or userType.' });
    }

    // Create JWT payload
    const payload = {
      userId: user.id,
      userType: user.userType || 'customer'
    };

    // Sign and return JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'defaultSecretKey',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err);
          return res.status(500).json({ error: 'Error generating authentication token' });
        }
        
        console.log('Login successful, sending token');
        res.json({ 
          token, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email,
            userType: user.userType || 'customer',
            skills: user.skills || [],
            location: user.location || '',
            description: user.description || '',
            phone: user.phone || ''
          } 
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login. Please try again. ' + (err && err.message ? err.message : '') });
  }
});

// @route   GET api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    // Log the Authorization header for debugging
    console.log('Authorization header:', req.headers['authorization']);
    // Check if req.user and req.user.userId exist
    if (!req.user || !req.user.userId) {
      console.error('Missing req.user or req.user.userId:', req.user);
      return res.status(401).json({ error: 'Invalid or missing authentication token.' });
    }
    const userId = req.user.userId;
    console.log('Fetching profile for userId:', userId);
    const user = await User.findById(userId).select('-password');
    if (!user) {
      console.error('User not found for userId:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Server error: ' + (err && err.message ? err.message : '') });
  }
});

module.exports = router;
