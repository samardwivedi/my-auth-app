# Volunteer Email Notification Guide

## Overview

This guide explains how volunteer email notifications work in the service request system and how to verify that they are functioning correctly.

## Issue Resolution

**Problem**: Volunteers were not receiving email notifications when users submitted service requests.

**Solution**: The system has been updated to ensure that email notifications are:
1. Sent directly to the volunteer assigned to the service request 
2. Sent for both new requests and status updates
3. Properly configured to actually send emails (not just log them in development mode)

## Changes Made

The following changes have been implemented:

1. **Updated Request Routes**:
   - Modified the POST `/api/requests` route to look up the volunteer's email by ID
   - Added personalized email notifications sent directly to volunteers
   - Improved the PUT `/api/requests/:id` route to send status update notifications
   - Added status history tracking for better record-keeping
   - Ensured all service request details (location, category, date/time, etc.) are saved and included in notifications
   - Added user's email lookup from their account to ensure correct email is displayed in notifications

2. **Email Configuration**:
   - Updated environment variables to disable development mode by default
   - Improved documentation in the .env file
   - Removed reliance on a fixed notification email address

3. **Comprehensive Request Information**:
   - Now saving all form fields to the database (service location, category, scheduled date/time, urgency level)
   - Including all service details in email notifications to volunteers
   - Providing more context in status update notifications
   - Showing both contact field and authenticated user's email in notifications to ensure correct email is visible

4. **Testing Utilities**:
   - Added a test script to verify volunteer email functionality

## Configuration Instructions

### Setting Up Email Credentials

1. Open the `.env` file in the backend directory
2. Ensure `DEV_MODE` is set to `false` to actually send emails
3. Configure email settings:
   - `EMAIL_SERVICE`: The email service (default: "gmail")
   - `EMAIL_USER`: Your email address (e.g., your-email@gmail.com)
   - `EMAIL_PASS`: Your email password or app password

For Gmail users:
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification if not already enabled
3. Create an App Password for this application
4. Use this App Password in the EMAIL_PASS field (not your regular Gmail password)

### Testing Email Functionality

To verify that volunteer email notifications are working correctly:

1. Make sure your MongoDB database is running
2. Make sure at least one user with `userType: 'volunteer'` exists in the database
3. Ensure the email credentials are correctly configured in `.env`
4. Run the test script:

```bash
node backend/test-volunteer-email.js
```

The script will:
- Find a volunteer in your database
- Create a test service request
- Send a test email notification to the volunteer's email
- Report whether the email was sent successfully
- Clean up the test data

### Troubleshooting

If email notifications are not working:

1. **Check Environment Variables**:
   - Make sure `DEV_MODE` is set to `false`
   - Verify that `EMAIL_USER` and `EMAIL_PASS` are correctly configured

2. **Authentication Issues**:
   - For Gmail, make sure you're using an App Password
   - Test your email credentials with `node backend/tests/test-email.js`

3. **Volunteer Data Issues**:
   - Verify that volunteers have valid email addresses in the database
   - Make sure `volunteerId` in requests points to a valid volunteer user

4. **Server Logs**:
   - Check the server logs for any error messages related to sending emails
   - Look for messages about volunteer email lookup failures

## How It Works

When a user submits a service request:

1. The system creates the request in the database with all provided fields
2. It looks up the volunteer's information (including email) using the `volunteerId`
3. It sends a personalized email notification directly to the volunteer with complete service details
4. If the volunteer's email can't be found, it falls back to the notification address

When a request's status is updated:

1. The system updates the status and adds an entry to the status history
2. It sends notifications to both the volunteer and the user
3. The notification message is customized based on the new status
4. All service details (location, category, schedule, etc.) are included in the notifications

This ensures that all parties are kept informed about service requests throughout the process with all the necessary information to properly fulfill the request.
