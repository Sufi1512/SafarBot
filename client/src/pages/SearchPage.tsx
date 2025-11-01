import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Users, 
  Plane, 
  Hotel, 
  Star, 
  Heart,
  ArrowRight,
  Globe,
  Clock
} from 'lucide-react';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';
import PlacesAutocomplete from '../components/PlacesAutocomplete';
import DatePicker from '../components/ui/DatePicker';

interface SearchResult {
  id: string;
  type: 'flight' | 'hotel' | 'package';
  title: string;
  destination: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  highlights: string[];
  duration?: string;
  amenities?: string[];
}

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'flights' | 'hotels' | 'packages'>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [travelers, setTravelers] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'popularity'>('popularity');
  const [isLoading, setIsLoading] = useState(false);

  // Mock search results
  const [searchResults] = useState<SearchResult[]>([
    {
      id: '1',
      type: 'flight',
      title: 'Direct Flight to Paris',
      destination: 'Paris, France',
      price: 899,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1502602898535-eb37b0b6d7c3?w=400&h=300&fit=crop',
      description: 'Experience the magic of Paris with our premium direct flight service.',
      highlights: ['Direct Flight', 'Premium Service', 'Flexible Booking'],
      duration: '7h 30m'
    },
    {
      id: '2',
      type: 'hotel',
      title: 'Luxury Hotel in Tokyo',
      destination: 'Tokyo, Japan',
      price: 1299,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
      description: 'Stay in the heart of Tokyo with stunning city views and world-class amenities.',
      highlights: ['City Center', '5-Star Rating', 'Free WiFi'],
      amenities: ['Spa', 'Restaurant', 'Gym', 'Pool']
    },
    {
      id: '3',
      type: 'package',
      title: 'Bali Adventure Package',
      destination: 'Bali, Indonesia',
      price: 1599,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop',
      description: 'Complete Bali experience including flights, hotel, and guided tours.',
      highlights: ['All-Inclusive', 'Guided Tours', 'Airport Transfer'],
      duration: '7 Days'
    },
    {
      id: '4',
      type: 'flight',
      title: 'Business Class to New York',
      destination: 'New York, USA',
      price: 2499,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop',
      description: 'Travel in style with our premium business class service to the Big Apple.',
      highlights: ['Business Class', 'Priority Boarding', 'Lounge Access'],
      duration: '6h 45m'
    },
    {
      id: '5',
      type: 'hotel',
      title: 'Beach Resort in Dubai',
      destination: 'Dubai, UAE',
      price: 899,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop',
      description: 'Relax in luxury at our beachfront resort with private beach access.',
      highlights: ['Beachfront', 'Private Beach', 'All-Inclusive'],
      amenities: ['Beach Access', 'Spa', 'Water Sports', 'Kids Club']
    },
    {
      id: '6',
      type: 'package',
      title: 'European Discovery Tour',
      destination: 'Multiple Cities, Europe',
      price: 2999,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop',
      description: 'Explore multiple European cities with our comprehensive tour package.',
      highlights: ['Multi-City', 'Guided Tours', 'Transport Included'],
      duration: '14 Days'
    }
  ]);

  useEffect(() => {
    // Extract search params from location state if available
    if (location.state?.searchParams) {
      const { destination, startDate: start, endDate: end, travelers: travelersCount } = location.state.searchParams;
      setSearchQuery(destination || '');
      setStartDate(start ? new Date(start) : null);
      setEndDate(end ? new Date(end) : null);
      setTravelers(travelersCount || 1);
    }
  }, [location]);

  const handleSearch = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const filteredResults = searchResults.filter(result => {
    if (searchType !== 'all') {
      // Map search type to result type
      const typeMapping: Record<string, string> = {
        'flights': 'flight',
        'hotels': 'hotel',
        'packages': 'package'
      };
      if (result.type !== typeMapping[searchType]) return false;
    }
    if (searchQuery && !result.destination.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (result.price < priceRange[0] || result.price > priceRange[1]) return false;
    return true;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popularity':
        return b.rating - a.rating; // Using rating as popularity proxy
      default:
        return 0;
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flight': return Plane;
      case 'hotel': return Hotel;
      case 'package': return Globe;
      default: return Globe;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'flight': return 'from-blue-500 to-blue-600';
      case 'hotel': return 'from-green-500 to-green-600';
      case 'package': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div 
      className="min-h-screen bg-white dark:bg-dark-bg"
      style={{
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.9), rgba(248, 250, 252, 0.9)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Search Results</h1>
            </div>
            
            <ModernButton
              variant="bordered"
              size="sm"
              onClick={() => navigate('/')}
              className="border-gray-300 dark:border-gray-600"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to Home
            </ModernButton>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <ModernCard variant="glass" padding="lg" className="backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Type
                  </label>
                  <div className="flex space-x-2">
                    {(['all', 'flights', 'hotels', 'packages'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSearchType(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          searchType === type
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Destination
                  </label>
                  <PlacesAutocomplete
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Where do you want to go?"
                    icon={<MapPin className="w-4 h-4" />}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <DatePicker
                      value={startDate || undefined}
                      onChange={(date) => setStartDate(date || null)}
                      placeholder="Select start date"
                      minDate={new Date()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <DatePicker
                      value={endDate || undefined}
                      onChange={(date) => setEndDate(date || null)}
                      placeholder="Select end date"
                      minDate={startDate || new Date()}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Travelers
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={travelers}
                      onChange={(e) => setTravelers(parseInt(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 bg-white dark:bg-gray-800"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Traveler' : 'Travelers'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'price' | 'rating' | 'popularity')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 bg-white dark:bg-gray-800"
                  >
                    <option value="popularity">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price">Lowest Price</option>
                  </select>
                </div>

                <ModernButton
                  onClick={handleSearch}
                  loading={isLoading}
                  icon={Search}
                  variant="solid"
                  size="lg"
                  className="w-full"
                >
                  Search
                </ModernButton>
              </div>
            </div>
          </ModernCard>
        </motion.div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {filteredResults.length} Results Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Showing {sortedResults.length} of {searchResults.length} results
            </p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Search Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedResults.map((result, index) => {
            const TypeIcon = getTypeIcon(result.type);
            return (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ModernCard variant="interactive" padding="none" hover className="overflow-hidden h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={result.image}
                      alt={result.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Type Badge */}
                    <div className={`absolute top-4 left-4 px-3 py-1 bg-gradient-to-r ${getTypeColor(result.type)} rounded-full text-xs font-medium text-white shadow-lg`}>
                      <TypeIcon className="w-3 h-3 inline mr-1" />
                      {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                    </div>
                    
                    {/* Rating */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-full px-3 py-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-sm font-medium">{result.rating}</span>
                    </div>
                    
                    {/* Price */}
                    <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg px-3 py-2">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        ${result.price}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        per {result.type === 'flight' ? 'person' : result.type === 'hotel' ? 'night' : 'package'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col h-full">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {result.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">
                      {result.description}
                    </p>
                    
                    {/* Highlights */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {result.highlights.map((highlight, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Additional Info */}
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {result.destination}
                      </div>
                      {result.duration && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {result.duration}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-auto">
                      <ModernButton
                        variant="bordered"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/booking/${result.type}/${result.id}`)}
                      >
                        Book Now
                      </ModernButton>
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Heart className="w-4 h-4" />
                      </ModernButton>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            );
          })}
        </div>

        {/* No Results */}
        {sortedResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Results Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search criteria or browse our popular destinations.
            </p>
            <ModernButton
              variant="solid"
              size="lg"
              onClick={() => navigate('/')}
            >
              Explore Destinations
            </ModernButton>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
