import React from 'react';

const socials = [
  { name: 'Facebook', url: 'https://facebook.com', color: 'bg-blue-600' },
  { name: 'Twitter', url: 'https://twitter.com', color: 'bg-blue-400' },
  { name: 'LinkedIn', url: 'https://linkedin.com', color: 'bg-blue-700' },
  { name: 'Instagram', url: 'https://instagram.com', color: 'bg-pink-500' },
];

export default function Social() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-pink-700 mb-8">Connect with Us</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {socials.map(social => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center space-x-4 p-6 rounded-xl shadow-lg text-white text-xl font-semibold hover:scale-105 transition transform ${social.color}`}
            >
              <span>{social.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
