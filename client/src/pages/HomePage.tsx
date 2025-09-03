import React, { useState } from 'react';
import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
import CustomDatePicker from '../components/ui/CustomDatePicker';
import ModernButton from '../components/ui/ModernButton';
import {
  MapPinIcon,
  StarIcon,
  ArrowRightIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  BuildingOfficeIcon,
  CubeIcon,
  HeartIcon,
  GlobeAltIcon,
  ClockIcon,
  PlayCircleIcon,
  FireIcon,
  TrophyIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface SearchForm {
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  travelers: number;
}

const HomePage: React.FC = () => {
  // const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState<SearchForm>({
    destination: '',
    startDate: null,
    endDate: null,
    travelers: 1,
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchForm.destination) params.set('destination', searchForm.destination);
    if (searchForm.startDate) params.set('startDate', searchForm.startDate.toISOString());
    if (searchForm.endDate) params.set('endDate', searchForm.endDate.toISOString());
    if (searchForm.travelers) params.set('travelers', String(searchForm.travelers));

    const url = window.location.origin + '/trip-planner' + (params.toString() ? `?${params.toString()}` : '');
    window.open(url, '_blank');
  };

  const features = [
    {
      icon: PaperAirplaneIcon,
      title: 'Smart Flight Search',
      description: 'AI-powered search finds you the best deals across hundreds of airlines worldwide.',
      color: 'from-cyan-400 to-blue-500',
      bgColor: 'from-cyan-50 to-blue-50',
      delay: 0.1,
    },
    {
      icon: BuildingOfficeIcon,
      title: 'Luxury Hotels',
      description: 'Handpicked accommodations from boutique hotels to luxury resorts.',
      color: 'from-violet-400 to-purple-500',
      bgColor: 'from-violet-50 to-purple-50',
      delay: 0.2,
    },
    {
      icon: CubeIcon,
      title: 'Complete Packages',
      description: 'All-inclusive travel packages with flights, hotels, and experiences.',
      color: 'from-emerald-400 to-teal-500',
      bgColor: 'from-emerald-50 to-teal-50',
      delay: 0.3,
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Booking',
      description: 'Bank-level security with 24/7 support for peace of mind during travels.',
      color: 'from-orange-400 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      delay: 0.4,
    },
  ];

  const destinations = [
    {
      name: 'Bali, Indonesia',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=600&h=400&fit=crop',
      price: 'From $899',
      rating: 4.8,
      description: 'Tropical paradise with stunning beaches',
      badge: 'Popular',
      badgeColor: 'bg-red-500'
    },
    {
      name: 'Santorini, Greece',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop',
      price: 'From $1,299',
      rating: 4.9,
      description: 'Iconic white buildings & sunsets',
      badge: 'Trending',
      badgeColor: 'bg-green-500'
    },
    {
      name: 'Tokyo, Japan',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop',
      price: 'From $1,199',
      rating: 4.7,
      description: 'Modern metropolis meets tradition',
      badge: 'Hot Deal',
      badgeColor: 'bg-orange-500'
    },
    {
      name: 'Maldives',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      price: 'From $2,199',
      rating: 4.9,
      description: 'Crystal waters & luxury resorts',
      badge: 'Luxury',
      badgeColor: 'bg-purple-500'
    },
  ];

  const stats = [
    { number: '50K+', label: 'Happy Travelers', icon: HeartIcon, color: 'from-pink-500 to-rose-500' },
    { number: '200+', label: 'Destinations', icon: GlobeAltIcon, color: 'from-blue-500 to-indigo-500' },
    { number: '24/7', label: 'Customer Support', icon: ClockIcon, color: 'from-green-500 to-emerald-500' },
    { number: '4.9★', label: 'Average Rating', icon: StarIcon, color: 'from-yellow-500 to-orange-500' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Travel Enthusiast',
      content: 'SafarBot made planning my dream vacation effortless. The AI recommendations were spot-on and saved me hours!',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      location: 'New York, USA'
    },
    {
      name: 'Michael Chen',
      role: 'Business Traveler',
      content: 'Best travel platform I\'ve used. Amazing deals and the booking process is incredibly smooth and intuitive.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      location: 'Singapore'
    },
    {
      name: 'Emma Davis',
      role: 'Family Traveler',
      content: 'Perfect for family trips! The support team helped us every step of the way. Highly recommended for families.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      location: 'London, UK'
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      
      {/* Hero Section with Background Image */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(147, 51, 234, 0.1) 100%), url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop')`
          }}
        />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div 
            animate={{ 
              x: [0, 100, 0],
              y: [0, -50, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl" 
          />
          <motion.div 
            animate={{ 
              x: [0, -100, 0],
              y: [0, 50, 0],
              rotate: [360, 180, 0]
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-40 right-10 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl" 
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto mb-20">
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg backdrop-blur-sm"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>AI-Powered Travel Intelligence</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
            >
              <span className="gradient-text-with-shimmer">
                Discover Your
              </span>
              <br />
              <span className="gradient-text-with-shimmer" style={{ animationDelay: '0.5s' }}>
                Next Adventure
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-2xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12 font-light"
            >
              Experience the world like never before. Our AI finds perfect destinations,
              <br className="hidden sm:block" />
              <span className="font-medium text-primary-600">
                unbeatable prices, and creates memories that last forever.
              </span>
            </motion.p>

            {/* CTA Buttons */}
              
          </div>

          {/* Enhanced Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-8 lg:p-12">
              {/* Card Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-blue-50/50 to-purple-50/50 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-purple-900/20" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/10 to-pink-500/10 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6"
                  >
                    <FireIcon className="w-4 h-4" />
                    <span>Hunt for Deals</span>
                  </motion.div>
                                      <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                      Where will your story begin?
                    </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Tell us your dream destination and we'll craft the perfect journey
                  </p>
                </div>

                <div className="space-y-6 mb-8">
                  {/* Destination Input - Full Width */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      🌍 <span>Where would you like to go?</span>
                    </label>
                    <div className="relative group">
                      <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-cyan-500 group-hover:text-blue-500 transition-colors z-10" />
                      <input
                        type="text"
                        placeholder="Enter your dream destination..."
                        value={searchForm.destination}
                        onChange={(e) => setSearchForm(prev => ({ ...prev, destination: e.target.value }))}
                        className="w-full pl-14 pr-6 py-5 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-lg font-medium hover:border-cyan-400 shadow-sm hover:shadow-md"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  </div>

                  {/* Date and Guests Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Check-in Date */}
                    <div className="relative">
                      <CustomDatePicker
                        label="📅 Check-in Date"
                        value={searchForm.startDate || undefined}
                        onChange={(date) => setSearchForm(prev => ({ ...prev, startDate: date }))}
                        placeholder="Select check-in"
                        minDate={new Date()}
                        className="w-full"
                      />
                    </div>

                    {/* Check-out Date */}
                    <div className="relative">
                      <CustomDatePicker
                        label="📅 Check-out Date"
                        value={searchForm.endDate || undefined}
                        onChange={(date) => setSearchForm(prev => ({ ...prev, endDate: date }))}
                        placeholder="Select check-out"
                        minDate={searchForm.startDate || new Date()}
                        className="w-full"
                      />
                    </div>

                    {/* Travelers */}
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        👥 <span>Travelers</span>
                      </label>
                      <div className="relative group">
                        <select
                          value={searchForm.travelers}
                          onChange={(e) => setSearchForm(prev => ({ ...prev, travelers: parseInt(e.target.value) }))}
                          className="w-full px-4 py-5 pr-12 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-lg font-medium appearance-none hover:border-cyan-400 shadow-sm hover:shadow-md cursor-pointer"
                          aria-label="Select number of travelers"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <option key={num} value={num} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              {num} {num === 1 ? 'Traveler' : 'Travelers'}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg 
                            className="w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-colors" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ModernButton
                      onClick={handleSearch}
                      size="lg"
                      variant="primary"
                      className="px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform transition-all duration-300 inline-flex items-center justify-center whitespace-nowrap"
                    >
                      <svg className="w-5 h-5 mr-2 flex-shrink-0 align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                      </svg>
                      <span>✨ Craft My Dream Trip</span>
                    </ModernButton>
                  </motion.div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    ✨ Over 10,000 destinations • Best price guarantee • Instant booking
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section with Better Colors */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 text-cyan-700 dark:text-cyan-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <TrophyIcon className="w-4 h-4" />
              <span>Why Choose SafarBot</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-8">
              Travel Smarter, Not Harder
            </h2>
            <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Experience the future of travel planning with our cutting-edge AI technology
              and personalized recommendations that save you time and money.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: feature.delay }}
                viewport={{ once: true }}
                className="group"
              >
                <motion.div
                  whileHover={{ y: -10, scale: 1.02 }}
                  className={`relative p-8 rounded-3xl h-full transition-all duration-300 bg-gradient-to-br ${feature.bgColor} dark:from-gray-800 dark:to-gray-700 border border-white/50 dark:border-gray-600/50 shadow-lg hover:shadow-2xl`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-700/50 dark:to-transparent rounded-3xl" />
                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations with Better Images */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FireIcon className="w-4 h-4" />
              <span>🌟 Discover Paradise</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-8">
              Where Dreams Come True
            </h2>
            <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Explore the world's most breathtaking destinations, handpicked by our travel experts
              and loved by thousands of adventurous travelers like you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {destinations.map((destination, destIndex) => (
              <motion.div
                key={destination.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: destIndex * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <motion.div
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Badge */}
                    <div className={`absolute top-4 left-4 ${destination.badgeColor} text-white rounded-full px-3 py-1 text-sm font-bold shadow-lg`}>
                      {destination.badge}
                    </div>

                    {/* Rating */}
                    <div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 shadow-lg">
                      <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {destination.rating}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="absolute bottom-4 right-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full px-4 py-2 font-bold text-lg shadow-lg">
                      {destination.price}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-cyan-600 transition-colors">
                      {destination.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                      {destination.description}
                    </p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-lg transition-colors group"
                    >
                      <span>🌍 Take Me There</span>
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-24 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Trusted by Travelers Worldwide
            </h2>
            <p className="text-xl text-cyan-100 max-w-3xl mx-auto">
              Join millions of happy travelers who have discovered their perfect journey with SafarBot
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, statIndex) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: statIndex * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-3xl transition-all duration-300`}
                >
                  <stat.icon className="w-10 h-10 text-white" />
                </motion.div>
                <div className="text-5xl lg:text-6xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-xl text-cyan-100 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <UserGroupIcon className="w-4 h-4" />
              <span>Happy Travelers</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-8">
              Stories from Our Community
            </h2>
            <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Discover why thousands of travelers trust SafarBot to create their perfect adventures
              and make memories that last a lifetime.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, testIndex) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: testIndex * 0.2 }}
                viewport={{ once: true }}
              >
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-8 h-full shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-cyan-100 dark:ring-cyan-900"
                    />
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-cyan-600 dark:text-cyan-400 font-medium">
                        {testimonial.role}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-6">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-8">
              Your Adventure Starts Now
            </h2>
            <p className="text-2xl text-cyan-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join over 50,000 travelers who trust SafarBot for their dream vacations.
              Your perfect journey is just one click away.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ModernButton
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold bg-white text-cyan-600 hover:bg-gray-50 shadow-2xl hover:shadow-3xl rounded-2xl inline-flex items-center justify-center whitespace-nowrap"
                >
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 12L3 7l18-4-4 18-5-7-5 3 3-5z" />
                  </svg>
                  <span>🎯 Plan My Escape</span>
                </ModernButton>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ModernButton
                  size="lg"
                  variant="ghost"
                  className="px-8 py-4 text-lg font-semibold border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm rounded-2xl inline-flex items-center justify-center whitespace-nowrap"
                >
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 0c2.5 2.5 2.5 15.5 0 18m0-18c-2.5 2.5-2.5 15.5 0 18M2 12h20M4 7h16M4 17h16" />
                  </svg>
                  <span>🗺️ Wander the World</span>
                </ModernButton>
              </motion.div>
            </div>
            <p className="text-cyan-200 mt-8 text-lg">
              ✈️ Free cancellation • 🛡️ Best price guarantee • ⭐ 24/7 support
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;  