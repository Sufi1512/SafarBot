import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FunnelIcon,
  MapPinIcon,
  CalendarIcon,
  PaperAirplaneIcon,
  BuildingOfficeIcon,
  StarIcon,
  XMarkIcon,
  HeartIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import PageHeader from '../components/PageHeader';
import ModernCard from '../components/ui/ModernCard';
import ModernButton from '../components/ui/ModernButton';


interface SearchResult {
  id: string;
  type: 'flight' | 'hotel' | 'package';
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  location: string;
  duration?: string;
  amenities?: string[];
  departureTime?: string;
  arrivalTime?: string;
  airline?: string;
  hotelClass?: number;
}

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    rating: 0,
    type: 'all',
    sortBy: 'price'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [savedItems, setSavedItems] = useState<string[]>([]);

  const destination = searchParams.get('destination') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const travelers = searchParams.get('travelers') || '1';

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'flight',
          title: 'Direct Flight to Paris',
          description: 'Non-stop flight with premium amenities',
          price: 899,
          originalPrice: 1200,
          rating: 4.8,
          reviewCount: 1247,
          image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop',
          location: 'Paris, France',
          duration: '8h 15m',
          departureTime: '09:30',
          arrivalTime: '17:45',
          airline: 'Air France'
        },
        {
          id: '2',
          type: 'hotel',
          title: 'Luxury Hotel in Paris',
          description: '5-star hotel in the heart of the city',
          price: 450,
          originalPrice: 600,
          rating: 4.9,
          reviewCount: 892,
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
          location: 'Paris, France',
          amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
          hotelClass: 5
        },
        {
          id: '3',
          type: 'package',
          title: 'Paris Complete Package',
          description: 'Flight + Hotel + Activities',
          price: 1299,
          originalPrice: 1800,
          rating: 4.7,
          reviewCount: 567,
          image: 'https://images.unsplash.com/photo-1502602898535-eb37b0b6d7c3?w=400&h=300&fit=crop',
          location: 'Paris, France',
          duration: '5 days',
          amenities: ['Guided Tours', 'Airport Transfer', 'Breakfast']
        }
      ];
      setResults(mockResults);
      setLoading(false);
    }, 1500);
  }, [destination, startDate, endDate, travelers]);

  const handleSaveItem = (itemId: string) => {
    setSavedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleViewDetails = (item: SearchResult) => {
    navigate(`/booking-options/${item.id}`, {
      state: { 
        item,
        searchParams: {
          destination,
          startDate,
          endDate,
          travelers
        }
      }
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flight': return PaperAirplaneIcon;
      case 'hotel': return BuildingOfficeIcon;
      default: return StarIcon;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getDiscountPercentage = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <PageHeader
          title="Searching..."
          description="Finding the best options for your trip"
          breadcrumbs={false}
        />
        <div className="container-chisfis py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <PageHeader
        title={`Search Results for ${destination}`}
        description={`${results.length} options found for ${travelers} traveler${travelers !== '1' ? 's' : ''}`}
      >
        <ModernButton
          variant="outline"
          size="lg"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <FunnelIcon className="h-5 w-5" />
          Filters
        </ModernButton>
      </PageHeader>

      <div className="container-chisfis py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className={`bg-white dark:bg-dark-card rounded-2xl shadow-soft p-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                    }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>${filters.priceRange[0]}</span>
                    <span>${filters.priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Minimum Rating</h4>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFilters(prev => ({ ...prev, rating: star }))}
                      className={`p-1 rounded ${
                        filters.rating >= star
                          ? 'text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      <StarIcon className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Type</h4>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'flight', label: 'Flights' },
                    { value: 'hotel', label: 'Hotels' },
                    { value: 'package', label: 'Packages' }
                  ].map((type) => (
                    <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={filters.type === type.value}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="text-primary-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Sort By</h4>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                >
                  <option value="price">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="rating">Rating</option>
                  <option value="reviews">Most Reviews</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {results.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ModernCard className="p-6 hover-lift">
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-32 h-24 rounded-xl object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {React.createElement(getTypeIcon(item.type), {
                                className: "h-5 w-5 text-primary-500"
                              })}
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {item.title}
                              </h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPinIcon className="h-4 w-4" />
                                {item.location}
                              </span>
                              {item.duration && (
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4" />
                                  {item.duration}
                                </span>
                              )}
                              <div className="flex items-center gap-1">
                                <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                                <span>{item.rating}</span>
                                <span>({item.reviewCount})</span>
                              </div>
                            </div>
                          </div>

                          {/* Price and Actions */}
                          <div className="flex flex-col items-end gap-3">
                            <div className="text-right">
                              {item.originalPrice && (
                                <p className="text-sm text-gray-500 line-through">
                                  {formatPrice(item.originalPrice)}
                                </p>
                              )}
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatPrice(item.price)}
                              </p>
                              {item.originalPrice && (
                                <span className="text-sm text-green-600 font-medium">
                                  Save {getDiscountPercentage(item.originalPrice, item.price)}%
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSaveItem(item.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  savedItems.includes(item.id)
                                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                }`}
                              >
                                <HeartIcon className="h-5 w-5" />
                              </button>
                              <ModernButton
                                variant="primary"
                                size="sm"
                                onClick={() => handleViewDetails(item)}
                                className="flex items-center gap-2"
                              >
                                <EyeIcon className="h-4 w-4" />
                                View Details
                              </ModernButton>
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        {item.amenities && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.amenities.map((amenity, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </ModernCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
