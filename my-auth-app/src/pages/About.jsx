import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const aboutLinks = [
  { name: 'About Us', path: '/about/about-us' },
  { name: 'Contact Us', path: '/about/contact-us' },
  { name: 'Our Team', path: '/about/team' },
  { name: 'Careers', path: '/about/careers' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-blue-800 mb-8">About</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <nav className="md:col-span-1 space-y-4">
            {aboutLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-4 py-2 rounded-lg text-lg font-medium text-blue-700 bg-white shadow hover:bg-blue-100 transition"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="md:col-span-3 bg-white rounded-xl shadow p-8 min-h-[300px]">
            <Outlet />
            <div className="text-gray-500 text-center mt-8">Select an option to learn more.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
