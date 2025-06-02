import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const helpLinks = [
  { name: 'How it Works', path: '/help/how-it-works' },
  { name: 'Finding Jobs', path: '/help/finding-jobs' },
  { name: 'FAQ', path: '/faqs' },
  { name: 'Support', path: '/help/support' },
];

export default function Help() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-green-800 mb-8">Help</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <nav className="md:col-span-1 space-y-4">
            {helpLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-4 py-2 rounded-lg text-lg font-medium text-green-700 bg-white shadow hover:bg-green-100 transition"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="md:col-span-3 bg-white rounded-xl shadow p-8 min-h-[300px]">
            <Outlet />
            <div className="text-gray-500 text-center mt-8">Select a help topic to get started.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
