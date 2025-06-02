import React from 'react';

/**
 * Component to display chat messages (real users/admins/helpers only, no AI)
 */
const ChatMessages = ({ chatLog, chatEndRef }) => {
  return (
    <div className="space-y-3">
      {/* Welcome message if no messages yet */}
      {chatLog.length === 0 && (
        <div className="flex justify-start animate-slide-up">
          <div className="flex">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2 flex-shrink-0">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="bg-green-50 border border-green-100 text-gray-800 px-4 py-3 rounded-2xl max-w-[80%] shadow-sm">
              <p className="break-words">Welcome! This chat connects you to the Helpora admin team. Ask any question or report an issue.</p>
              <div className="text-xs mt-1 text-right text-gray-500">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Message list (no AI messages) */}
      {chatLog.filter(msg => msg.sender !== 'ai').map((msg, index) => (
        <div 
          key={index} 
          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up stagger-item`}
        >
          {/* Avatar for admin/helper */}
          {msg.sender !== 'user' && (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          )}
          <div 
            className={`px-4 py-3 rounded-2xl max-w-[80%] shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white' 
                : 'bg-blue-50 border border-blue-100 text-gray-800'
            }`}
          >
            <p className="break-words">{msg.message}</p>
            {msg.timestamp && (
              <div className={`text-xs mt-1 text-right ${msg.sender === 'user' ? 'text-primary-100' : 'text-gray-500'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Invisible element to scroll to */}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatMessages;
