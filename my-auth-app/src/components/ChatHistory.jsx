import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const ChatHistory = ({ userId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/chats/history/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch chat history');
        }
        
        const data = await response.json();
        setChats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchChats();
    }
  }, [userId]);

  if (loading) {
    return <div className="text-center py-4">Loading chat history...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
        {error}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No chat history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chats.map((chat) => (
        <div key={chat._id} className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium text-gray-900">
                Chat with {chat.participants.find(p => p._id !== userId)?.name || 'Unknown'}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(chat.lastMessageAt).toLocaleString()}
              </p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              chat.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {chat.status}
            </span>
          </div>
          
          <div className="border-t border-gray-200 mt-2 pt-2">
            <p className="text-gray-600 text-sm">
              Last message: {chat.lastMessage?.content || 'No messages'}
            </p>
            {chat.unreadCount > 0 && (
              <div className="mt-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {chat.unreadCount} unread messages
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatHistory; 