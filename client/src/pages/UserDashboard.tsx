import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Bell, 
  
  Settings, 
  LogOut, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plane,
  Menu,
  X
} from 'lucide-react';
import { alertsAPI } from '../services/api';

interface SavedTrip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'planned' | 'booked' | 'completed' | 'cancelled';
  totalCost?: number;
  imageUrl?: string;
  createdAt: string;
}

interface PriceAlert {
  id: string;
  destination: string;
  current_price: number;
  target_price: number;
  alert_type: 'flight' | 'hotel';
  status: 'active' | 'inactive' | 'triggered';
  is_active: boolean;
  created_at: string;
  last_checked: string;
  next_check: string;
  check_in_date?: string;
  check_out_date?: string;
  departure_date?: string;
  return_date?: string;
  passengers?: number;
  guests?: number;
}

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  preferences: {
    budgetRange: string;
    travelStyle: string[];
    preferredAirlines: string[];
    preferredHotels: string[];
  };
  stats: {
    totalTrips: number;
    totalSpent: number;
    averageRating: number;
    favoriteDestinations: string[];
  };
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'alerts' | 'profile'>('overview');
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load price alerts from API
      const alertsResponse = await alertsAPI.getAlerts();
      if (alertsResponse.success && alertsResponse.data) {
        setPriceAlerts(alertsResponse.data);
      }

      // Load affiliate stats
      // const affiliateStatsResponse = await affiliateAPI.getStats();
      
      // Load alert statistics
      // const alertStatsResponse = await alertsAPI.getAlertStats();
      
      // For now, keep mock data for trips and profile until we have those endpoints
      loadMockData();
      
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      // Fallback to mock data
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    // Mock saved trips
    const mockTrips: SavedTrip[] = [
      {
        id: '1',
        destination: 'Dubai, UAE',
        startDate: '2024-03-15',
        endDate: '2024-03-20',
        budget: 2000,
        status: 'booked',
        totalCost: 1850,
        imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        destination: 'Tokyo, Japan',
        startDate: '2024-05-10',
        endDate: '2024-05-17',
        budget: 3000,
        status: 'planned',
        imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
        createdAt: '2024-02-01'
      },
      {
        id: '3',
        destination: 'Paris, France',
        startDate: '2024-07-20',
        endDate: '2024-07-25',
        budget: 2500,
        status: 'completed',
        totalCost: 2300,
        imageUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400',
        createdAt: '2024-01-10'
      }
    ];

    // Create user profile from auth context
    const mockProfile: UserProfile = {
      name: user ? `${user.firstName} ${user.lastName}` : 'User',
      email: user?.email || 'user@example.com',
      phone: user?.phone || '+1-555-0123',
      preferences: {
        budgetRange: '$1000-$3000',
        travelStyle: ['Adventure', 'Cultural', 'Luxury'],
        preferredAirlines: ['Emirates', 'Qatar Airways', 'Turkish Airlines'],
        preferredHotels: ['Marriott', 'Hilton', 'Hyatt']
      },
      stats: {
        totalTrips: 8,
        totalSpent: 18500,
        averageRating: 4.6,
        favoriteDestinations: ['Dubai', 'Tokyo', 'Paris', 'Istanbul']
      }
    };

    setSavedTrips(mockTrips);
    setUserProfile(mockProfile);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'text-green-500 bg-green-100';
      case 'planned': return 'text-blue-500 bg-blue-100';
      case 'completed': return 'text-gray-500 bg-gray-100';
      case 'cancelled': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'booked': return <CheckCircle className="w-4 h-4" />;
      case 'planned': return <Clock className="w-4 h-4" />;
      case 'completed': return <Star className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleCreateNewTrip = () => {
    navigate('/');
  };

  const handleEditTrip = (tripId: string) => {
    // Navigate to trip editing page
    console.log('Edit trip:', tripId);
  };

  const handleDeleteTrip = (tripId: string) => {
    setSavedTrips(prev => prev.filter(trip => trip.id !== tripId));
  };

  const handleToggleAlert = async (alertId: string) => {
    try {
      const response = await alertsAPI.toggleAlert(alertId);
      if (response.success) {
        setPriceAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId 
              ? { ...alert, is_active: !alert.is_active }
              : alert
          )
        );
      }
    } catch (err: any) {
      console.error('Error toggling alert:', err);
      setError(err.message || 'Failed to toggle alert');
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const response = await alertsAPI.deleteAlert(alertId);
      if (response.success) {
        setPriceAlerts(prev => prev.filter(alert => alert.id !== alertId));
      }
    } catch (err: any) {
      console.error('Error deleting alert:', err);
      setError(err.message || 'Failed to delete alert');
    }
  };

  const handleCreateAlert = () => {
    // Navigate to alert creation page or open modal
    console.log('Create new alert');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="particles">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      {/* Header - Matching HomePage styling */}
      <header className="glass-dark sticky top-0 z-50 border-b border-white/10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Left side - Logo and Name */}
            <div className="flex items-center space-x-1">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center pulse-glow">
                <Plane className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">SafarBot</h1>
            </div>
            
            {/* Right side - Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => navigate('/')}
                className="nav-link hover:text-blue-400 transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => navigate('/flights')}
                className="nav-link hover:text-blue-400 transition-colors"
              >
                Flights
              </button>
              <button 
                onClick={() => navigate('/hotels')}
                className="nav-link hover:text-blue-400 transition-colors"
              >
                Hotels
              </button>
              <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={logout}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </nav>

            {/* Right side - Mobile menu button */}
            <button
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-white/10 slide-in-left">
              <div className="flex flex-col space-y-4">
                <button 
                  onClick={() => {
                    navigate('/');
                    setMobileMenuOpen(false);
                  }}
                  className="nav-link hover:text-blue-400 transition-colors text-left"
                >
                  Home
                </button>
                <button 
                  onClick={() => {
                    navigate('/flights');
                    setMobileMenuOpen(false);
                  }}
                  className="nav-link hover:text-blue-400 transition-colors text-left"
                >
                  Flights
                </button>
                <button 
                  onClick={() => {
                    navigate('/hotels');
                    setMobileMenuOpen(false);
                  }}
                  className="nav-link hover:text-blue-400 transition-colors text-left"
                >
                  Hotels
                </button>
                <div className="flex space-x-2 pt-2">
                  <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <Bell className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={logout}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* User Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {userProfile?.name}!</h1>
              <p className="text-gray-300">Manage your trips, alerts, and preferences</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-lg p-1 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'trips', label: 'My Trips', icon: <MapPin className="w-4 h-4" /> },
            { id: 'alerts', label: 'Price Alerts', icon: <Bell className="w-4 h-4" /> },
            { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card-3d">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Total Trips</p>
                    <p className="text-2xl font-bold">{userProfile?.stats.totalTrips}</p>
                  </div>
                  <MapPin className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <div className="card-3d">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Total Spent</p>
                    <p className="text-2xl font-bold">${userProfile?.stats.totalSpent.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div className="card-3d">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Avg Rating</p>
                    <p className="text-2xl font-bold">{userProfile?.stats.averageRating}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <div className="card-3d">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Active Alerts</p>
                    <p className="text-2xl font-bold">{priceAlerts.filter(a => a.is_active).length}</p>
                  </div>
                  <Bell className="w-8 h-8 text-red-400" />
                </div>
              </div>
            </div>

            {/* Recent Trips */}
            <div className="card-3d">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Trips</h2>
                <button
                  onClick={handleCreateNewTrip}
                  className="btn-primary px-4 py-2 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Trip</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedTrips.slice(0, 3).map((trip) => (
                  <div key={trip.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{trip.destination}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${getStatusColor(trip.status)}`}>
                        {getStatusIcon(trip.status)}
                        <span>{trip.status}</span>
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm">Budget: ${trip.budget.toLocaleString()}</p>
                    {trip.totalCost && (
                      <p className="text-sm text-green-400">Spent: ${trip.totalCost.toLocaleString()}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Favorite Destinations */}
            <div className="card-3d">
              <h2 className="text-xl font-semibold mb-4">Favorite Destinations</h2>
              <div className="flex flex-wrap gap-2">
                {userProfile?.stats.favoriteDestinations.map((dest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-sm"
                  >
                    {dest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Trips</h2>
              <button
                onClick={handleCreateNewTrip}
                className="btn-primary px-4 py-2 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Plan New Trip</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTrips.map((trip) => (
                <div key={trip.id} className="card-3d overflow-hidden">
                  {trip.imageUrl && (
                    <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${trip.imageUrl})` }} />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">{trip.destination}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${getStatusColor(trip.status)}`}>
                        {getStatusIcon(trip.status)}
                        <span>{trip.status}</span>
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-gray-300 text-sm">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm">
                        <DollarSign className="w-4 h-4 inline mr-2" />
                        Budget: ${trip.budget.toLocaleString()}
                      </p>
                      {trip.totalCost && (
                        <p className="text-sm text-green-400">
                          <DollarSign className="w-4 h-4 inline mr-2" />
                          Spent: ${trip.totalCost.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTrip(trip.id)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleEditTrip(trip.id)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Price Alerts</h2>
              <button 
                onClick={handleCreateAlert}
                className="btn-primary px-4 py-2 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Alert</span>
              </button>
            </div>

            <div className="card-3d overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Destination
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Current Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Target Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {priceAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium">{alert.destination}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            alert.alert_type === 'flight' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {alert.alert_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          ${alert.current_price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          ${alert.target_price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleAlert(alert.id)}
                            className={`px-2 py-1 rounded-full text-xs ${
                              alert.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {alert.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && userProfile && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Profile Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="card-3d">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={userProfile.name}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={userProfile.email}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={userProfile.phone || ''}
                      className="input-field w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Travel Preferences */}
              <div className="card-3d">
                <h3 className="text-lg font-semibold mb-4">Travel Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Budget Range</label>
                    <select className="input-field w-full">
                      <option value={userProfile.preferences.budgetRange}>{userProfile.preferences.budgetRange}</option>
                      <option value="$500-$1000">$500-$1000</option>
                      <option value="$1000-$3000">$1000-$3000</option>
                      <option value="$3000-$5000">$3000-$5000</option>
                      <option value="$5000+">$5000+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Travel Style</label>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.preferences.travelStyle.map((style, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-sm"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="card-3d">
              <h3 className="text-lg font-semibold mb-4">Travel Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{userProfile.stats.totalTrips}</p>
                  <p className="text-sm text-gray-300">Total Trips</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">${userProfile.stats.totalSpent.toLocaleString()}</p>
                  <p className="text-sm text-gray-300">Total Spent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{userProfile.stats.averageRating}</p>
                  <p className="text-sm text-gray-300">Avg Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{userProfile.stats.favoriteDestinations.length}</p>
                  <p className="text-sm text-gray-300">Favorites</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard; 