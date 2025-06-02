import React, { useState, useMemo, memo, lazy, Suspense, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ServiceCategoryCard from '../components/ServiceCategoryCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay, EffectFade } from 'swiper/modules';
import { useInView } from 'framer-motion';
import { motion, AnimatePresence } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

// Memoized ServiceCategoryCard for better performance
const MemoizedServiceCategoryCard = memo(ServiceCategoryCard);

// Testimonials data for carousel
const TESTIMONIALS = [
  {
    id: 1,
    name: "Michael Thompson",
    role: "Homeowner",
    image: "/images/testimonials/user1.jpg",
    rating: 5,
    text: "The electrician arrived within an hour of my request and fixed my power outage issue immediately. Highly professional and fairly priced!"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Small Business Owner",
    image: "/images/testimonials/user2.jpg",
    rating: 5,
    text: "I've used this platform multiple times for my business needs. The plumbing service saved us from a disaster and prevented costly damages. Highly recommend!"
  }
];

// How it works steps
const HOW_IT_WORKS_STEPS = [
  {
    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    title: "Find a Service",
    description: "Search through our verified professionals and find the service you need"
  },
  {
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    title: "Book Appointment",
    description: "Request an appointment with your selected service provider"
  },
  {
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    title: "Get Service",
    description: "Receive high-quality service from experienced professionals"
  },
  {
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    title: "Rate & Review",
    description: "Share your experience to help others find great providers"
  }
];

// Why choose us features
const WHY_CHOOSE_US = [
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "Verified Professionals",
    description: "All service providers undergo thorough background checks and verification"
  },
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "Quick Response",
    description: "Get connected with professionals quickly, often within hours"
  },
  {
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Fair Pricing",
    description: "Transparent and competitive pricing with no hidden fees"
  },
  {
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    title: "Secure Platform",
    description: "Your data and transactions are protected with enterprise-grade security"
  }
];

// Featured services constant with high-quality images
const FEATURED_SERVICES = [
  {
    id: 1,
    name: 'Professional Electrical Repair',
    provider: 'ElectroPros',
    rating: 4.9,
    image: '/images/featured/electrician-featured.jpg',
    fallbackImage: '/images/Electrician.jpg',
    category: 'Electrician',
    description: 'Expert electrical services for your home and office with 24/7 support'
  },
  {
    id: 2,
    name: 'Emergency Plumbing Service',
    provider: 'Quick Pipe Solutions',
    rating: 4.8,
    image: '/images/featured/plumber-featured.jpg',
    fallbackImage: '/images/Plumbers.jpg',
    category: 'Plumber',
    description: 'Fast and reliable plumbing repairs for any emergency situation'
  },
  {
    id: 3,
    name: 'Medical Consultation',
    provider: 'HealthFirst',
    rating: 4.7,
    image: '/images/Doctor.jpg',
    fallbackImage: '/images/Doctor.jpg',
    category: 'Doctor',
    description: 'Professional medical advice and consultation from qualified healthcare providers'
  },
  {
    id: 4,
    name: 'Premium Room Rentals',
    provider: 'CozyStay',
    rating: 4.6,
    image: '/images/Room.jpg',
    fallbackImage: '/images/Room.jpg',
    category: 'Room Finder',
    description: 'Find comfortable and affordable accommodations for your short or long-term stay'
  },
  {
    id: 5,
    name: 'Advanced Electrical Installations',
    provider: 'PowerCircuit',
    rating: 4.8,
    image: '/images/Electrician.jpg',
    fallbackImage: '/images/Electrician.jpg',
    category: 'Electrician',
    description: 'Complete electrical installations for new constructions and renovations'
  }
];

// Enhanced service categories with descriptions
const SERVICE_CATEGORIES = [
  { 
    name: 'Electrician', 
    icon: '/images/Electrician.jpg',
    description: 'Expert electrical services for installations, repairs, and maintenance'
  },
  { 
    name: 'Plumber', 
    icon: '/images/Plumbers.jpg',
    description: 'Professional plumbing solutions for leaks, installations, and emergencies'
  },
  { 
    name: 'Doctor', 
    icon: '/images/Doctor.jpg',
    description: 'Qualified healthcare professionals providing medical consultations'
  },
  { 
    name: 'Room Finder', 
    icon: '/images/Room.jpg',
    description: 'Find your perfect accommodation with our verified listings'
  }
];

// Pricing and response time based on service category
const SERVICE_PRICING = {
  Electrician: 'Starting from ₹499',
  Plumber: 'Starting from ₹399',
  Doctor: 'Starting from ₹299',
  'Room Finder': 'Starting from ₹1999/mo',
};
const SERVICE_RESPONSE = {
  Electrician: 'Avg. response in 1h',
  Plumber: 'Avg. response in 2h',
  Doctor: 'Avg. response in 30m',
  'Room Finder': 'Avg. response in 3h',
};

// Optimize ServiceCard with better image loading
const ServiceCard = memo(({ service }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const pricing = SERVICE_PRICING[service.category] || 'Contact for price';
  const response = SERVICE_RESPONSE[service.category] || 'Response time varies';

  return (
    <motion.div
      whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative overflow-hidden rounded-xl h-[350px] cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-60 z-10"></div>
      {!imageLoaded && (
        <div className="w-full h-full bg-gray-800 animate-pulse"></div>
      )}
      <img
        src={service.image}
        alt={service.name}
        loading="lazy"
        width="800"
        height="500"
        onLoad={() => setImageLoaded(true)}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = service.fallbackImage;
          setImageLoaded(true);
        }}
        className={`w-full h-full object-cover transition-transform duration-300 ${!imageLoaded ? 'opacity-0' : 'opacity-100'} group-hover:scale-105`}
        style={{ transition: 'opacity 0.3s, transform 0.3s' }}
      />
      <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
        <div className="flex gap-2 mb-3">
          <div className="px-3 py-1 bg-primary-500 text-white rounded-full text-xs font-medium w-fit">
            {service.category}
          </div>
          <div className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold w-fit flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {pricing}
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{service.name}</h3>
        <p className="text-white/80 text-sm mb-2">{service.description}</p>
        <div className="flex items-center mb-4">
          <p className="text-white/90 mr-2">by {service.provider}</p>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white text-sm ml-1">{service.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>
            {response}
          </span>
        </div>
        <button className="bg-white text-primary-700 hover:bg-primary-50 py-2.5 px-5 rounded-lg font-medium will-change-transform">
          Book Now
        </button>
      </div>
    </motion.div>
  );
});

// Pre-rendered SVG components for better performance
const StarIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 inline" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
));

// Memoized testimonial card for better performance
const TestimonialCard = memo(({ testimonial }) => (
  <div key={testimonial.id} className="bg-gray-800 rounded-xl p-6 shadow-lg h-full">
    <div className="mb-4">
      {Array.from({ length: testimonial.rating }).map((_, i) => (
        <StarIcon key={i} />
      ))}
    </div>
    <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
    <div className="flex items-center mt-auto">
      <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-gray-700 flex-shrink-0">
        <img 
          src={testimonial.image} 
          alt={testimonial.name}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/avatar-placeholder.jpg";
          }}
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <p className="text-white font-bold">{testimonial.name}</p>
        <p className="text-gray-400 text-sm">{testimonial.role}</p>
      </div>
    </div>
  </div>
));

// --- Custom Hero Carousel with Animations ---
const HERO_SLIDES = [
  {
    image: '/images/Doctor.jpg',
    title: 'Find Trusted Doctors',
    description: 'Book appointments with verified medical professionals near you.'
  },
  {
    image: '/images/Electrician.jpg',
    title: 'Expert Electricians',
    description: 'Get quick help for all your electrical needs, anytime.'
  },
  {
    image: '/images/Plumbers.jpg',
    title: 'Plumbing Solutions',
    description: 'Emergency repairs and installations by top-rated plumbers.'
  },
  {
    image: '/images/Room.jpg',
    title: 'Find Your Room',
    description: 'Discover affordable and comfortable room rentals in your city.'
  }
];

function HeroCarousel() {
  const [active, setActive] = useState(0);
  const timeoutRef = useRef();

  // Auto-play logic
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setActive((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3500);
    return () => clearTimeout(timeoutRef.current);
  }, [active]);

  // Scroll-triggered animation
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative w-full h-[350px] md:h-[500px] rounded-2xl overflow-hidden mb-14 shadow-xl">
      <AnimatePresence initial={false}>
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={HERO_SLIDES[active].image}
            alt={HERO_SLIDES[active].title}
            className="w-full h-full object-cover object-center"
            loading="lazy"
            style={{ filter: inView ? 'brightness(0.7)' : 'brightness(0.5)' }}
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-10 px-4">
            <motion.h1
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.7, type: 'spring' }}
              className="text-3xl md:text-5xl font-bold text-white drop-shadow mb-4"
            >
              {HERO_SLIDES[active].title}
            </motion.h1>
            <motion.p
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7, type: 'spring' }}
              className="text-lg md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto"
            >
              {HERO_SLIDES[active].description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Link to="/services" className="bg-primary-600 hover:bg-primary-700 text-white py-3 px-8 rounded-lg font-medium text-lg shadow-lg transition-all">
                Explore Services
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
      {/* Carousel Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${active === idx ? 'bg-primary-400 scale-125' : 'bg-white/60'}`}
            onClick={() => setActive(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

// Optimize performance by creating section components
const HeroSection = memo(({ searchTerm, setSearchTerm }) => (
  <div className="relative rounded-2xl overflow-hidden mb-14">
    <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-900 opacity-90"></div>
    <div className="relative z-10 py-12 px-8 md:px-16 flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
        Find Expert Local Services
      </h1>
      <p className="text-white/90 text-lg mb-8 text-center max-w-2xl">
        Connect with verified professionals in your area for all your service needs
      </p>
      {/* Enhanced Search Bar */}
      <div className="w-full max-w-2xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a service..."
            className="w-full px-6 py-4 pr-12 bg-white/95 border-0 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-4 top-0 bottom-0 flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-primary-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
        </div>
        <div className="text-white/80 text-sm mt-2 text-center">
          <Link to="/advanced-search" className="hover:text-white hover:underline">Advanced Search</Link>
        </div>
      </div>
    </div>
  </div>
));

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userType, setUserType] = useState(null);
  
  // Check user type on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserType(parsedUser.userType);
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);
  
  // Memoize featured services to prevent unnecessary re-renders
  const featuredServices = useMemo(() => FEATURED_SERVICES, []);
  
  // Memoize service categories to prevent unnecessary re-renders
  const categories = useMemo(() => SERVICE_CATEGORIES, []);
  
  // Memoize filtered categories to prevent unnecessary recalculations
  const filteredCategories = useMemo(() => 
    categories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), 
    [searchTerm, categories]
  );

  // Optimize Swiper configs
  const featuredSwiperConfig = useMemo(() => ({
    modules: [Pagination, Navigation, Autoplay, EffectFade],
    spaceBetween: 30,
    slidesPerView: 1,
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
    pagination: { 
      clickable: true,
      dynamicBullets: true 
    },
    navigation: true,
    autoplay: { 
      delay: 3000,
      disableOnInteraction: false
    },
    loop: true,
    grabCursor: true,
    speed: 800
  }), []);

  return (
    <div className="min-h-screen pt-20 will-change-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Carousel with scroll-triggered animation */}
        <HeroCarousel />
        {/* Hero Section (search bar, etc.) */}
        <HeroSection searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        {/* Popular Services Section */}
        <div className="mb-10 sm:mb-14">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-0">Popular Services</h2>
            <Link to="/services" className="text-primary-500 hover:text-primary-400 font-medium">View All</Link>
          </div>
          <div className="mt-4 sm:mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredCategories.map((category, index) => (
                <MemoizedServiceCategoryCard 
                  key={index} 
                  name={category.name} 
                  icon={category.icon} 
                  description={category.description} 
                />
              ))}
            </div>
          </div>
        </div>
        {/* Why Choose Us Section */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">Why Choose Our Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {WHY_CHOOSE_US.map((item, index) => (
              <motion.div
                key={index}
                className="bg-gray-800 rounded-xl p-4 sm:p-6 transition-transform hover:scale-105 hover:shadow-xl will-change-transform"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: index * 0.1, type: 'spring' }}
              >
                <div className="rounded-full bg-primary-600 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 sm:h-6 sm:w-6 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-gray-300 text-sm sm:text-base">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
        {/* How It Works Section */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <motion.div
                key={index}
                className="bg-gray-800 rounded-xl p-4 sm:p-6 text-center transition-colors hover:bg-gray-700 will-change-auto"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: index * 0.1, type: 'spring' }}
              >
                <div className="mx-auto rounded-full bg-primary-600 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 sm:h-8 sm:w-8 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                  </svg>
                </div>
                <div className="relative mb-2 sm:mb-4">
                  <div className="text-white font-bold text-base sm:text-xl">{step.title}</div>
                  {index < HOW_IT_WORKS_STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-8 sm:-right-12 w-6 sm:w-8 h-0.5 bg-primary-500">
                      <div className="absolute -right-1 -top-1 w-2 sm:w-3 h-2 sm:h-3 bg-primary-500 transform rotate-45"></div>
                    </div>
                  )}
                </div>
                <p className="text-gray-300 text-sm sm:text-base">{step.description}</p>
                {/* Mobile step indicator */}
                {index < HOW_IT_WORKS_STEPS.length - 1 && (
                  <div className="md:hidden mt-3 sm:mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-primary-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-6 sm:mt-8">
            <Link to="/how-it-works" className="bg-primary-600 text-white hover:bg-primary-700 py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg font-medium inline-block">Learn More</Link>
          </div>
        </div>
        {/* Testimonials Section */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
          <div className="text-center mt-6 sm:mt-8">
            <Link to="/reviews" className="text-primary-400 hover:text-primary-300 font-medium">View all reviews →</Link>
          </div>
        </div>
        {/* Partner With Us Section */}
        <div className="mb-12 sm:mb-16 relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-900"></div>
          <div className="relative z-10 px-4 sm:px-8 py-10 sm:py-16 md:py-20 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Partner With Us</h2>
            <p className="text-white/90 max-w-2xl mx-auto mb-6 sm:mb-8 text-base sm:text-lg">Are you a business, NGO, or local organization? Collaborate with us to expand your reach, support your community, and make a greater impact together.</p>
            <Link to="/partner" className="bg-primary-600 text-white hover:bg-primary-700 py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg font-medium inline-block">Become a Partner</Link>
          </div>
        </div>
        {/* Download App Section */}
        <div className="mb-12 sm:mb-16">
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Get Our Mobile App</h2>
                <p className="text-gray-300 mb-4 sm:mb-6">Download our mobile app for a seamless experience on the go. Book services, track appointments, and stay connected with our community anytime, anywhere.</p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button type="button" className="flex items-center bg-black text-white py-2.5 sm:py-3 px-4 sm:px-5 rounded-lg hover:bg-gray-900 transition-colors">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 mr-2 sm:mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.5186 14.8333L20.4583 11.8936C20.5045 11.8474 20.5415 11.7929 20.5674 11.7331C20.616 11.6323 20.616 11.5194 20.5674 11.4186C20.5415 11.3588 20.5045 11.3042 20.4583 11.2581L17.5186 8.31836C17.3718 8.17155 17.1518 8.17155 17.005 8.31836C16.8582 8.46516 16.8582 8.68514 17.005 8.83195L19.3397 11.1667H7C6.8092 11.1667 6.6504 11.3255 6.6504 11.5163C6.6504 11.7071 6.8092 11.8659 7 11.8659H19.3397L17.005 14.2007C16.8582 14.3475 16.8582 14.5675 17.005 14.7143C17.1518 14.8611 17.3718 14.8611 17.5186 14.7143V14.8333Z" />
                    </svg>
                    <div>
                      <div className="text-xs">Download on the</div>
                      <div className="text-base sm:text-lg font-semibold font-sans -mt-1">App Store</div>
                    </div>
                  </button>
                  <button type="button" className="flex items-center bg-black text-white py-2.5 sm:py-3 px-4 sm:px-5 rounded-lg hover:bg-gray-900 transition-colors">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 mr-2 sm:mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.60001 2.30005C3.30001 2.60005 3.10001 3.10005 3.10001 3.70005V21.3C3.10001 21.9 3.30001 22.4 3.60001 22.7L3.70001 22.8L14.4 12.1V11.9L3.70001 1.20005L3.60001 2.30005Z" />
                      <path d="M19.2 12.1L16.5 9.40005L14.4 12L16.5 14.6L19.2 13.9L19.3 13.8C19.7 13.4 19.7 12.6 19.3 12.2C19.3 12.2 19.3 12.1 19.2 12.1Z" />
                    </svg>
                    <div>
                      <div className="text-xs">GET IT ON</div>
                      <div className="text-base sm:text-lg font-semibold font-sans -mt-1">Google Play</div>
                    </div>
                  </button>
                </div>
              </div>
              <div className="hidden md:flex justify-center items-center p-4 sm:p-6">
                <img 
                  src="/images/app-mockup.png" 
                  alt="Mobile app mockup"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/brandlogo.png";
                    e.target.style.maxWidth = "80%";
                    e.target.style.maxHeight = "80%";
                  }}
                  className="max-h-72 sm:max-h-96 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer Section with links */}
      <footer className="bg-gray-800 py-8 sm:py-10 mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about-us" className="text-gray-300 hover:text-primary-400 flex items-center gap-2"><svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m-1-4h.01M12 20.5C7.305 20.5 3.5 16.695 3.5 12S7.305 3.5 12 3.5 20.5 7.305 20.5 12 16.695 20.5 12 20.5z" /></svg>About Us</Link></li>
                <li><Link to="/team" className="text-gray-300 hover:text-primary-400 flex items-center gap-2"><svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" /></svg>Our Team</Link></li>
                <li><Link to="/careers" className="text-gray-300 hover:text-primary-400 flex items-center gap-2"><svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7V3a1 1 0 00-1-1h-6a1 1 0 00-1 1v4M5 8h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2z" /></svg>Careers</Link></li>
                <li><Link to="/blog" className="text-gray-300 hover:text-primary-400 flex items-center gap-2"><svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h5l2-2h5a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-gray-300 hover:text-primary-400 flex items-center gap-2"><svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>Help Center</Link></li>
                <li><Link to="/safety-guidelines" className="text-gray-300 hover:text-primary-400 flex items-center gap-2"><svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Safety Guidelines</Link></li>
                <li><Link to="/faqs" className="text-gray-300 hover:text-primary-400 flex items-center gap-2"><svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>FAQs</Link></li>
                <li><Link to="/contact-us" className="text-gray-300 hover:text-primary-400 flex items-center gap-2"><svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10.5a8.38 8.38 0 01-1.9.82 3.48 3.48 0 00-6.6 0A8.38 8.38 0 013 10.5V19a2 2 0 002 2h14a2 2 0 002-2v-8.5z" /></svg>Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/terms-of-service" className="text-gray-300 hover:text-primary-400 flex items-center gap-2"><svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>Terms of Service</Link></li>
                <li><Link to="/privacy-policy" className="text-gray-300 hover:text-primary-400 flex items-center gap-2"><svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>Privacy Policy</Link></li>
                <li><Link to="/cookie-policy" className="text-gray-300 hover:text-primary-400 flex items-center gap-2"><svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Cookie Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/how-it-works" className="text-gray-300 hover:text-primary-400 flex items-center gap-2"><svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>How It Works</Link></li>
                <li><Link to="/finding-jobs" className="text-gray-300 hover:text-primary-400 flex items-center gap-2"><svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 4h6a2 2 0 002-2v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2a2 2 0 002 2z" /></svg>Finding Jobs</Link></li>
                <li><Link to="/social" className="text-gray-300 hover:text-primary-400 flex items-center gap-2"><svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zm-6 8c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z" /></svg>Social Impact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0 text-center md:text-left">&copy; {new Date().getFullYear()} Kind Helping Chain. All rights reserved.</p>
            <div className="flex space-x-4">
              <button type="button" className="text-gray-300 hover:text-primary-400">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </button>
              <button type="button" className="text-gray-300 hover:text-primary-400">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </button>
              <button type="button" className="text-gray-300 hover:text-primary-400">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
