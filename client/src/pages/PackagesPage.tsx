import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Star, 
  ArrowRight,
  Clock,
  Shield,
  Heart,
  Plane,
  Building,
} from 'lucide-react';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';

interface Package {
  id: string;
  title: string;
  destination: string;
  duration: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  features: string[];
  type: 'adventure' | 'luxury' | 'family' | 'romantic' | 'cultural';
  discount?: number;
}

const PackagesPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');

  const packages: Package[] = [
    {
      id: '1',
      title: 'Bali Paradise Escape',
      destination: 'Bali, Indonesia',
      duration: '7 days',
      price: 1299,
      originalPrice: 1599,
      rating: 4.8,
      reviews: 1247,
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=500&h=300&fit=crop',
      description: 'Experience the beauty of Bali with this comprehensive package including luxury resorts, cultural tours, and adventure activities.',
      features: ['Luxury Resort Stay', 'Airport Transfers', 'Cultural Tours', 'Adventure Activities', 'Meals Included'],
      type: 'luxury',
      discount: 19
    },
    {
      id: '2',
      title: 'Tokyo Cultural Journey',
      destination: 'Tokyo, Japan',
      duration: '5 days',
      price: 899,
      originalPrice: 1099,
      rating: 4.9,
      reviews: 892,
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&h=300&fit=crop',
      description: 'Discover the rich culture and modern marvels of Tokyo with guided tours and authentic experiences.',
      features: ['City Tours', 'Temple Visits', 'Traditional Meals', 'JR Pass Included', 'English Guide'],
      type: 'cultural',
      discount: 18
    },
    {
      id: '3',
      title: 'Swiss Alps Adventure',
      destination: 'Switzerland',
      duration: '10 days',
      price: 2499,
      originalPrice: 2999,
      rating: 4.7,
      reviews: 634,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      description: 'Adventure through the stunning Swiss Alps with hiking, skiing, and mountain activities.',
      features: ['Mountain Hiking', 'Ski Equipment', 'Cable Car Passes', 'Mountain Lodges', 'Expert Guide'],
      type: 'adventure',
      discount: 17
    },
    {
      id: '4',
      title: 'Paris Romantic Getaway',
      destination: 'Paris, France',
      duration: '6 days',
      price: 1599,
      originalPrice: 1899,
      rating: 4.9,
      reviews: 1156,
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=500&h=300&fit=crop',
      description: 'Perfect for couples, this romantic package includes luxury accommodations and intimate experiences.',
      features: ['Luxury Hotel', 'River Cruise', 'Fine Dining', 'Museum Passes', 'Private Tours'],
      type: 'romantic',
      discount: 16
    },
    {
      id: '5',
      title: 'Dubai Family Fun',
      destination: 'Dubai, UAE',
      duration: '8 days',
      price: 1899,
      originalPrice: 2299,
      rating: 4.6,
      reviews: 743,
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&h=300&fit=crop',
      description: 'Family-friendly package with activities for all ages in the amazing city of Dubai.',
      features: ['Theme Parks', 'Desert Safari', 'Aquarium Visit', 'Shopping Tours', 'Kids Activities'],
      type: 'family',
      discount: 17
    },
    {
      id: '6',
      title: 'Santorini Sunset Dreams',
      destination: 'Santorini, Greece',
      duration: '5 days',
      price: 1199,
      originalPrice: 1399,
      rating: 4.8,
      reviews: 967,
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=500&h=300&fit=crop',
      description: 'Experience the magical sunsets and beautiful architecture of Santorini.',
      features: ['Boutique Hotel', 'Wine Tasting', 'Boat Tours', 'Photography Session', 'Local Cuisine'],
      type: 'romantic',
      discount: 14
    }
  ];

  const packageTypes = [
    { id: 'all', name: 'All Packages', icon: Plane },
    { id: 'adventure', name: 'Adventure', icon: MapPin },
    { id: 'luxury', name: 'Luxury', icon: Star },
    { id: 'family', name: 'Family', icon: Heart },
    { id: 'romantic', name: 'Romantic', icon: Heart },
    { id: 'cultural', name: 'Cultural', icon: Building }
  ];

  const durations = [
    { id: 'all', name: 'Any Duration' },
    { id: 'short', name: '1-3 days' },
    { id: 'medium', name: '4-7 days' },
    { id: 'long', name: '8+ days' }
  ];

  const filteredPackages = packages.filter(pkg => {
    const typeMatch = selectedType === 'all' || pkg.type === selectedType;
    const durationMatch = selectedDuration === 'all' || 
      (selectedDuration === 'short' && parseInt(pkg.duration) <= 3) ||
      (selectedDuration === 'medium' && parseInt(pkg.duration) >= 4 && parseInt(pkg.duration) <= 7) ||
      (selectedDuration === 'long' && parseInt(pkg.duration) >= 8);
    return typeMatch && durationMatch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'adventure': return MapPin;
      case 'luxury': return Star;
      case 'family': return Heart;
      case 'romantic': return Heart;
      case 'cultural': return Building;
      default: return Plane;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'adventure': return 'bg-green-100 text-green-800';
      case 'luxury': return 'bg-yellow-100 text-yellow-800';
      case 'family': return 'bg-blue-100 text-blue-800';
      case 'romantic': return 'bg-pink-100 text-pink-800';
      case 'cultural': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-white text-gray-900">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Travel Packages
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600">
              Discover amazing destinations with our curated travel packages
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">Secure Booking</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                <Star className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">Best Price Guarantee</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Package Type Filter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Package Type</h3>
              <div className="flex flex-wrap gap-2">
                {packageTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                        selectedType === type.id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{type.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration Filter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Duration</h3>
              <div className="flex flex-wrap gap-2">
                {durations.map((duration) => (
                  <button
                    key={duration.id}
                    onClick={() => setSelectedDuration(duration.id)}
                    className={`px-4 py-2 rounded-full transition-all duration-200 ${
                      selectedDuration === duration.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {duration.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg, index) => {
            const TypeIcon = getTypeIcon(pkg.type);
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ModernCard className="overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {pkg.discount && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{pkg.discount}%
                      </div>
                    )}
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(pkg.type)}`}>
                      <TypeIcon className="w-4 h-4 inline mr-1" />
                      {pkg.type}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {pkg.title}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {pkg.rating} ({pkg.reviews})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{pkg.destination}</span>
                    </div>

                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{pkg.duration}</span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {pkg.description}
                    </p>

                    {/* Features */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {pkg.features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                        {pkg.features.length > 3 && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                            +{pkg.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${pkg.price}
                          </span>
                          {pkg.originalPrice && (
                            <span className="text-lg text-gray-500 line-through">
                              ${pkg.originalPrice}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">per person</span>
                      </div>
                      <ModernButton
                        variant="gradient"
                        size="sm"
                        className="group-hover:scale-105 transition-transform duration-200"
                      >
                        Book Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </ModernButton>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredPackages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Plane className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No packages found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters to see more results
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PackagesPage;
