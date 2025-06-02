const nodemailer = require('nodemailer');

/**
 * Send an email using nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body text
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendEmail = async (to, subject, text) => {
  // Log the email for debugging
  console.log('📧 Preparing to send email:');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${text}`);

  try {
    // Check if we're in development mode
    if (process.env.DEV_MODE === 'true') {
      console.log('ℹ️ DEV_MODE is enabled: Email sending is simulated');
      console.log('✅ Development mode: Email details logged instead of sending');
      return { success: true, development: true };
    }
    
    // Check for email credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ Email credentials not found in environment variables');
      console.log('✓ In development mode: Email details logged to console');
      // For development - just log and return success instead of failing
      return { success: true, development: true };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Define email options
    const mailOptions = {
      from: 'Helpora <' + process.env.EMAIL_USER + '>', // Show "Helpora" as sender name
      to,
      subject,
      text
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('📨 Email sent successfully:', info.response);
    return { success: true, info };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // Provide helpful guidance for common errors
    if (error.code === 'EAUTH' || (error.message && error.message.includes('Username and Password not accepted'))) {
      console.error('⚠️ Email sending failed: Authentication error detected');
      console.error('💡 For Gmail: Make sure you\'re using an App Password, not your regular password');
      console.error('   1. Visit https://myaccount.google.com/security');
      console.error('   2. Enable 2-Step Verification if not already enabled');
      console.error('   3. Create an App Password for this application');
      console.error('   4. Or set DEV_MODE=true in .env for development');
    }
    
    // Don't throw error, just return failure status
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
