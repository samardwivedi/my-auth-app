const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Request = require('../models/Request');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail'); 
// POST /api/requests
router.post('/', async (req, res) => {
  const { userName, contact, message, volunteerId, serviceLocation, serviceCategory, scheduledDate, scheduledTime, urgencyLevel } = req.body;
  
  // Validate required fields
  if (!userName || !contact || !message) {
    return res.status(400).json({ error: 'Missing required fields: userName, contact, and message are required' });
  }
  
  try {
    // For development purposes, if volunteerId is missing or invalid, use a placeholder
    const finalVolunteerId = volunteerId || '65f1a2b3c4d5e6f7a8b9c0d1'; // Placeholder ID
    
    // Get user ID and email from auth token if available
    let userId = null;
    let userEmail = null;
    
    try {
      const token = req.header('x-auth-token');
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.user.id;
        
        // Get user email from database
        if (userId) {
          const user = await User.findById(userId);
          if (user && user.email) {
            userEmail = user.email;
          }
        }
      }
    } catch (tokenError) {
      console.warn('⚠️ Error extracting user ID from token:', tokenError.message);
    }
    
    // Create new request with all fields
    const newRequest = new Request({ 
      userId,
      userName, 
      contact, 
      message, 
      volunteerId: finalVolunteerId,
      // Include all additional fields from the form
      serviceLocation: serviceLocation || '',
      serviceCategory: serviceCategory || '',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      scheduledTime: scheduledTime || '',
      urgencyLevel: urgencyLevel || 'medium'
    });
    
    await newRequest.save();

    // Look up the volunteer's email address
    let volunteerEmail = null;
    let volunteerName = "Volunteer";
    
    try {
      // Find the volunteer user by ID
      const volunteerUser = await User.findById(finalVolunteerId);
      if (volunteerUser) {
        volunteerEmail = volunteerUser.email;
        volunteerName = volunteerUser.name;
        console.log(`✅ Found volunteer: ${volunteerName} (${volunteerEmail})`);
      } else {
        console.warn(`⚠️ Volunteer with ID ${finalVolunteerId} not found`);
      }
    } catch (error) {
      console.error(`❌ Error finding volunteer: ${error.message}`);
    }
    
    // Send email notification
    const emailBody = `
Hello ${volunteerName},

A new service request has been assigned to you:

Request ID: ${newRequest._id}

User Information:
- Name: ${userName}
- Contact: ${contact}
- Email: ${userEmail || contact}

Service Details:
- Category: ${serviceCategory || 'Not specified'}
- Location: ${serviceLocation || 'Not specified'}
- Message: ${message}
- Urgency: ${urgencyLevel || 'Medium'}
- Scheduled Date: ${scheduledDate ? new Date(scheduledDate).toLocaleDateString() : 'Not specified'}
- Scheduled Time: ${scheduledTime || 'Not specified'}

Please log in to your volunteer dashboard to accept or decline this request.
    `;
    
    // Default notification email if volunteer email is not found
    const fallbackEmail = process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER || 'your-email@gmail.com';
    
    // Use the volunteer's email if available, otherwise use the fallback
    const notificationEmail = volunteerEmail || fallbackEmail;
    
    // Log which email is being used
    console.log(`📧 Sending notification to: ${notificationEmail} ${volunteerEmail ? '(volunteer email)' : '(fallback email)'}`);
    
    // Send email and check response
    const emailResult = await sendEmail(notificationEmail, 'New Service Request Assigned', emailBody);
    
    let responseMessage = 'Request submitted successfully';
    
    // Add email status to response message
    if (emailResult.success) {
      if (emailResult.development) {
        responseMessage += ' (Email details logged to console - development mode)';
      } else {
        responseMessage += ' and email notification sent to volunteer';
      }
    } else {
      responseMessage += ' but email notification failed';
      console.warn('⚠️ Email sending failed:', emailResult.error);
    }
    
    res.status(201).json({ 
      message: responseMessage, 
      requestId: newRequest._id,
      emailSent: emailResult.success,
      sentToVolunteer: !!volunteerEmail
    });
  } catch (err) {
    console.error('❌ Error creating request or sending email:', err);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});
       

   
 
// GET /api/requests - Get all requests
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// GET /api/requests/user - Get requests for the logged-in user
router.get('/user', async (req, res) => {
  try {
    // Extract user ID from authentication token
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ error: 'No authentication token, authorization denied' });
    }
    
    // Decode the token to get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecretKey');
    const userId = decoded.userId;
    
    // Find all requests for this user
    const requests = await Request.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    console.error('Error fetching user requests:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// GET /api/requests/:id - Get a specific request
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.status(200).json(request);
  } catch (err) {
    console.error('Error fetching request:', err);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// PUT /api/requests/:id - Update a request status
router.put('/:id', async (req, res) => {
  try {
    const { status, updatedBy, notes, rating } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    // Validate status value
    const validStatuses = ['requested', 'accepted', 'in_progress', 'completed', 'paid', 'cancelled', 'declined'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    // First, get the current request to access its details
    const currentRequest = await Request.findById(req.params.id);
    if (!currentRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Only send status update email if status actually changed
    const statusChanged = currentRequest.status !== status;
    
    // Add status history entry
    const statusHistory = {
      status,
      updatedAt: new Date(),
      updatedBy: updatedBy || 'System',
      notes: notes || `Status changed to ${status}`
    };
    
    // Build update object
    const updateObj = { 
      status,
      $push: { statusHistory }
    };
    
    // Add rating if provided (when marking as completed)
    if (rating && status === 'completed') {
      updateObj.rating = rating;
    }
    
    // Handle payment release when status changes to completed
    if (status === 'completed' && currentRequest.paymentIntentId && currentRequest.paymentStatus === 'held') {
      try {
        // Use payment release endpoint
        const paymentReleaseResponse = await fetch(`${process.env.API_BASE_URL || ''}/api/payments/release`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': req.header('x-auth-token')
          },
          body: JSON.stringify({ requestId: req.params.id })
        });
        
        if (!paymentReleaseResponse.ok) {
          console.error('Error releasing payment:', await paymentReleaseResponse.text());
        }
      } catch (paymentError) {
        console.error('Error calling payment release API:', paymentError);
      }
    }
    
    // Update the request
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      updateObj,
      { new: true }
    );
    
    // If status changed, send email notifications
    let emailResults = { volunteer: false, user: false };
    
    if (statusChanged) {
      // Get detailed information about the volunteer and user
      try {
        // Look up user and volunteer details to send notifications
        const volunteer = await User.findById(currentRequest.volunteerId);
        const user = await User.findById(currentRequest.userId);
        
        // Email to volunteer about status change
        if (volunteer && volunteer.email) {
          // Get user email if available
          let userEmail = null;
          if (user && user.email) {
            userEmail = user.email;
          }

          const volunteerEmailBody = `
Hello ${volunteer.name},

The status of service request #${currentRequest._id} has been updated to "${status}".

User Information:
- Name: ${currentRequest.userName}
- Contact: ${currentRequest.contact}
- Email: ${userEmail || currentRequest.contact}

Service Details:
- Category: ${currentRequest.serviceCategory || 'Not specified'}
- Location: ${currentRequest.serviceLocation || 'Not specified'}
- Message: ${currentRequest.message}
- Urgency: ${currentRequest.urgencyLevel || 'Medium'}
- Scheduled Date: ${currentRequest.scheduledDate ? new Date(currentRequest.scheduledDate).toLocaleDateString() : 'Not specified'}
- Scheduled Time: ${currentRequest.scheduledTime || 'Not specified'}
${notes ? `\nAdditional Notes:\n${notes}` : ''}

Please log in to your volunteer dashboard for more details.
          `;
          
          const volunteerEmailResult = await sendEmail(
            volunteer.email,
            `Service Request Status Updated: ${status.toUpperCase()}`,
            volunteerEmailBody
          );
          
          emailResults.volunteer = volunteerEmailResult.success;
        }
        
        // Email to user about status change
        if (user && user.email) {
          // Customize message based on status
          let statusMessage = '';
          switch(status) {
            case 'accepted':
              statusMessage = 'Your request has been accepted by the volunteer.';
              break;
            case 'completed':
              statusMessage = 'Your service request has been marked as completed.';
              break;
            case 'cancelled':
              statusMessage = 'Your service request has been cancelled.';
              break;
            case 'declined':
              statusMessage = 'Unfortunately, the volunteer is unable to fulfill your request at this time.';
              break;
            case 'rescheduled':
              statusMessage = 'Your service request has been rescheduled.';
              break;
            default:
              statusMessage = `Your request status has been updated to "${status}".`;
          }
          
          const userEmailBody = `
Hello ${user.name},

${statusMessage}

Request details:
- Request ID: ${currentRequest._id}
- Service Category: ${currentRequest.serviceCategory || 'Not specified'}
- Service Location: ${currentRequest.serviceLocation || 'Not specified'}
- Scheduled Date: ${currentRequest.scheduledDate ? new Date(currentRequest.scheduledDate).toLocaleDateString() : 'Not specified'}
- Scheduled Time: ${currentRequest.scheduledTime || 'Not specified'}
- Message: ${currentRequest.message}
${notes ? `- Notes: ${notes}` : ''}

You can check the status of your request by logging into your account.
          `;
          
          const userEmailResult = await sendEmail(
            user.email,
            `Update on Your Service Request: ${status.toUpperCase()}`,
            userEmailBody
          );
          
          emailResults.user = userEmailResult.success;
        }
      } catch (emailError) {
        console.error('Error sending status update emails:', emailError);
      }
    }
    
    res.status(200).json({
      request: updatedRequest,
      statusChanged,
      emailResults
    });
  } catch (err) {
    console.error('Error updating request:', err);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// PATCH /api/requests/:id/viewed - Helper marks request as viewed
router.patch('/:id/viewed', async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { viewedByHelper: true },
      { new: true }
    );
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json({ success: true, viewedByHelper: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update viewed status' });
  }
});

// PATCH /api/requests/:id/cancel - User cancels request if within deadline
router.patch('/:id/cancel', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    const now = new Date();
    const deadline = request.cancelDeadline || new Date(request.createdAt.getTime() + 2 * 60 * 60 * 1000); // 2 hours default
    if (request.status === 'completed' || request.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot cancel completed or already cancelled request' });
    }
    if (now > deadline) {
      return res.status(400).json({ error: 'Cancel period expired' });
    }
    request.status = 'cancelled';
    await request.save();
    // Notify helper (email or notification)
    try {
      const volunteer = await User.findById(request.volunteerId);
      if (volunteer && volunteer.email) {
        const sendEmail = require('../utils/sendEmail');
        const emailBody = `
Hello ${volunteer.name || 'Helper'},

A service request assigned to you (ID: ${request._id}) has been cancelled by the user.

User: ${request.userName}
Contact: ${request.contact}
Service: ${request.serviceCategory || 'N/A'}
Location: ${request.serviceLocation || 'N/A'}

Please log in to your dashboard for more details.`;
        await sendEmail(volunteer.email, 'Service Request Cancelled', emailBody);
      }
    } catch (notifyErr) {
      console.error('Failed to notify helper on cancel:', notifyErr);
    }
    res.json({ success: true, cancelled: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel request' });
  }
});

// GET /api/requests/user-stats - Get stats for the logged-in user
router.get('/user-stats', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ error: 'No authentication token, authorization denied' });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecretKey');
    } catch (jwtErr) {
      console.error('JWT verification error:', jwtErr);
      return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }
    // Support both token formats
    const userId = decoded.userId || (decoded.user && decoded.user.id);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token: user ID not found' });
    }
    const totalRequests = await Request.countDocuments({ userId });
    const completedRequests = await Request.countDocuments({ userId, status: 'completed' });
    const pendingRequests = await Request.countDocuments({ userId, status: { $ne: 'completed' } });
    res.json({ totalRequests, completedRequests, pendingRequests });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// PATCH /api/requests/:id/mark-completed - Helper marks request as completed
router.patch('/:id/mark-completed', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.isCompletedByHelper) return res.status(400).json({ error: 'Already marked as completed' });
    request.isCompletedByHelper = true;
    await request.save();
    // Notify user
    const user = await User.findById(request.userId);
    if (user && user.email) {
      const sendEmail = require('../utils/sendEmail');
      await sendEmail(user.email, 'Service Marked as Completed', `Your service request #${request._id} has been marked as completed by the helper. Please confirm completion in your dashboard.`);
    }
    res.json({ success: true, isCompletedByHelper: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as completed' });
  }
});

// PATCH /api/requests/:id/confirm-completion - User confirms completion
router.patch('/:id/confirm-completion', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (!request.isCompletedByHelper) return res.status(400).json({ error: 'Helper has not marked as completed yet' });
    if (request.isConfirmedByUser) return res.status(400).json({ error: 'Already confirmed' });
    request.isConfirmedByUser = true;
    request.releaseDate = new Date();
    await request.save();
    // Notify admin (could trigger auto-release or manual review)
    const sendEmail = require('../utils/sendEmail');
    const adminEmail = process.env.ADMIN_EMAIL || process.env.NOTIFICATION_EMAIL;
    if (adminEmail) {
      await sendEmail(adminEmail, 'User Confirmed Completion', `User has confirmed completion for request #${request._id}. You may now release payment to the helper.`);
    }
    res.json({ success: true, isConfirmedByUser: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to confirm completion' });
  }
});

// PATCH /api/requests/:id/raise-dispute - User or helper raises dispute
router.patch('/:id/raise-dispute', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.disputeRaised) return res.status(400).json({ error: 'Dispute already raised' });
    request.disputeRaised = true;
    await request.save();
    // Notify admin
    const sendEmail = require('../utils/sendEmail');
    const adminEmail = process.env.ADMIN_EMAIL || process.env.NOTIFICATION_EMAIL;
    if (adminEmail) {
      await sendEmail(adminEmail, 'Dispute Raised', `A dispute has been raised for request #${request._id}. Please review.`);
    }
    res.json({ success: true, disputeRaised: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to raise dispute' });
  }
});

module.exports = router; // ✅ Make sure this line exists
