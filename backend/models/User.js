const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  // Enhanced profile fields
  bio: {
    type: String,
    default: ''
  },
  skills: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: ''
  },
  photoUrl: {
    type: String,
    default: ''
  },
  // Languages spoken
  languages: {
    type: [String],
    default: []
  },
  // Gender (for matching preferences if relevant)
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer not to say'],
    default: 'prefer not to say'
  },
  // Ratings and verification
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  servicesCompleted: {
    type: Number,
    default: 0
  },
  isVerifiedProvider: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  // Enhanced status for admin panel
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending'],
    default: 'active'
  },
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  availabilitySchedule: {
    type: [
      {
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        startTime: String,
        endTime: String
      }
    ],
    default: []
  },
  // Location with coordinates for geospatial search
  coordinates: {
    type: {
      lat: Number,
      lng: Number
    },
    default: null
  },
  // Provider details
  providerSince: {
    type: Date
  },
  specializations: {
    type: [String],
    default: []
  },
  // User profile type
  userType: {
    type: String,
    enum: ['customer', 'volunteer', 'admin'],
    default: 'customer'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Add index for location-based queries
UserSchema.index({ "coordinates": "2dsphere" });

module.exports = mongoose.model('User', UserSchema);
