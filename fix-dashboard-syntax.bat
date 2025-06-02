@echo off
echo Fixing syntax error in UserDashboard.jsx

:: First, restore the backup if it exists
if exist my-auth-app\src\pages\UserDashboard.jsx.bak (
  echo Restoring from backup...
  copy my-auth-app\src\pages\UserDashboard.jsx.bak my-auth-app\src\pages\UserDashboard.jsx
) else (
  echo No backup found, attempting to fix directly...
)

:: Fix the unterminated string around line 343
powershell -Command "(Get-Content my-auth-app\src\pages\UserDashboard.jsx) -replace '<div className=\"dropdown-menu', '<div className=\"dropdown-menu\">' | Set-Content my-auth-app\src\pages\UserDashboard.jsx"

echo Syntax issue fixed. Now manually add the volunteer tab:

echo 1. Add the import at the top of UserDashboard.jsx:
echo    import VolunteerTabContent from '../components/VolunteerTabContent';

echo 2. Add this button in the dashboard navigation section:
echo    ^<button 
echo      className={`py-2 px-1 ${activeTab === 'volunteer' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
echo      onClick={^(^) =^> setActiveTab^('volunteer'^)}
echo    ^>
echo      Become a Volunteer
echo    ^</button^>

echo 3. Add this code before the chats tab conditional rendering:
echo    {/* Volunteer Tab */}
echo    {activeTab === 'volunteer' ^&^& ^<VolunteerTabContent /^>}

echo The changes need to be applied manually. Please check the VOLUNTEER_TAB_README.md for details.
