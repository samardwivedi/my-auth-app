import React from 'react';

const AuthMessage = ({ message, type = 'info' }) => {
  if (!message) return null;

  const bgColor = type === 'error' ? 'bg-red-100' : 'bg-blue-100';
  const textColor = type === 'error' ? 'text-red-700' : 'text-blue-700';
  const borderColor = type === 'error' ? 'border-red-500' : 'border-blue-500';

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} ${textColor} p-4 mb-4`}>
      <p className="font-medium">{message}</p>
    </div>
  );
};

export default AuthMessage; 