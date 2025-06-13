/**
 * Test script to verify volunteer email notification functionality
 * Run with: node backend/test-volunteer-email.js
 */

// Load environment variables
require('dotenv').config();

// Import required models and utilities
const mongoose = require('mongoose');
const User = require('./models/User');
const Request = require('./models/Request');
const sendEmail = require('./utils/sendEmail');

/**
 * This script tests volunteer email notification functionality by:
 * 1. Finding a volunteer user in the database
 * 2. Creating a test service request assigned to that volunteer
 * 3. Sending an email notification to the volunteer
 */
const testVolunteerEmail = async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Log current email configuration
    console.log('\n📋 Email Configuration:');
    console.log(`- DEV_MODE: ${process.env.DEV_MODE === 'true' ? 'Enabled (emails will be simulated)' : 'Disabled (actual emails will be sent)'}`);
    console.log(`- EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'gmail'}`);
    console.log(`- EMAIL_USER: ${process.env.EMAIL_USER ? '✓ Set' : '✗ Missing'}`);
    console.log(`- EMAIL_PASS: ${process.env.EMAIL_PASS ? '✓ Set' : '✗ Missing'}`);

    // Find a volunteer user
    console.log('\n🔄 Looking for a volunteer user...');
    const volunteer = await User.findOne({ userType: 'volunteer' });

    if (!volunteer) {
      console.error('❌ No volunteer users found in the database!');
      console.log('\nPlease create a volunteer user first, then run this test again.');
      console.log('You can create a volunteer user by:');
      console.log('1. Signing up as a regular user');
      console.log('2. Using MongoDB Compass to update the userType to "volunteer"');
      process.exit(1);
    }

    console.log(`✅ Found volunteer: ${volunteer.name} (${volunteer.email})`);

    // Create a test request
    console.log('\n🔄 Creating a test service request...');
    
    // Use volunteer or another user from database for the user
    let testUserId = volunteer._id;
    let testUserEmail = 'test@example.com'; 
    
    // Try to find a regular user for more realistic testing
    try {
      const regularUser = await User.findOne({ userType: 'customer' });
      if (regularUser) {
        testUserId = regularUser._id;
        testUserEmail = regularUser.email;
        console.log(`✅ Using regular user for test: ${regularUser.name} (${regularUser.email})`);
      }
    } catch (error) {
      console.log('ℹ️ No regular user found, using volunteer as user for test');
    }
    
    const testRequest = new Request({
      userId: testUserId,
      userName: 'Test User',
      contact: 'test@example.com', // This could be different from actual email
      message: 'This is a test service request to verify email notifications',
      volunteerId: volunteer._id,
      status: 'requested', // changed from 'pending' to 'requested'
      // Adding additional fields to test the complete notification format
      serviceLocation: '123 Test Street, Test City',
      serviceCategory: 'Plumbing',
      scheduledDate: new Date(new Date().getTime() + 86400000), // Tomorrow
      scheduledTime: '14:00',
      urgencyLevel: 'medium'
    });

    const savedRequest = await testRequest.save();
    console.log(`✅ Test request created with ID: ${savedRequest._id}`);

    // Prepare and send the email
    console.log('\n🔄 Sending test email notification to volunteer...');
    
    const emailBody = `
Hello ${volunteer.name},

This is a test email to verify that volunteer notifications are working correctly.

A new service request has been assigned to you:

Request ID: ${savedRequest._id}

User Information:
- Name: Test User
- Contact: test@example.com
- Email: ${testUserEmail}

Service Details:
- Category: Plumbing
- Location: 123 Test Street, Test City
- Message: This is a test service request to verify email notifications
- Urgency: Medium
- Scheduled Date: ${new Date(new Date().getTime() + 86400000).toLocaleDateString()}
- Scheduled Time: 14:00

Please log in to your volunteer dashboard to accept or decline this request.

Note: This is just a test. You can safely ignore this request.
    `;

    const emailResult = await sendEmail(
      volunteer.email,
      'TEST - New Service Request Assigned',
      emailBody
    );

    // Report the result
    if (emailResult.success) {
      if (emailResult.development) {
        console.log('\n✅ Test successful! (Development mode - email simulated)');
        console.log('ℹ️ Email was not actually sent, but the configuration looks correct.');
        console.log('🔧 To send actual emails, set DEV_MODE=false in your .env file.');
      } else {
        console.log('\n✅ Test successful! Email sent to volunteer.');
        console.log(`🎉 Volunteer email notification sent to: ${volunteer.email}`);
      }
    } else {
      console.log('\n❌ Test failed! Email could not be sent.');
      console.log('Error:', emailResult.error);
    }

    // Cleanup - delete the test request
    console.log('\n🔄 Cleaning up test data...');
    await Request.findByIdAndDelete(savedRequest._id);
    console.log('✅ Test request deleted');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    // Disconnect from MongoDB
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('\n✅ Disconnected from MongoDB');
    }
  }
};

// Run the test
testVolunteerEmail();
