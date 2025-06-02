import React, { useState } from 'react';

// Icons
const StepIcon = ({ step, isActive }) => (
  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
    isActive ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
  } text-lg font-bold`}>
    {step}
  </div>
);

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);
  
  const steps = [
    {
      step: 1,
      title: "Create an Account",
      description: "Sign up for a free account to access our community of helpers and professionals.",
      details: "Creating an account is quick and easy. Click the 'Sign Up' button in the top right corner of any page. Fill out the registration form with your basic information—name, email, and password. You'll then receive a verification email to confirm your account. Once verified, you can complete your profile by adding a profile picture, your location, and a brief description about yourself."
    },
    {
      step: 2,
      title: "Create a Request",
      description: "Describe your need in detail and specify what kind of help you're looking for.",
      details: "From your dashboard, click the 'New Request' button. Fill out the request form with a clear title and detailed description of what you need help with. Be specific about any requirements, such as timing, location, or specific skills needed. You can also attach photos if relevant (for example, if you need help with home repairs). Choose the appropriate category for your request, and indicate whether this is an urgent matter."
    },
    {
      step: 3,
      title: "Get Matched with Helpers",
      description: "Our system finds qualified volunteers and professionals in your area who can help.",
      details: "Once you submit a request, our matching algorithm immediately looks for suitable helpers based on proximity, skills, availability, and ratings. You'll typically receive notifications about potential matches within 24-48 hours, though urgent requests often receive responses much faster. You'll be able to view profiles of potential helpers, including their skills, experience, and reviews from other community members."
    },
    {
      step: 4,
      title: "Communicate Directly",
      description: "Message potential helpers securely through our platform to discuss details.",
      details: "When you find a potential helper you'd like to work with, you can start a conversation directly in our secure messaging system. Discuss the details of your request, answer any questions, and schedule a time for the help to be provided. All communication stays on our platform for your safety and to maintain a record of the arrangement. You can share additional details or photos as needed during this stage."
    },
    {
      step: 5,
      title: "Receive Help",
      description: "Meet with your helper and get the assistance you need.",
      details: "On the scheduled day, meet with your helper at the agreed location. For safety, our app includes a check-in feature that lets both parties confirm the meeting is taking place as planned. As the helper provides assistance, you can use our real-time tracking feature to keep track of time spent (if relevant). For services with agreed-upon costs, you can handle payment securely through our platform."
    },
    {
      step: 6,
      title: "Leave Feedback",
      description: "Rate your experience and leave a review to help our community.",
      details: "After the help has been provided, you'll be prompted to leave feedback. This includes a star rating and written review. Your honest feedback helps maintain quality in our community and assists other users in finding reliable helpers. You can also report any issues directly through the feedback system. Helpers with consistently high ratings are recognized with special badges in our community."
    }
  ];

  return (
    <div className="prose max-w-none">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">How It Works</h1>
      
      <p className="text-lg text-gray-700 mb-8">
        Our platform makes it easy to connect with skilled volunteers and professionals in your community. 
        Whether you need help with home repairs, healthcare consultations, or finding accommodation,
        our simple process helps you get the assistance you need quickly and safely.
      </p>

      {/* Step navigator */}
      <div className="flex flex-wrap gap-4 mb-8">
        {steps.map((step) => (
          <button
            key={step.step}
            className={`flex items-center px-4 py-2 rounded-full border ${
              activeStep === step.step 
                ? 'border-blue-600 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400'
            }`}
            onClick={() => setActiveStep(step.step)}
          >
            <span className="font-medium">{step.title}</span>
          </button>
        ))}
      </div>

      {/* Step details */}
      <div className="mb-10">
        {steps.map((step) => (
          <div 
            key={step.step}
            className={activeStep === step.step ? 'block' : 'hidden'}
          >
            <div className="flex items-start mb-4">
              <StepIcon step={step.step} isActive={true} />
              <div className="ml-4">
                <h2 className="text-2xl font-semibold text-gray-900 mt-0">{step.title}</h2>
                <p className="text-lg font-medium text-blue-600 mt-1">{step.description}</p>
              </div>
            </div>
            
            <div className="ml-16">
              <p className="text-gray-700">{step.details}</p>
              
              {step.step === 1 && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
                  <p className="text-sm text-blue-700">
                    <strong>Pro Tip:</strong> Add as much detail to your profile as possible. 
                    Helpers are more likely to respond to requests from users with complete profiles.
                  </p>
                </div>
              )}
              
              {step.step === 2 && (
                <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold mb-2">Request Components:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Clear, specific title</li>
                    <li>Detailed description of help needed</li>
                    <li>Timeframe (urgency, specific dates/times)</li>
                    <li>Location information</li>
                    <li>Required skills or qualifications</li>
                    <li>Photos or documentation (optional)</li>
                  </ul>
                </div>
              )}
              
              {step.step === 5 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Safety Note:</strong> For your safety, we recommend meeting in public places 
                    when possible and using our check-in feature. Review our 
                    <a href="/safety-guidelines" className="text-blue-600 hover:text-blue-800"> Safety Guidelines</a> for more information.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Video section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Watch How It Works</h2>
        <p className="text-gray-700 mb-6">
          See our platform in action with this short demonstration video that walks through the entire process.
        </p>
        <div className="bg-gray-200 aspect-video flex items-center justify-center rounded-xl">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 text-gray-500">Video Placeholder - Coming Soon</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <button className="flex justify-between items-center w-full px-6 py-4 text-left">
              <h3 className="text-lg font-medium text-gray-900">
                Is there a cost to use the platform?
              </h3>
              <span className="text-blue-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            <div className="px-6 pb-5">
              <p className="text-gray-600">
                Basic use of our platform is completely free. This includes creating requests, finding helpers, 
                and using our messaging system. Some professional services may have associated costs, which 
                are clearly displayed before you confirm. Additionally, we offer premium features for a small 
                subscription fee, such as priority matching and advanced filtering.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <button className="flex justify-between items-center w-full px-6 py-4 text-left">
              <h3 className="text-lg font-medium text-gray-900">
                How are helpers vetted for safety?
              </h3>
              <span className="text-blue-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            <div className="px-6 pb-5">
              <p className="text-gray-600">
                We take safety seriously. All helpers undergo a verification process that includes ID verification 
                and review of qualifications. For specialized services, we verify relevant licenses and certifications. 
                Our community rating system also helps maintain quality by allowing users to leave feedback. For more 
                details, view our <a href="/safety-guidelines" className="text-blue-600 hover:text-blue-800">Safety Guidelines</a>.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <a href="/faqs" className="text-blue-600 hover:text-blue-800 font-medium flex justify-center items-center">
            View all FAQs
            <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
      
      {/* Get Started Section */}
      <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="mb-6">Join our community today and start connecting with helpers and those in need.</p>
        <div className="flex flex-wrap gap-4">
          <a href="/signup" className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold shadow transition">
            Sign Up Now
          </a>
          <a href="/safety-guidelines" className="border border-white text-white hover:bg-white/10 px-6 py-3 rounded-lg font-semibold shadow transition">
            Learn About Safety
          </a>
        </div>
      </div>
    </div>
  );
}
