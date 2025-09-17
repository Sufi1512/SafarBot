import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { dashboardAPI, savedItineraryAPI } from '../services/cachedApi';
import { useAuth } from '../contexts/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardStats from '../components/DashboardStats';
import ChatsPage from './dashboard/ChatsPage';
import ExplorePage from './dashboard/ExplorePage';
import SavedPage from './dashboard/SavedPage';
import TripsPage from './dashboard/TripsPage';
import UpdatesPage from './dashboard/UpdatesPage';
import InspirationPage from './dashboard/InspirationPage';
import CreatePage from './dashboard/CreatePage';
import { 
  CalendarDays, 
  Plane,
  Plus,
  Search
} from 'lucide-react';

interface DashboardData {
  user_stats: {
    total_bookings: number;
    total_spent: number;
    confirmed_bookings: number;
    pending_bookings: number;
    cancelled_bookings: number;
    flight_bookings: number;
    hotel_bookings: number;
    upcoming_trips: number;
    loyalty_points: number;
    loyalty_tier: string;
  };
  recent_bookings: Array<{
    id: string;
    type: string;
    status: string;
    destination: string;
    departure_date: string;
    return_date?: string;
    total_cost: number;
  }>;
  upcoming_trips: Array<{
    id: string;
    destination: string;
    departure_date: string;
    return_date?: string;
    type: string;
  }>;
  saved_itineraries: Array<{
    id: string;
    title: string;
    destination: string;
    country: string;
    city: string;
    duration_days: number;
    budget?: number;
    total_estimated_cost?: number;
    travel_style: string[];
    interests: string[];
    is_favorite: boolean;
    status: string;
    cover_image?: string;
    views_count: number;
    likes_count: number;
    created_at: string;
  }>;
  price_alerts: Array<{
    id: string;
    destination: string;
    current_price: number;
    target_price: number;
    status: string;
    created_at: string;
  }>;
  notifications: Array<{
  id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
  }>;
  travel_analytics: {
    countries_visited: string[];
    cities_visited: string[];
    favorite_destinations: Array<{
  destination: string;
      visit_count: number;
    }>;
    spending_by_month: Array<{
      month: string;
      amount: number;
    }>;
  };
  session_analytics: {
    active_sessions: number;
    last_login: string;
    device_types: Array<{
      type: string;
      count: number;
    }>;
  };
}

const UserDashboard: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [, setItineraryStats] = useState<any>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [lastItineraryFetchTime, setLastItineraryFetchTime] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
      loadItineraries();
    }
  }, [isAuthenticated, user]);

  // Handle activeTab from navigation state
  useEffect(() => {
    const state = location.state as { activeTab?: string };
    if (state?.activeTab) {
      setActiveTab(state.activeTab);
    }
  }, [location.state]);

  const loadDashboardData = async (forceRefresh = false) => {
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
    const CACHE_KEY = 'dashboard_data';
    const TIMESTAMP_KEY = 'dashboard_timestamp';
    
    // Check localStorage cache first
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(TIMESTAMP_KEY);
      
      if (cachedData && cachedTimestamp) {
        const cacheTime = parseInt(cachedTimestamp);
        if (now - cacheTime < CACHE_DURATION) {
          setDashboardData(JSON.parse(cachedData));
          setLastFetchTime(cacheTime);
          setLoading(false);
          return;
        }
      }
    }

    // Check if we have in-memory cached data and it's still fresh
    if (!forceRefresh && dashboardData && (now - lastFetchTime) < CACHE_DURATION) {
      setLoading(false);
      return;
    }

    try {
      if (!forceRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      
      const data = await dashboardAPI.getDashboardData();
      setDashboardData(data as any);
      setLastFetchTime(now);
      
      // Cache in localStorage
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(TIMESTAMP_KEY, now.toString());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadItineraries = async (forceRefresh = false) => {
    const now = Date.now();
    const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes cache for itineraries
    const ITINERARIES_CACHE_KEY = 'itineraries_data';
    const ITINERARIES_TIMESTAMP_KEY = 'itineraries_timestamp';
    const STATS_CACHE_KEY = 'itinerary_stats';
    const STATS_TIMESTAMP_KEY = 'itinerary_stats_timestamp';
    
    // Check localStorage cache first
    if (!forceRefresh) {
      const cachedItineraries = localStorage.getItem(ITINERARIES_CACHE_KEY);
      const cachedItinerariesTimestamp = localStorage.getItem(ITINERARIES_TIMESTAMP_KEY);
      const cachedStats = localStorage.getItem(STATS_CACHE_KEY);
      const cachedStatsTimestamp = localStorage.getItem(STATS_TIMESTAMP_KEY);
      
      if (cachedItineraries && cachedItinerariesTimestamp && cachedStats && cachedStatsTimestamp) {
        const itinerariesCacheTime = parseInt(cachedItinerariesTimestamp);
        const statsCacheTime = parseInt(cachedStatsTimestamp);
        
        if (now - itinerariesCacheTime < CACHE_DURATION && now - statsCacheTime < CACHE_DURATION) {
          setItineraries(JSON.parse(cachedItineraries));
          setItineraryStats(JSON.parse(cachedStats));
          setLastItineraryFetchTime(Math.max(itinerariesCacheTime, statsCacheTime));
          return;
        }
      }
    }
    
    // Check if we have in-memory cached data and it's still fresh
    if (!forceRefresh && itineraries.length > 0 && (now - lastItineraryFetchTime) < CACHE_DURATION) {
      return;
    }

    try {
      const [itinerariesData, statsData] = await Promise.all([
        savedItineraryAPI.getItineraries({ limit: 20 }),
        savedItineraryAPI.getItineraryStats()
      ]);
      setItineraries(itinerariesData);
      setItineraryStats(statsData);
      setLastItineraryFetchTime(now);
      
      // Cache in localStorage
      localStorage.setItem(ITINERARIES_CACHE_KEY, JSON.stringify(itinerariesData));
      localStorage.setItem(ITINERARIES_TIMESTAMP_KEY, now.toString());
      localStorage.setItem(STATS_CACHE_KEY, JSON.stringify(statsData));
      localStorage.setItem(STATS_TIMESTAMP_KEY, now.toString());
    } catch (err: any) {
      console.error('Failed to load itineraries:', err.message);
    }
  };




  const handleTabChange = (tab: string) => {
    // Map 'dashboard' tab to 'overview' for consistency
    const mappedTab = tab === 'dashboard' ? 'overview' : tab;
    setActiveTab(mappedTab);
    // Only refresh data if switching to a tab that needs fresh data
    if (mappedTab === 'saved' || mappedTab === 'overview') {
      loadItineraries();
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleRefresh = async (forceRefresh?: boolean) => {
    await loadDashboardData(forceRefresh);
    await loadItineraries(forceRefresh);
  };

  const handleRefreshClick = () => {
    handleRefresh(true);
  };


  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/';
  };



  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="text-blue-500 text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => loadDashboardData(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { user_stats, recent_bookings, upcoming_trips, saved_itineraries } = dashboardData;


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex pt-16">
      {/* Sidebar */}
      <DashboardSidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        isExpanded={isSidebarExpanded}
        onToggleExpanded={handleToggleSidebar}
      />

      {/* Main Content */}
      <div 
        className={`flex-1 flex flex-col ${isSidebarExpanded ? 'ml-64' : 'ml-16'} transition-all duration-300 ease-in-out`}
        onClick={() => {
          console.log('Main content clicked');
        }}
      >
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Enhanced Header Bar */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">
                      {activeTab === 'overview' ? '📊' : 
                       activeTab === 'saved' ? '💾' : 
                       activeTab === 'chats' ? '💬' :
                       activeTab === 'explore' ? '🌍' :
                       activeTab === 'trips' ? '✈️' :
                       activeTab === 'updates' ? '📰' :
                       activeTab === 'inspiration' ? '✨' :
                       activeTab === 'create' ? '➕' : '🏠'}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {activeTab === 'overview' ? 'Dashboard Overview' : 
                       activeTab === 'saved' ? 'Saved Itineraries' : 
                       activeTab === 'chats' ? 'Chats' :
                       activeTab === 'explore' ? 'Explore' :
                       activeTab === 'trips' ? 'Trips' :
                       activeTab === 'updates' ? 'Updates' :
                       activeTab === 'inspiration' ? 'Inspiration' :
                       activeTab === 'create' ? 'Create' : 'Dashboard'}
                    </h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {activeTab === 'overview' ? 'Your travel dashboard and analytics' : 
                       activeTab === 'saved' ? 'Manage your saved travel plans' : 
                       activeTab === 'chats' ? 'Chat with SafarBot for travel assistance' :
                       activeTab === 'explore' ? 'Discover new destinations and experiences' :
                       activeTab === 'trips' ? 'View and manage your trips' :
                       activeTab === 'updates' ? 'Stay updated with travel news and alerts' :
                       activeTab === 'inspiration' ? 'Get inspired for your next adventure' :
                       activeTab === 'create' ? 'Create new travel plans and itineraries' : 'Welcome to your dashboard'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefreshClick}
                  disabled={isRefreshing}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isRefreshing ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span className="text-xs font-medium">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
                
                {/* Quick Actions */}
                {activeTab === 'overview' && (
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleTabChange('create')}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all duration-200 flex items-center space-x-1.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="text-xs font-medium">New Trip</span>
                    </button>
                    <button
                      onClick={() => handleTabChange('explore')}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-200 flex items-center space-x-1.5"
                    >
                      <Search className="w-3 h-3" />
                      <span className="text-xs font-medium">Explore</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="p-4">
          {/* Overview Tab */}
        {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Section */}
              
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Welcome back, {user?.first_name || 'Traveler'}! 👋</h2>
                    <p className="text-black-100 text-sm">Ready for your next adventure? Let's explore the world together.</p>
                  </div>
                  {/* <div className="hidden md:flex items-center space-x-3">
                    <button
                      onClick={() => handleTabChange('create')}
                      className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center space-x-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-medium">Plan New Trip</span>
                    </button>
                    <button
                      onClick={() => handleTabChange('explore')}
                      className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center space-x-1.5"
                    >
                      <Search className="w-4 h-4" />
                      <span className="text-sm font-medium">Explore</span>
                    </button>
                  </div> */}
                </div>
              

              {/* Stats Overview */}
              <DashboardStats 
                userStats={user_stats} 
                itineraryStats={{
                  total_itineraries: saved_itineraries.length,
                  published_itineraries: saved_itineraries.filter(i => i.status === 'published').length,
                  favorite_itineraries: saved_itineraries.filter(i => i.is_favorite).length,
                  draft_itineraries: saved_itineraries.filter(i => i.status === 'draft').length,
                  total_views: saved_itineraries.reduce((sum, i) => sum + (i.views_count || 0), 0)
                }} 
              />

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Bookings */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <Plane className="w-6 h-6 text-blue-600" />
                        <span>Recent Bookings</span>
                      </h3>
                      <button
                        onClick={() => handleTabChange('trips')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    {recent_bookings.length > 0 ? (
                      <div className="space-y-4">
                        {recent_bookings.slice(0, 3).map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl hover:shadow-md transition-all duration-200">
                            <div className="flex items-center space-x-4">
                              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                <Plane className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{booking.destination}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{booking.departure_date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900 dark:text-white">${booking.total_cost}</p>
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Plane className="h-10 w-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">No recent bookings</p>
                        <button
                          onClick={() => handleTabChange('create')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Plan Your First Trip
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming Trips */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <CalendarDays className="w-6 h-6 text-green-600" />
                        <span>Upcoming Trips</span>
                      </h3>
                      <button
                        onClick={() => handleTabChange('trips')}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    {upcoming_trips.length > 0 ? (
                      <div className="space-y-4">
                        {upcoming_trips.slice(0, 3).map((trip) => (
                          <div key={trip.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 dark:from-gray-700 dark:to-gray-600 rounded-xl hover:shadow-md transition-all duration-200">
                            <div className="flex items-center space-x-4">
                              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                <CalendarDays className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{trip.destination}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{trip.departure_date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{trip.type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CalendarDays className="h-10 w-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">No upcoming trips</p>
                        <button
                          onClick={() => handleTabChange('create')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Plan Your Next Trip
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <button
                  onClick={() => handleTabChange('create')}
                  className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Plus className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg">Create Trip</h3>
                  </div>
                  <p className="text-blue-100 text-sm">Plan your next adventure with AI assistance</p>
                </button>

                <button
                  onClick={() => handleTabChange('explore')}
                  className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg">Explore</h3>
                  </div>
                  <p className="text-purple-100 text-sm">Discover amazing destinations worldwide</p>
                </button>

                <button
                  onClick={() => handleTabChange('saved')}
                  className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-lg">💾</span>
                    </div>
                    <h3 className="font-bold text-lg">Saved Trips</h3>
                  </div>
                  <p className="text-green-100 text-sm">Manage your saved itineraries</p>
                </button>

                <button
                  onClick={() => handleTabChange('chats')}
                  className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl text-white hover:from-pink-600 hover:to-pink-700 transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-lg">💬</span>
                    </div>
                    <h3 className="font-bold text-lg">Chat</h3>
                  </div>
                  <p className="text-pink-100 text-sm">Get travel advice from SafarBot</p>
                </button>
              </div>
            </div>
          )}

          {/* Saved Itineraries Tab */}
          {activeTab === 'saved' && <SavedPage />}

          {/* Other Tabs - Actual Page Content */}
          {activeTab === 'chats' && <ChatsPage />}
          {activeTab === 'explore' && <ExplorePage />}
          {activeTab === 'trips' && <TripsPage />}
          {activeTab === 'updates' && <UpdatesPage />}
          {activeTab === 'inspiration' && <InspirationPage />}
          {activeTab === 'create' && <CreatePage />}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default UserDashboard; 