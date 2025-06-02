const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const User = require('../models/User');
const mongoose = require('mongoose');

// @route   POST api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', auth, async (req, res) => {
  const { providerId, rating, comment, serviceType } = req.body;
  
  // Validate required fields
  if (!providerId || !rating || !comment || !serviceType) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }
  
  try {
    // Check if provider exists
    const provider = await User.findById(providerId);
    if (!provider) {
      return res.status(404).json({ error: 'Service provider not found' });
    }
    
    // Check if user is trying to review themselves
    if (req.user.userId === providerId) {
      return res.status(400).json({ error: 'You cannot review yourself' });
    }
    
    // Check if user has already reviewed this provider
    const existingReview = await Review.findOne({
      userId: req.user.userId,
      providerId
    });
    
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this provider' });
    }
    
    // Create the review
    const newReview = new Review({
      userId: req.user.userId,
      providerId,
      rating: Math.min(Math.max(parseInt(rating), 1), 5), // Ensure rating is between 1-5
      comment,
      serviceType
    });
    
    const savedReview = await newReview.save();
    
    // Update provider's average rating
    const allReviews = await Review.find({ providerId, status: 'approved' });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : 0;
    
    await User.findByIdAndUpdate(providerId, { 
      averageRating: parseFloat(averageRating),
      reviewCount: allReviews.length
    });
    
    res.status(201).json(savedReview);
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/reviews/provider/:providerId
// @desc    Get reviews for a specific provider
// @access  Public
router.get('/provider/:providerId', async (req, res) => {
  try {
    // Check if the providerId is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.providerId)) {
      return res.status(400).json({ error: 'Invalid provider ID' });
    }
    
    // Find approved reviews for this provider
    const reviews = await Review.find({
      providerId: req.params.providerId,
      status: 'approved'
    }).sort({ createdAt: -1 }) // Sort by newest first
      .populate('userId', 'name'); // Include reviewer's name
    
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/reviews/volunteer/:volunteerId
// @desc    Get reviews for a specific volunteer (alias for provider)
// @access  Public
router.get('/volunteer/:volunteerId', async (req, res) => {
  try {
    // Check if the volunteerId is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.volunteerId)) {
      return res.status(400).json({ error: 'Invalid volunteer ID' });
    }
    
    // Find approved reviews for this volunteer
    const reviews = await Review.find({
      providerId: req.params.volunteerId, // Use providerId field since volunteers are providers
      status: 'approved'
    }).sort({ createdAt: -1 }) // Sort by newest first
      .populate('userId', 'name'); // Include reviewer's name
    
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching volunteer reviews:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/reviews/user
// @desc    Get reviews written by the logged-in user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('providerId', 'name'); // Include provider name
    
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching user reviews:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { rating, comment } = req.body;
  
  // Check if rating and comment are provided
  if (!rating && !comment) {
    return res.status(400).json({ error: 'Please provide rating or comment to update' });
  }
  
  try {
    // Find the review
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if the review belongs to the user
    if (review.userId.toString() !== req.user.userId) {
      return res.status(401).json({ error: 'Not authorized to update this review' });
    }
    
    // Create update object
    const updateData = {};
    if (rating) updateData.rating = Math.min(Math.max(parseInt(rating), 1), 5);
    if (comment) updateData.comment = comment;
    
    // Update the review
    review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    // Update provider's average rating
    const providerId = review.providerId;
    const allReviews = await Review.find({ providerId, status: 'approved' });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : 0;
    
    await User.findByIdAndUpdate(providerId, { 
      averageRating: parseFloat(averageRating),
      reviewCount: allReviews.length
    });
    
    res.json(review);
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find the review
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if the review belongs to the user
    if (review.userId.toString() !== req.user.userId) {
      return res.status(401).json({ error: 'Not authorized to delete this review' });
    }
    
    // Store provider ID before deleting
    const providerId = review.providerId;
    
    // Delete the review
    await Review.findByIdAndDelete(req.params.id);
    
    // Update provider's average rating
    const allReviews = await Review.find({ providerId, status: 'approved' });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : 0;
    
    await User.findByIdAndUpdate(providerId, { 
      averageRating: parseFloat(averageRating),
      reviewCount: allReviews.length
    });
    
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
