@echo off
echo Applying changes to add Volunteer tab to UserDashboard.jsx

:: Create backup of original file
copy my-auth-app\src\pages\UserDashboard.jsx my-auth-app\src\pages\UserDashboard.jsx.bak

:: Import changes: Add VolunteerTabContent import
powershell -Command "(Get-Content my-auth-app\src\pages\UserDashboard.jsx) -replace 'import BeVolunteerForm from ''../components/BeVolunteerForm'';', 'import BeVolunteerForm from ''../components/BeVolunteerForm'';\nimport VolunteerTabContent from ''../components/VolunteerTabContent'';' | Set-Content my-auth-app\src\pages\UserDashboard.jsx"

:: Navigation changes: Add Volunteer tab button
powershell -Command "(Get-Content my-auth-app\src\pages\UserDashboard.jsx) -replace '<button \r?\n            className=\`py-2 px-1 \$\{activeTab === ''chats''', '<button \r\n            className=\`py-2 px-1 \$\{activeTab === ''volunteer'' ? ''border-b-2 border-blue-600 text-blue-600 font-medium'' : ''text-gray-500''\`\r\n            onClick=\(\) =^> setActiveTab\(''volunteer''\)\r\n          >\r\n            Become a Volunteer\r\n          </button>\r\n          <button \r\n            className=\`py-2 px-1 \$\{activeTab === ''chats''' | Set-Content my-auth-app\src\pages\UserDashboard.jsx"

:: Tab content changes: Add Volunteer tab content section
powershell -Command "(Get-Content my-auth-app\src\pages\UserDashboard.jsx) -replace '\{activeTab === ''chats'' \&\&', '{activeTab === ''volunteer'' && <VolunteerTabContent />}\r\n\r\n      {/* Chats Tab */}\r\n      {activeTab === ''chats'' &&' | Set-Content my-auth-app\src\pages\UserDashboard.jsx"

:: Remove "Become a Volunteer" from profile dropdown
powershell -Command "(Get-Content my-auth-app\src\pages\UserDashboard.jsx) -replace '<a href=\"#\" onClick=\(\) =^> navigate\(''/become-volunteer''\)\>[^<]+<\/a>', '' | Set-Content my-auth-app\src\pages\UserDashboard.jsx"

echo Changes applied successfully! Please check my-auth-app\src\pages\UserDashboard.jsx for results.
