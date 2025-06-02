# KHC Application Backend

This is the backend service for the KHC application. It provides API endpoints for user authentication, messaging, and service requests.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   cd backend
   npm install
   ```
3. Configure environment variables by creating or editing `.env` file (see Configuration section below)
4. Start the server:
   ```
   npm start
   ```

## Configuration

The application uses environment variables for configuration. Create a `.env` file in the backend directory with the following variables:

### Required Environment Variables

```
MONGO_URI=mongodb://localhost:27017/react-app
PORT=5000
```

### Email Configuration Options

The application can send email notifications for service requests. Configure email settings in the `.env` file:

```
# Email configuration
# For Gmail: 
# 1. Use your Gmail address as EMAIL_USER
# 2. Use an App Password (not your regular password) as EMAIL_PASS
#    To create an App Password: 
#    - Go to https://myaccount.google.com/security
#    - Enable 2-Step Verification if not already enabled
#    - Go to App passwords, create a new one for this application

EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NOTIFICATION_EMAIL=your-email@gmail.com  # Email where notifications will be sent

# Set to true to disable actual email sending (for development)
DEV_MODE=true
```

## Development vs Production Email Settings

This application has two modes for handling emails:

1. **Development Mode** (`DEV_MODE=true`): 
   - No actual emails are sent
   - Email contents are logged to console
   - Useful for local development without sending real emails
   - No credentials required

2. **Production Mode** (`DEV_MODE=false`):
   - Actual emails are sent to recipients
   - Valid email credentials required
   - For Gmail, you must use an App Password, not your regular Gmail password

## Testing Email Configuration

To test if your email configuration is working correctly, run the test script:

```
node tests/test-email.js
```

This will show your current email configuration and attempt to send a test email based on your settings.

## Common Email Issues

### Gmail Authentication Error

If using Gmail and you see an error like:
```
Error sending email: Invalid login: 535-5.7.8 Username and Password not accepted
```

This is typically because:

1. You're using your regular Gmail password instead of an App Password
2. Your email credentials are incorrect
3. Less secure app access is disabled for your Google account

**Solution**: Use an App Password instead of your regular Gmail password.

To generate an App Password:
1. Visit https://myaccount.google.com/security
2. Enable 2-Step Verification if not already enabled
3. Go to "App passwords" and create a new one for this application
4. Copy the generated password and use it as your `EMAIL_PASS` in the .env file

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get a token

### Messages
- `GET /api/messages/:chatId` - Get all messages for a specific chat
- `POST /api/messages` - Send a new message
- `DELETE /api/messages/:messageId` - Delete a message

### Service Requests
- `POST /api/requests` - Create a new service request
- `GET /api/requests` - Get all service requests
