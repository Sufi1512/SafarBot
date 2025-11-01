import React, { useState } from 'react';
import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
import CustomDatePicker from '../components/ui/CustomDatePicker';
import ModernButton from '../components/ui/ModernButton';
import Dropdown, { DropdownOption } from '../components/ui/Dropdown';
import PlacesAutocomplete from '../components/PlacesAutocomplete';
import bgVideo2 from '../asset/videos/bg-video2.mp4';
import { Users } from 'lucide-react';
import {
  StarIcon,
  ArrowRightIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  BuildingOfficeIcon,
  CubeIcon,
  // HeartIcon, // Used in commented-out stats section
  // GlobeAltIcon, // Used in commented-out stats section
  // ClockIcon, // Used in commented-out stats section
  FireIcon,
  TrophyIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { CircularTestimonials } from '../components/ui/circular-testimonials';

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

  // Travelers dropdown options
  const travelersOptions: DropdownOption[] = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i === 0 ? 'Traveler' : 'Travelers'}`,
    icon: <Users className="w-4 h-4" />,
  }));



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
    {
      name: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=600&h=400&fit=crop',
      price: 'From $1,099',
      rating: 4.8,
      description: 'City of lights & romance',
      badge: 'Classic',
      badgeColor: 'bg-blue-500'
    },
    {
      name: 'New York, USA',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop',
      price: 'From $1,399',
      rating: 4.6,
      description: 'The city that never sleeps',
      badge: 'Epic',
      badgeColor: 'bg-indigo-500'
    },
    {
      name: 'Dubai, UAE',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop',
      price: 'From $1,599',
      rating: 4.7,
      description: 'Futuristic skyline & luxury',
      badge: 'Premium',
      badgeColor: 'bg-amber-500'
    },
    {
      name: 'Sydney, Australia',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      price: 'From $1,799',
      rating: 4.8,
      description: 'Harbor views & vibrant culture',
      badge: 'Adventure',
      badgeColor: 'bg-emerald-500'
    },
    {
      name: 'Rome, Italy',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=400&fit=crop',
      price: 'From $999',
      rating: 4.9,
      description: 'Ancient history & delicious cuisine',
      badge: 'Heritage',
      badgeColor: 'bg-rose-500'
    },
    {
      name: 'Thailand',
      image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&h=400&fit=crop',
      price: 'From $699',
      rating: 4.7,
      description: 'Golden temples & tropical beaches',
      badge: 'Budget',
      badgeColor: 'bg-yellow-500'
    },
    {
      name: 'Switzerland',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      price: 'From $1,899',
      rating: 4.8,
      description: 'Alpine beauty & pristine lakes',
      badge: 'Nature',
      badgeColor: 'bg-cyan-500'
    },
    {
      name: 'Iceland',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=600&h=400&fit=crop',
      price: 'From $1,499',
      rating: 4.9,
      description: 'Northern lights & volcanic landscapes',
      badge: 'Unique',
      badgeColor: 'bg-teal-500'
    },
  ];

  // Stats data (currently commented out in JSX)
  // const stats = [
  //   { number: '50K+', label: 'Happy Travelers', icon: HeartIcon, color: 'from-pink-500 to-rose-500' },
  //   { number: '200+', label: 'Destinations', icon: GlobeAltIcon, color: 'from-blue-500 to-indigo-500' },
  //   { number: '24/7', label: 'Customer Support', icon: ClockIcon, color: 'from-green-500 to-emerald-500' },
  //   { number: '4.9★', label: 'Average Rating', icon: StarIcon, color: 'from-yellow-500 to-orange-500' },
  // ];

  // Enhanced testimonials data for AnimatedTestimonials component with reliable images
  const animatedTestimonials = [
    {
      quote: "SafarBot completely revolutionized how I plan my travels. The AI-powered recommendations are incredibly accurate and saved me weeks of research. The collaborative features let my family contribute to our itinerary seamlessly.",
      name: "Sarah Chen",
      designation: "Travel Blogger & Adventure Enthusiast",
      src: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=400&h=400&fit=crop&crop=face&auto=format"
    },
    {
      quote: "As a business traveler, I need efficiency and reliability. SafarBot delivers both with its smart booking system and real-time updates. The integration with my calendar is a game-changer for managing my busy schedule.",
      name: "Michael Rodriguez",
      designation: "Corporate Travel Manager at TechFlow",
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format"
    },
    {
      quote: "Planning our family vacation to Europe was overwhelming until we found SafarBot. The collaborative features let everyone contribute ideas, and the AI created the perfect itinerary for our multi-generational trip. Pure magic!",
      name: "Emily Watson",
      designation: "Family Travel Coordinator",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face&auto=format"
    },
    {
      quote: "The weather integration and local insights feature helped me discover hidden gems I never would have found otherwise. SafarBot doesn't just plan trips; it creates unforgettable experiences tailored to your interests.",
      name: "James Kim",
      designation: "Photography Traveler",
      src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format"
    },
    {
      quote: "From budget backpacking to luxury getaways, SafarBot adapts to any travel style. The price comparison feature saved me hundreds on flights and hotels. It's like having a personal travel agent available 24/7.",
      name: "Lisa Thompson",
      designation: "Solo Traveler & Budget Expert",
      src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face&auto=format"
    }
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
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
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
              className="text-base sm:text-lg text-gray-900 dark:text-gray-500 max-w-2xl mx-auto leading-relaxed mb-6 font-light"
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
            <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-xl border border-white/50 dark:border-gray-700/50 p-4 lg:p-6">
              {/* Card Background Pattern */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-50/30 via-blue-50/30 to-purple-50/30 dark:from-cyan-900/10 dark:via-blue-900/10 dark:to-purple-900/10" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/5 to-blue-500/5 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/5 to-pink-500/5 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="text-center mb-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    className="inline-flex items-center space-x-2 bg-primary-600 text-white px-3 py-1.5 rounded-full text-sm font-medium mb-3"
                  >
                    <FireIcon className="w-4 h-4" />
                    <span>Hunt for Deals</span>
                  </motion.div>
                  <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                    Where will your story begin?
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                    Tell us your dream destination and we'll craft the perfect journey
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  {/* Destination Input - Full Width */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      🌍 <span>Where would you like to go?</span>
                    </label>
                    <PlacesAutocomplete
                      value={searchForm.destination}
                      onChange={(value) => setSearchForm(prev => ({ ...prev, destination: value }))}
                      placeholder="Enter your dream destination..."
                      className="w-full"
                      icon={<span className="text-lg">🌍</span>}
                    />
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
                      <Dropdown
                        options={travelersOptions}
                        value={searchForm.travelers}
                        onChange={(value) => setSearchForm(prev => ({ ...prev, travelers: value as number }))}
                        placeholder="Select travelers"
                        size="lg"
                        variant="outline"
                        className="w-full"
                      />
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
                      size="md"
                      variant="solid"
                      className="px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transform transition-all duration-300 inline-flex items-center justify-center whitespace-nowrap"
                    >

                      <span> Craft My Dream Trip ✨</span>
                    </ModernButton>
                  </motion.div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    ✨ Over 10,000 destinations • Best price guarantee • Instant booking
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
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
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Travel Smarter, Not Harder
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
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
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div
          className="absolute top-10 left-10 opacity-20"
          animate={{
            x: [0, 50, 0],
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <div className="text-4xl">🌍</div>
        </motion.div>
        
        <motion.div
          className="absolute top-20 right-20 opacity-20"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <div className="text-3xl">✈️</div>
        </motion.div>
        
        <motion.div
          className="absolute bottom-20 left-20 opacity-20"
          animate={{
            x: [0, 40, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <div className="text-3xl">🏖️</div>
        </motion.div>
        
        <motion.div
          className="absolute bottom-10 right-10 opacity-20"
          animate={{
            x: [0, -50, 0],
            y: [0, 20, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <div className="text-4xl">🗺️</div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div 
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6"
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: [
                  '0 4px 15px rgba(147, 51, 234, 0.2)',
                  '0 8px 25px rgba(147, 51, 234, 0.4)',
                  '0 4px 15px rgba(147, 51, 234, 0.2)'
                ]
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }}
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                }}
              >
                <FireIcon className="w-4 h-4" />
              </motion.div>
              <motion.span
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{
                  backgroundImage: 'linear-gradient(90deg, #7c3aed, #ec4899, #f59e0b, #7c3aed)',
                  backgroundSize: '200% 100%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                🌟 Discover Paradise
              </motion.span>
            </motion.div>
            <motion.h2 
              className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.span
                className="inline-block"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{
                  backgroundImage: 'linear-gradient(90deg, #1f2937, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #1f2937)',
                  backgroundSize: '300% 100%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Where Dreams Come True
              </motion.span>
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                }}
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="text-2xl"
                >
                  ✨
                </motion.div>
              </motion.div>
              <motion.div
                className="absolute -bottom-1 -left-1"
                animate={{
                  x: [0, 10, 0],
                  rotate: [0, 10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="text-xl"
                >
                  🌟
                </motion.div>
              </motion.div>
            </motion.h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Explore the world's most breathtaking destinations, handpicked by our travel experts
              and loved by thousands of adventurous travelers like you.
            </p>
          </motion.div>

          {/* Smooth Marquee Container */}
          <div className="relative overflow-hidden">
            <motion.div
              className="flex space-x-6 pl-40 pr-40"
              animate={{
                x: [0, -100 * destinations.length]
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: destinations.length * 6,
                  ease: "linear",
                },
              }}
            >
              {[...destinations, ...destinations, ...destinations].map((destination, index) => (
                <motion.div
                  key={`${destination.name}-${index}`}
                  className="flex-shrink-0 w-80 group cursor-pointer"
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <motion.div
                    className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
                    whileHover={{ 
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                      borderColor: "rgba(34, 211, 238, 0.3)"
                    }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Badge */}
                      <motion.div 
                        className={`absolute top-3 left-3 ${destination.badgeColor} text-white rounded-full px-2 py-1 text-xs font-bold shadow-lg`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {destination.badge}
                      </motion.div>

                      {/* Rating */}
                      <div className="absolute top-3 right-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1 shadow-lg">
                        <StarIcon className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {destination.rating}
                        </span>
                      </div>

                      {/* Price */}
                      <motion.div 
                        className="absolute bottom-3 right-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full px-3 py-1 font-bold text-sm shadow-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        {destination.price}
                      </motion.div>
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
                        <motion.span
                          animate={{
                            rotate: [0, 10, -10, 0]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                        >
                          🌍
                        </motion.span>
                        <span>Take Me There</span>
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {/* Edge overlays removed to avoid end blur */}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Travelers Worldwide
            </h2>
            <p className="text-lg text-gray-900 max-w-2xl mx-auto">
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
                  <stat.icon className="w-8 h-8 text-gray-900" />
                </motion.div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-900 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Enhanced Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-xs font-medium mb-6 shadow-lg">
              <UserGroupIcon className="w-5 h-5" />
              <span>Trusted by Travelers Worldwide</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-6">
              Stories from Our Community
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Discover why thousands of travelers trust SafarBot to create their perfect adventures
              and make memories that last a lifetime. From solo backpackers to family vacationers.
            </p>
          </motion.div>

          {/* Circular Testimonials Component */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <CircularTestimonials 
              testimonials={animatedTestimonials} 
              autoplay={true}
              colors={{
                name: "#1f2937",
                designation: "#6b7280", 
                testimony: "#4b5563",
                arrowBackground: "#1f2937",
                arrowForeground: "#ffffff",
                arrowHoverBackground: "#3b82f6"
              }}
              fontSizes={{
                name: "1.875rem",
                designation: "1rem",
                quote: "1.25rem"
              }}
            />
          </motion.div>
          
        </div>
      
      </section>

    </div>
  );
};

export default HomePage;