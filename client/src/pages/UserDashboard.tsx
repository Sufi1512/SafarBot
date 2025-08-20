import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plane, 
  Hotel, 
  MapPin, 
  Calendar, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut,
  Plus,
  Search,
  Filter,
  Star,
  Clock,
  TrendingUp,
  Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';

interface Booking {
  id: string;
  type: 'flight' | 'hotel';
  destination: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: number;
  image: string;
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      type: 'flight',
      destination: 'Paris, France',
      date: '2024-02-15',
      status: 'confirmed',
      price: 899,
      image: 'https://images.unsplash.com/photo-1502602898535-eb37b0b6d7c3?w=400&h=300&fit=crop'
    },
    {
      id: '2',
      type: 'hotel',
      destination: 'Tokyo, Japan',
      date: '2024-03-20',
      status: 'pending',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop'
    },
    {
      id: '3',
      type: 'flight',
      destination: 'New York, USA',
      date: '2024-04-10',
      status: 'confirmed',
      price: 699,
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop'
    }
  ]);

  const stats = [
    { label: 'Total Bookings', value: '12', icon: Plane, color: 'from-blue-500 to-blue-600' },
    { label: 'Active Trips', value: '3', icon: MapPin, color: 'from-green-500 to-green-600' },
    { label: 'Total Spent', value: '$4,250', icon: CreditCard, color: 'from-purple-500 to-purple-600' },
    { label: 'Reward Points', value: '2,450', icon: Star, color: 'from-yellow-500 to-yellow-600' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return '✓';
      case 'pending': return '⏳';
      case 'cancelled': return '✗';
      default: return '?';
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <ModernButton
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="border-gray-300 dark:border-gray-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Booking
              </ModernButton>
              
              <ModernButton
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 dark:text-gray-400 hover:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </ModernButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <ModernCard variant="glass" padding="lg" className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.first_name || 'Traveler'}! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Ready for your next adventure? Let's explore the world together.
            </p>
          </ModernCard>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
            >
              <ModernCard variant="elevated" padding="lg" className="text-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</div>
              </ModernCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-xl p-1 mb-8">
          {['overview', 'bookings', 'trips', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Recent Bookings */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Bookings</h3>
                <ModernButton
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('bookings')}
                >
                  View All
                </ModernButton>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.slice(0, 3).map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <ModernCard variant="interactive" padding="none" hover className="overflow-hidden">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={booking.image}
                          alt={booking.destination}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Status Badge */}
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)} {booking.status}
                        </div>
                        
                        {/* Type Icon */}
                        <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                          {booking.type === 'flight' ? (
                            <Plane className="w-4 h-4 text-white" />
                          ) : (
                            <Hotel className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {booking.destination}
                        </h4>
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(booking.date).toLocaleDateString()}
                          </div>
                          <div className="font-semibold text-primary-600">
                            ${booking.price}
                          </div>
                        </div>
                        
                        <ModernButton
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => navigate(`/booking-details/${booking.id}`)}
                        >
                          View Details
                        </ModernButton>
                      </div>
                    </ModernCard>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ModernCard variant="interactive" padding="lg" className="text-center cursor-pointer" onClick={() => navigate('/flights')}>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Plane className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Book Flight</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Find and book your next flight</p>
                </ModernCard>
                
                <ModernCard variant="interactive" padding="lg" className="text-center cursor-pointer" onClick={() => navigate('/hotels')}>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Hotel className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Book Hotel</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Find the perfect place to stay</p>
                </ModernCard>
                
                <ModernCard variant="interactive" padding="lg" className="text-center cursor-pointer" onClick={() => navigate('/search')}>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Explore</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Discover new destinations</p>
                </ModernCard>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">All Bookings</h3>
              <div className="flex space-x-3">
                <ModernButton variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </ModernButton>
                <ModernButton variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </ModernButton>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ModernCard variant="interactive" padding="none" hover className="overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={booking.image}
                        alt={booking.destination}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Status Badge */}
                      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)} {booking.status}
                      </div>
                      
                      {/* Type Icon */}
                      <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                        {booking.type === 'flight' ? (
                          <Plane className="w-4 h-4 text-white" />
                        ) : (
                          <Hotel className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {booking.destination}
                      </h4>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="font-semibold text-primary-600">
                          ${booking.price}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <ModernButton
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/booking-details/${booking.id}`)}
                        >
                          View Details
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
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'trips' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Active Trips</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have any active trips at the moment. Start planning your next adventure!
            </p>
            <ModernButton
              variant="gradient"
              size="lg"
              onClick={() => navigate('/')}
            >
              Plan Your Trip
            </ModernButton>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Settings className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Account settings and preferences will be available here soon.
            </p>
            <ModernButton
              variant="outline"
              size="lg"
              disabled
            >
              Coming Soon
            </ModernButton>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard; 