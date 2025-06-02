@echo off
echo ===== VolunteerHub Admin Setup =====
echo.
echo This script will set up your admin access and start the application.
echo.

REM Step 1: Run the seed database script to create admin users
echo Step 1: Seeding database with admin users...
call seed-database.bat

REM Step 2: Start the application
echo.
echo Step 2: Starting the application...
echo.
start start-app.bat

echo.
echo ===== Admin Setup Complete =====
echo.
echo The application is now starting.
echo.
echo To access the admin dashboard:
echo.
echo 1. Open http://localhost:3002 in your browser
echo 2. Click "Login" in the top right corner
echo 3. Use one of the following admin credentials:
echo.
echo    Username: admin@example.com
echo    Password: admin123
echo.
echo    OR
echo.
echo    Username: samardwivedi97@gmail.com
echo    Password: admin123
echo.
echo 4. After logging in, you should see "Admin Dashboard" in the navigation bar
echo 5. Click on "Admin Dashboard" to access admin features
echo.
echo If you still encounter issues:
echo - Ensure the backend server is running (check terminal windows)
echo - Check that you are using the correct admin credentials
echo - Make sure your MongoDB connection is working
echo - Try clearing your browser cache and logging in again
echo.
pause
