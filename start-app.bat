@echo off
echo ===== VolunteerHub Application Startup =====
echo.
echo Setting up environment...

REM Make sure required modules are installed
echo Checking dependencies...
cd backend && npm install -q && npm install pdfkit -q || (
    echo Failed to install backend dependencies.
    pause
    exit /b 1
)

cd ../my-auth-app && npm install -q || (
    echo Failed to install frontend dependencies.
    pause
    exit /b 1
)

cd ..
echo Dependencies checked successfully.
echo.

REM Note about port usage
echo Note: The backend will use port 5003 or the next available port if 5003 is in use.
echo       Check backend console for the actual port number.
echo.

echo.
echo Starting backend server...
start cmd /k "cd backend && npm start"

REM Wait a moment for the backend to initialize
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Starting frontend React app on port 3002...
start cmd /k "cd my-auth-app && set PORT=3002 && npm start"

echo.
echo ===== Startup Complete =====
echo The applications should now be starting. 
echo Please check the opened terminal windows for details.
echo.
echo - Frontend: http://localhost:3002
echo - Backend: http://localhost:5003
echo.
echo Tips:
echo - Login with any email/password to test the application
echo - Visit http://localhost:3002/chat to test the chat functionality
echo - Visit http://localhost:3002/services/electrician to see service listings
echo.
echo If you encounter any issues, check the terminal outputs for error messages.
