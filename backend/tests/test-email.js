/**
 * Test script to verify email functionality
 * Run with: node tests/test-email.js
 */

// Load environment variables
require('dotenv').config();

const sendEmail = require('../utils/sendEmail');

/**
 * Environment variables needed:
 * - EMAIL_USER: Your email address (e.g. your-email@gmail.com)
 * - EMAIL_PASS: Your email password or app password
 * - EMAIL_SERVICE: Email service to use (default: gmail)
 * - DEV_MODE: Set to 'true' to simulate email sending without actually sending
 */

const testEmail = async () => {
  console.log('🧪 Testing email configuration...');
  
  // Log current environment settings (safely without showing credentials)
  console.log('\n📋 Environment Configuration:');
  console.log(`- DEV_MODE: ${process.env.DEV_MODE === 'true' ? 'Enabled (emails will be simulated)' : 'Disabled (actual emails will be sent)'}`);
  console.log(`- EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'gmail'}`);
  console.log(`- EMAIL_USER: ${process.env.EMAIL_USER ? '✓ Set' : '✗ Missing'}`);
  console.log(`- EMAIL_PASS: ${process.env.EMAIL_PASS ? '✓ Set' : '✗ Missing'}`);
  console.log(`- NOTIFICATION_EMAIL: ${process.env.NOTIFICATION_EMAIL || 'Not set (will use EMAIL_USER)'}`);
  
  // Test recipient email (using NOTIFICATION_EMAIL or EMAIL_USER)
  const to = process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER || 'test@example.com';
  
  // Create a test subject and message
  const subject = 'Test Email - ' + new Date().toLocaleString();
  const text = `This is a test email sent at ${new Date().toLocaleString()}.
It was generated to verify that your email configuration is working correctly.
The email was sent in ${process.env.DEV_MODE === 'true' ? 'development mode (simulated)' : 'production mode (actual email)'}.`;
  
  console.log('\n🚀 Attempting to send test email...');
  
  try {
    const result = await sendEmail(to, subject, text);
    
    if (result.success) {
      if (result.development) {
        console.log('\n✅ Test successful! (Development mode - email simulated)');
        console.log('ℹ️ Email was not actually sent, but the configuration looks correct.');
        console.log('🔧 To send actual emails, set DEV_MODE=false in your .env file.');
      } else {
        console.log('\n✅ Test successful! Email sent.');
        console.log('🎉 Your email configuration is working correctly.');
      }
    } else {
      console.log('\n❌ Test failed! Email could not be sent.');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('\n❌ Unexpected error during test:', error);
  }
};

// Run the test
testEmail();
