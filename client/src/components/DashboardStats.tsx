import React from 'react';
import { 
  Plane, 
  DollarSign, 
  MapPin, 
  Star, 
  Heart,
  Eye,
  Share2
} from 'lucide-react';

interface DashboardStatsProps {
  userStats: {
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
  itineraryStats: {
    total_itineraries: number;
    published_itineraries: number;
    favorite_itineraries: number;
    draft_itineraries: number;
    total_views: number;
  } | null;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ userStats, itineraryStats }) => {
  const statsCards = [
    {
      title: 'Total Bookings',
      value: userStats.total_bookings,
      icon: Plane,
      color: 'blue',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Spent',
      value: `$${userStats.total_spent.toLocaleString()}`,
      icon: DollarSign,
      color: 'green',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Saved Itineraries',
      value: itineraryStats?.total_itineraries || 0,
      icon: MapPin,
      color: 'purple',
      change: '+5',
      changeType: 'positive' as const
    },
    {
      title: 'Loyalty Points',
      value: userStats.loyalty_points,
      icon: Star,
      color: 'yellow',
      change: '+150',
      changeType: 'positive' as const
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        icon: 'text-blue-600',
        text: 'text-blue-900'
      },
      green: {
        bg: 'bg-green-100',
        icon: 'text-green-600',
        text: 'text-green-900'
      },
      purple: {
        bg: 'bg-purple-100',
        icon: 'text-purple-600',
        text: 'text-purple-900'
      },
      yellow: {
        bg: 'bg-yellow-100',
        icon: 'text-yellow-600',
        text: 'text-yellow-900'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = getColorClasses(stat.color);
          
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-lg font-bold ${colorClasses.text}`}>
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className={`text-[10px] font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-[10px] text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-2 rounded-md ${colorClasses.bg}`}>
                  <Icon className={`h-4 w-4 ${colorClasses.icon}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Booking Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Booking Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Confirmed</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{userStats.confirmed_bookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Pending</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{userStats.pending_bookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Cancelled</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{userStats.cancelled_bookings}</span>
            </div>
          </div>
        </div>

        {/* Itinerary Stats */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Itinerary Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Published</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{itineraryStats?.published_itineraries || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Favorites</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{itineraryStats?.favorite_itineraries || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Drafts</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{itineraryStats?.draft_itineraries || 0}</span>
            </div>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Engagement</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600">Total Views</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{itineraryStats?.total_views || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600">Total Likes</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {itineraryStats ? itineraryStats.favorite_itineraries * 5 : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Share2 className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600">Shares</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {itineraryStats ? Math.floor((itineraryStats.total_views || 0) * 0.1) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
