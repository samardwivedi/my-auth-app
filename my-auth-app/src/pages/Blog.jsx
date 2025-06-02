import React, { useState } from 'react';

const blogPosts = [
  {
    id: 1,
    title: "How James Found Purpose Through Volunteering",
    category: "Volunteer Stories",
    author: "Emma Wilson",
    date: "May 5, 2025",
    image: "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    summary: "After retirement, James found a new sense of purpose by offering his plumbing skills to those in need.",
    content: "After 35 years as a professional plumber, James Thompson retired at the age of 62. While he initially enjoyed the newfound free time, he soon found himself missing the satisfaction that came from helping others with his skills."
  },
  {
    id: 2,
    title: "5 Tips for Requesting Help Successfully",
    category: "User Guides",
    author: "Michael Chen",
    date: "April 28, 2025",
    image: "https://images.unsplash.com/photo-1579208570378-8c970854bc23?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    summary: "Learn how to write effective service requests that get prompt responses from volunteers.",
    content: "When seeking help on our platform, the way you communicate your needs can significantly impact how quickly and effectively volunteers respond."
  },
  {
    id: 3,
    title: "Safety First: Protecting Yourself While Volunteering",
    category: "Safety Guidelines",
    author: "Dr. Sophia Rodriguez",
    date: "April 15, 2025",
    image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    summary: "Essential safety tips for volunteers when providing services in others' homes.",
    content: "Volunteering your skills to help others is rewarding, but it's important to prioritize your safety."
  },
  {
    id: 4,
    title: "How to Choose a Reliable Plumber",
    category: "Home Services",
    author: "Robert Johnson",
    date: "May 10, 2025",
    image: "https://images.unsplash.com/photo-1594761051343-36d4ddab9b33?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    summary: "Essential tips for finding a trustworthy and skilled plumber for your home repair needs.",
    content: "When faced with plumbing issues in your home, finding a reliable plumber is crucial. Check licensing and insurance, verify experience, read online reviews, evaluate professionalism, compare pricing."
  },
  {
    id: 5,
    title: "Benefits of Volunteering",
    category: "Volunteer Resources",
    author: "Lisa Thompson",
    date: "May 8, 2025",
    image: "https://images.unsplash.com/photo-1593113630400-ea4288922497?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    summary: "Discover the numerous personal and professional advantages of volunteering your skills to help others.",
    content: "Volunteering your time and skills to help others is not just an act of generosity—it's also an investment in your own wellbeing and future."
  }
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Filter posts by category
  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);
  
  // Get unique categories
  const categories = ['All', ...new Set(blogPosts.map(post => post.category))];
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Stories & Resources</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Inspiring stories from our volunteers and helpful guides to make the most of our platform
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } transition-colors`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {selectedPost ? (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedPost(null)}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to all posts
            </button>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <img 
                src={selectedPost.image} 
                alt={selectedPost.title} 
                className="w-full h-80 object-cover" 
              />
              
              <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold mb-1">
                  {selectedPost.category}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedPost.title}</h2>
                
                <div className="flex items-center text-gray-500 text-sm mb-6">
                  <span>By {selectedPost.author}</span>
                  <span className="mx-2">•</span>
                  <span>{selectedPost.date}</span>
                </div>
                
                <div className="prose max-w-none">
                  {selectedPost.content}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <div 
                key={post.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                <div className="p-6">
                  <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold mb-1">
                    {post.category}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 mb-4">{post.summary}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {post.date}
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      Read more →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
