import React, { useState } from 'react';

// FAQ categories and questions
const faqData = {
  "New Users": [
    {
      question: "How do I create an account?",
      answer: "Creating an account is easy! Click the 'Sign Up' button in the top-right corner of the homepage. Fill in your basic information, verify your email address, and you're ready to go. The entire process takes less than 5 minutes."
    },
    {
      question: "Is the service free to use?",
      answer: "Yes, our platform is free for individuals seeking help. We're a community-based service supported by volunteers and donations. While using our core services is free, we do offer premium features for a small fee that helps support our operations."
    },
    {
      question: "How do I request help?",
      answer: "Once you're logged in, click on the 'Request Help' button on your dashboard. Fill out the form with details about what you need assistance with, your availability, and any other relevant information. Be as specific as possible to help match you with the right volunteer."
    },
    {
      question: "How long does it take to get matched with a volunteer?",
      answer: "Matching times vary based on your request type, location, and volunteer availability. Simple requests in major urban areas might be matched within hours, while specialized help in remote areas might take days. You'll receive updates on your dashboard and via email as volunteers respond to your request."
    },
    {
      question: "What if I need to cancel a request?",
      answer: "You can cancel a request at any time through your dashboard. Please try to cancel at least 24 hours in advance if possible, out of respect for the volunteer's time. There is no penalty for cancellations, but frequent last-minute cancellations may affect your priority in future matching."
    }
  ],
  "Volunteers": [
    {
      question: "How do I become a volunteer?",
      answer: "To become a volunteer, log in to your account and click on the 'Become a Volunteer' link in your profile. You'll need to complete a profile specifying your skills, availability, and areas you're willing to serve. Depending on your skills, we might request verification documents (like professional licenses for plumbers, electricians, etc.)."
    },
    {
      question: "Can I choose when I volunteer?",
      answer: "Absolutely! You have complete control over your volunteer schedule. You can set your availability in your profile, choose specific requests that fit your schedule, and even set up recurring availability slots. Our platform is designed to work around your schedule, not the other way around."
    },
    {
      question: "Are there minimum hour requirements for volunteers?",
      answer: "No, there are no minimum hour requirements. You can volunteer as much or as little as you'd like. Some volunteers help once a month, while others dedicate several hours each week. We appreciate all contributions, regardless of the time commitment."
    },
    {
      question: "Do I need special qualifications to volunteer?",
      answer: "It depends on the type of help you're offering. For general assistance (like grocery shopping, yard work, or companionship), no special qualifications are needed. For specialized services (like plumbing, electrical work, or legal advice), you'll need to provide verification of your qualifications and any required licenses."
    },
    {
      question: "How does the platform ensure my safety as a volunteer?",
      answer: "Your safety is our priority. We have multiple safeguards in place: all users are verified through ID checks, we have a rating system to flag problematic users, volunteers can set boundaries on where they'll provide services, and our 'Safety Check' feature lets you check in/out when providing help. We also have 24/7 support for any safety concerns."
    }
  ],
  "Common Questions": [
    {
      question: "How can I report an issue with a user or volunteer?",
      answer: "If you encounter any problems, please use the 'Report an Issue' button on the user's profile or in your dashboard. Our support team reviews all reports within 24 hours. For urgent safety concerns, use the 'Emergency Support' feature for immediate assistance."
    },
    {
      question: "What areas do you serve?",
      answer: "We currently operate in most major metropolitan areas across the United States and Canada, with limited service in some rural regions. We're rapidly expanding to new areas based on volunteer availability. You can check coverage in your area by entering your zip code on our homepage."
    },
    {
      question: "Is my personal information secure?",
      answer: "We take data security seriously. All personal information is encrypted, and we never share your contact details without permission. We comply with all relevant privacy regulations, and you have complete control over what information is visible to other users. Our full privacy policy is available on our website."
    },
    {
      question: "How are volunteers vetted?",
      answer: "All volunteers undergo a multi-step verification process. Basic verification includes email and phone verification, ID checks, and review of any professional credentials needed for their service area. For services involving vulnerable populations or home entry, additional background checks may be required."
    },
    {
      question: "Can I donate to support the platform?",
      answer: "Yes! We welcome donations that help us maintain the platform, expand to new areas, and provide training for volunteers. You can make one-time or recurring donations through the 'Support Us' page. As a registered non-profit, all donations are tax-deductible."
    },
    {
      question: "How do I update my profile information?",
      answer: "To update your profile, click on your profile picture in the top-right corner and select 'Edit Profile'. From there, you can modify your personal information, skills, availability, service areas, notification preferences, and privacy settings."
    }
  ]
};

const FAQs = () => {
  const [activeCategory, setActiveCategory] = useState("New Users");
  const [openQuestions, setOpenQuestions] = useState({});

  const toggleQuestion = (index) => {
    setOpenQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about our platform and services
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center mb-10 border-b border-gray-200">
          {Object.keys(faqData).map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-3 text-base font-medium ${
                activeCategory === category
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Questions */}
        <div className="mt-8 space-y-4">
          {faqData[activeCategory].map((faq, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="flex justify-between items-center w-full px-6 py-4 text-left"
              >
                <h3 className="text-lg font-medium text-gray-900">
                  {faq.question}
                </h3>
                <span className={`text-blue-500 transition-transform duration-200 ${openQuestions[index] ? 'rotate-180' : ''}`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              
              {openQuestions[index] && (
                <div className="px-6 pb-5">
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-4">
            If you couldn't find the answer to your question, our support team is here to help!
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQs;
