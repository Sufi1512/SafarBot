import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  CreditCardIcon,
  UserIcon,
  HeartIcon,
  PaperAirplaneIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import PageHeader from '../components/PageHeader';
import ModernCard from '../components/ui/ModernCard';
import ModernButton from '../components/ui/ModernButton';
import { useAuth } from '../contexts/AuthContext';

interface Booking {
  id: string;
  type: 'flight' | 'hotel' | 'package';
  title: string;
  destination: string;
  date: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  price: number;
  image: string;
}

interface SavedTrip {
  id: string;
  title: string;
  destination: string;
  savedDate: string;
  image: string;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual API calls
  const upcomingBookings: Booking[] = [
    {
      id: '1',
      type: 'flight',
      title: 'Flight to Paris',
      destination: 'Paris, France',
      date: '2024-02-15',
      status: 'upcoming',
      price: 899,
      image: 'https://images.unsplash.com/photo-1502602898535-eb37b0b6d7c3?w=400&h=300&fit=crop'
    },
    {
      id: '2',
      type: 'hotel',
      title: 'Hotel Booking',
      destination: 'Paris, France',
      date: '2024-02-15',
      status: 'upcoming',
      price: 450,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'
    }
  ];

  const savedTrips: SavedTrip[] = [
    {
      id: '1',
      title: 'Tokyo Adventure',
      destination: 'Tokyo, Japan',
      savedDate: '2024-01-20',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop'
    },
    {
      id: '2',
      title: 'Bali Paradise',
      destination: 'Bali, Indonesia',
      savedDate: '2024-01-15',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop'
    }
  ];

  const stats = [
    { label: 'Total Bookings', value: '12', icon: DocumentTextIcon, color: 'blue' },
    { label: 'Upcoming Trips', value: '3', icon: CalendarIcon, color: 'green' },
    { label: 'Saved Destinations', value: '8', icon: HeartIcon, color: 'pink' },
    { label: 'Total Spent', value: '$2,450', icon: CreditCardIcon, color: 'purple' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'bookings', label: 'My Bookings', icon: DocumentTextIcon },
    { id: 'saved', label: 'Saved Trips', icon: HeartIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'completed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flight': return PaperAirplaneIcon;
      case 'hotel': return BuildingOfficeIcon;
      default: return DocumentTextIcon;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <PageHeader
        title={`Welcome back, ${user?.first_name || 'Traveler'}!`}
        description="Manage your bookings, explore saved destinations, and plan your next adventure."
      >
        <ModernButton
          variant="primary"
          size="lg"
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          New Booking
        </ModernButton>
      </PageHeader>

      <div className="container-chisfis py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ModernCard className="p-6 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </div>
              </ModernCard>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-soft mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Upcoming Bookings */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Upcoming Bookings
                    </h3>
                    <Link
                      to="/bookings"
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium flex items-center gap-1"
                    >
                      View all
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingBookings.map((booking) => {
                      const TypeIcon = getTypeIcon(booking.type);
                      return (
                        <ModernCard key={booking.id} className="p-6 hover-lift">
                          <div className="flex items-start gap-4">
                            <img
                              src={booking.image}
                              alt={booking.title}
                              className="w-16 h-16 rounded-xl object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <TypeIcon className="h-4 w-4 text-gray-500" />
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {booking.title}
                                </h4>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {booking.destination}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <CalendarIcon className="h-4 w-4" />
                                    {new Date(booking.date).toLocaleDateString()}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                    {booking.status}
                                  </span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  ${booking.price}
                                </span>
                              </div>
                            </div>
                          </div>
                        </ModernCard>
                      );
                    })}
                  </div>
                </div>

                {/* Saved Trips */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Saved Trips
                    </h3>
                    <Link
                      to="/saved-trips"
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium flex items-center gap-1"
                    >
                      View all
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savedTrips.map((trip) => (
                      <ModernCard key={trip.id} className="p-6 hover-lift">
                        <div className="flex items-start gap-4">
                          <img
                            src={trip.image}
                            alt={trip.title}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {trip.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {trip.destination}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                Saved {new Date(trip.savedDate).toLocaleDateString()}
                              </span>
                              <ModernButton variant="outline" size="sm">
                                Plan Trip
                              </ModernButton>
                            </div>
                          </div>
                        </div>
                      </ModernCard>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  All Bookings
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  View and manage all your travel bookings in one place.
                </p>
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="text-center py-12">
                <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Saved Destinations
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Your saved destinations and travel inspiration.
                </p>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="text-center py-12">
                <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Profile Settings
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Manage your account settings and preferences.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 