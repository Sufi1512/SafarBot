/**
 * Cached API Service
 * Wraps the original API service with intelligent caching
 */

import { 
  savedItineraryAPI as originalSavedItineraryAPI,
  dashboardAPI as originalDashboardAPI,
  weatherAPI as originalWeatherAPI,
  flightAPI as originalFlightAPI,
  hotelAPI as originalHotelAPI,
  restaurantAPI as originalRestaurantAPI,
  authAPI as originalAuthAPI,
  chatAPI as originalChatAPI,
  itineraryAPI as originalItineraryAPI,
  alertsAPI as originalAlertsAPI,
  affiliateAPI as originalAffiliateAPI,
  collaborationAPI as originalCollaborationAPI
} from './api';
import { cacheService, CACHE_CONFIGS } from './cacheService';

// Cached Saved Itinerary API
export const savedItineraryAPI = {
  getItineraries: async (params?: {
    limit?: number;
    skip?: number;
    status?: 'draft' | 'published' | 'archived';
    is_favorite?: boolean;
  }) => {
    return cacheService.cachedCall(
      () => originalSavedItineraryAPI.getItineraries(params),
      '/itineraries',
      params,
      CACHE_CONFIGS.SAVED_ITINERARIES
    );
  },

  getItinerary: async (itineraryId: string) => {
    return cacheService.cachedCall(
      () => originalSavedItineraryAPI.getItinerary(itineraryId),
      `/itineraries/${itineraryId}`,
      { itineraryId },
      { ttl: 10 * 60 * 1000 } // 10 minutes for individual itinerary
    );
  },

  createItinerary: async (itineraryData: any) => {
    const result = await originalSavedItineraryAPI.createItinerary(itineraryData);
    // Invalidate saved itineraries cache after creation
    cacheService.invalidateCachePattern('/itineraries');
    return result;
  },

  updateItinerary: async (itineraryId: string, updateData: any) => {
    const result = await originalSavedItineraryAPI.updateItinerary(itineraryId, updateData);
    // Invalidate specific itinerary and list caches
    cacheService.invalidateCache(`/itineraries/${itineraryId}`);
    cacheService.invalidateCachePattern('/itineraries');
    return result;
  },

  deleteItinerary: async (itineraryId: string) => {
    const result = await originalSavedItineraryAPI.deleteItinerary(itineraryId);
    // Invalidate caches after deletion
    cacheService.invalidateCache(`/itineraries/${itineraryId}`);
    cacheService.invalidateCachePattern('/itineraries');
    return result;
  },

  toggleFavorite: async (itineraryId: string) => {
    const result = await originalSavedItineraryAPI.toggleFavorite(itineraryId);
    // Invalidate specific itinerary and list caches
    cacheService.invalidateCache(`/itineraries/${itineraryId}`);
    cacheService.invalidateCachePattern('/itineraries');
    return result;
  },

  discoverItineraries: async (params?: {
    limit?: number;
    skip?: number;
    destination?: string;
    travel_style?: string;
  }) => {
    return cacheService.cachedCall(
      () => originalSavedItineraryAPI.discoverItineraries(params),
      '/itineraries/public/discover',
      params,
      { ttl: 15 * 60 * 1000 } // 15 minutes for public itineraries
    );
  },

  getItineraryStats: async () => {
    return cacheService.cachedCall(
      () => originalSavedItineraryAPI.getItineraryStats(),
      '/itineraries/stats/summary',
      {},
      CACHE_CONFIGS.STATS
    );
  },

  shareItinerary: async (itineraryId: string) => {
    const result = await originalSavedItineraryAPI.shareItinerary(itineraryId);
    // Invalidate specific itinerary cache
    cacheService.invalidateCache(`/itineraries/${itineraryId}`);
    return result;
  },

  getPublicItinerary: async (shareToken: string) => {
    return cacheService.cachedCall(
      () => originalSavedItineraryAPI.getPublicItinerary(shareToken),
      `/itineraries/public/${shareToken}`,
      { shareToken },
      { ttl: 30 * 60 * 1000 } // 30 minutes for public itineraries
    );
  }
};

// Cached Dashboard API
export const dashboardAPI = {
  getDashboardData: async () => {
    return cacheService.cachedCall(
      () => originalDashboardAPI.getDashboardData(),
      '/dashboard/',
      {},
      CACHE_CONFIGS.DASHBOARD
    );
  },

  getStats: async () => {
    return cacheService.cachedCall(
      () => originalDashboardAPI.getStats(),
      '/dashboard/stats',
      {},
      CACHE_CONFIGS.STATS
    );
  },

  getRecentBookings: async (limit: number = 10) => {
    return cacheService.cachedCall(
      () => originalDashboardAPI.getRecentBookings(limit),
      '/dashboard/bookings',
      { limit },
      CACHE_CONFIGS.DASHBOARD
    );
  },

  getUpcomingTrips: async (limit: number = 5) => {
    return cacheService.cachedCall(
      () => originalDashboardAPI.getUpcomingTrips(limit),
      '/dashboard/trips',
      { limit },
      CACHE_CONFIGS.DASHBOARD
    );
  },

  getSavedItineraries: async (limit: number = 10) => {
    return cacheService.cachedCall(
      () => originalDashboardAPI.getSavedItineraries(limit),
      '/dashboard/saved-itineraries',
      { limit },
      CACHE_CONFIGS.SAVED_ITINERARIES
    );
  },

  getPriceAlerts: async () => {
    return cacheService.cachedCall(
      () => originalDashboardAPI.getPriceAlerts(),
      '/dashboard/price-alerts',
      {},
      CACHE_CONFIGS.DASHBOARD
    );
  },

  getNotifications: async (limit: number = 20) => {
    return cacheService.cachedCall(
      () => originalDashboardAPI.getNotifications(limit),
      '/dashboard/notifications',
      { limit },
      CACHE_CONFIGS.DASHBOARD
    );
  },

  getTravelAnalytics: async () => {
    return cacheService.cachedCall(
      () => originalDashboardAPI.getTravelAnalytics(),
      '/dashboard/analytics',
      {},
      { ttl: 10 * 60 * 1000 } // 10 minutes for analytics
    );
  },

  getSessionAnalytics: async () => {
    return cacheService.cachedCall(
      () => originalDashboardAPI.getSessionAnalytics(),
      '/dashboard/sessions',
      {},
      CACHE_CONFIGS.DASHBOARD
    );
  },

  getPreferences: async () => {
    return cacheService.cachedCall(
      () => originalDashboardAPI.getPreferences(),
      '/dashboard/preferences',
      {},
      CACHE_CONFIGS.USER_PROFILE
    );
  },

  updatePreferences: async (preferences: any) => {
    const result = await originalDashboardAPI.updatePreferences(preferences);
    // Invalidate preferences cache
    cacheService.invalidateCache('/dashboard/preferences');
    return result;
  },

  getActiveSessions: async () => {
    return cacheService.cachedCall(
      () => originalDashboardAPI.getActiveSessions(),
      '/dashboard/sessions',
      {},
      CACHE_CONFIGS.DASHBOARD
    );
  },

  revokeSession: async (sessionId: string) => {
    const result = await originalDashboardAPI.revokeSession(sessionId);
    // Invalidate sessions cache
    cacheService.invalidateCachePattern('/dashboard/sessions');
    return result;
  },

  revokeAllSessions: async () => {
    const result = await originalDashboardAPI.revokeAllSessions();
    // Invalidate sessions cache
    cacheService.invalidateCachePattern('/dashboard/sessions');
    return result;
  }
};

// Cached Weather API
export const weatherAPI = {
  getCurrentWeather: async (city: string, country_code?: string) => {
    return cacheService.cachedCall(
      () => originalWeatherAPI.getCurrentWeather(city, country_code),
      '/weather/current',
      { city, country_code },
      CACHE_CONFIGS.WEATHER
    );
  },

  getWeatherForecast: async (city: string, country_code?: string, days: number = 5) => {
    return cacheService.cachedCall(
      () => originalWeatherAPI.getWeatherForecast(city, country_code, days),
      '/weather/forecast',
      { city, country_code, days },
      CACHE_CONFIGS.WEATHER
    );
  },

  getWeatherByCoordinates: async (lat: number, lon: number) => {
    return cacheService.cachedCall(
      () => originalWeatherAPI.getWeatherByCoordinates(lat, lon),
      '/weather/coordinates',
      { lat, lon },
      CACHE_CONFIGS.WEATHER
    );
  },

  getWeatherForItinerary: async (city: string, country_code?: string) => {
    return cacheService.cachedCall(
      () => originalWeatherAPI.getWeatherForItinerary(city, country_code),
      '/weather/itinerary-format',
      { city, country_code },
      CACHE_CONFIGS.WEATHER
    );
  }
};

// Cached Flight API
export const flightAPI = {
  searchFlights: async (data: any) => {
    return cacheService.cachedCall(
      () => originalFlightAPI.searchFlights(data),
      '/flights/search',
      data,
      CACHE_CONFIGS.FLIGHTS
    );
  },

  getPopularFlights: async () => {
    return cacheService.cachedCall(
      () => originalFlightAPI.getPopularFlights(),
      '/flights/popular',
      {},
      { ttl: 30 * 60 * 1000 } // 30 minutes for popular flights
    );
  },

  getFlightDetails: async (flightId: string) => {
    return cacheService.cachedCall(
      () => originalFlightAPI.getFlightDetails(flightId),
      `/flights/${flightId}`,
      { flightId },
      CACHE_CONFIGS.FLIGHTS
    );
  },

  bookFlight: async (flightId: string, passengers: number = 1) => {
    const result = await originalFlightAPI.bookFlight(flightId, passengers);
    // Invalidate flight caches after booking
    cacheService.invalidateCachePattern('/flights/');
    return result;
  },

  getAirportSuggestions: async (query: string) => {
    return cacheService.cachedCall(
      () => originalFlightAPI.getAirportSuggestions(query),
      '/flights/airports/suggestions',
      { query },
      CACHE_CONFIGS.AIRPORTS
    );
  },

  getBookingOptions: async (bookingToken: string) => {
    return cacheService.cachedCall(
      () => originalFlightAPI.getBookingOptions(bookingToken),
      `/flights/booking-options/${bookingToken}`,
      { bookingToken },
      { ttl: 2 * 60 * 1000 } // 2 minutes for booking options
    );
  }
};

// Cached Hotel API
export const hotelAPI = {
  searchHotels: async (data: any) => {
    return cacheService.cachedCall(
      () => originalHotelAPI.searchHotels(data),
      '/search-hotels',
      data,
      CACHE_CONFIGS.HOTELS
    );
  },

  getPopularHotels: async (location: string) => {
    return cacheService.cachedCall(
      () => originalHotelAPI.getPopularHotels(location),
      `/hotels/${location}/popular`,
      { location },
      { ttl: 30 * 60 * 1000 } // 30 minutes for popular hotels
    );
  }
};

// Cached Restaurant API
export const restaurantAPI = {
  getRecommendations: async (data: any) => {
    return cacheService.cachedCall(
      () => originalRestaurantAPI.getRecommendations(data),
      '/recommend-restaurants',
      data,
      CACHE_CONFIGS.RESTAURANTS
    );
  },

  getPopularRestaurants: async (location: string) => {
    return cacheService.cachedCall(
      () => originalRestaurantAPI.getPopularRestaurants(location),
      `/restaurants/${location}/popular`,
      { location },
      { ttl: 30 * 60 * 1000 } // 30 minutes for popular restaurants
    );
  }
};

// Cached Itinerary API
export const itineraryAPI = {
  generateEnhancedItinerary: async (data: any, options?: { signal?: AbortSignal }) => {
    // Don't cache itinerary generation as it's expensive and user-specific
    return originalItineraryAPI.generateEnhancedItinerary(data, options);
  },

  generateItinerary: async (data: any, options?: { signal?: AbortSignal }) => {
    // Don't cache itinerary generation as it's expensive and user-specific
    return originalItineraryAPI.generateItinerary(data, options);
  },

  placeById: async (place_id: string, gl?: string) => {
    return cacheService.cachedCall(
      () => originalItineraryAPI.placeById(place_id, gl),
      '/places/by-id',
      { place_id, gl },
      { ttl: 60 * 60 * 1000 } // 1 hour for place details
    );
  },

  predictPrices: async (data: any) => {
    return cacheService.cachedCall(
      () => originalItineraryAPI.predictPrices(data),
      '/predict-prices',
      data,
      { ttl: 15 * 60 * 1000 } // 15 minutes for price predictions
    );
  }
};

// Cached Chat API
export const chatAPI = {
  sendMessage: async (data: any) => {
    // Don't cache chat messages as they're real-time
    return originalChatAPI.sendMessage(data);
  },

  getHistory: async () => {
    return cacheService.cachedCall(
      () => originalChatAPI.getHistory(),
      '/chat/history',
      {},
      { ttl: 5 * 60 * 1000 } // 5 minutes for chat history
    );
  }
};

// Cached Alerts API
export const alertsAPI = {
  createAlert: async (data: any) => {
    const result = await originalAlertsAPI.createAlert(data);
    // Invalidate alerts cache after creation
    cacheService.invalidateCachePattern('/alerts');
    return result;
  },

  getAlerts: async (params?: any) => {
    return cacheService.cachedCall(
      () => originalAlertsAPI.getAlerts(params),
      '/alerts',
      params,
      CACHE_CONFIGS.DASHBOARD
    );
  },

  updateAlert: async (alertId: string, data: any) => {
    const result = await originalAlertsAPI.updateAlert(alertId, data);
    // Invalidate alerts cache after update
    cacheService.invalidateCachePattern('/alerts');
    return result;
  },

  deleteAlert: async (alertId: string) => {
    const result = await originalAlertsAPI.deleteAlert(alertId);
    // Invalidate alerts cache after deletion
    cacheService.invalidateCachePattern('/alerts');
    return result;
  },

  toggleAlert: async (alertId: string) => {
    const result = await originalAlertsAPI.toggleAlert(alertId);
    // Invalidate alerts cache after toggle
    cacheService.invalidateCachePattern('/alerts');
    return result;
  },

  getNotifications: async (params?: any) => {
    return cacheService.cachedCall(
      () => originalAlertsAPI.getNotifications(params),
      '/alerts/notifications',
      params,
      CACHE_CONFIGS.DASHBOARD
    );
  },

  getAlertStats: async (user_id?: string) => {
    return cacheService.cachedCall(
      () => originalAlertsAPI.getAlertStats(user_id),
      '/alerts/stats',
      { user_id },
      CACHE_CONFIGS.STATS
    );
  },

  predictPrices: async (destination: string, alert_type: 'flight' | 'hotel', date_range: string) => {
    return cacheService.cachedCall(
      () => originalAlertsAPI.predictPrices(destination, alert_type, date_range),
      '/alerts/predict-prices',
      { destination, alert_type, date_range },
      { ttl: 15 * 60 * 1000 } // 15 minutes for price predictions
    );
  }
};

// Cached Collaboration API
export const collaborationAPI = {
  inviteCollaborator: async (data: any) => {
    const result = await originalCollaborationAPI.inviteCollaborator(data);
    // Invalidate collaboration caches after invitation
    cacheService.invalidateCachePattern('/collaboration/');
    return result;
  },

  getInvitations: async () => {
    return cacheService.cachedCall(
      () => originalCollaborationAPI.getInvitations(),
      '/collaboration/invitations',
      {},
      CACHE_CONFIGS.DASHBOARD
    );
  },

  acceptInvitation: async (invitationToken: string) => {
    const result = await originalCollaborationAPI.acceptInvitation(invitationToken);
    // Invalidate collaboration caches after acceptance
    cacheService.invalidateCachePattern('/collaboration/');
    return result;
  },

  declineInvitation: async (invitationToken: string) => {
    const result = await originalCollaborationAPI.declineInvitation(invitationToken);
    // Invalidate collaboration caches after decline
    cacheService.invalidateCachePattern('/collaboration/');
    return result;
  },

  getCollaborators: async (itineraryId: string) => {
    return cacheService.cachedCall(
      () => originalCollaborationAPI.getCollaborators(itineraryId),
      `/collaboration/itinerary/${itineraryId}/collaborators`,
      { itineraryId },
      CACHE_CONFIGS.DASHBOARD
    );
  },

  removeCollaborator: async (itineraryId: string, userId: string) => {
    const result = await originalCollaborationAPI.removeCollaborator(itineraryId, userId);
    // Invalidate collaboration caches after removal
    cacheService.invalidateCachePattern('/collaboration/');
    return result;
  },

  getMyCollaborations: async () => {
    return cacheService.cachedCall(
      () => originalCollaborationAPI.getMyCollaborations(),
      '/collaboration/my-collaborations',
      {},
      CACHE_CONFIGS.DASHBOARD
    );
  }
};

// Auth API - mostly not cached as it's sensitive
export const authAPI = {
  login: async (data: any) => {
    const result = await originalAuthAPI.login(data);
    // Clear all caches on login to ensure fresh data
    cacheService.clearCache();
    return result;
  },

  signup: async (data: any) => {
    return originalAuthAPI.signup(data);
  },

  logout: async () => {
    const result = await originalAuthAPI.logout();
    // Clear all caches on logout
    cacheService.clearCache();
    return result;
  },

  refreshToken: async (refresh_token: string) => {
    return originalAuthAPI.refreshToken(refresh_token);
  },

  forgotPassword: async (email: string) => {
    return originalAuthAPI.forgotPassword(email);
  },

  resetPassword: async (data: any) => {
    return originalAuthAPI.resetPassword(data);
  },

  getProfile: async () => {
    return cacheService.cachedCall(
      () => originalAuthAPI.getProfile(),
      '/auth/me',
      {},
      CACHE_CONFIGS.USER_PROFILE
    );
  },

  updateProfile: async (data: any) => {
    const result = await originalAuthAPI.updateProfile(data);
    // Invalidate profile cache after update
    cacheService.invalidateCache('/auth/me');
    return result;
  },

  changePassword: async (data: any) => {
    return originalAuthAPI.changePassword(data);
  },

  sendVerificationOTP: async (email: string) => {
    return originalAuthAPI.sendVerificationOTP(email);
  },

  verifyOTP: async (data: any) => {
    return originalAuthAPI.verifyOTP(data);
  },

  resendOTP: async (email: string) => {
    return originalAuthAPI.resendOTP(email);
  }
};

// Affiliate API - mostly not cached as it's tracking data
export const affiliateAPI = {
  trackClick: async (data: any) => {
    return originalAffiliateAPI.trackClick(data);
  },

  trackBooking: async (data: any) => {
    return originalAffiliateAPI.trackBooking(data);
  },

  getClicks: async (params?: any) => {
    return cacheService.cachedCall(
      () => originalAffiliateAPI.getClicks(params),
      '/affiliate/clicks',
      params,
      { ttl: 5 * 60 * 1000 } // 5 minutes for affiliate data
    );
  },

  getBookings: async (params?: any) => {
    return cacheService.cachedCall(
      () => originalAffiliateAPI.getBookings(params),
      '/affiliate/bookings',
      params,
      { ttl: 5 * 60 * 1000 } // 5 minutes for affiliate data
    );
  },

  getReports: async (start_date: string, end_date: string, platform?: string) => {
    return cacheService.cachedCall(
      () => originalAffiliateAPI.getReports(start_date, end_date, platform),
      '/affiliate/reports',
      { start_date, end_date, platform },
      { ttl: 10 * 60 * 1000 } // 10 minutes for reports
    );
  },

  getStats: async () => {
    return cacheService.cachedCall(
      () => originalAffiliateAPI.getStats(),
      '/affiliate/stats',
      {},
      CACHE_CONFIGS.STATS
    );
  },

  getLinks: async () => {
    return cacheService.cachedCall(
      () => originalAffiliateAPI.getLinks(),
      '/affiliate/links',
      {},
      { ttl: 30 * 60 * 1000 } // 30 minutes for affiliate links
    );
  }
};

// Export cache service for manual cache management
export { cacheService };
