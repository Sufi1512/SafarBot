import React, { useState } from 'react';
import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
import CustomDatePicker from '../components/ui/CustomDatePicker';
import ModernButton from '../components/ui/ModernButton';
import bgVideo2 from '../asset/videos/bg-video2.mp4';
import { MapPin, Calendar, Users, DollarSign, Cloud, Sun, Wind, Eye, Thermometer } from 'lucide-react';
import {
  StarIcon,
  ArrowRightIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  BuildingOfficeIcon,
  CubeIcon,
  HeartIcon,
  GlobeAltIcon,
  ClockIcon,
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

  // Mock weather data - in real app, this would come from an API
  const weatherData = {
    location: 'Mumbai, IN',
    temperature: 27,
    feelsLike: 27,
    condition: 'Overcast Clouds',
    humidity: 80,
    wind: 3.69,
    pressure: 1007,
    visibility: 10,
    icon: 'cloud'
  };

  // Calculate journey overview data
  const journeyOverview = {
    totalDays: searchForm.startDate && searchForm.endDate 
      ? Math.ceil((searchForm.endDate.getTime() - searchForm.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 5,
    estimatedBudget: searchForm.travelers * 300, // $300 per person per day
    plannedDays: searchForm.startDate && searchForm.endDate 
      ? Math.ceil((searchForm.endDate.getTime() - searchForm.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 5
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchForm.destination) params.set('destination', searchForm.destination);
    if (searchForm.startDate) params.set('startDate', searchForm.startDate.toISOString());
    if (searchForm.endDate) params.set('endDate', searchForm.endDate.toISOString());
    if (searchForm.travelers) params.set('travelers', String(searchForm.travelers));

    const url = '/trip-planner' + (params.toString() ? `?${params.toString()}` : '');
    window.location.href = url;
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
      
      {/* Hero Section with Background Video */}
      <section className="relative min-h-[100vh] pt-20 pb-8 overflow-hidden">
        {/* Hero Background Video */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            className="w-full h-full object-cover object-center"
            src={bgVideo2}
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
        
        {/* Animated Background Elements removed */}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-8">
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg backdrop-blur-sm"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>AI-Powered Travel Intelligence</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
            >
            
              <span className="gradient-text-with-shimmer" style={{ animationDelay: '0.5s' }}>
              Discover Your Next Adventure
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-6 font-light"
            >
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Experience the world like never before. Our AI finds perfect destinations,
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="font-medium text-primary-600"
              >
                unbeatable prices, and creates memories that last forever.
              </motion.span>
            </motion.p>
          </div>


          {/* Enhanced Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-xl border border-white/50 dark:border-gray-700/50 p-6 lg:p-8">
              {/* Card Background Pattern */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-50/30 via-blue-50/30 to-purple-50/30 dark:from-cyan-900/10 dark:via-blue-900/10 dark:to-purple-900/10" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/5 to-blue-500/5 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/5 to-pink-500/5 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    className="inline-flex items-center space-x-2 bg-primary-600 text-white px-3 py-1.5 rounded-full text-sm font-medium mb-4"
                  >
                    <FireIcon className="w-4 h-4" />
                    <span>Hunt for Deals</span>
                  </motion.div>
                  <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
                    Where will your story begin?
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                    Tell us your dream destination and we'll craft the perfect journey
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Destination Input - Full Width */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      🌍 <span>Where would you like to go?</span>
                    </label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500 group-hover:text-blue-500 transition-colors z-10" />
                      <input
                        type="text"
                        placeholder="Enter your dream destination..."
                        value={searchForm.destination}
                        onChange={(e) => setSearchForm(prev => ({ ...prev, destination: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-base font-medium hover:border-cyan-400 shadow-sm hover:shadow-md"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  </div>

                  {/* Date and Guests Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        👥 <span>Travelers</span>
                      </label>
                      <div className="relative group">
                        <select
                          value={searchForm.travelers}
                          onChange={(e) => setSearchForm(prev => ({ ...prev, travelers: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2.5 pr-10 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-base font-medium appearance-none hover:border-cyan-400 shadow-sm hover:shadow-md cursor-pointer"
                          aria-label="Select number of travelers"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <option key={num} value={num} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              {num} {num === 1 ? 'Traveler' : 'Travelers'}
                            </option>
                          ))}
                        </select>
                        {/* Removed custom arrow to avoid duplicate caret; rely on native select indicator */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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
                      variant="solid"
                      className="px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 inline-flex items-center justify-center whitespace-nowrap"
                    >
                      <svg className="w-4 h-4 mr-2 flex-shrink-0 align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                      </svg>
                      <span>✨ Craft My Dream Trip</span>
                    </ModernButton>
                  </motion.div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    ✨ Over 10,000 destinations • Best price guarantee • Instant booking
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Journey Overview & Weather Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Journey Overview */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Journey Overview
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Your trip details at a glance
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Days */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-6 text-center border border-blue-200/50 dark:border-blue-700/50"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-1">
                    {journeyOverview.totalDays}
                  </div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Total Days
                  </div>
                </motion.div>

                {/* Estimated Budget */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl p-6 text-center border border-green-200/50 dark:border-green-700/50"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300 mb-1">
                    ${journeyOverview.estimatedBudget}
                  </div>
                  <div className="text-sm font-medium text-green-600 dark:text-green-400">
                    Estimated Budget
                  </div>
                </motion.div>

                {/* Planned Days */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl p-6 text-center border border-purple-200/50 dark:border-purple-700/50"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-1">
                    {journeyOverview.plannedDays}
                  </div>
                  <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Planned Days
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Current Weather */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sun className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Current Weather
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Stay informed about your destination
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {weatherData.location}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Current weather
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-orange-500 mb-1">
                      {weatherData.temperature}°C
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Feels like {weatherData.feelsLike}°C
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Cloud className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {weatherData.condition}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {weatherData.humidity}% humidity
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <Wind className="w-4 h-4 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-500 dark:text-gray-400">Wind</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {weatherData.wind} m/s
                    </div>
                  </div>
                  <div className="text-center">
                    <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-500 dark:text-gray-400">Pressure</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {weatherData.pressure} hPa
                    </div>
                  </div>
                  <div className="text-center">
                    <Thermometer className="w-4 h-4 text-gray-500 dark:text-gray-400 mx-auto mb-1" />
                    <div className="text-xs text-gray-500 dark:text-gray-400">Visibility</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {weatherData.visibility} km
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-3 border border-blue-200/50 dark:border-blue-700/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Sun className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Travel Tip: Pack summer clothing and sun protection
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section with Enhanced UI */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 text-cyan-700 dark:text-cyan-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <TrophyIcon className="w-4 h-4" />
              <span>Why Choose SafarBot</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Travel Smarter, Not Harder
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Experience the future of travel planning with our cutting-edge AI technology
              and personalized recommendations that save you time and money.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`relative p-6 rounded-2xl h-full transition-all duration-300 bg-gradient-to-br ${feature.bgColor} dark:from-gray-800 dark:to-gray-700 border border-white/50 dark:border-gray-600/50 shadow-lg hover:shadow-2xl`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-700/50 dark:to-transparent rounded-2xl" />
                  <div className="relative z-10">
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FireIcon className="w-4 h-4" />
              <span>🌟 Discover Paradise</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Where Dreams Come True
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Explore the world's most breathtaking destinations, handpicked by our travel experts
              and loved by thousands of adventurous travelers like you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Badge */}
                    <div className={`absolute top-3 left-3 ${destination.badgeColor} text-white rounded-full px-2 py-1 text-xs font-bold shadow-lg`}>
                      {destination.badge}
                    </div>

                    {/* Rating */}
                    <div className="absolute top-3 right-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1 shadow-lg">
                      <StarIcon className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {destination.rating}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="absolute bottom-3 right-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full px-3 py-1 font-bold text-sm shadow-lg">
                      {destination.price}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-cyan-600 transition-colors">
                      {destination.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                      {destination.description}
                    </p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-sm transition-colors group"
                    >
                      <span>🌍 Take Me There</span>
                      <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Trusted by Travelers Worldwide
            </h2>
            <p className="text-lg text-cyan-100 max-w-2xl mx-auto">
              Join millions of happy travelers who have discovered their perfect journey with SafarBot
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
                  className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-2xl group-hover:shadow-3xl transition-all duration-300`}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>
                <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-cyan-100 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <UserGroupIcon className="w-4 h-4" />
              <span>Happy Travelers</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Stories from Our Community
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover why thousands of travelers trust SafarBot to create their perfect adventures
              and make memories that last a lifetime.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover ring-4 ring-cyan-100 dark:ring-cyan-900"
                    />
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-cyan-600 dark:text-cyan-400 font-medium text-sm">
                        {testimonial.role}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm mb-4">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;