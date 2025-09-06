import React, { useState } from 'react';
import { Plus, MapPin, Calendar, Users, DollarSign, Plane, Hotel, Car, Camera, FileText, Share2, Save, Eye } from 'lucide-react';

interface CreateOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  category: 'trip' | 'itinerary' | 'booking' | 'content';
  features: string[];
  estimatedTime: string;
}

const CreatePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<CreateOption | null>(null);

  const createOptions: CreateOption[] = [
    {
      id: '1',
      title: 'Plan a New Trip',
      description: 'Create a complete travel itinerary with flights, hotels, and activities',
      icon: MapPin,
      color: 'bg-blue-500',
      category: 'trip',
      features: ['Flight booking', 'Hotel reservations', 'Activity planning', 'Budget tracking'],
      estimatedTime: '15-30 min'
    },
    {
      id: '2',
      title: 'Custom Itinerary',
      description: 'Design a detailed day-by-day travel plan for your destination',
      icon: Calendar,
      color: 'bg-green-500',
      category: 'itinerary',
      features: ['Day-by-day planning', 'Time management', 'Location mapping', 'Transportation'],
      estimatedTime: '10-20 min'
    },
    {
      id: '3',
      title: 'Flight Booking',
      description: 'Search and book flights with real-time pricing and availability',
      icon: Plane,
      color: 'bg-purple-500',
      category: 'booking',
      features: ['Price comparison', 'Seat selection', 'Baggage options', 'Meal preferences'],
      estimatedTime: '5-10 min'
    },
    {
      id: '4',
      title: 'Hotel Reservation',
      description: 'Find and book the perfect accommodation for your stay',
      icon: Hotel,
      color: 'bg-orange-500',
      category: 'booking',
      features: ['Location search', 'Amenities filter', 'Reviews & ratings', 'Best price guarantee'],
      estimatedTime: '5-15 min'
    },
    {
      id: '5',
      title: 'Car Rental',
      description: 'Rent a car for your trip with flexible pickup and drop-off options',
      icon: Car,
      color: 'bg-red-500',
      category: 'booking',
      features: ['Vehicle selection', 'Insurance options', 'Pickup locations', 'Return flexibility'],
      estimatedTime: '3-8 min'
    },
    {
      id: '6',
      title: 'Travel Journal',
      description: 'Document your travel experiences with photos, notes, and memories',
      icon: Camera,
      color: 'bg-pink-500',
      category: 'content',
      features: ['Photo uploads', 'Text notes', 'Location tagging', 'Memory sharing'],
      estimatedTime: '2-5 min'
    },
    {
      id: '7',
      title: 'Share Your Story',
      description: 'Create and share travel content to inspire other travelers',
      icon: Share2,
      color: 'bg-indigo-500',
      category: 'content',
      features: ['Story creation', 'Photo galleries', 'Travel tips', 'Community sharing'],
      estimatedTime: '10-25 min'
    },
    {
      id: '8',
      title: 'Travel Checklist',
      description: 'Create a personalized checklist for your upcoming trip',
      icon: FileText,
      color: 'bg-teal-500',
      category: 'trip',
      features: ['Custom items', 'Progress tracking', 'Reminders', 'Sharing options'],
      estimatedTime: '5-10 min'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Options' },
    { id: 'trip', label: 'Trip Planning' },
    { id: 'itinerary', label: 'Itineraries' },
    { id: 'booking', label: 'Bookings' },
    { id: 'content', label: 'Content' }
  ];

  const filteredOptions = createOptions.filter(option => {
    if (selectedCategory === 'all') return true;
    return option.category === selectedCategory;
  });

  const handleCreateClick = (option: CreateOption) => {
    setSelectedOption(option);
    setShowCreateModal(true);
  };

  const handleCreateConfirm = () => {
    // In a real app, this would navigate to the appropriate creation flow
    console.log('Creating:', selectedOption?.title);
    setShowCreateModal(false);
    setSelectedOption(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create Something Amazing
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose what you'd like to create and we'll guide you through the process step by step
        </p>
      </div>

      {/* Categories */}
      <div className="flex justify-center">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => handleCreateClick(option)}
            >
              <div className="text-center">
                <div className={`w-16 h-16 ${option.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {option.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {option.description}
                </p>
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Estimated time: {option.estimatedTime}
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {option.features.slice(0, 2).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                    {option.features.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                        +{option.features.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Plus className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Start from Scratch</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Begin with a blank canvas</div>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Browse Templates</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Use pre-made templates</div>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <Share2 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Import from Others</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Copy from shared content</div>
            </div>
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && selectedOption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 ${selectedOption.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <selectedOption.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {selectedOption.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedOption.description}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Features included:</h4>
                <ul className="space-y-1">
                  {selectedOption.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Estimated time: {selectedOption.estimatedTime}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateConfirm}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Creating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePage;


