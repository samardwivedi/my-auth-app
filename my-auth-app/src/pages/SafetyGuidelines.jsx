import React from 'react';

export default function SafetyGuidelines() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Safety Guidelines</h1>
            <p className="mt-2 text-blue-100">
              Your safety is our top priority. Please review these guidelines before using our platform.
            </p>
          </div>
          
          {/* Content */}
          <div className="px-6 py-8">
            {/* General Safety */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                General Safety Guidelines
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong className="text-blue-700">Verify identities:</strong> Our platform offers verified badges for service providers who have gone through our verification process. Look for this badge when selecting a volunteer.
                </p>
                <p>
                  <strong className="text-blue-700">Meet in public places:</strong> Whenever possible, meet service providers in public, well-lit areas, especially for initial meetings.
                </p>
                <p>
                  <strong className="text-blue-700">Share your location:</strong> Let a friend or family member know when and where you're meeting a service provider, and check in with them afterwards.
                </p>
                <p>
                  <strong className="text-blue-700">Trust your instincts:</strong> If something feels wrong, it probably is. Don't hesitate to cancel or reschedule if you feel uncomfortable.
                </p>
                <p>
                  <strong className="text-blue-700">Keep communication on-platform:</strong> For your safety and protection, keep all communications within our platform's messaging system.
                </p>
              </div>
            </section>
            
            {/* Online Safety */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Online Safety
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong className="text-blue-700">Protect personal information:</strong> Never share sensitive personal information like your full address, financial details, or identification numbers before meeting.
                </p>
                <p>
                  <strong className="text-blue-700">Be wary of suspicious requests:</strong> Be cautious of service providers who request unnecessary personal information or payment before providing services.
                </p>
                <p>
                  <strong className="text-blue-700">Strong passwords:</strong> Use unique, strong passwords for your account and don't share them with anyone.
                </p>
                <p>
                  <strong className="text-blue-700">Report suspicious behavior:</strong> If someone is behaving inappropriately, report them immediately using our reporting system.
                </p>
              </div>
            </section>
            
            {/* Service Provider Guidelines */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                For Service Providers
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong className="text-blue-700">Verification process:</strong> Complete our verification process to earn a verified badge, which helps build trust with potential clients.
                </p>
                <p>
                  <strong className="text-blue-700">Clear communication:</strong> Clearly communicate your services, availability, and expectations to avoid misunderstandings.
                </p>
                <p>
                  <strong className="text-blue-700">Professional conduct:</strong> Maintain professional behavior at all times and respect the privacy and property of your clients.
                </p>
                <p>
                  <strong className="text-blue-700">Safety equipment:</strong> Always use appropriate safety equipment and follow industry best practices when providing services.
                </p>
              </div>
            </section>
            
            {/* Emergency Situations */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Emergency Situations
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong className="text-red-700">Contact emergency services:</strong> In case of an emergency or if you feel in danger, contact local emergency services immediately (e.g., 911).
                </p>
                <p>
                  <strong className="text-red-700">Report to us:</strong> After ensuring your safety, report any serious incidents to our support team through the "Report" button.
                </p>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                  <p className="text-red-700 font-medium">Emergency Contact: 911 or your local emergency number</p>
                  <p className="text-red-600 mt-1">Platform Support: support@example.com or use the in-app reporting tool</p>
                </div>
              </div>
            </section>
            
            {/* Reporting Issues */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                How to Report Issues
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  We take all reports seriously and have a dedicated team to address safety concerns.
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Click on the "Report" button on the user's profile or in a chat conversation</li>
                  <li>Select the appropriate reason for your report</li>
                  <li>Provide as much detail as possible about the incident</li>
                  <li>Submit your report</li>
                </ol>
                <p>
                  Our team will review your report and take appropriate action within 24-48 hours. For urgent issues, please contact our support team directly.
                </p>
                
                <div className="mt-6">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Contact Support
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
