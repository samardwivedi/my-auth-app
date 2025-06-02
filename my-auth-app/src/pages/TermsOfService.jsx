import React from 'react';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-gray-600 mb-8">Last Updated: May 1, 2025</p>
      
      <div className="prose max-w-none space-y-8">
        {/* Section 1 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">1. Introduction & Acceptance</h2>
          <p>
            Welcome to our community service platform. These Terms of Service ("Terms") govern your access to and use of our website, mobile applications, and services (collectively, the "Service").
          </p>
          <p>
            By accessing or using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
          </p>
          <p>
            We may modify these Terms at any time. If we make changes, we will provide notice of such changes, such as by sending an email notification, providing notice through the Service, or updating the "Last Updated" date at the beginning of these Terms.
          </p>
        </section>
        
        {/* Section 2 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">2. User Accounts</h2>
          <h3 className="text-xl font-semibold mt-4">Account Creation</h3>
          <p>
            To use certain features of our Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
          </p>
          
          <h3 className="text-xl font-semibold mt-4">Account Responsibilities</h3>
          <p>
            You are responsible for safeguarding your account. This includes maintaining the security of your password, restricting access to your device, and accepting responsibility for all activities that occur under your account.
          </p>
        </section>
        
        {/* Section 3 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">3. User Conduct</h2>
          <p>You agree not to engage in any of the following prohibited activities:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Using the Service for any illegal purpose</li>
            <li>Harassing, threatening, or intimidating other users</li>
            <li>Impersonating any person or entity</li>
            <li>Interfering with or disrupting the Service</li>
            <li>Attempting to gain unauthorized access to restricted areas</li>
            <li>Using the Service to send unsolicited advertising</li>
          </ul>
        </section>
        
        {/* Section 4 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">4. Service Provider Conduct</h2>
          <p>If you use our platform as a service provider (volunteer or professional), you agree to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide accurate information about your skills and qualifications</li>
            <li>Maintain any required licenses or certifications</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Treat recipients of your services with respect</li>
            <li>Fulfill commitments made through our platform</li>
          </ul>
        </section>
        
        {/* Section 5 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">5. Payments & Fees</h2>
          <p>
            While many services on our platform are provided by volunteers at no cost, some professional services may have associated fees. All fees are clearly displayed before you confirm a service.
          </p>
          <p>
            For paid services, we use third-party payment processors to facilitate transactions. By using our payment services, you agree to the terms and conditions of our payment processors.
          </p>
        </section>
        
        {/* Section 6 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">6. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by us and are protected by intellectual property laws.
          </p>
          <p>
            When you post content on our Service, you grant us a non-exclusive, royalty-free license to use, display, reproduce, and distribute that content in connection with operating and providing the Service.
          </p>
        </section>
        
        {/* Section 7 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">7. Disclaimers & Limitations</h2>
          <p>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis, without warranty of any kind, either express or implied.
          </p>
          <p>
            We do not guarantee the quality of volunteer services provided through our platform. While we strive to verify the identity of service providers, we cannot guarantee their quality, safety, or reliability.
          </p>
        </section>
        
        {/* Section 8 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">8. Dispute Resolution</h2>
          <p>
            These Terms and any action related thereto will be governed by the laws of [Your jurisdiction], without regard to its conflict of laws provisions.
          </p>
          <p>
            Before filing a claim against us, you agree to try to resolve the dispute informally by contacting us. We'll try to resolve the dispute informally by contacting you via email.
          </p>
        </section>
        
        {/* Section 9 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">9. Privacy & Data</h2>
          <p>
            Our <a href="/policy/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</a> describes how we collect, use, and share information about you when you use our Service. By using our Service, you agree to the collection, use, and sharing of your information as described in the Privacy Policy.
          </p>
          <p>
            We use cookies and similar technologies as described in our <a href="/policy/cookies" className="text-blue-600 hover:text-blue-800">Cookie Policy</a>. By using our Service, you agree to our use of cookies.
          </p>
        </section>
        
        {/* Section 10 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">10. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <div className="bg-gray-100 p-4 rounded-lg mt-2">
            <p><strong className="text-gray-700">Email:</strong> terms@example.com</p>
            <p><strong className="text-gray-700">Address:</strong> 123 Main St, Anytown, AN 12345</p>
            <p><strong className="text-gray-700">Phone:</strong> (555) 123-4567</p>
          </div>
        </section>
        
        {/* Acceptance */}
        <div className="mt-12 mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Acceptance of Terms</h3>
          <p className="mb-4">
            By using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
          <p>
            If you do not agree to these Terms, you should not access or use the Service.
          </p>
        </div>
      </div>
    </div>
  );
}
