import axios, { AxiosResponse } from 'axios';

// Base URL for API - Render backend for production, localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.PROD 
    ? 'https://safarbot-backend.onrender.com/api/v1' 
    : 'http://localhost:8000/api/v1'
);

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
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    
    // Add Authorization header if token exists
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
    
    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await authAPI.refreshToken(refreshToken);
          localStorage.setItem('accessToken', response.access_token);
          localStorage.setItem('refreshToken', response.refresh_token);
          
          // Retry the original request with new token
          error.config.headers.Authorization = `Bearer ${response.access_token}`;
          return api(error.config);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    // Transform error for better user experience
    if (error.response?.status === 401) {
      error.userMessage = 'Session expired. Please log in again.';
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
      // Handle FastAPI error format: {"detail": "error message"}
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Something went wrong. Please try again.';
      error.userMessage = errorMessage;
    }
    
    return Promise.reject(error);
  }
);

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Request Types
export interface ItineraryRequest {
  // Basic Information
  destination: string;
  start_date: string;
  end_date: string;
  total_days?: number;
  budget?: number;
  budget_range?: string;
  
  // Travel Preferences
  travelers: number;
  travel_companion?: string;
  trip_pace?: string;
  interests: string[];
  
  // Travel Details
  departure_city?: string;
  flight_class_preference?: string;
  hotel_rating_preference?: string;
  accommodation_type?: string;
  email?: string;
  
  // Dietary Preferences
  dietary_preferences: string[];
  halal_preferences?: string;
  vegetarian_preferences?: string;
}

export interface ChatRequest {
  message: string;
  context?: Record<string, any>;
}

export interface HotelSearchRequest {
  location: string;
  check_in: string;
  check_out: string;
  guests: number;
  budget_range?: string;
}

export interface RestaurantRequest {
  location: string;
  cuisine?: string;
  budget?: string;
  rating?: number;
}

// Flight Types
export interface FlightSearchRequest {
  from_location: string;
  to_location: string;
  departure_date: string;
  return_date?: string;
  passengers: number;
  class_type: string;
}

export interface FlightSegment {
  id: string;
  airline: string;
  airline_logo?: string;
  flight_number: string;
  departure: {
    airport: string;
    airport_name: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    airport_name: string;
    time: string;
    date: string;
  };
  duration: string;
  duration_minutes: number;
  amenities: string[];
  aircraft: string;
  travel_class: string;
  legroom?: string;
  overnight: boolean;
  often_delayed: boolean;
  ticket_also_sold_by: string[];
  plane_and_crew_by?: string;
}

export interface Layover {
  duration: number;
  airport: string;
  airport_name: string;
  overnight: boolean;
}

export interface CarbonEmissions {
  this_flight: number;
  typical_for_route: number;
  difference_percent: number;
}

export interface Flight {
  id: string;
  price: number;
  currency: string;
  stops: number;
  total_duration: string;
  total_duration_minutes: number;
  flight_type: string;
  airline_logo?: string;
  departure_token?: string;
  booking_token?: string;
  carbon_emissions: CarbonEmissions;
  extensions: string[];
  flight_segments: FlightSegment[];
  layovers: Layover[];
  rating: number;
  amenities: string[];
}

export interface FlightSearchResponse {
  success: boolean;
  flights: Flight[];
  total_count: number;
  message: string;
}

// Booking Options Types
export interface BookingOption {
  separate_tickets?: boolean;
  together?: BookingOptionDetails;
  departing?: BookingOptionDetails;
  returning?: BookingOptionDetails;
}

export interface BookingOptionDetails {
  book_with: string;
  airline_logos: string[];
  marketed_as: string[];
  price: number;
  local_prices: LocalPrice[];
  option_title: string;
  extensions: string[];
  baggage_prices: string[];
  booking_request: BookingRequest;
  booking_phone?: string;
  estimated_phone_service_fee?: number;
}

export interface LocalPrice {
  currency: string;
  price: number;
}

export interface BookingRequest {
  url: string;
  post_data: string;
}

export interface BaggagePrices {
  together?: string[];
  departing?: string[];
  returning?: string[];
}

export interface PriceInsights {
  lowest_price: number;
  price_level: string;
  typical_price_range: number[];
  price_history?: number[][];
}

export interface BookingOptionsResponse {
  selected_flights: any[];
  baggage_prices: BaggagePrices;
  booking_options: BookingOption[];
  price_insights?: PriceInsights;
}

export interface AirportSuggestion {
  code: string;
  name: string;
  city: string;
  country: string;
}

// Response Types
export interface DailyPlan {
  day: number;
  date: string;
  activities: Activity[];
  accommodation?: Hotel;
  meals: Restaurant[];
  totalCost?: number;
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  cost?: number;
  type: 'sightseeing' | 'restaurant' | 'transport' | 'hotel';
}

export interface Hotel {
  name: string;
  rating: number;
  price?: number;
  price_range?: string; // For backend compatibility
  amenities?: string[];
  location?: string;
  description?: string;
  image_url?: string;
}

export interface Restaurant {
  name: string;
  cuisine: string;
  rating: number;
  priceRange?: string;
  price_range?: string; // For backend compatibility
  description?: string;
  location?: string;
  image_url?: string;
}

// Enhanced API Response interfaces matching your backend
export interface PlaceDetails {
  position?: number;
  title: string;
  place_id: string;
  data_id?: string;
  data_cid?: string;
  reviews_link?: string;
  photos_link?: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
  place_id_search?: string;
  provider_id?: string;
  rating?: number;
  reviews?: number;
  price?: string;
  type?: string;
  types?: string[];
  type_id?: string;
  type_ids?: string[];
  address: string;
  open_state?: string;
  hours?: string;
  operating_hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  phone?: string;
  website?: string;
  extensions?: Array<{
    service_options?: string[];
  }>;
  unsupported_extensions?: Array<{
    accessibility?: string[];
  }>;
  service_options?: {
    dine_in?: boolean;
    takeout?: boolean;
    no_contact_delivery?: boolean;
    delivery?: boolean;
  };
  reserve_a_table?: string;
  order_online?: string;
  user_review?: string;
  thumbnail?: string;
  serpapi_thumbnail?: string;
  category: string;
  prefetched?: boolean;
  description?: string;
}

export interface AdditionalPlace {
  // Raw SERP API fields
  title?: string;  // SERP API uses 'title'
  name?: string;   // Keep for backward compatibility
  rating?: number;
  price_range?: string;
  amenities?: string[];
  location?: string;
  address?: string;  // SERP API uses 'address'
  description?: string;
  phone?: string;
  website?: string;
  thumbnail?: string;
  serpapi_thumbnail?: string;
  gps_coordinates?: {  // SERP API uses 'gps_coordinates'
    latitude: number;
    longitude: number;
  };
  coordinates?: {  // Keep for backward compatibility
    lat: number;
    lng: number;
  };
  place_id: string;
  category: string;
  prefetched?: boolean;
  cuisine?: string;
  hours?: string;
  // Additional SERP API fields
  reviews?: number;
  type?: string;
  types?: string[];
  open_state?: string;
  operating_hours?: any;
}

export interface EnhancedItineraryResponse {
  itinerary: {
    destination: string;
    total_days: number;
    budget_estimate: number;
    accommodation_suggestions: Array<{
      place_id: string;
      name: string;
      type: string;
      location: string;
      price_range: string;
      brief_description: string;
    }>;
    daily_plans: Array<{
      day: number;
      date: string;
      theme: string;
      activities: Array<{
        time: string;
        place_id: string;
        title: string;
        duration: string;
        estimated_cost: string;
        type: string;
      }>;
      meals: Array<{
        time: string;
        meal_type: string;
        place_id: string;
        name: string;
        cuisine: string;
        price_range: string;
      }>;
      transportation: Array<{
        from: string;
        to: string;
        method: string;
        duration: string;
        cost: string;
      }>;
    }>;
    place_ids_used: string[];
    travel_tips: string[];
  };
  place_details: Record<string, PlaceDetails>;
  additional_places: {
    hotels: AdditionalPlace[];
    restaurants: AdditionalPlace[];
    cafes: AdditionalPlace[];
    attractions: AdditionalPlace[];
    interest_based: AdditionalPlace[];
  };
  weather?: WeatherData;
  metadata: {
    total_places_prefetched: number;
    places_used_in_itinerary: number;
    additional_places_available: number;
    generation_timestamp: string;
    workflow_type: string;
    weather_included?: boolean;
  };
}

// Keep the old interface for backward compatibility
export interface ItineraryResponse {
  destination: string;
  total_days: number;
  budget_estimate: number;
  daily_plans: DailyPlan[];
  recommendations: {
    hotels: Hotel[];
    restaurants: Restaurant[];
    tips?: string[];
  };
  weather_info?: any;
}

// API Functions
export const itineraryAPI = {
  // Enhanced itinerary generation with complete place metadata
  generateEnhancedItinerary: async (data: ItineraryRequest): Promise<EnhancedItineraryResponse> => {
    try {
      // Use a longer timeout for enhanced itinerary generation (3 minutes)
      const response = await api.post('/generate-itinerary', data, {
        timeout: 180000 // 3 minutes timeout for comprehensive data generation
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to generate enhanced itinerary');
    }
  },

  // Legacy function for backward compatibility
  generateItinerary: async (data: ItineraryRequest): Promise<ItineraryResponse> => {
    try {
      // Use a longer timeout for itinerary generation (2 minutes)
      const response = await api.post('/generate-itinerary', data, {
        timeout: 120000 // 2 minutes timeout for AI generation
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to generate itinerary');
    }
  },



  placeById: async (place_id: string, gl?: string): Promise<any> => {
    const params: Record<string, string> = { place_id };
    if (gl) params.gl = gl;
    const response = await api.get('/places/by-id', { params });
    return response.data;
  },

  predictPrices: async (data: ItineraryRequest): Promise<APIResponse> => {
    try {
      const response = await api.post('/predict-prices', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to predict prices');
    }
  },
};

export const chatAPI = {
  sendMessage: async (data: ChatRequest): Promise<{response: string; context?: any}> => {
    try {
      const response = await api.post('/chat', data);
      return response.data; // This is the ChatResponse from backend
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to send message');
    }
  },

  getHistory: async (): Promise<APIResponse> => {
    try {
      const response = await api.get('/chat/history');
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get chat history');
    }
  },
};

export const hotelAPI = {
  searchHotels: async (data: HotelSearchRequest): Promise<APIResponse<Hotel[]>> => {
    try {
      const response = await api.post('/search-hotels', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to search hotels');
    }
  },

  getPopularHotels: async (location: string): Promise<APIResponse<Hotel[]>> => {
    try {
      const response = await api.get(`/hotels/${encodeURIComponent(location)}/popular`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get popular hotels');
    }
  },
};

export const restaurantAPI = {
  getRecommendations: async (data: RestaurantRequest): Promise<APIResponse<Restaurant[]>> => {
    try {
      const response = await api.post('/recommend-restaurants', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get restaurant recommendations');
    }
  },

  getPopularRestaurants: async (location: string): Promise<APIResponse<Restaurant[]>> => {
    try {
      const response = await api.get(`/restaurants/${encodeURIComponent(location)}/popular`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get popular restaurants');
    }
  },
};

export const flightAPI = {
  searchFlights: async (data: FlightSearchRequest): Promise<FlightSearchResponse> => {
    try {
      const response = await api.post('/flights/search', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to search flights');
    }
  },

  getPopularFlights: async (): Promise<Flight[]> => {
    try {
      const response = await api.get('/flights/popular');
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get popular flights');
    }
  },

  getFlightDetails: async (flightId: string): Promise<Flight> => {
    try {
      const response = await api.get(`/flights/${flightId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get flight details');
    }
  },

  bookFlight: async (flightId: string, passengers: number = 1): Promise<APIResponse> => {
    try {
      const response = await api.post(`/flights/book?flight_id=${flightId}&passengers=${passengers}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to book flight');
    }
  },

  getAirportSuggestions: async (query: string): Promise<AirportSuggestion[]> => {
    try {
      if (query.length < 2) return [];
      const response = await api.get(`/flights/airports/suggestions?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get airport suggestions');
    }
  },

  getBookingOptions: async (bookingToken: string): Promise<BookingOptionsResponse> => {
    try {
      console.log('Fetching booking options for token:', bookingToken);
      const response = await api.get(`/flights/booking-options/${encodeURIComponent(bookingToken)}`);
      console.log('Booking options response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching booking options:', error);
      throw new Error(error.userMessage || 'Failed to get booking options');
    }
  },
};

// Price Alerts API
export const alertsAPI = {
  createAlert: async (data: {
    destination: string;
    current_price: number;
    target_price: number;
    alert_type: 'flight' | 'hotel';
    check_in_date?: string;
    check_out_date?: string;
    departure_date?: string;
    return_date?: string;
    passengers?: number;
    guests?: number;
  }): Promise<APIResponse> => {
    try {
      const response = await api.post('/alerts/create', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to create price alert');
    }
  },

  getAlerts: async (params?: {
    user_id?: string;
    alert_type?: 'flight' | 'hotel';
    status?: 'active' | 'inactive' | 'triggered';
  }): Promise<APIResponse> => {
    try {
      const response = await api.get('/alerts', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get price alerts');
    }
  },

  updateAlert: async (alertId: string, data: {
    target_price?: number;
    is_active?: boolean;
  }): Promise<APIResponse> => {
    try {
      const response = await api.put(`/alerts/${alertId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to update price alert');
    }
  },

  deleteAlert: async (alertId: string): Promise<APIResponse> => {
    try {
      const response = await api.delete(`/alerts/${alertId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to delete price alert');
    }
  },

  toggleAlert: async (alertId: string): Promise<APIResponse> => {
    try {
      const response = await api.post(`/alerts/${alertId}/toggle`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to toggle price alert');
    }
  },

  getNotifications: async (params?: {
    user_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<APIResponse> => {
    try {
      const response = await api.get('/alerts/notifications', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get notifications');
    }
  },

  getAlertStats: async (user_id?: string): Promise<APIResponse> => {
    try {
      const response = await api.get('/alerts/stats', { params: { user_id } });
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get alert statistics');
    }
  },

  predictPrices: async (destination: string, alert_type: 'flight' | 'hotel', date_range: string): Promise<APIResponse> => {
    try {
      const response = await api.post('/alerts/predict-prices', null, {
        params: { destination, alert_type, date_range }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to predict prices');
    }
  }
};

// Affiliate API
export const affiliateAPI = {
  trackClick: async (data: {
    platform: string;
    destination: string;
    price?: number;
    search_query?: string;
    user_id?: string;
  }): Promise<APIResponse> => {
    try {
      const response = await api.post('/affiliate/track-click', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to track affiliate click');
    }
  },

  trackBooking: async (data: {
    click_id: string;
    booking_reference: string;
    booking_type: string;
    booking_amount: number;
    travel_date?: string;
    platform_booking_id?: string;
    customer_info?: any;
  }): Promise<APIResponse> => {
    try {
      const response = await api.post('/affiliate/track-booking', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to track affiliate booking');
    }
  },

  getClicks: async (params?: {
    platform?: string;
    user_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<APIResponse> => {
    try {
      const response = await api.get('/affiliate/clicks', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get affiliate clicks');
    }
  },

  getBookings: async (params?: {
    platform?: string;
    user_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<APIResponse> => {
    try {
      const response = await api.get('/affiliate/bookings', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get affiliate bookings');
    }
  },

  getReports: async (start_date: string, end_date: string, platform?: string): Promise<APIResponse> => {
    try {
      const response = await api.get('/affiliate/reports', {
        params: { start_date, end_date, platform }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get commission reports');
    }
  },

  getStats: async (): Promise<APIResponse> => {
    try {
      const response = await api.get('/affiliate/stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get affiliate statistics');
    }
  },

  getLinks: async (): Promise<APIResponse> => {
    try {
      const response = await api.get('/affiliate/links');
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get affiliate links');
    }
  }
};

// Authentication API
export const authAPI = {
  login: async (data: {
    email: string;
    password: string;
  }): Promise<{
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      is_email_verified: boolean;
      status: string;
      created_at: string;
      updated_at: string;
    };
  }> => {
    try {
      const response = await api.post('/auth/login', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Login failed');
    }
  },

  signup: async (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
    confirm_password: string;
  }): Promise<{
    message: string;
    user_id: string;
  }> => {
    try {
      const response = await api.post('/auth/signup', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Registration failed');
    }
  },

  logout: async (): Promise<{ message: string }> => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Logout failed');
    }
  },

  refreshToken: async (refresh_token: string): Promise<{
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      is_email_verified: boolean;
      status: string;
      created_at: string;
      updated_at: string;
    };
  }> => {
    try {
      const response = await api.post('/auth/refresh', { refresh_token });
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Token refresh failed');
    }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Password reset request failed');
    }
  },

  resetPassword: async (data: {
    token: string;
    new_password: string;
    confirm_password: string;
  }): Promise<{ message: string }> => {
    try {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Password reset failed');
    }
  },

  getProfile: async (): Promise<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    is_email_verified: boolean;
    status: string;
    created_at: string;
    updated_at: string;
  }> => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get profile');
    }
  },

  updateProfile: async (data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  }): Promise<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    is_email_verified: boolean;
    status: string;
    created_at: string;
    updated_at: string;
  }> => {
    try {
      const response = await api.put('/auth/me', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to update profile');
    }
  },

  changePassword: async (data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<{ message: string }> => {
    try {
      const response = await api.post('/auth/change-password', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Password change failed');
    }
  }
};

// Weather API Types
export interface WeatherData {
  location: {
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  current: {
    temperature: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    description: string;
    icon: string;
    wind_speed: number;
    wind_direction: number;
    visibility: number;
    uv_index: number;
  };
  recommendations: string[];
  timestamp: string;
}

export interface WeatherForecast {
  location: {
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  forecasts: Array<{
    datetime: string;
    temperature: {
      min: number;
      max: number;
      current: number;
    };
    humidity: number;
    description: string;
    icon: string;
    wind_speed: number;
    precipitation: number;
  }>;
  timestamp: string;
}

export interface WeatherForItinerary {
  formatted_weather: string;
  recommendations: string[];
  raw_data: WeatherData;
}

// Weather API
export const weatherAPI = {
  getCurrentWeather: async (city: string, country_code?: string): Promise<WeatherData> => {
    try {
      const params: Record<string, string> = { city };
      if (country_code) params.country_code = country_code;
      
      const response = await api.get('/weather/current', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get current weather');
    }
  },

  getWeatherForecast: async (city: string, country_code?: string, days: number = 5): Promise<WeatherForecast> => {
    try {
      const params: Record<string, string> = { city, days: days.toString() };
      if (country_code) params.country_code = country_code;
      
      const response = await api.get('/weather/forecast', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get weather forecast');
    }
  },

  getWeatherByCoordinates: async (lat: number, lon: number): Promise<WeatherData> => {
    try {
      const response = await api.get('/weather/coordinates', {
        params: { lat: lat.toString(), lon: lon.toString() }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get weather by coordinates');
    }
  },

  getWeatherForItinerary: async (city: string, country_code?: string): Promise<WeatherForItinerary> => {
    try {
      const params: Record<string, string> = { city };
      if (country_code) params.country_code = country_code;
      
      const response = await api.get('/weather/itinerary-format', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.userMessage || 'Failed to get weather for itinerary');
    }
  },
};

// Dashboard API
export const dashboardAPI = {
  getDashboardData: async (): Promise<{
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
      booking_id: string;
      type: string;
      status: string;
      total_amount: number;
      currency: string;
      travel_date: string;
      return_date?: string;
      passengers: number;
      destination: string;
      created_at: string;
    }>;
    upcoming_trips: Array<{
      id: string;
      booking_id: string;
      type: string;
      status: string;
      total_amount: number;
      currency: string;
      travel_date: string;
      return_date?: string;
      passengers: number;
      destination: string;
      days_until: number;
    }>;
    saved_itineraries: Array<{
      id: string;
      itinerary_id: string;
      title: string;
      destination: string;
      start_date?: string;
      end_date?: string;
      total_days: number;
      budget_estimate: number;
      currency: string;
      is_public: boolean;
      tags: string[];
      created_at?: string;
      updated_at?: string;
    }>;
    price_alerts: Array<{
      id: string;
      alert_id: string;
      type: string;
      destination: string;
      target_price: number;
      current_price: number;
      currency: string;
      departure_date?: string;
      return_date?: string;
      created_at?: string;
      last_checked?: string;
    }>;
    notifications: Array<{
      id: string;
      notification_id: string;
      type: string;
      status: string;
      title: string;
      message: string;
      data: Record<string, any>;
      is_read: boolean;
      created_at?: string;
      read_at?: string;
      action_url?: string;
    }>;
    travel_analytics: {
      monthly_trends: Array<Record<string, any>>;
      top_destinations: Array<Record<string, any>>;
      total_countries: number;
      average_booking_value: number;
    };
    session_analytics: {
      total_sessions: number;
      active_sessions: number;
      device_types: string[];
      last_activity?: string;
    };
    last_updated: string;
  }> => {
    try {
      const response = await api.get('/dashboard/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to load dashboard data');
    }
  },

  getStats: async (): Promise<{
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
  }> => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to load user stats');
    }
  },

  getRecentBookings: async (limit: number = 10): Promise<Array<{
    id: string;
    booking_id: string;
    type: string;
    status: string;
    total_amount: number;
    currency: string;
    travel_date: string;
    return_date?: string;
    passengers: number;
    destination: string;
    created_at: string;
  }>> => {
    try {
      const response = await api.get(`/dashboard/bookings?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to load recent bookings');
    }
  },

  getUpcomingTrips: async (limit: number = 5): Promise<Array<{
    id: string;
    booking_id: string;
    type: string;
    status: string;
    total_amount: number;
    currency: string;
    travel_date: string;
    return_date?: string;
    passengers: number;
    destination: string;
    days_until: number;
  }>> => {
    try {
      const response = await api.get(`/dashboard/trips?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to load upcoming trips');
    }
  },

  getSavedItineraries: async (limit: number = 10): Promise<Array<{
    id: string;
    itinerary_id: string;
    title: string;
    destination: string;
    start_date?: string;
    end_date?: string;
    total_days: number;
    budget_estimate: number;
    currency: string;
    is_public: boolean;
    tags: string[];
    created_at?: string;
    updated_at?: string;
  }>> => {
    try {
      const response = await api.get(`/saved-itinerary/?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to load saved itineraries');
    }
  },

  getPriceAlerts: async (): Promise<Array<{
    id: string;
    alert_id: string;
    type: string;
    destination: string;
    target_price: number;
    current_price: number;
    currency: string;
    departure_date?: string;
    return_date?: string;
    created_at?: string;
    last_checked?: string;
  }>> => {
    try {
      const response = await api.get('/dashboard/price-alerts');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to load price alerts');
    }
  },

  getNotifications: async (limit: number = 20): Promise<Array<{
    id: string;
    notification_id: string;
    type: string;
    status: string;
    title: string;
    message: string;
    data: Record<string, any>;
    is_read: boolean;
    created_at?: string;
    read_at?: string;
    action_url?: string;
  }>> => {
    try {
      const response = await api.get(`/dashboard/notifications?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to load notifications');
    }
  },

  getTravelAnalytics: async (): Promise<{
    monthly_trends: Array<Record<string, any>>;
    top_destinations: Array<Record<string, any>>;
    total_countries: number;
    average_booking_value: number;
  }> => {
    try {
      const response = await api.get('/dashboard/analytics');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to load travel analytics');
    }
  },

  getSessionAnalytics: async (): Promise<{
    total_sessions: number;
    active_sessions: number;
    device_types: string[];
    last_activity?: string;
  }> => {
    try {
      const response = await api.get('/dashboard/sessions');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to load session analytics');
    }
  },

  getPreferences: async (): Promise<{
    id: string;
    notification_preferences: Record<string, any>;
    travel_preferences: Record<string, any>;
    privacy_settings: Record<string, any>;
    theme_preference: string;
    language: string;
    region: string;
    updated_at?: string;
  }> => {
    try {
      const response = await api.get('/dashboard/preferences');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to load user preferences');
    }
  },

  updatePreferences: async (preferences: {
    notification_preferences?: Record<string, any>;
    travel_preferences?: Record<string, any>;
    privacy_settings?: Record<string, any>;
    theme_preference?: string;
    language?: string;
    region?: string;
  }): Promise<{ message: string }> => {
    try {
      const response = await api.put('/dashboard/preferences', preferences);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to update preferences');
    }
  },

  getActiveSessions: async (): Promise<Array<{
    id: string;
    session_id: string;
    device_type: string;
    device_name: string;
    ip_address: string;
    location?: Record<string, any>;
    last_activity: string;
    is_remember_me: boolean;
    created_at: string;
  }>> => {
    try {
      const response = await api.get('/dashboard/sessions');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to load active sessions');
    }
  },

  revokeSession: async (sessionId: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/dashboard/sessions/${sessionId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to revoke session');
    }
  },

  revokeAllSessions: async (): Promise<{ message: string; revoked_count: number }> => {
    try {
      const response = await api.delete('/dashboard/sessions');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to revoke sessions');
    }
  }
};

// Saved Itinerary API
export const savedItineraryAPI = {
  // Get all user itineraries
  getItineraries: async (params?: {
    limit?: number;
    skip?: number;
    status?: 'draft' | 'published' | 'archived';
    is_favorite?: boolean;
  }): Promise<Array<{
    id: string;
    title: string;
    description?: string;
    destination: string;
    country: string;
    city: string;
    duration_days: number;
    budget?: number;
    travel_style: string[];
    interests: string[];
    total_estimated_cost?: number;
    is_favorite: boolean;
    tags: string[];
    cover_image?: string;
    status: string;
    views_count: number;
    likes_count: number;
    shares_count: number;
    created_at: string;
    updated_at: string;
  }>> => {
    try {
      const response = await api.get('/saved-itinerary/', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to load itineraries');
    }
  },

  // Get specific itinerary
  getItinerary: async (itineraryId: string): Promise<{
    id: string;
    title: string;
    description?: string;
    destination: string;
    country: string;
    city: string;
    duration_days: number;
    budget?: number;
    travel_style: string[];
    interests: string[];
    total_estimated_cost?: number;
    is_favorite: boolean;
    tags: string[];
    cover_image?: string;
    status: string;
    views_count: number;
    likes_count: number;
    shares_count: number;
    created_at: string;
    updated_at: string;
    days: Array<{
      day_number: number;
      date?: string;
      activities: Array<{
        name: string;
        time: string;
        location: string;
        description: string;
        cost: number;
      }>;
      accommodations?: {
        name: string;
        type: string;
        cost_per_night: number;
      };
      transportation?: Record<string, any>;
      meals: Array<{
        name: string;
        time: string;
        location: string;
        description: string;
        cost: number;
      }>;
      notes?: string;
      estimated_cost?: number;
    }>;
    is_public: boolean;
  }> => {
    try {
      const response = await api.get(`/saved-itinerary/${itineraryId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to load itinerary');
    }
  },

  // Create new itinerary
  createItinerary: async (itineraryData: {
    title: string;
    description?: string;
    destination: string;
    country: string;
    city: string;
    duration_days: number;
    start_date?: string;
    end_date?: string;
    budget?: number;
    travel_style: string[];
    interests: string[];
    days: Array<{
      day_number: number;
      date?: string;
      activities: Array<{
        name: string;
        time: string;
        location: string;
        description: string;
        cost: number;
      }>;
      accommodations?: {
        name: string;
        type: string;
        cost_per_night: number;
      };
      transportation?: Record<string, any>;
      meals: Array<{
        name: string;
        time: string;
        location: string;
        description: string;
        cost: number;
      }>;
      notes?: string;
      estimated_cost?: number;
    }>;
  }): Promise<{
    id: string;
    title: string;
    description?: string;
    destination: string;
    country: string;
    city: string;
    duration_days: number;
    budget?: number;
    travel_style: string[];
    interests: string[];
    total_estimated_cost?: number;
    is_favorite: boolean;
    tags: string[];
    cover_image?: string;
    status: string;
    views_count: number;
    likes_count: number;
    shares_count: number;
    created_at: string;
    updated_at: string;
    days: Array<any>;
    is_public: boolean;
  }> => {
    try {
      const response = await api.post('/saved-itinerary/', itineraryData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to create itinerary');
    }
  },

  // Update itinerary
  updateItinerary: async (itineraryId: string, updateData: {
    title?: string;
    description?: string;
    destination?: string;
    country?: string;
    city?: string;
    duration_days?: number;
    start_date?: string;
    end_date?: string;
    budget?: number;
    travel_style?: string[];
    interests?: string[];
    days?: Array<any>;
    is_public?: boolean;
    tags?: string[];
    cover_image?: string;
    status?: string;
  }): Promise<{
    id: string;
    title: string;
    description?: string;
    destination: string;
    country: string;
    city: string;
    duration_days: number;
    budget?: number;
    travel_style: string[];
    interests: string[];
    total_estimated_cost?: number;
    is_favorite: boolean;
    tags: string[];
    cover_image?: string;
    status: string;
    views_count: number;
    likes_count: number;
    shares_count: number;
    created_at: string;
    updated_at: string;
    days: Array<any>;
    is_public: boolean;
  }> => {
    try {
      const response = await api.put(`/itineraries/${itineraryId}`, updateData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to update itinerary');
    }
  },

  // Delete itinerary
  deleteItinerary: async (itineraryId: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/itineraries/${itineraryId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to delete itinerary');
    }
  },

  // Toggle favorite
  toggleFavorite: async (itineraryId: string): Promise<{ message: string }> => {
    try {
      const response = await api.post(`/itineraries/${itineraryId}/favorite`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to toggle favorite');
    }
  },

  // Discover public itineraries
  discoverItineraries: async (params?: {
    limit?: number;
    skip?: number;
    destination?: string;
    travel_style?: string;
  }): Promise<Array<{
    id: string;
    title: string;
    description?: string;
    destination: string;
    country: string;
    city: string;
    duration_days: number;
    budget?: number;
    travel_style: string[];
    interests: string[];
    total_estimated_cost?: number;
    is_favorite: boolean;
    tags: string[];
    cover_image?: string;
    status: string;
    views_count: number;
    likes_count: number;
    shares_count: number;
    created_at: string;
    updated_at: string;
  }>> => {
    try {
      const response = await api.get('/saved-itinerary/public/discover', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to discover itineraries');
    }
  },

  // Get itinerary stats
  getItineraryStats: async (): Promise<{
    total_itineraries: number;
    published_itineraries: number;
    favorite_itineraries: number;
    draft_itineraries: number;
    total_views: number;
  }> => {
    try {
      const response = await api.get('/saved-itinerary/stats/summary');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to load itinerary stats');
    }
  },

  // Share itinerary
  shareItinerary: async (itineraryId: string): Promise<{
    message: string;
    public_url: string;
    share_token: string;
  }> => {
    try {
      const response = await api.post(`/saved-itinerary/${itineraryId}/share`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to share itinerary');
    }
  },

  // Get public itinerary
  getPublicItinerary: async (shareToken: string): Promise<{
    id: string;
    title: string;
    description?: string;
    destination: string;
    country: string;
    city: string;
    duration_days: number;
    budget?: number;
    travel_style: string[];
    interests: string[];
    total_estimated_cost?: number;
    is_favorite: boolean;
    tags: string[];
    cover_image?: string;
    status: string;
    views_count: number;
    likes_count: number;
    shares_count: number;
    created_at: string;
    updated_at: string;
    days: Array<any>;
    is_public: boolean;
  }> => {
    try {
      const response = await api.get(`/saved-itinerary/public/${shareToken}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to load public itinerary');
    }
  }
};

export default api; 