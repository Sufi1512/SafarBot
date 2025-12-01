import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, AlertCircle, Info, CheckCircle, Clock, Plane, Hotel, Car, MapPin, DollarSign, Calendar, Users, Shield, Loader2 } from 'lucide-react';
import { notificationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Update {
  id: string;
  type: 'booking' | 'price' | 'weather' | 'reminder' | 'promotion' | 'system' | 'collaboration' | 'invitation' | 'role_update';
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
  data?: Record<string, any>;
}

const UpdatesPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'booking' | 'price' | 'weather' | 'reminder' | 'collaboration'>('all');
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load updates data
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUpdatesData();
    }
  }, [isAuthenticated, user, filter]);

  const loadUpdatesData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await notificationsAPI.getNotifications(50, 0);
      if (import.meta.env.DEV) {
        console.debug('Notifications API Response received');
      }
      const notifications = response || [];
      console.log('Notifications array:', notifications);
      
      // Transform notifications into updates format
      const transformedUpdates: Update[] = notifications.map((notification: any) => ({
        id: notification.id,
        type: mapNotificationType(notification.type),
        title: notification.title,
        message: notification.message,
        timestamp: formatTimestamp(notification.created_at),
        isRead: notification.is_read,
        priority: getPriorityFromType(notification.type),
        action: notification.action_url ? {
          label: getActionLabel(notification.type),
          url: notification.action_url
        } : undefined,
        data: notification.data
      }));
      
      setUpdates(transformedUpdates);
    } catch (err: any) {
      console.error('Error loading updates data:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (updateId: string) => {
    try {
      await notificationsAPI.markAsRead(updateId);
      
      // Update local state
      setUpdates(prev => prev.map(update => 
        update.id === updateId ? { ...update, isRead: true } : update
      ));
    } catch (err: any) {
      console.error('Error marking update as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      
      // Update local state
      setUpdates(prev => prev.map(update => ({ ...update, isRead: true })));
    } catch (err: any) {
      console.error('Error marking all updates as read:', err);
    }
  };

  const handleActionClick = (update: Update) => {
    if (update.action?.url) {
      // Mark as read when action is clicked
      if (!update.isRead) {
        handleMarkAsRead(update.id);
      }
      
      // Navigate to the action URL
      navigate(update.action.url);
    }
  };

  // Helper functions
  const mapNotificationType = (type: string): Update['type'] => {
    const typeMap: Record<string, Update['type']> = {
      'price_alert': 'price',
      'booking_confirmation': 'booking',
      'booking_reminder': 'reminder',
      'system_update': 'system',
      'promotional': 'promotion',
      'invitation_received': 'invitation',
      'invitation_accepted': 'collaboration',
      'invitation_declined': 'collaboration',
      'collaborator_added': 'collaboration',
      'collaborator_removed': 'collaboration',
      'role_updated': 'role_update',
      'itinerary_updated': 'collaboration',
      'itinerary_shared': 'collaboration'
    };
    return typeMap[type] || 'system';
  };

  const getPriorityFromType = (type: string): 'low' | 'medium' | 'high' => {
    const highPriority = ['booking_confirmation', 'invitation_received', 'role_updated'];
    const mediumPriority = ['price_alert', 'booking_reminder', 'collaborator_added', 'collaborator_removed'];
    
    if (highPriority.includes(type)) return 'high';
    if (mediumPriority.includes(type)) return 'medium';
    return 'low';
  };

  const getActionLabel = (type: string): string => {
    const actionMap: Record<string, string> = {
      'invitation_received': 'View Invitation',
      'booking_confirmation': 'View Booking',
      'price_alert': 'View Deal',
      'role_updated': 'View Itinerary',
      'collaborator_added': 'View Collaboration',
      'itinerary_updated': 'View Itinerary'
    };
    return actionMap[type] || 'View Details';
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };



  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'price': return <DollarSign className="h-5 w-5 text-blue-600" />;
      case 'weather': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'reminder': return <Clock className="h-5 w-5 text-orange-600" />;
      case 'promotion': return <Bell className="h-5 w-5 text-purple-600" />;
      case 'system': return <Info className="h-5 w-5 text-gray-600" />;
      case 'collaboration': return <Users className="h-5 w-5 text-indigo-600" />;
      case 'invitation': return <Users className="h-5 w-5 text-blue-600" />;
      case 'role_update': return <Shield className="h-5 w-5 text-purple-600" />;
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
    if (filter === 'collaboration') return ['collaboration', 'invitation', 'role_update'].includes(update.type);
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
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'all', label: 'All Updates', count: updates.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          { id: 'booking', label: 'Bookings', count: updates.filter(u => u.type === 'booking').length },
          { id: 'price', label: 'Price Alerts', count: updates.filter(u => u.type === 'price').length },
          { id: 'weather', label: 'Weather', count: updates.filter(u => u.type === 'weather').length },
          { id: 'reminder', label: 'Reminders', count: updates.filter(u => u.type === 'reminder').length },
          { id: 'collaboration', label: 'Collaboration', count: updates.filter(u => ['collaboration', 'invitation', 'role_update'].includes(u.type)).length }
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <span className="ml-2 text-red-600">{error}</span>
          </div>
        ) : filteredUpdates.length === 0 ? (
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
        ) : (
          filteredUpdates.map((update) => (
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
                      <button 
                        onClick={() => handleActionClick(update)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        {update.action.label}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
        )}
      </div>

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


