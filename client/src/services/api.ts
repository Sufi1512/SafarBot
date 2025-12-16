import axios, { AxiosResponse } from 'axios';

// Type definitions for itinerary API responses
export interface PlaceDetails {
  title: string;
  description?: string;
  address?: string;
  rating?: number;
  price?: string;
  price_range?: string;
  category?: string;
  thumbnail?: string;
  serpapi_thumbnail?: string;
  high_res_image?: string;
  photos_link?: string;
  website?: string;
  phone?: string;
  hours?: any;
  open_state?: string;
  operating_hours?: any;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  place_id?: string;
  [key: string]: any; // Allow additional properties
}

export interface AdditionalPlace {
  title?: string;
  name?: string;
  description?: string;
  address?: string;
  location?: string;
  rating?: number;
  price?: string;
  price_range?: string;
  category?: string;
  cuisine?: string;
  amenities?: string[];
  thumbnail?: string;
  serpapi_thumbnail?: string;
  high_res_image?: string;
  photos_link?: string;
  website?: string;
  phone?: string;
  hours?: any;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  place_id?: string;
  [key: string]: any; // Allow additional properties
}

export interface EnhancedItineraryResponse {
  itinerary: {
    destination: string;
    total_days: number;
    budget_estimate?: number;
    daily_plans: any[];
    accommodation_suggestions?: any[];
    travel_tips?: string[];
  };
  place_details?: Record<string, PlaceDetails>;
  additional_places?: {
    hotels?: AdditionalPlace[];
    restaurants?: AdditionalPlace[];
    cafes?: AdditionalPlace[];
    attractions?: AdditionalPlace[];
    interest_based?: AdditionalPlace[];
  };
  weather?: any;
  photo_prefetch?: Array<{
    thumbnail?: string;
    high_res_image?: string;
    serpapi_thumbnail?: string;
    photos_link?: string;
  }>;
  [key: string]: any; // Allow additional properties
}

// Weather types
export interface WeatherData {
  location: {
    name: string;
    city?: string;
    country?: string;
    region?: string;
    lat?: number;
    lon?: number;
    coordinates?: {
      lat: number;
      lon: number;
    };
  };
  current: {
    temperature: number;
    condition: string;
    description?: string;
    humidity?: number;
    wind_speed?: number;
    wind_direction?: string;
    pressure?: number;
    visibility?: number;
    uv_index?: number;
    feels_like?: number;
    icon?: string;
  };
  forecast?: WeatherForecast[];
  forecasts?: WeatherForecast[];
  recommendations?: Array<{
    type: string;
    message: string;
    priority?: 'high' | 'medium' | 'low';
  } | string>;
  timestamp?: string;
}

export interface WeatherForecast {
  date?: string;
  datetime?: string;
  day?: {
    condition: string;
    temperature: number;
    max_temp?: number;
    min_temp?: number;
    humidity?: number;
    wind_speed?: number;
    icon?: string;
  };
  night?: {
    condition: string;
    temperature: number;
    icon?: string;
  };
  description?: string;
  icon?: string;
  temperature?: {
    max: number;
    min: number;
  };
  humidity?: number;
  forecasts?: WeatherForecast[];
}

// Flight types
export interface Flight {
  id: string;
  airline: string;
  airline_logo?: string;
  flight_number: string;
  departure: {
    airport: string;
    airport_code: string;
    airport_name?: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    airport_code: string;
    airport_name?: string;
    city: string;
    time: string;
    date: string;
  };
  duration: string;
  total_duration?: string;
  stops: number;
  price: number;
  currency: string;
  booking_token?: string;
  segments?: FlightSegment[];
  flight_segments?: FlightSegment[];
  amenities?: string[];
  layovers?: Layover[];
  flight_type?: string;
  rating?: number;
  carbon_emissions?: {
    this_flight: number;
    difference_percent: number;
  };
}

export interface FlightSegment {
  id?: string;
  departure: {
    airport: string;
    airport_code: string;
    airport_name?: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    airport_code: string;
    airport_name?: string;
    time: string;
    date: string;
  };
  duration: string;
  airline: string;
  flight_number: string;
  aircraft?: string;
  travel_class?: string;
  overnight?: boolean;
  often_delayed?: boolean;
  amenities?: string[];
}

export interface Layover {
  airport: string;
  airport_code: string;
  duration: string;
  city?: string;
}

export interface FlightSearchRequest {
  from?: string;
  from_location?: string;
  to?: string;
  to_location?: string;
  departure_date: string;
  return_date?: string;
  adults?: number;
  children?: number;
  infants?: number;
  passengers?: number;
  cabin_class?: 'economy' | 'business' | 'first';
  class_type?: string;
  currency?: string;
}

export interface AirportSuggestion {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  country_code: string;
}

// Booking types
export interface BookingOption {
  id: string;
  type: 'flight' | 'hotel' | 'activity';
  title: string;
  description?: string;
  price: number;
  currency: string;
  provider: string;
  booking_url: string;
  image?: string;
  rating?: number;
  reviews_count?: number;
  together?: {
    booking_request?: {
      url: string;
    };
    booking_phone?: string;
  };
}

export interface BookingOptionsResponse {
  options?: BookingOption[];
  booking_options?: BookingOption[];
  selected_flights?: any[];
  total?: number;
  currency?: string;
}

// Base URL for API - Uses centralized config
import { getApiBaseUrl } from '../config/apiConfig';

const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and authentication
api.interceptors.request.use(
  (config) => {
    // Normalize URL to prevent double slashes
    if (config.url) {
      // Ensure URL starts with a single slash (remove leading slashes and add one)
      config.url = '/' + config.url.replace(/^\/+/, '');
      
      // Normalize any double slashes in the path (but preserve protocol slashes)
      // This handles cases like //auth/login -> /auth/login
      config.url = config.url.replace(/([^:]\/)\/+/g, '$1');
    }
    
    // API calls are visible in Network tab - no need to log to console
    // Only log errors in development for debugging
    if (import.meta.env.DEV && config.url && !config.url.includes('/health')) {
      // Use console.debug for less intrusive logging
      console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    // Add Authorization header if token exists
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Only log actual errors
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // API responses are visible in Network tab - no need to log to console
    // Only log errors, not successful responses
    return response;
  },
  async (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
                          error.config?.url?.includes('/auth/signup') ||
                          error.config?.url?.includes('/auth/forgot-password') ||
                          error.config?.url?.includes('/auth/reset-password');

    if (import.meta.env.DEV && !isAuthEndpoint) { // Only log non-auth errors to reduce noise
      console.error('API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url
      });
    }

    if (error.response?.status === 401 && !error.config._retry && !isAuthEndpoint) {
      error.config._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await authAPI.refreshToken(refreshToken);
          localStorage.setItem('accessToken', response.access_token);
          localStorage.setItem('refreshToken', response.refresh_token);
          error.config.headers.Authorization = `Bearer ${response.access_token}`;
          return api(error.config);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          const currentPath = window.location.pathname + window.location.search;
          const state = { from: currentPath, message: 'Session expired. Please log in again.', timestamp: Date.now() };
          sessionStorage.setItem('authRedirect', JSON.stringify(state));
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        const currentPath = window.location.pathname + window.location.search;
        const state = { from: currentPath, message: 'Please log in to continue', timestamp: Date.now() };
        sessionStorage.setItem('authRedirect', JSON.stringify(state));
        window.location.href = '/login';
      }
    }

    const errorMessage = error.response?.data?.detail ||
                        error.response?.data?.message ||
                        error.message ||
                        'An error occurred';

    if (error.response?.status === 401 && !isAuthEndpoint) {
      error.userMessage = 'Session expired. Please log in again.';
    } else if (error.response?.status === 401 && isAuthEndpoint) {
      error.userMessage = errorMessage;
    } else if (error.response?.status === 403) {
      error.userMessage = 'Access denied. Please check your credentials.';
    } else if (error.response?.status === 404) {
      error.userMessage = 'Service not found. Please check your connection.';
    } else if (error.response?.status === 409) {
      error.userMessage = 'An account with this email already exists.';
    } else if (error.response?.status === 422) {
      error.userMessage = 'Please check your input and try again.';
    } else if (error.response?.status === 500) {
      error.userMessage = 'Server error. Please try again later.';
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.userMessage = 'Request timed out. The server is taking longer than expected. Please try again.';
    } else if (!error.response) {
      error.userMessage = 'Network error. Please check your connection.';
    } else {
      error.userMessage = errorMessage;
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  signup: async (data: { firstName: string; lastName: string; email: string; password: string }) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (data: { token: string; new_password: string }) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await api.put('/auth/me', data);
    return response.data;
  },
  changePassword: async (data: { current_password: string; new_password: string }) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },
  sendVerificationOTP: async (email: string) => {
    const response = await api.post('/auth/send-verification-otp', { email });
    return response.data;
  },
  verifyOTP: async (data: { email: string; otp: string }) => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },
  resendOTP: async (email: string) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  }
};

export const itineraryAPI = {
  generateEnhancedItinerary: async (data: any, options?: { signal?: AbortSignal }) => {
    // Use generate-itinerary-complete endpoint which provides enhanced itinerary with place details
    const response = await api.post('/itinerary/generate-itinerary-complete', data, {
      signal: options?.signal,
      timeout: 180000 // 3 minutes for itinerary generation
    });
    return response.data;
  },
  generateItinerary: async (data: any, options?: { signal?: AbortSignal }) => {
    const response = await api.post('/itinerary/generate-itinerary', data, {
      signal: options?.signal,
      timeout: 180000 // 3 minutes for itinerary generation
    });
    return response.data;
  },
  placeById: async (place_id: string, gl?: string) => {
    const response = await api.get('/itinerary/places/by-id', { params: { place_id, gl } });
    return response.data;
  },
  predictPrices: async (data: any) => {
    const response = await api.post('/itinerary/predict-prices', data);
    return response.data;
  },
  getItinerary: async (id: string) => {
    const response = await api.get(`/itinerary/${id}`);
    return response.data;
  },
  updateItinerary: async (id: string, data: any) => {
    const response = await api.put(`/itinerary/${id}`, data);
    return response.data;
  },
  deleteItinerary: async (id: string) => {
    const response = await api.delete(`/itinerary/${id}`);
    return response.data;
  }
};

export const savedItineraryAPI = {
  getItineraries: async (params?: { limit?: number; offset?: number; skip?: number; status?: string; is_favorite?: boolean }) => {
    const response = await api.get('/itinerary/saved', { params });
    return response.data;
  },
  getItinerary: async (itineraryId: string) => {
    const response = await api.get(`/itineraries/${itineraryId}`);
    return response.data;
  },
  createItinerary: async (itineraryData: any) => {
    const response = await api.post('/itineraries', itineraryData);
    return response.data;
  },
  updateItinerary: async (itineraryId: string, updateData: any) => {
    const response = await api.put(`/itineraries/${itineraryId}`, updateData);
    return response.data;
  },
  deleteItinerary: async (itineraryId: string) => {
    const response = await api.delete(`/itineraries/${itineraryId}`);
    return response.data;
  },
  toggleFavorite: async (itineraryId: string) => {
    const response = await api.post(`/itineraries/${itineraryId}/toggle-favorite`);
    return response.data;
  },
  discoverItineraries: async (params?: { limit?: number; skip?: number; destination?: string; travel_style?: string }) => {
    const response = await api.get('/itineraries/public/discover', { params });
    return response.data;
  },
  getItineraryStats: async () => {
    const response = await api.get('/itineraries/stats/summary');
    return response.data;
  },
  shareItinerary: async (itineraryId: string) => {
    const response = await api.post(`/itineraries/${itineraryId}/share`);
    return response.data;
  },
  getPublicItinerary: async (shareToken: string) => {
    const response = await api.get(`/itineraries/public/${shareToken}`);
    return response.data;
  },
  saveItinerary: async (data: any) => {
    const response = await api.post('/itinerary/save', data);
    return response.data;
  },
  favoriteItinerary: async (id: string) => {
    const response = await api.post(`/itinerary/${id}/favorite`);
    return response.data;
  },
  unfavoriteItinerary: async (id: string) => {
    const response = await api.post(`/itinerary/${id}/unfavorite`);
    return response.data;
  }
};

export const dashboardAPI = {
  getDashboardData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  getRecentBookings: async (limit: number = 10) => {
    const response = await api.get('/dashboard/bookings', { params: { limit } });
    return response.data;
  },
  getUpcomingTrips: async (limit: number = 5) => {
    const response = await api.get('/dashboard/trips', { params: { limit } });
    return response.data;
  },
  getSavedItineraries: async (limit: number = 10) => {
    const response = await api.get('/dashboard/saved-itineraries', { params: { limit } });
    return response.data;
  },
  getPriceAlerts: async () => {
    const response = await api.get('/dashboard/price-alerts');
    return response.data;
  },
  getNotifications: async (limit: number = 20) => {
    const response = await api.get('/dashboard/notifications', { params: { limit } });
    return response.data;
  },
  getTravelAnalytics: async () => {
    const response = await api.get('/dashboard/analytics');
    return response.data;
  },
  getSessionAnalytics: async () => {
    const response = await api.get('/dashboard/sessions');
    return response.data;
  },
  getPreferences: async () => {
    const response = await api.get('/dashboard/preferences');
    return response.data;
  },
  updatePreferences: async (preferences: any) => {
    const response = await api.put('/dashboard/preferences', preferences);
    return response.data;
  },
  getActiveSessions: async () => {
    const response = await api.get('/dashboard/sessions');
    return response.data;
  },
  revokeSession: async (sessionId: string) => {
    const response = await api.delete(`/dashboard/sessions/${sessionId}`);
    return response.data;
  },
  revokeAllSessions: async () => {
    const response = await api.delete('/dashboard/sessions');
    return response.data;
  }
};

export const notificationsAPI = {
  getNotifications: async (limit: number = 50, offset: number = 0) => {
    const response = await api.get('/notifications', { params: { limit, offset } });
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
  deleteNotification: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
  getNotificationCount: async () => {
    const response = await api.get('/notifications/count');
    return response.data;
  }
};

export const weatherAPI = {
  getWeather: async (location: string) => {
    const response = await api.get('/weather', { params: { location } });
    return response.data;
  },
  getCurrentWeather: async (city: string, country_code?: string) => {
    const response = await api.get('/weather/current', { params: { city, country_code } });
    return response.data;
  },
  getWeatherForecast: async (city: string, country_code?: string, days: number = 5) => {
    const response = await api.get('/weather/forecast', { params: { city, country_code, days } });
    return response.data;
  },
  getWeatherByCoordinates: async (lat: number, lon: number) => {
    const response = await api.get('/weather/coordinates', { params: { lat, lon } });
    return response.data;
  },
  getWeatherForItinerary: async (city: string, country_code?: string) => {
    const response = await api.get('/weather/itinerary-format', { params: { city, country_code } });
    return response.data;
  }
};

export const flightAPI = {
  searchFlights: async (data: any) => {
    const response = await api.post('/flights/search', data);
    return response.data;
  },
  getPopularFlights: async () => {
    const response = await api.get('/flights/popular');
    return response.data;
  },
  getFlightDetails: async (flightId: string) => {
    const response = await api.get(`/flights/${flightId}`);
    return response.data;
  },
  bookFlight: async (flightId: string, passengers: number = 1) => {
    const response = await api.post('/flights/book', { flight_id: flightId, passengers });
    return response.data;
  },
  getAirportSuggestions: async (query: string) => {
    const response = await api.get('/flights/airports/suggestions', { params: { query } });
    return response.data;
  },
  getBookingOptions: async (bookingToken: string) => {
    const response = await api.get(`/flights/booking-options/${bookingToken}`);
    return response.data;
  }
};

export const hotelAPI = {
  searchHotels: async (data: any) => {
    const response = await api.post('/hotels/search-hotels', data);
    return response.data;
  },
  getPopularHotels: async (location: string) => {
    const response = await api.get(`/hotels/${location}/popular`);
    return response.data;
  }
};

export const restaurantAPI = {
  getRecommendations: async (data: any) => {
    const response = await api.post('/restaurants/recommend-restaurants', data);
    return response.data;
  },
  getPopularRestaurants: async (location: string) => {
    const response = await api.get(`/restaurants/${location}/popular`);
    return response.data;
  }
};

export const chatAPI = {
  sendMessage: async (data: any) => {
    const response = await api.post('/chat', data);
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/chat/history');
    return response.data;
  }
};

export const alertsAPI = {
  createAlert: async (data: any) => {
    const response = await api.post('/alerts', data);
    return response.data;
  },
  getAlerts: async (params?: any) => {
    const response = await api.get('/alerts', { params });
    return response.data;
  },
  updateAlert: async (alertId: string, data: any) => {
    const response = await api.put(`/alerts/${alertId}`, data);
    return response.data;
  },
  deleteAlert: async (alertId: string) => {
    const response = await api.delete(`/alerts/${alertId}`);
    return response.data;
  },
  toggleAlert: async (alertId: string) => {
    const response = await api.post(`/alerts/${alertId}/toggle`);
    return response.data;
  },
  getNotifications: async (params?: any) => {
    const response = await api.get('/alerts/notifications', { params });
    return response.data;
  },
  getAlertStats: async (user_id?: string) => {
    const response = await api.get('/alerts/stats', { params: { user_id } });
    return response.data;
  },
  predictPrices: async (destination: string, alert_type: 'flight' | 'hotel', date_range: string) => {
    const response = await api.post('/alerts/predict-prices', { destination, alert_type, date_range });
    return response.data;
  }
};

export const affiliateAPI = {
  trackClick: async (data: any) => {
    const response = await api.post('/affiliate/track-click', data);
    return response.data;
  },
  trackBooking: async (data: any) => {
    const response = await api.post('/affiliate/track-booking', data);
    return response.data;
  },
  getClicks: async (params?: any) => {
    const response = await api.get('/affiliate/clicks', { params });
    return response.data;
  },
  getBookings: async (params?: any) => {
    const response = await api.get('/affiliate/bookings', { params });
    return response.data;
  },
  getReports: async (start_date: string, end_date: string, platform?: string) => {
    const response = await api.get('/affiliate/reports', { params: { start_date, end_date, platform } });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/affiliate/stats');
    return response.data;
  },
  getLinks: async () => {
    const response = await api.get('/affiliate/links');
    return response.data;
  }
};

export const collaborationAPI = {
  inviteCollaborator: async (data: any) => {
    const response = await api.post('/collaboration/invite', data);
    return response.data;
  },
  getInvitations: async () => {
    const response = await api.get('/collaboration/invitations');
    return response.data;
  },
  getInvitationInfo: async (invitationToken: string) => {
    const response = await api.get(`/collaboration/invitation/${invitationToken}/info`);
    return response.data;
  },
  acceptInvitation: async (invitationToken: string) => {
    const response = await api.post(`/collaboration/invitation/${invitationToken}/accept`);
    return response.data;
  },
  declineInvitation: async (invitationToken: string) => {
    const response = await api.post(`/collaboration/invitation/${invitationToken}/decline`);
    return response.data;
  },
  getCollaborators: async (itineraryId: string) => {
    const response = await api.get(`/collaboration/itinerary/${itineraryId}/collaborators`);
    return response.data;
  },
  removeCollaborator: async (itineraryId: string, userId: string) => {
    const response = await api.delete(`/collaboration/itinerary/${itineraryId}/collaborator/${userId}`);
    return response.data;
  },
  updateCollaboratorRole: async (itineraryId: string, userId: string, role: 'viewer' | 'editor' | 'admin') => {
    const response = await api.put(`/collaboration/itinerary/${itineraryId}/collaborator/${userId}/role`, { role });
    return response.data;
  },
  resendInvitation: async (data: { invitation_id: string; itinerary_id: string; email: string; message?: string }) => {
    const response = await api.post('/collaboration/resend-invitation', data);
    return response.data;
  },
  getMyCollaborations: async () => {
    const response = await api.get('/collaboration/my-collaborations');
    return response.data;
  },
  getRoomStatus: async (itineraryId: string) => {
    const response = await api.get(`/collaboration/room/status/${itineraryId}`);
    return response.data;
  },
  createRoom: async (data: { itinerary_id: string; room_name?: string }) => {
    const response = await api.post('/collaboration/room/create', data);
    return response.data;
  },
  joinRoom: async (roomId: string) => {
    const response = await api.post(`/collaboration/room/${roomId}/join`);
    return response.data;
  },
  getRoomInfo: async (roomId: string) => {
    const response = await api.get(`/collaboration/room/${roomId}/info`);
    return response.data;
  }
};

export default api;
