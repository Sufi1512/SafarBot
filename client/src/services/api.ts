import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
    
    // Transform error for better user experience
    if (error.response?.status === 500) {
      error.userMessage = 'Server error. Please try again later.';
    } else if (error.response?.status === 404) {
      error.userMessage = 'Service not found. Please check your connection.';
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.userMessage = 'Request timed out. The server is taking longer than expected. Please try again.';
    } else if (!error.response) {
      error.userMessage = 'Network error. Please check your connection.';
    } else {
      error.userMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
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

export interface Flight {
  id: string;
  airline: string;
  flight_number: string;
  departure: {
    airport: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    time: string;
    date: string;
  };
  duration: string;
  price: number;
  stops: number;
  rating: number;
  amenities: string[];
}

export interface FlightSearchResponse {
  success: boolean;
  flights: Flight[];
  total_count: number;
  message: string;
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
};

export default api; 