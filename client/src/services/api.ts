import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

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
  context?: string;
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

export const itineraryAPI = {
  generateItinerary: async (data: ItineraryRequest) => {
    const response = await api.post('/generate-itinerary', data);
    return response.data;
  },

  predictPrices: async (data: ItineraryRequest) => {
    const response = await api.post('/predict-prices', data);
    return response.data;
  },
};

export const chatAPI = {
  sendMessage: async (data: ChatRequest) => {
    const response = await api.post('/chat', data);
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/chat/history');
    return response.data;
  },
};

export const hotelAPI = {
  searchHotels: async (data: HotelSearchRequest) => {
    const response = await api.post('/search-hotels', data);
    return response.data;
  },

  getPopularHotels: async (location: string) => {
    const response = await api.get(`/hotels/${location}/popular`);
    return response.data;
  },
};

export const restaurantAPI = {
  getRecommendations: async (data: RestaurantRequest) => {
    const response = await api.post('/recommend-restaurants', data);
    return response.data;
  },

  getPopularRestaurants: async (location: string) => {
    const response = await api.get(`/restaurants/${location}/popular`);
    return response.data;
  },
};

export default api; 