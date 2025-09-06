import React, { useState } from 'react';
import { Heart, Share2, Bookmark, MapPin, Calendar, Users, DollarSign, Star, Filter, Grid, List, Compass, Camera, Plane, Hotel, Car } from 'lucide-react';

interface InspirationItem {
  id: string;
  title: string;
  description: string;
  image: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  location: string;
  category: string;
  tags: string[];
  likes: number;
  isLiked: boolean;
  isBookmarked: boolean;
  estimatedCost: number;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'itinerary' | 'destination' | 'activity' | 'accommodation';
}

const InspirationPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('trending');

  const inspirationItems: InspirationItem[] = [
    {
      id: '1',
      title: '7 Days in Santorini: A Complete Guide',
      description: 'Discover the magic of Santorini with this comprehensive 7-day itinerary covering all the must-see spots, hidden gems, and local experiences.',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=500&h=300&fit=crop',
      author: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        verified: true
      },
      location: 'Santorini, Greece',
      category: 'itinerary',
      tags: ['Romantic', 'Beach', 'Sunset', 'Photography'],
      likes: 1247,
      isLiked: false,
      isBookmarked: true,
      estimatedCost: 1200,
      duration: '7 days',
      difficulty: 'easy',
      type: 'itinerary'
    },
    {
      id: '2',
      title: 'Hidden Gems of Tokyo: Off the Beaten Path',
      description: 'Explore Tokyo beyond the tourist spots with these incredible hidden gems that locals love.',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&h=300&fit=crop',
      author: {
        name: 'Yuki Tanaka',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        verified: true
      },
      location: 'Tokyo, Japan',
      category: 'destination',
      tags: ['Culture', 'Food', 'Local', 'Adventure'],
      likes: 892,
      isLiked: true,
      isBookmarked: false,
      estimatedCost: 800,
      duration: '5 days',
      difficulty: 'medium',
      type: 'destination'
    },
    {
      id: '3',
      title: 'Bali Wellness Retreat: Mind, Body & Soul',
      description: 'Transform your life with this comprehensive wellness retreat in the heart of Bali\'s spiritual center.',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=500&h=300&fit=crop',
      author: {
        name: 'Maya Patel',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        verified: false
      },
      location: 'Ubud, Bali',
      category: 'activity',
      tags: ['Wellness', 'Yoga', 'Meditation', 'Nature'],
      likes: 654,
      isLiked: false,
      isBookmarked: true,
      estimatedCost: 600,
      duration: '10 days',
      difficulty: 'easy',
      type: 'activity'
    },
    {
      id: '4',
      title: 'Luxury Hotels in Paris: Where to Stay',
      description: 'Discover the most luxurious and charming hotels in Paris for an unforgettable stay in the City of Light.',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=500&h=300&fit=crop',
      author: {
        name: 'Pierre Dubois',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        verified: true
      },
      location: 'Paris, France',
      category: 'accommodation',
      tags: ['Luxury', 'Romantic', 'Historic', 'Fine Dining'],
      likes: 432,
      isLiked: true,
      isBookmarked: false,
      estimatedCost: 300,
      duration: '3 days',
      difficulty: 'easy',
      type: 'accommodation'
    },
    {
      id: '5',
      title: 'Road Trip Through New Zealand\'s South Island',
      description: 'An epic 14-day road trip covering the most stunning landscapes of New Zealand\'s South Island.',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      author: {
        name: 'Emma Wilson',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
        verified: true
      },
      location: 'South Island, New Zealand',
      category: 'itinerary',
      tags: ['Adventure', 'Nature', 'Road Trip', 'Photography'],
      likes: 1156,
      isLiked: false,
      isBookmarked: true,
      estimatedCost: 2000,
      duration: '14 days',
      difficulty: 'hard',
      type: 'itinerary'
    },
    {
      id: '6',
      title: 'Street Food Tour of Bangkok',
      description: 'Experience the authentic flavors of Bangkok through its vibrant street food scene.',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=300&fit=crop',
      author: {
        name: 'Chen Wei',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        verified: true
      },
      location: 'Bangkok, Thailand',
      category: 'activity',
      tags: ['Food', 'Culture', 'Local', 'Budget'],
      likes: 789,
      isLiked: true,
      isBookmarked: false,
      estimatedCost: 50,
      duration: '1 day',
      difficulty: 'easy',
      type: 'activity'
    }
  ];

  const categories = [
    { id: 'all', label: 'All', icon: Compass },
    { id: 'itinerary', label: 'Itineraries', icon: MapPin },
    { id: 'destination', label: 'Destinations', icon: Camera },
    { id: 'activity', label: 'Activities', icon: Plane },
    { id: 'accommodation', label: 'Hotels', icon: Hotel }
  ];

  const sortOptions = [
    { id: 'trending', label: 'Trending' },
    { id: 'newest', label: 'Newest' },
    { id: 'popular', label: 'Most Popular' },
    { id: 'cost-low', label: 'Cost: Low to High' },
    { id: 'cost-high', label: 'Cost: High to Low' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'itinerary': return <MapPin className="h-4 w-4" />;
      case 'destination': return <Camera className="h-4 w-4" />;
      case 'activity': return <Plane className="h-4 w-4" />;
      case 'accommodation': return <Hotel className="h-4 w-4" />;
      default: return <Compass className="h-4 w-4" />;
    }
  };

  const filteredItems = inspirationItems.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const toggleLike = (id: string) => {
    // In a real app, this would update the backend
    console.log('Toggle like for item:', id);
  };

  const toggleBookmark = (id: string) => {
    // In a real app, this would update the backend
    console.log('Toggle bookmark for item:', id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inspiration</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover amazing travel ideas and get inspired for your next adventure
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="h-4 w-4 inline mr-2" />
            Filters
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Share Your Story
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredItems.length} inspiration{filteredItems.length !== 1 ? 's' : ''} found
        </div>
        <div className="flex items-center space-x-4">
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

      {/* Inspiration Items */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow ${
              viewMode === 'list' ? 'flex' : ''
            }`}
          >
            {/* Image */}
            <div className={`relative ${viewMode === 'list' ? 'w-48 h-32' : 'h-48'}`}>
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-full">
                  {getTypeIcon(item.type)}
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {item.category}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                  {item.difficulty}
                </span>
              </div>
              <div className="absolute top-3 right-3 flex space-x-2">
                <button
                  onClick={() => toggleLike(item.id)}
                  className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      item.isLiked ? 'text-red-500 fill-current' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  />
                </button>
                <button
                  onClick={() => toggleBookmark(item.id)}
                  className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  <Bookmark
                    className={`h-4 w-4 ${
                      item.isBookmarked ? 'text-blue-500 fill-current' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {item.location}
                  </div>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {item.description}
              </p>

              {/* Author */}
              <div className="flex items-center space-x-2 mb-3">
                <img
                  src={item.author.avatar}
                  alt={item.author.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-900 dark:text-white">
                  {item.author.name}
                </span>
                {item.author.verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  • {item.likes} likes
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                    +{item.tags.length - 3} more
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${item.estimatedCost}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {item.duration}
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
          Load More Inspiration
        </button>
      </div>
    </div>
  );
};

export default InspirationPage;


