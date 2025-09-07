import React, { useState, useEffect } from 'react';
import { Bell, Check, AlertCircle, Info, CheckCircle, Clock, Plane, Hotel, Car, MapPin, DollarSign, Calendar } from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Update {
  id: string;
  type: 'booking' | 'price' | 'weather' | 'reminder' | 'promotion' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  action?: {
    label: string;
    url: string;
  };
  relatedItem?: {
    type: string;
    name: string;
    id: string;
  };
}

const UpdatesPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread' | 'booking' | 'price' | 'weather' | 'reminder'>('all');

  // Load updates data
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUpdatesData();
    }
  }, [isAuthenticated, user, filter]);

  const loadUpdatesData = async () => {
    try {
      // Load dashboard data which includes notifications
      await dashboardAPI.getDashboardData();
      
      // TODO: Process notifications into updates format
      // const updates = dashboardData.notifications.map(notification => ({
      //   id: notification.id,
      //   type: notification.type,
      //   title: notification.title,
      //   message: notification.message,
      //   timestamp: notification.created_at,
      //   isRead: notification.is_read,
      //   priority: 'medium'
      // }));
      
    } catch (err: any) {
      console.error('Error loading updates data:', err);
    }
  };

  const handleMarkAsRead = async (updateId: string) => {
    try {
      // TODO: Call API to mark update as read
      // await dashboardAPI.markNotificationAsRead(updateId);
      console.log('Marked update as read:', updateId);
    } catch (err: any) {
      console.error('Error marking update as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // TODO: Call API to mark all updates as read
      // await dashboardAPI.markAllNotificationsAsRead();
      console.log('Marked all updates as read');
    } catch (err: any) {
      console.error('Error marking all updates as read:', err);
    }
  };


  const updates: Update[] = [
    {
      id: '1',
      type: 'booking',
      title: 'Flight Confirmed',
      message: 'Your flight to Paris on March 15th has been confirmed. Check-in opens 24 hours before departure.',
      timestamp: '2 hours ago',
      isRead: false,
      priority: 'high',
      action: {
        label: 'View Booking',
        url: '/bookings/123'
      },
      relatedItem: {
        type: 'flight',
        name: 'Paris Flight',
        id: '123'
      }
    },
    {
      id: '2',
      type: 'price',
      title: 'Price Drop Alert',
      message: 'The hotel you saved in Tokyo has dropped by $50 per night. Book now to save!',
      timestamp: '4 hours ago',
      isRead: false,
      priority: 'medium',
      action: {
        label: 'View Hotel',
        url: '/hotels/tokyo-123'
      },
      relatedItem: {
        type: 'hotel',
        name: 'Park Hyatt Tokyo',
        id: '456'
      }
    },
    {
      id: '3',
      type: 'weather',
      title: 'Weather Update',
      message: 'Heavy rain expected in Bali during your stay. Consider packing rain gear.',
      timestamp: '6 hours ago',
      isRead: true,
      priority: 'medium',
      relatedItem: {
        type: 'trip',
        name: 'Bali Trip',
        id: '789'
      }
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Check-in Reminder',
      message: 'Don\'t forget to check in for your flight to Tokyo. Check-in opens in 2 hours.',
      timestamp: '1 day ago',
      isRead: true,
      priority: 'high',
      action: {
        label: 'Check In',
        url: '/checkin/456'
      },
      relatedItem: {
        type: 'flight',
        name: 'Tokyo Flight',
        id: '456'
      }
    },
    {
      id: '5',
      type: 'promotion',
      title: 'Special Offer',
      message: 'Get 20% off your next hotel booking with code SAVE20. Valid until March 31st.',
      timestamp: '2 days ago',
      isRead: true,
      priority: 'low',
      action: {
        label: 'Use Code',
        url: '/hotels?promo=SAVE20'
      }
    },
    {
      id: '6',
      type: 'system',
      title: 'App Update Available',
      message: 'A new version of the app is available with improved features and bug fixes.',
      timestamp: '3 days ago',
      isRead: true,
      priority: 'low',
      action: {
        label: 'Update Now',
        url: '/settings/update'
      }
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'price': return <DollarSign className="h-5 w-5 text-blue-600" />;
      case 'weather': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'reminder': return <Clock className="h-5 w-5 text-orange-600" />;
      case 'promotion': return <Bell className="h-5 w-5 text-purple-600" />;
      case 'system': return <Info className="h-5 w-5 text-gray-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-gray-300';
      default: return 'border-l-gray-300';
    }
  };

  const getRelatedItemIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="h-4 w-4" />;
      case 'hotel': return <Hotel className="h-4 w-4" />;
      case 'car': return <Car className="h-4 w-4" />;
      case 'trip': return <MapPin className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const filteredUpdates = updates.filter(update => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !update.isRead;
    return update.type === filter;
  });

  const unreadCount = updates.filter(update => !update.isRead).length;


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Updates</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay informed about your travel plans and bookings
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Mark all as read
            </button>
          )}
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Settings
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'all', label: 'All Updates', count: updates.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          { id: 'booking', label: 'Bookings', count: updates.filter(u => u.type === 'booking').length },
          { id: 'price', label: 'Price Alerts', count: updates.filter(u => u.type === 'price').length },
          { id: 'weather', label: 'Weather', count: updates.filter(u => u.type === 'weather').length },
          { id: 'reminder', label: 'Reminders', count: updates.filter(u => u.type === 'reminder').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Updates List */}
      <div className="space-y-3">
        {filteredUpdates.map((update) => (
          <div
            key={update.id}
            className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 border-l-4 ${getPriorityColor(update.priority)} ${
              !update.isRead ? 'ring-2 ring-blue-100 dark:ring-blue-900/20' : ''
            }`}
          >
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getTypeIcon(update.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-sm font-medium ${
                          !update.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {update.title}
                        </h3>
                        {!update.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <p className={`mt-1 text-sm ${
                        !update.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {update.message}
                      </p>
                      {update.relatedItem && (
                        <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          {getRelatedItemIcon(update.relatedItem.type)}
                          <span>{update.relatedItem.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {update.timestamp}
                      </span>
                      {!update.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(update.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {update.action && (
                    <div className="mt-3">
                      <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        {update.action.label}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUpdates.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No updates found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'unread' 
              ? "You're all caught up! No unread updates."
              : `No ${filter} updates at the moment.`
            }
          </p>
        </div>
      )}

      {/* Load More */}
      {filteredUpdates.length > 0 && (
        <div className="text-center">
          <button className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            Load More Updates
          </button>
        </div>
      )}
    </div>
  );
};

export default UpdatesPage;


