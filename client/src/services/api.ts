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
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  interests: string[];
  travelers: number;
  accommodation_type?: string;
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
  name: string;
  rating?: number;
  price_range?: string;
  amenities?: string[];
  location?: string;
  description?: string;
  phone?: string;
  website?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  place_id: string;
  category: string;
  prefetched?: boolean;
  cuisine?: string;
  hours?: string;
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
    interest_based: PlaceDetails[];
  };
  metadata: {
    total_places_prefetched: number;
    places_used_in_itinerary: number;
    additional_places_available: number;
    generation_timestamp: string;
    workflow_type: string;
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

export default api; 