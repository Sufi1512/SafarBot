import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Heart, Grid, List, Calendar, Users } from 'lucide-react';
import { savedItineraryAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  rating: number;
  price: number;
  duration: string;
  travelers: number;
  isLiked: boolean;
  tags: string[];
  description: string;
}

const ExplorePage: React.FC = () => {
  const { } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');

  // Load public itineraries and popular destinations
  useEffect(() => {
    loadExploreData();
  }, [searchQuery, selectedFilter, sortBy]);

  const loadExploreData = async () => {
    try {
      // Load public itineraries for inspiration
      await savedItineraryAPI.getItineraries({
        limit: 20,
        skip: 0,
        status: 'published'
      });
      
      // TODO: Load popular destinations from places API
      // const popularDestinations = await placeServiceAPI.getPopularDestinations();
      
    } catch (err: any) {
      console.error('Error loading explore data:', err);
    }
  };

  const handleLikeDestination = async (destinationId: string) => {
    try {
      // TODO: Implement like functionality
      console.log('Liked destination:', destinationId);
    } catch (err: any) {
      console.error('Error liking destination:', err);
    }
  };


  const destinations: Destination[] = [
    {
      id: '1',
      name: 'Santorini',
      country: 'Greece',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=500&h=300&fit=crop',
      rating: 4.8,
      price: 1200,
      duration: '7 days',
      travelers: 2,
      isLiked: false,
      tags: ['Romantic', 'Beach', 'Sunset'],
      description: 'Experience the magic of white-washed buildings and stunning sunsets'
    },
    {
      id: '2',
      name: 'Tokyo',
      country: 'Japan',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&h=300&fit=crop',
      rating: 4.9,
      price: 1800,
      duration: '10 days',
      travelers: 1,
      isLiked: true,
      tags: ['Culture', 'Food', 'Modern'],
      description: 'Immerse yourself in the vibrant culture and cutting-edge technology'
    },
    {
      id: '3',
      name: 'Bali',
      country: 'Indonesia',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=500&h=300&fit=crop',
      rating: 4.7,
      price: 800,
      duration: '14 days',
      travelers: 4,
      isLiked: false,
      tags: ['Tropical', 'Wellness', 'Adventure'],
      description: 'Discover paradise with lush landscapes and spiritual experiences'
    },
    {
      id: '4',
      name: 'Paris',
      country: 'France',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=500&h=300&fit=crop',
      rating: 4.6,
      price: 1500,
      duration: '5 days',
      travelers: 2,
      isLiked: true,
      tags: ['Romantic', 'Art', 'History'],
      description: 'The city of light and love, perfect for romantic getaways'
    },
    {
      id: '5',
      name: 'New York',
      country: 'USA',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500&h=300&fit=crop',
      rating: 4.5,
      price: 2000,
      duration: '6 days',
      travelers: 3,
      isLiked: false,
      tags: ['City', 'Shopping', 'Entertainment'],
      description: 'The city that never sleeps, full of energy and possibilities'
    },
    {
      id: '6',
      name: 'Dubai',
      country: 'UAE',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880a?w=500&h=300&fit=crop',
      rating: 4.4,
      price: 1600,
      duration: '8 days',
      travelers: 2,
      isLiked: false,
      tags: ['Luxury', 'Modern', 'Shopping'],
      description: 'Experience luxury and modern architecture in the desert'
    }
  ];

  const filters = [
    { id: 'all', label: 'All Destinations' },
    { id: 'romantic', label: 'Romantic' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'culture', label: 'Culture' },
    { id: 'beach', label: 'Beach' },
    { id: 'city', label: 'City' }
  ];

  const sortOptions = [
    { id: 'popular', label: 'Most Popular' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Highest Rated' }
  ];


  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dest.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || dest.tags.some(tag => 
      tag.toLowerCase().includes(selectedFilter.toLowerCase())
    );
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search destinations, countries, or experiences..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === filter.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredDestinations.length} destinations
      </div>

      {/* Destinations Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }>
        {filteredDestinations.map((destination) => (
          <div
            key={destination.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow ${
              viewMode === 'list' ? 'flex' : ''
            }`}
          >
            {/* Image */}
            <div className={`relative ${viewMode === 'list' ? 'w-48 h-32' : 'h-48'}`}>
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleLikeDestination(destination.id)}
                className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
              >
                <Heart
                  className={`h-4 w-4 ${
                    destination.isLiked ? 'text-red-500 fill-current' : 'text-gray-600 dark:text-gray-400'
                  }`}
                />
              </button>
              <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-full">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {destination.rating}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {destination.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-1" />
                    {destination.country}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    ${destination.price}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">per person</div>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {destination.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {destination.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Details */}
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {destination.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {destination.travelers} travelers
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          Load More Destinations
        </button>
      </div>
    </div>
  );
};

export default ExplorePage;


