import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  MapPin, 
  Search,
  Shield,
  Zap,
  Clock,
  TrendingUp,
  Users as UsersIcon,
  Plane,
  Star,
  Globe,
  Heart,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';
import ModernInput from '../components/ui/ModernInput';

interface SearchForm {
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  travelers: number;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState<SearchForm>({
    destination: '',
    startDate: null,
    endDate: null,
    travelers: 1
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchForm.destination || !searchForm.startDate || !searchForm.endDate) {
      return;
    }
    
    setIsLoading(true);
    // Navigate to flights page with search params
    navigate('/flights', { 
      state: { 
        searchParams: {
          destination: searchForm.destination,
          startDate: searchForm.startDate.toISOString(),
          endDate: searchForm.endDate.toISOString(),
          travelers: searchForm.travelers
        }
      }
    });
  };

  const popularDestinations = [
    { 
      name: 'Paris, France', 
      image: 'https://images.unsplash.com/photo-1502602898535-eb37b0b6d7c3?w=400&h=300&fit=crop', 
      price: '$899',
      rating: 4.8,
      description: 'City of Light'
    },
    { 
      name: 'Tokyo, Japan', 
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop', 
      price: '$1,299',
      rating: 4.9,
      description: 'Modern Metropolis'
    },
    { 
      name: 'New York, USA', 
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop', 
      price: '$699',
      rating: 4.7,
      description: 'The Big Apple'
    },
    { 
      name: 'London, UK', 
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop', 
      price: '$799',
      rating: 4.6,
      description: 'Historic Capital'
    },
    { 
      name: 'Bali, Indonesia', 
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop', 
      price: '$599',
      rating: 4.9,
      description: 'Island Paradise'
    },
    { 
      name: 'Dubai, UAE', 
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop', 
      price: '$999',
      rating: 4.5,
      description: 'Desert Oasis'
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Instant Booking',
      description: 'Book flights and hotels instantly with our streamlined process',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Your payments are protected with bank-level security',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Get help anytime with our round-the-clock customer service',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      icon: TrendingUp,
      title: 'Best Prices',
      description: 'We guarantee the best prices with our price match promise',
      color: 'from-purple-400 to-pink-500'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Travelers', icon: Heart },
    { number: '100+', label: 'Destinations', icon: Globe },
    { number: '24/7', label: 'Support', icon: Clock },
    { number: '4.9', label: 'Rating', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-bg dark:via-dark-bg dark:to-secondary-800">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-200/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative section-padding">
        <div className="container-chisfis">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 bg-white/90 dark:bg-dark-card/90 backdrop-blur-md rounded-full px-6 py-3 mb-8 border border-white/30 dark:border-secondary-700/50 shadow-lg"
            >
              <Sparkles className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-medium text-secondary-800 dark:text-secondary-200">
                AI-Powered Travel Planning
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-7xl font-heading font-bold text-secondary-900 dark:text-dark-text mb-6 leading-tight"
            >
              Plan Your Perfect
              <span className="block text-gradient"> Journey</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-secondary-700 dark:text-secondary-200 max-w-3xl mx-auto text-body leading-relaxed"
            >
              Discover amazing destinations, book flights and hotels, and create unforgettable memories with our AI-powered travel platform.
            </motion.p>
          </div>

          {/* Modern Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <ModernCard variant="glass" padding="xl" shadow="glow">
              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Destination */}
                  <div className="lg:col-span-2">
                    <ModernInput
                      label="Where do you want to go?"
                      placeholder="Enter destination"
                      value={searchForm.destination}
                      onChange={(value) => setSearchForm(prev => ({ ...prev, destination: value }))}
                      icon={MapPin}
                      variant="glass"
                      size="lg"
                      required
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-800 dark:text-secondary-200 mb-3">
                      Start Date
                    </label>
                    <DatePicker
                      selected={searchForm.startDate}
                      onChange={(date: Date | null) => setSearchForm(prev => ({ ...prev, startDate: date }))}
                      placeholderText="Select date"
                      className="w-full px-4 py-3 border border-white/40 dark:border-secondary-600/40 backdrop-blur-md bg-white/30 dark:bg-dark-card/30 text-secondary-900 dark:text-dark-text placeholder-secondary-600 dark:placeholder-secondary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl transition-all duration-200"
                      minDate={new Date()}
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-800 dark:text-secondary-200 mb-3">
                      End Date
                    </label>
                    <DatePicker
                      selected={searchForm.endDate}
                      onChange={(date: Date | null) => setSearchForm(prev => ({ ...prev, endDate: date }))}
                      placeholderText="Select date"
                      className="w-full px-4 py-3 border border-white/40 dark:border-secondary-600/40 backdrop-blur-md bg-white/30 dark:bg-dark-card/30 text-secondary-900 dark:text-dark-text placeholder-secondary-600 dark:placeholder-secondary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl transition-all duration-200"
                      minDate={searchForm.startDate || new Date()}
                    />
                  </div>
                </div>

                {/* Additional Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-800 dark:text-secondary-200 mb-3">
                      Travelers
                    </label>
                    <div className="relative">
                      <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-600 dark:text-secondary-400 w-5 h-5" />
                      <select
                        value={searchForm.travelers}
                        onChange={(e) => setSearchForm(prev => ({ ...prev, travelers: parseInt(e.target.value) }))}
                        className="w-full pl-10 pr-4 py-3 border border-white/40 dark:border-secondary-600/40 backdrop-blur-md bg-white/30 dark:bg-dark-card/30 text-secondary-900 dark:text-dark-text rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num} className="bg-white dark:bg-dark-card text-secondary-900 dark:text-dark-text">
                            {num} {num === 1 ? 'Traveler' : 'Travelers'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-secondary-800 dark:text-secondary-200 mb-3">
                      &nbsp;
                    </label>
                    <ModernButton
                      onClick={handleSearch}
                      loading={isLoading}
                      icon={Search}
                      variant="gradient"
                      size="lg"
                      fullWidth
                      className="h-12"
                    >
                      Search Flights
                    </ModernButton>
                  </div>
                </div>
              </form>
            </ModernCard>
          </motion.div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-secondary-900 dark:text-dark-text mb-6">
              Popular Destinations
            </h2>
            <p className="text-xl text-secondary-700 dark:text-secondary-200 max-w-2xl mx-auto">
              Explore trending destinations around the world
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularDestinations.map((destination, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <ModernCard variant="interactive" padding="none" hover>
                  <div className="relative h-64 overflow-hidden rounded-2xl">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Rating */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-full px-3 py-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-sm font-medium">{destination.rating}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-white font-bold text-xl mb-1">{destination.name}</h3>
                      <p className="text-white/80 text-sm mb-3">{destination.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold text-lg">Starting from {destination.price}</span>
                        <ModernButton variant="glass" size="sm" icon={ArrowRight}>
                          Explore
                        </ModernButton>
                      </div>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary-50 to-white dark:from-secondary-800 dark:to-dark-bg">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-secondary-900 dark:text-dark-text mb-6">
              Why Choose SafarBot?
            </h2>
            <p className="text-xl text-secondary-700 dark:text-secondary-200 max-w-2xl mx-auto">
              Experience the future of travel planning
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <ModernCard variant="elevated" padding="lg" className="text-center h-full">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 dark:text-dark-text mb-3">{feature.title}</h3>
                  <p className="text-secondary-700 dark:text-secondary-200 leading-relaxed">{feature.description}</p>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-primary-100 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <ModernCard variant="gradient" padding="xl" className="text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Plane className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-4xl font-heading font-bold text-white mb-4">
                Get Travel Inspiration
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Subscribe to our newsletter for exclusive deals and travel tips
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <ModernInput
                  placeholder="Enter your email"
                  value=""
                  onChange={() => {}}
                  variant="glass"
                  size="lg"
                  className="flex-1"
                />
                <ModernButton variant="glass" size="lg">
                  Subscribe
                </ModernButton>
              </div>
            </ModernCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 