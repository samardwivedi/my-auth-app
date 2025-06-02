# Admin Dashboard Troubleshooting Guide

This guide helps troubleshoot common issues with the VolunteerHub admin dashboard.

## Common Issues and Solutions

### "Nothing happens when I click on Admin Dashboard"

This issue can occur for several reasons:

1. **Invalid admin credentials in localStorage**
   - Solution: Make sure your user object in localStorage has `"userType": "admin"`.
   - Open browser DevTools (F12) → Application → Storage → Local Storage → Find the "user" item
   - Check that the JSON includes `"userType": "admin"`. If not, modify it and refresh the page.

2. **JavaScript errors preventing navigation**
   - Solution: Check the browser console for errors
   - Open browser DevTools (F12) → Console
   - Look for any red error messages that might indicate what's preventing navigation

3. **MongoDB connection issues**
   - Solution: Verify your MongoDB connection is active
   - Check the terminal where your backend is running for connection errors
   - Run the seed-database.bat script to ensure admin users exist in the database

4. **JSON parsing errors**
   - Solution: Reset your localStorage data
   - Open browser DevTools (F12) → Application → Storage → Local Storage
   - Clear all items (or just the "user" and "token" items)
   - Refresh the page and login again with admin credentials

5. **Missing authentication token**
   - Solution: Check if you have a valid token in localStorage
   - Open browser DevTools (F12) → Application → Storage → Local Storage → Find the "token" item
   - If missing, try logging in again

### "I can see the dashboard but none of the actions work"

1. **Backend API connection issues**
   - Solution: Make sure your backend server is running
   - Check the terminal where your backend should be running
   - Verify in the browser console that API requests aren't failing (no 404 or 500 errors)

2. **Authentication token issues**
   - Solution: Your token might be expired or invalid
   - Try logging out and logging back in with your admin credentials

3. **CORS issues**
   - Solution: Check browser console for CORS errors
   - If you see CORS errors, make sure your backend is properly configured to allow requests from your frontend

### "I can't see any users in the admin dashboard"

1. **Empty database**
   - Solution: Run the seed-database.bat script to populate the database with sample users

2. **API request issues**
   - Solution: Check the browser console for failed API requests
   - Verify that the backend server is running and accessible

### Step-by-Step Recovery Process

If you're still having issues, follow these steps to fully reset your setup:

1. **Close all terminal windows** running the application
2. **Clear browser data**:
   - Open browser DevTools (F12) → Application → Storage → Clear site data
3. **Run the setup-admin-access.bat** script:
   - This will seed the database and start the application with proper admin users
4. **Login with admin credentials**:
   - Email: admin@example.com
   - Password: admin123
5. **Verify user object in localStorage**:
   - After login, check that your localStorage "user" item contains `"userType": "admin"`

## Manual Admin User Creation

If all else fails, you can manually create an admin user in MongoDB:

1. Open MongoDB Compass
2. Connect to your database (usually mongodb://localhost:27017/react-app)
3. Navigate to the "users" collection
4. Add a new document with the following structure:

```json
{
  "name": "Manual Admin",
  "email": "manual.admin@example.com",
  "password": "$2a$10$X7BnzMfIiLKJr1rMSl.K1.u0ERhKQPe.M2rmU6C2KkGNXwMx0r3aq", 
  "userType": "admin",
  "status": "active",
  "location": "Admin Office",
  "description": "Manually created admin user",
  "isVerifiedProvider": true
}
```

**Note**: The password hash above corresponds to "admin123" - don't change it unless you know what you're doing.

## Still Having Issues?

If you've tried all the solutions above and are still experiencing problems:

1. Check the terminal output for any error messages
2. Look in browser console (F12 → Console) for JavaScript errors
3. Verify your MongoDB instance is running correctly
4. Make sure your backend and frontend ports match what's expected (backend: 5000, frontend: 3002)
