import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { dashboardAPI, savedItineraryAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardStats from '../components/DashboardStats';
import Footer from '../components/Footer';
import ChatsPage from './dashboard/ChatsPage';
import ExplorePage from './dashboard/ExplorePage';
import SavedPage from './dashboard/SavedPage';
import TripsPage from './dashboard/TripsPage';
import UpdatesPage from './dashboard/UpdatesPage';
import InspirationPage from './dashboard/InspirationPage';
import CreatePage from './dashboard/CreatePage';
import { 
  CalendarDays, 
  Plane
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
  const [itineraryStats, setItineraryStats] = useState<any>(null);
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
      setDashboardData(data);
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
    setActiveTab(tab);
    // Only refresh data if switching to a tab that needs fresh data
    if (tab === 'saved' || tab === 'overview') {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex pt-16">
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
          {/* Header Bar */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeTab === 'overview' ? 'Dashboard Overview' : 
                   activeTab === 'saved' ? 'Saved Itineraries' : 
                   activeTab === 'chats' ? 'Chats' :
                   activeTab === 'explore' ? 'Explore' :
                   activeTab === 'trips' ? 'Trips' :
                   activeTab === 'updates' ? 'Updates' :
                   activeTab === 'inspiration' ? 'Inspiration' :
                   activeTab === 'create' ? 'Create' : 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
              <button
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-sm"
              >
                {isRefreshing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                <span className="text-sm font-medium">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="p-6">
          {/* Overview Tab */}
        {activeTab === 'overview' && (
            <div className="space-y-8">
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
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              </div>
                  <div className="p-6">
                    {recent_bookings.length > 0 ? (
                      <div className="space-y-4">
                        {recent_bookings.map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Plane className="h-5 w-5 text-blue-600" />
                        </div>
                              <div>
                                <p className="font-medium text-gray-900">{booking.destination}</p>
                                <p className="text-sm text-gray-600">{booking.departure_date}</p>
                        </div>
                      </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">${booking.total_cost}</p>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status}
                              </span>
                          </div>
                          </div>
                        ))}
                        </div>
                    ) : (
                      <div className="text-center py-8">
                        <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No recent bookings</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming Trips */}
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Upcoming Trips</h3>
                  </div>
                  <div className="p-6">
                    {upcoming_trips.length > 0 ? (
                      <div className="space-y-4">
                        {upcoming_trips.map((trip) => (
                          <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <CalendarDays className="h-5 w-5 text-green-600" />
                  </div>
                              <div>
                                <p className="font-medium text-gray-900">{trip.destination}</p>
                                <p className="text-sm text-gray-600">{trip.departure_date}</p>
              </div>
            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">{trip.type}</p>
              </div>
            </div>
                        ))}
                      </div>
                        ) : (
                      <div className="text-center py-8">
                        <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No upcoming trips</p>
                      </div>
                    )}
                        </div>
                      </div>
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
        
        {/* Footer - Adjusted for sidebar */}
        <div className={`${isSidebarExpanded ? 'ml-64' : 'ml-16'} transition-all duration-300 ease-in-out`}>
          <Footer disableCentering={true} />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 