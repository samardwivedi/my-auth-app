# Admin Dashboard Access Guide

This guide explains how to access and use the admin dashboard in VolunteerHub.

## Getting Admin Access

To access the admin dashboard, you need an account with admin privileges. Here's how to create one:

### Method 1: Using the Seed Data Script (Recommended for Development)

1. Run the seed database script to create sample data including an admin user:

```bash
npm run seed-database.bat
```

This script automatically creates several test users, including one with admin privileges.

### Method 2: Promoting an Existing User to Admin

If you already have a user account, you can promote yourself to admin by:

1. Open your browser's developer tools (F12 in most browsers)
2. Go to the "Application" or "Storage" tab
3. Find "Local Storage" and select your site
4. Find the item named "user"
5. Edit the JSON value and change `"userType": "customer"` to `"userType": "admin"`
6. Refresh the page for changes to take effect

### Method 3: Creating an Admin User Using MongoDB Compass

1. Open MongoDB Compass and connect to your database
2. Navigate to the "users" collection
3. Find an existing user or create a new one
4. Set the `userType` field to "admin"
5. Save the changes

## Logging In as Admin

1. Navigate to the homepage 
2. Click "Login" at the top right of the site
3. Enter your admin credentials

If you used Method 1 (seed data), use one of the following admin accounts:

Default admin:
- Email: `admin@example.com`
- Password: `admin123`

Custom admin:
- Email: `samardwivedi97@gmail.com` 
- Username: `samar`
- Password: When running the seed script, this account will have the same password as the default admin (`admin123`). 

Note: If you need to use the specific password "Kamlasamar@2005", you'll need to update it manually in the database or through the application after login.

## Accessing the Admin Dashboard

Once logged in with admin credentials:

1. You should see an "Admin Dashboard" link in the navigation bar
2. Click this link to access the admin dashboard
3. If you don't see the link, make sure:
   - You're logged in
   - Your account has admin privileges
   - You've refreshed the page after gaining admin privileges

## Admin Dashboard Features

From the admin dashboard, you can:

1. View all users & volunteers
2. Search and filter users by name, email, role, status, and location
3. Activate or suspend user accounts
4. Change user roles (promote to Volunteer or Admin)
5. Verify pending volunteer accounts

## Troubleshooting

If you can't access the admin dashboard:

1. Check that you're logged in with an admin account
2. Verify the `userType` in localStorage is set to "admin"
3. Try clearing your browser cache and logging in again
4. Check the browser console for any errors
5. Ensure your MongoDB connection is working (if using a database)
