import React from 'react';

/**
 * Component for chat message input and send button
 */
const ChatInput = ({ message, setMessage, sendMessage, isDisabled, aiTyping }) => {
  return (
    <div className="bg-white rounded-xl p-2 shadow-md border border-gray-200 flex gap-2">
      <input
        type="text"
        className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask the AI anything..."
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        disabled={isDisabled}
      />
      <button 
        onClick={sendMessage} 
        className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-5 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 btn-hover-effect"
        disabled={isDisabled || aiTyping}
      >
        <div className="flex items-center">
          <span>Send</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
      </button>
    </div>
  );
};

export default ChatInput;
