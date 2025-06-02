@echo off
echo ===== VolunteerHub Database Seeder =====
echo.
echo This script will seed the database with sample volunteers, requests, and payments.
echo Warning: This will delete existing volunteer, request, and payment data!
echo.

set /p CONFIRM=Are you sure you want to continue? (y/n): 

if /i "%CONFIRM%" NEQ "y" (
  echo Operation cancelled.
  pause
  exit /b 0
)

echo.
echo Running database seeder script...
echo.

cd backend && node seed-data.js

echo.
echo Database seeding complete!
echo.
echo You can now run the application with start-app.bat
echo.
echo - Visit http://localhost:3002 to access the application
echo - Visit http://localhost:3002/volunteer-dashboard to see the volunteer dashboard
echo.
echo Sample volunteer login credentials:
echo.
echo Email: john.volunteer@example.com
echo Password: password123
echo.
echo Email: sarah.volunteer@example.com
echo Password: password123
echo.
echo Email: michael.volunteer@example.com
echo Password: password123
echo.

pause
