/**
 * Chatbot AI utility functions
 * This file contains helper functions for the AI chatbot functionality
 */

// List of predefined responses for common questions
const commonResponses = {
  greeting: [
    "Hello! How can I help you today?",
    "Hi there! What can I assist you with?",
    "Greetings! I'm here to help answer your questions about our volunteer services."
  ],
  thanks: [
    "You're welcome! Is there anything else I can help with?",
    "Happy to help! Let me know if you need anything else.",
    "My pleasure! Do you have other questions about our services or volunteers?"
  ],
  goodbye: [
    "Goodbye! Feel free to return if you have more questions.",
    "Have a great day! Come back if you need anything else.",
    "Take care! I'm here whenever you need assistance with finding volunteers or services."
  ],
  unknown: [
    "I'm not sure I understand. Could you rephrase that? I can help with finding services, volunteers, or answering general questions.",
    "I didn't quite catch that. Could you explain differently? I'm here to guide you to the right volunteer or service.",
    "I'm still learning. Could you try asking in a different way? I can help with service requests, volunteer information, and more."
  ]
};

// FAQ responses for common platform questions
const faqResponses = {
  // General platform information
  "how does this work": "Our platform connects you with volunteers who can help with various tasks. Once you create an account, you can request services, browse available volunteers, and schedule help according to your needs.",
  "who are the volunteers": "Our volunteers are verified individuals who want to help others. They go through a multi-step verification process including email/phone verification, ID checks, and credential reviews for specialized services.",
  "is this service free": "Yes, our basic service is free. Volunteers offer their time without charging. We also have premium features available for a small fee that helps support our operations.",
  "what areas do you serve": "We currently operate in most major metropolitan areas across the United States and Canada, with limited service in some rural regions. You can check coverage in your area by entering your zip code on our homepage.",
  "is my information secure": "Yes, we take data security very seriously. All personal information is encrypted, and we comply with privacy regulations. You have complete control over what information is visible to other users.",
  
  // Finding and requesting services
  "what services are offered": "Our volunteers can help with various services including plumbing, electrical work, cleaning, healthcare assistance, education/tutoring, transportation, childcare, and more. You can browse all service categories on our Service List page.",
  "how do I request help": "To request help, log in to your account and click the 'Request Help' button on your dashboard. Fill out the form with details about what you need assistance with, your availability, and other relevant information.",
  "how long to get matched": "Matching times vary based on your request type, location, and volunteer availability. Simple requests in major urban areas might be matched within hours, while specialized help in remote areas might take days.",
  "how to cancel request": "You can cancel a request anytime through your dashboard. Please try to cancel at least 24 hours in advance if possible, out of respect for the volunteer's time.",
  
  // Volunteer information
  "how do I become a volunteer": "To become a volunteer, log in to your account and click the 'Become a Volunteer' link in your profile. You'll need to complete a profile with your skills, availability, and areas you're willing to serve.",
  "volunteer requirements": "For general assistance (like grocery shopping or companionship), no special qualifications are needed. For specialized services (like plumbing or electrical work), you'll need to provide verification of your qualifications and any required licenses.",
  "volunteer schedule": "As a volunteer, you have complete control over your schedule. You can set your availability in your profile, choose specific requests that fit your schedule, and set up recurring availability slots.",
  "volunteer safety": "We prioritize volunteer safety with various safeguards: all users are verified through ID checks, we have a rating system to flag problematic users, volunteers can set boundaries on where they'll provide services, and we have a 'Safety Check' feature.",
  
  // Support and issues
  "report a problem": "If you encounter any problems, use the 'Report an Issue' button on the user's profile or in your dashboard. Our support team reviews all reports within 24 hours. For urgent safety concerns, use the 'Emergency Support' feature.",
  "contact support": "You can contact our support team through the 'Contact Support' button in the footer of any page. We're available 24/7 for urgent issues and respond to general inquiries within 1 business day.",
  "make a donation": "You can make one-time or recurring donations through the 'Support Us' page. As a registered non-profit, all donations are tax-deductible and help us maintain the platform and expand our services."
};

/**
 * Get a random response from an array of responses
 */
const getRandomResponse = (responses) => {
  return responses[Math.floor(Math.random() * responses.length)];
};

// Service categories information
const serviceCategories = {
  "plumbing": "Our plumbing volunteers can help with fixing leaks, unclogging drains, repairing faucets, and other basic plumbing issues. For major plumbing work, they can provide guidance and assessment.",
  "electrical": "Our electrical volunteers can assist with basic electrical problems like replacing outlets, fixing light fixtures, and troubleshooting circuit issues. All electrical volunteers are verified and have relevant experience.",
  "cleaning": "Cleaning volunteers can help with home organization, deep cleaning, and regular maintenance. They bring their expertise to help create a cleaner, more organized living space.",
  "healthcare": "Healthcare volunteers include nurses, caregivers, and health aides who can provide basic health checks, medication reminders, and companionship for those with health needs.",
  "education": "Education volunteers offer tutoring, homework help, and skills training across various subjects and age groups. Many are certified teachers or subject matter experts.",
  "transportation": "Transportation volunteers can provide rides to appointments, grocery shopping, or other essential trips for those who cannot drive or access public transportation.",
  "childcare": "Childcare volunteers offer babysitting, after-school care, and activities for children. All childcare volunteers undergo additional background checks for safety.",
  "other": "We have volunteers with diverse skills beyond our main categories. If you have a specific need not listed, please describe it and we'll try to find the right volunteer."
};

// Volunteer information
const volunteerInfo = {
  "find volunteer": "You can find volunteers by visiting our 'Service List' page and browsing by service category. Each volunteer has a profile with their skills, experience, availability, and ratings from other users.",
  "volunteer qualifications": "Volunteers have various qualifications depending on their service area. Many have professional experience, certifications, or natural talents they're sharing. For specialized services, we verify professional credentials.",
  "volunteer vetting": "All volunteers undergo a multi-step verification process. Basic verification includes email and phone verification, ID checks, and review of professional credentials if needed. For services involving vulnerable populations, additional background checks may be required.",
  "top volunteers": "Our top-rated volunteers are featured on our homepage and have a special badge on their profiles. These volunteers consistently receive high ratings and positive feedback from users."
};

// Pages and features guidance
const pageGuidance = {
  "dashboard": "Your dashboard is your control center where you can view your requests, messages, and account information. You can access it by clicking on your profile picture and selecting 'Dashboard'.",
  "profile page": "Your profile page shows your personal information, service history, and settings. You can update your profile by clicking on your profile picture and selecting 'Edit Profile'.",
  "service list": "The Service List page shows all service categories and available volunteers. You can filter by service type, rating, availability, and location to find the perfect volunteer.",
  "request form": "To submit a service request, find a volunteer you like and click the 'Request Service' button on their profile. Fill out the form with details about your needs, preferred schedule, and location.",
  "payment system": "While most volunteer services are free, some premium services or specialized help may require payment. Our secure payment system handles these transactions and provides receipts and transaction history.",
  "chat feature": "Our chat feature allows you to communicate directly with volunteers before and during service. You can access your chats from the dashboard or by clicking on the message icon in the navigation bar.",
  "reviews": "After receiving help, you can leave a review for your volunteer. Honest reviews help maintain quality and help other users find great volunteers. Similarly, volunteers can review their experience working with you."
};

/**
 * Enhanced message classification based on keywords and patterns
 */
const classifyMessage = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Check for greetings
  if (/\b(hi|hello|hey|greetings)\b/.test(lowerMessage)) {
    return 'greeting';
  }
  
  // Check for thanks
  if (/\b(thanks|thank you|appreciate)\b/.test(lowerMessage)) {
    return 'thanks';
  }
  
  // Check for goodbyes
  if (/\b(bye|goodbye|see you|farewell)\b/.test(lowerMessage)) {
    return 'goodbye';
  }
  
  // Check for specific service category inquiries
  for (const category in serviceCategories) {
    if (lowerMessage.includes(category)) {
      return { type: 'service_category', category };
    }
  }
  
  // Check for volunteer information inquiries
  for (const topic in volunteerInfo) {
    if (lowerMessage.includes(topic)) {
      return { type: 'volunteer_info', topic };
    }
  }
  
  // Check for page guidance inquiries
  for (const page in pageGuidance) {
    if (lowerMessage.includes(page)) {
      return { type: 'page_guidance', page };
    }
  }
  
  // Check for service requests
  if (/\b(request|book|schedule|hire|need help|looking for help)\b/.test(lowerMessage)) {
    return 'service_request';
  }
  
  // Check for FAQ questions
  for (const question in faqResponses) {
    if (lowerMessage.includes(question)) {
      return { type: 'faq', question };
    }
  }
  
  return 'unknown';
};

/**
 * Generate a response based on the message type
 */
const generateResponse = (message) => {
  const classification = classifyMessage(message);
  
  if (typeof classification === 'string') {
    // Handle basic message types like greeting, thanks, goodbye
    if (classification === 'service_request') {
      return "To request a service, please visit our Service List page where you can browse volunteers by category. When you find a suitable volunteer, click the 'Request Service' button on their profile. You'll need to provide details about your needs, preferred schedule, and location. If you need more help, you can also visit your dashboard and click the 'Request Help' button.";
    }
    return getRandomResponse(commonResponses[classification]);
  } else if (classification.type === 'faq') {
    // Handle FAQ responses
    return faqResponses[classification.question];
  } else if (classification.type === 'service_category') {
    // Handle service category inquiries
    return serviceCategories[classification.category] + 
           "\n\nWould you like to browse available " + classification.category + " volunteers? You can visit our Service List page and filter by this category.";
  } else if (classification.type === 'volunteer_info') {
    // Handle volunteer information inquiries
    return volunteerInfo[classification.topic];
  } else if (classification.type === 'page_guidance') {
    // Handle page guidance inquiries
    return pageGuidance[classification.page];
  }
  
  return getRandomResponse(commonResponses.unknown);
};

/**
 * Process user message and generate AI response
 */
const processMessage = (message) => {
  // Basic response generation
  const aiResponse = generateResponse(message);
  
  return {
    message: aiResponse,
    timestamp: new Date().toISOString(),
    sender: 'ai'
  };
};

module.exports = {
  processMessage,
  generateResponse,
  classifyMessage
};
