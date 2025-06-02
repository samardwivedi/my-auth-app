import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const ChatHistory = ({ onSelectChat, onNewChat, isAuthenticated, userType = null }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/messages/history/user`, {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        setChatHistory(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching chat history:', err);
        setError('Failed to load chat history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [isAuthenticated]);

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    // If date is today, just show time
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If date is this week, show day name and time
    const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show full date
    return date.toLocaleString([], options);
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Function to start a new chat
  const handleNewChat = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/messages/chat/user`, 
        { name: `Chat with Admin ${new Date().toLocaleString()}` },
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      setChatHistory([response.data, ...chatHistory]);
      if (onNewChat) {
        onNewChat(response.data);
      }
    } catch (err) {
      console.error('Error creating new chat:', err);
      setError('Failed to create new chat. Please try again later.');
    }
  };

  // Get message for unauthenticated users based on availability of anonymous chat
  const getGuestMessage = () => {
    return (
      <div className="p-4 bg-gray-100 rounded-lg shadow-inner">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Please Sign In</h3>
          <p className="text-gray-600 mb-4">Sign in to view your chat history and start new conversations.</p>
          <button 
            onClick={() => onNewChat && onNewChat({ _id: 'guest', name: 'Guest Chat' })}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start Anonymous Chat
          </button>
        </div>
      </div>
    );
  };

  // For guests, show option to chat anonymously or sign in
  if (!isAuthenticated) {
    return getGuestMessage();
  }

  return (
    <div className="min-h-[60vh] w-full max-w-md mx-auto mt-8 p-6 bg-white rounded-xl shadow-card flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-primary-600">Chat History</h2>
          {userType && (
            <div className="text-xs text-gray-500 mt-1">
              Logged in as: <span className="font-medium capitalize">{userType}</span>
            </div>
          )}
        </div>
        <button 
          onClick={handleNewChat}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Chat
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4">
          <p className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : chatHistory.length > 0 ? (
        <div className="flex-1 overflow-auto bg-gray-50 rounded-xl p-2 space-y-2">
          {chatHistory.map((chat) => {
            // Robust last message preview
            let lastMsg = chat.lastMessage && chat.lastMessage.text;
            if (!lastMsg && Array.isArray(chat.messages) && chat.messages.length > 0) {
              lastMsg = chat.messages[chat.messages.length - 1].message;
            }
            return (
              <div 
                key={chat._id} 
                onClick={() => onSelectChat && onSelectChat(chat)}
                className="p-3 rounded-lg bg-white border border-gray-200 hover:border-primary-300 hover:bg-blue-50 cursor-pointer transition-colors duration-200"
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-800">{chat.name}</h3>
                  <span className="text-xs text-gray-500">
                    {chat.updatedAt ? formatDate(chat.updatedAt) : formatDate(chat.createdAt)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {lastMsg ? truncateText(lastMsg) : 'No messages yet'}
                  </p>
                </div>
                {!chat.isActive && (
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Completed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center py-12 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="font-medium text-gray-700 mb-1">No Chat History</h3>
          <p className="text-gray-500 text-sm mb-6">Start a new conversation with the Helpora admin team.</p>
          <button 
            onClick={handleNewChat}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Chat
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
