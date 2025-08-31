import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, DollarSign, Clock, Star, AlertCircle, Hotel, Utensils } from 'lucide-react';
import { itineraryAPI, hotelAPI, restaurantAPI } from '../services/api';
import api from '../services/api';
import GoogleMaps from '../components/GoogleMaps';

// Import Location interface from GoogleMaps component
interface Location {
  id: string;
  name: string;
  type: 'destination' | 'hotel' | 'restaurant' | 'activity';
  position: {
    lat: number;
    lng: number;
  };
  description?: string;
  rating?: number;
  price?: string | number;
  image?: string;
}

interface DailyPlan {
  day: number;
  date: string;
  activities: Activity[];
  accommodation?: Hotel;
  meals: Restaurant[];
  transport?: Activity[];
  totalCost?: number;
}

interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  cost?: number;
  type: 'sightseeing' | 'restaurant' | 'transport' | 'hotel';
  image?: string;
}

interface Hotel {
  name: string;
  rating: number;
  price?: number;
  price_range?: string;
  amenities?: string[];
  location?: string;
  description?: string;
  image?: string;
}

interface Restaurant {
  name: string;
  cuisine: string;
  rating: number;
  priceRange?: string;
  price_range?: string;
  description?: string;
  location?: string;
  image?: string;
}

interface ItineraryData {
  destination: string;
  startDate: string;
  endDate: string;
  days: number;
  travelers: number;
  budget: number;
  interests: string[];
  apiRequest?: {
    destination: string;
    start_date: string;
    end_date: string;
    budget: number;
    interests: string[];
    travelers: number;
    accommodation_type: string;
  };
}

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [itineraryData, setItineraryData] = useState<ItineraryData | null>(null);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'hotels' | 'restaurants'>('itinerary');
  const [itinerarySummary, setItinerarySummary] = useState<{
    total_days: number;
    budget_estimate: number;
    destination: string;
  } | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const [weatherInfo, setWeatherInfo] = useState<any>(null);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const hasGeneratedRef = useRef(false);
  // SERP restaurants state removed since SERP API functionality was removed

  // SERP cache state removed since SERP API functionality was removed
  
  // Hover popup state for all cards
  const [hoveredItem, setHoveredItem] = useState<Activity | Hotel | Restaurant | null>(null);
  const [hoveredItemType, setHoveredItemType] = useState<'activity' | 'hotel' | 'restaurant' | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function for hover events
  const handleMouseEnter = (e: React.MouseEvent, item: Activity | Hotel | Restaurant, type: 'activity' | 'hotel' | 'restaurant') => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPosition({ x: rect.right + 10, y: rect.top });
    setHoveredItem(item);
    setHoveredItemType(type);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
      setHoveredItemType(null);
      setHoverPosition(null);
    }, 300);
  };

  // SERP image cache state removed since SERP API functionality was removed

  const resolveCoordsWithSerp = async (query: string) => {
    // SERP API functionality has been removed
    console.log('SERP API functionality has been removed:', query);
    return;
  };

  // SERP API functionality for fetching restaurants has been removed
  useEffect(() => {
    console.log('SERP API functionality for restaurants has been removed');
    // No longer fetching restaurants via SERP API
  }, [itineraryData?.destination]);

  // Function to extract locations for Google Maps
  const extractLocations = () => {
    const locations: Location[] = [];
    
    console.log('extractLocations called with:', {
      itineraryData,
      hotels: hotels.length,
      restaurants: restaurants.length,
      dailyPlans: dailyPlans.length
    });
    console.log('Hotels data:', hotels);
    console.log('Restaurants data:', restaurants);
    console.log('Daily plans data:', dailyPlans);
    
    // Mumbai area coordinates for different neighborhoods
    const mumbaiAreas = {
      'City Center': { lat: 19.0760, lng: 72.8777 },
      'Bandra': { lat: 19.0596, lng: 72.8295 },
      'Dadar': { lat: 19.0170, lng: 72.8478 },
      'Mahim': { lat: 19.0400, lng: 72.8400 },
      'Worli': { lat: 19.0170, lng: 72.8146 },
      'Colaba': { lat: 18.9217, lng: 72.8347 },
      'Fort': { lat: 18.9323, lng: 72.8336 },
      'Marine Drive': { lat: 18.9433, lng: 72.8237 },
      'Lower Parel': { lat: 18.9939, lng: 72.8300 },
      'Mahalaxmi': { lat: 18.9822, lng: 72.8180 },
      'Elephanta Island': { lat: 18.9633, lng: 72.9316 },
      'Mumbai Airport (BOM)': { lat: 19.0896, lng: 72.8656 },
      'Juhu': { lat: 19.0996, lng: 72.8347 },
      'Andheri': { lat: 19.1197, lng: 72.8464 },
      'Bandra Kurla Complex': { lat: 19.0596, lng: 72.8683 },
      'Kurla': { lat: 19.0759, lng: 72.8777 },
      'Chembur': { lat: 19.0596, lng: 72.8983 },
      'Sewri': { lat: 19.0050, lng: 72.8600 },
      'Trombay': { lat: 19.0200, lng: 72.9100 },
      'Downtown': { lat: 19.0760, lng: 72.8777 },
      'Old Town': { lat: 19.0170, lng: 72.8478 },
      'Waterfront': { lat: 19.0170, lng: 72.8146 },
      'Outskirts': { lat: 19.1197, lng: 72.8464 }
    };
    
    if (itineraryData?.destination) {
      // Add destination
      locations.push({
        id: 'destination',
        name: itineraryData.destination,
        type: 'destination' as const,
        position: mumbaiAreas['City Center'],
        description: 'Your travel destination'
      });
      console.log('Added destination:', itineraryData.destination);
      // Fire off a SERP lookup to refine destination center
      resolveCoordsWithSerp(itineraryData.destination);
    }

    // Add hotels with real coordinates based on their location
    hotels.forEach((hotel, index) => {
      if (hotel.location) {
        console.log('Processing hotel location:', hotel.location);
        
        // Find coordinates by searching both location and hotel name
        const searchText = `${hotel.location || ''} ${hotel.name || ''}`.toLowerCase();
        const areaKey = Object.keys(mumbaiAreas).find(key => {
          const match = searchText.includes(key.toLowerCase());
          console.log(`Checking if "${searchText}" contains "${key}": ${match}`);
          return match;
        });
        
        // SERP positioning removed - using default coordinates
        const position = (
          areaKey ? mumbaiAreas[areaKey as keyof typeof mumbaiAreas] : 
          { lat: 19.0760 + (index * 0.01), lng: 72.8777 + (index * 0.01) }
        );
        
        console.log(`Hotel "${hotel.name}" location "${hotel.location}" mapped to area "${areaKey}" at position:`, position);
        // SERP coordinate resolution removed
        
        locations.push({
          id: `hotel-${index}`,
          name: hotel.name,
          type: 'hotel' as const,
          position,
          description: hotel.description,
          rating: hotel.rating,
          price: hotel.price
        });
        console.log('Added hotel:', hotel.name, 'at position:', position);
      }
    });

    // Add restaurants with real coordinates based on their location
    restaurants.forEach((restaurant, index) => {
      if (restaurant.location) {
        console.log('Processing restaurant location:', restaurant.location);
        
        // Find coordinates by searching both location and restaurant name
        const searchText = `${restaurant.location || ''} ${restaurant.name || ''}`.toLowerCase();
        const areaKey = Object.keys(mumbaiAreas).find(key => {
          const match = searchText.includes(key.toLowerCase());
          console.log(`Checking if "${searchText}" contains "${key}": ${match}`);
          return match;
        });
        
        // SERP positioning removed - using default coordinates
        const position = (
          areaKey ? mumbaiAreas[areaKey as keyof typeof mumbaiAreas] : 
          { lat: 19.0760 + (index * 0.015), lng: 72.8777 + (index * 0.015) }
        );
        
        console.log(`Restaurant "${restaurant.name}" location "${restaurant.location}" mapped to area "${areaKey}" at position:`, position);
        // SERP coordinate resolution removed
        
        locations.push({
          id: `restaurant-${index}`,
          name: restaurant.name,
          type: 'restaurant' as const,
          position,
          description: restaurant.description,
          rating: restaurant.rating,
          price: restaurant.priceRange
        });
        console.log('Added restaurant:', restaurant.name, 'at position:', position);
      }
    });

    // Add activities from daily plans with real coordinates
    dailyPlans.forEach((plan, planIndex) => {
      plan.activities.forEach((activity, activityIndex) => {
        if (activity.location && activity.location !== itineraryData?.destination) {
          console.log('Processing activity location:', activity.location);
          
          // Find coordinates by searching location text
          const searchText = activity.location.toLowerCase();
          const areaKey = Object.keys(mumbaiAreas).find(key => {
            const match = searchText.includes(key.toLowerCase());
            console.log(`Checking if "${searchText}" contains "${key}": ${match}`);
            return match;
          });
          
          // SERP positioning removed - using default coordinates
          const position = (
            areaKey ? mumbaiAreas[areaKey as keyof typeof mumbaiAreas] : 
            { lat: 19.0760 + (planIndex * 0.02) + (activityIndex * 0.005), lng: 72.8777 + (planIndex * 0.02) + (activityIndex * 0.005) }
          );
          
          console.log(`Activity "${activity.title}" location "${activity.location}" mapped to area "${areaKey}" at position:`, position);
          // SERP coordinate resolution removed
          
          locations.push({
            id: `activity-${planIndex}-${activityIndex}`,
            name: activity.title,
            type: 'activity' as const,
            position,
            description: activity.description
          });
          console.log('Added activity:', activity.title, 'at position:', position);
        }
      });
    });

    // SERP restaurants functionality removed
    console.log('Total locations extracted:', locations.length);
    console.log('Locations:', locations);
    return locations;
  };

  useEffect(() => {
    console.log('useEffect triggered:', { 
      hasState: !!location.state, 
      hasGenerated: hasGeneratedRef.current,
      isLoading,
      locationState: location.state
    });
    
    // If no location state, redirect to home
    if (!location.state) {
      console.log('No location state, redirecting to home');
      navigate('/');
      return;
    }
    
    // If we're already loading, don't start another process
    if (isLoading) {
      console.log('Already loading, skipping...');
      return;
    }
    
    // If we already have the data, don't regenerate
    if (hasGeneratedRef.current) {
      console.log('Itinerary already generated, skipping...');
      return;
    }
    
    // Start itinerary generation
    console.log('Starting itinerary generation...');
    setItineraryData(location.state);
    generateRealItinerary(location.state);
  }, [location.state, navigate, isLoading]);
  
  // Separate useEffect for cleanup when location state changes
  useEffect(() => {
    return () => {
      // Reset flags when component unmounts or location changes
      hasGeneratedRef.current = false;
      setRetryCount(0);
    };
  }, [location.state]);

  const generateRealItinerary = async (data: ItineraryData) => {
    console.log('generateRealItinerary called with data:', data);
    
    // Prevent duplicate API calls and add retry limit
    if (isLoading) {
      console.log('API call already in progress, skipping...');
      return;
    }
    
    // Double-check with ref to prevent multiple calls
    if (hasGeneratedRef.current) {
      console.log('Itinerary already generated (ref check), skipping...');
      return;
    }
    
    if (retryCount >= 3) {
      console.log('Max retry count reached. Not using mock data.');
      setError('API calls failed after multiple attempts. Please try again later.');
      return;
    }
    
    console.log(`Attempt ${retryCount + 1} of 3`);
    
    console.log('Setting loading state and starting API call...');
    setIsLoading(true);
    setError(null);

    try {
      // Use the API request data if available, otherwise prepare it
      const apiRequest = data.apiRequest || {
        destination: data.destination,
        start_date: data.startDate,
        end_date: data.endDate,
        budget: data.budget,
        interests: data.interests,
        travelers: data.travelers,
        accommodation_type: 'hotel'
      };

      console.log('Sending API request:', apiRequest);
      console.log('API base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1');

      // Generate itinerary with timeout
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000) // 30 second timeout
      );
      
      console.log('About to call itineraryAPI.generateItinerary...');
      
      // Fast health check (non-blocking)
      api.get('/health', { timeout: 5000 }).then((resp) => {
        console.log('Health check:', resp.status);
      }).catch((healthError) => {
        console.warn('Health check failed (non-blocking):', healthError?.message || healthError);
      });
      
      let itineraryResponse;
      try {
        // Rely on axios timeout in itineraryAPI (120s) instead of local 30s race
        itineraryResponse = await itineraryAPI.generateItinerary(apiRequest) as any;
      console.log('Raw itinerary response:', itineraryResponse);
      console.log('Response keys:', Object.keys(itineraryResponse || {}));
      console.log('Response structure check:');
      console.log('- Has data property:', 'data' in (itineraryResponse || {}));
      console.log('- Has daily_plans property:', 'daily_plans' in (itineraryResponse || {}));
      console.log('- Data property:', itineraryResponse?.data);
      console.log('- Daily plans property:', itineraryResponse?.daily_plans);
      } catch (apiError: any) {
        console.error('API call failed:', apiError);
        
        // If it's a network/connection error, use mock data
        if (apiError.message?.includes('Network Error') || 
            apiError.message?.includes('timeout') ||
            apiError.code === 'ECONNABORTED') {
          console.log('Network error detected. Not using mock data.');
          setError('Network error while generating itinerary. Please check your connection and try again.');
          return;
        }
        
        throw apiError;
      }
      
      // Handle the response structure from your backend
      // Check if response is wrapped in a 'data' property or direct
      const actualData = itineraryResponse?.data || itineraryResponse;
      console.log('Using actual data:', actualData);
      
      if (actualData && actualData.daily_plans !== undefined) {
        // Check if we got actual itinerary data
        if (actualData.daily_plans.length === 0) {
          console.warn('Received empty daily_plans from AI');
          throw new Error('AI could not generate a detailed itinerary. This might be due to complex requirements or server issues.');
        }
        
        // Process daily plans and normalize the data
        const normalizedDailyPlans = actualData.daily_plans.map((plan: any) => ({
          ...plan,
          activities: plan.activities.map((activity: any) => ({
            ...activity,
            cost: activity.cost || 0,
            type: activity.type || 'sightseeing'
          })),
          meals: plan.meals.map((meal: any) => ({
            ...meal,
            priceRange: meal.priceRange || meal.price_range || '$$',
            description: meal.description || `Great ${meal.cuisine} cuisine`,
            location: meal.location || actualData.destination
          }))
        }));
        
        setDailyPlans(normalizedDailyPlans);
        
        // Set itinerary summary
        setItinerarySummary({
          total_days: actualData.total_days || data.days,
          budget_estimate: actualData.budget_estimate || 0,
          destination: actualData.destination || data.destination
        });
        
        // Update recommendations if available
        if (actualData.recommendations) {
          if (actualData.recommendations.hotels) {
            // Normalize hotel data from backend
            const normalizedHotels = actualData.recommendations.hotels.map((hotel: any) => ({
              ...hotel,
              price: hotel.price || 100, // Default price if not provided
              priceRange: hotel.price_range || '$$',
              amenities: hotel.amenities || ['WiFi'],
              location: hotel.location || actualData.destination,
              description: hotel.description || `Great hotel in ${actualData.destination}`
            }));
            setHotels(normalizedHotels);
          }
          if (actualData.recommendations.restaurants) {
            // Normalize restaurant data from backend
            const normalizedRestaurants = actualData.recommendations.restaurants.map((restaurant: any) => ({
              ...restaurant,
              priceRange: restaurant.price_range || restaurant.priceRange || '$$',
              description: restaurant.description || `Excellent ${restaurant.cuisine} cuisine`,
              location: restaurant.location || actualData.destination
            }));
            setRestaurants(normalizedRestaurants);
          }
          if (actualData.recommendations.tips) {
            setTips(actualData.recommendations.tips);
          }
        }
        
        // Set weather info if available
        if (actualData.weather_info) {
          setWeatherInfo(actualData.weather_info);
        }
        
        // Mark as successfully generated
        hasGeneratedRef.current = true;
        console.log('✅ Successfully processed itinerary response');
      } else {
        console.error('❌ Invalid response format. Expected daily_plans but got:', {
          hasData: !!itineraryResponse?.data,
          hasDirectDailyPlans: !!itineraryResponse?.daily_plans,
          actualDataKeys: Object.keys(actualData || {}),
          actualData: actualData
        });
        throw new Error('Invalid response format from server - missing daily_plans');
      }

      // Only fetch additional hotels/restaurants if we don't have them from the itinerary
      if (!actualData.recommendations?.hotels || actualData.recommendations.hotels.length === 0) {
        setHotelsLoading(true);
        try {
          const hotelResponse = await hotelAPI.getPopularHotels(data.destination);
          if (hotelResponse.success) {
            setHotels(hotelResponse.data || []);
          }
        } catch (hotelError) {
          console.warn('Could not fetch hotels:', hotelError);
        } finally {
          setHotelsLoading(false);
        }
      }

      if (!actualData.recommendations?.restaurants || actualData.recommendations.restaurants.length === 0) {
        setRestaurantsLoading(true);
        try {
          const restaurantResponse = await restaurantAPI.getPopularRestaurants(data.destination);
          if (restaurantResponse.success) {
            setRestaurants(restaurantResponse.data || []);
          }
        } catch (restaurantError) {
          console.warn('Could not fetch restaurants:', restaurantError);
        } finally {
          setRestaurantsLoading(false);
        }
      }

    } catch (error) {
      console.error('Error generating itinerary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate itinerary. Please try again.';
      setError(errorMessage);
      
      // Increment retry count for next attempt
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDayActivities = (day: number): Activity[] => {
    const activities: Activity[] = [];
    
    if (day === 1) {
      activities.push(
        {
          time: '09:00',
          title: 'Arrival & Hotel Check-in',
          description: 'Check into your hotel and freshen up',
          location: 'Grand Hotel Central',
          duration: '1 hour',
          type: 'hotel'
        },
        {
          time: '10:30',
          title: 'City Orientation Walk',
          description: 'Explore the historic city center and main landmarks',
          location: 'City Center',
          duration: '2 hours',
          cost: 25,
          type: 'sightseeing'
        },
        {
          time: '14:00',
          title: 'Local Market Visit',
          description: 'Experience local culture and cuisine at the central market',
          location: 'Downtown',
          duration: '1.5 hours',
          cost: 15,
          type: 'sightseeing'
        }
      );
    } else if (day === 2) {
      activities.push(
        {
          time: '08:00',
          title: 'Museum Visit',
          description: 'Explore the famous art museum and cultural exhibits',
          location: 'Colaba',
          duration: '3 hours',
          cost: 30,
          type: 'sightseeing'
        },
        {
          time: '14:00',
          title: 'Beach Walk',
          description: 'Relax and enjoy the beautiful beach views',
          location: 'Juhu',
          duration: '2 hours',
          cost: 10,
          type: 'sightseeing'
        }
      );
    } else if (day === 3) {
      activities.push(
        {
          time: '09:00',
          title: 'Bandra Exploration',
          description: 'Visit Bandra Fort and explore the trendy neighborhood',
          location: 'Bandra',
          duration: '4 hours',
          cost: 20,
          type: 'sightseeing'
        },
        {
          time: '14:00',
          title: 'Shopping at Linking Road',
          description: 'Shop for souvenirs and local products',
          location: 'Bandra',
          duration: '2 hours',
          cost: 0,
          type: 'sightseeing'
        }
      );
    } else {
      activities.push(
        {
          time: '09:00',
          title: 'Day Trip to Elephanta Caves',
          description: 'Visit the historic cave temples and enjoy boat ride',
          location: 'Outskirts',
          duration: '6 hours',
          cost: 50,
          type: 'sightseeing'
        }
      );
    }
    
    return activities;
  };

  const generateDayMeals = (day: number): Restaurant[] => {
    const restaurantPool = [
      { name: 'Local Bistro', cuisine: 'Local', rating: 4.5, priceRange: '$$', description: 'Authentic local dishes', location: 'Downtown' },
      { name: 'Seafood Grill', cuisine: 'Seafood', rating: 4.7, priceRange: '$$$', description: 'Fresh seafood', location: 'Waterfront' },
      { name: 'Traditional Cafe', cuisine: 'Traditional', rating: 4.3, priceRange: '$', description: 'Cozy traditional cafe', location: 'Old Town' },
      { name: 'Fine Dining', cuisine: 'International', rating: 4.8, priceRange: '$$$$', description: 'Upscale dining experience', location: 'City Center' }
    ];
    
    return [
      restaurantPool[day % restaurantPool.length],
      restaurantPool[(day + 1) % restaurantPool.length],
      restaurantPool[(day + 2) % restaurantPool.length]
    ];
  };

  if (!itineraryData) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            {/* Left side - Back button and Logo/Name */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/trip-planner')}
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {itineraryData.destination} Itinerary
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {itineraryData.days} days • {itineraryData.travelers} traveler{itineraryData.travelers > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right side - Trip details */}
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">
                  {new Date(itineraryData.startDate).toLocaleDateString()} - {new Date(itineraryData.endDate).toLocaleDateString()}
                </span>
                <span className="sm:hidden">
                  {new Date(itineraryData.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Budget: ${itineraryData.budget}</span>
                <span className="sm:hidden">${itineraryData.budget}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 pt-28">
                {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-8">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Crafting Your Perfect Journey
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto text-lg">
              Our AI is analyzing {itineraryData.destination} and creating a personalized itinerary just for you.
            </p>
            <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span>Analyzing destinations</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span>Finding accommodations</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <span>Selecting restaurants</span>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mb-8">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error.includes('timeout') ? 'Request Timed Out' : 'Something went wrong'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto text-lg">{error}</p>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Attempt {retryCount} of 3
              </p>
            )}
            
            {error.includes('timeout') && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-8 max-w-lg mx-auto">
                <p className="text-amber-800 dark:text-amber-200">
                  💡 <strong>Tip:</strong> AI itinerary generation can take time. Try simplifying your request or check your internet connection.
                </p>
              </div>
            )}
            
            {retryCount >= 3 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8 max-w-lg mx-auto">
                <p className="text-red-800 dark:text-red-200">
                  ⚠️ <strong>Maximum retries reached:</strong> Please try again later or adjust your request.
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  if (itineraryData) {
                    hasGeneratedRef.current = false;
                    setRetryCount(0); // Reset retry count
                    generateRealItinerary(itineraryData);
                  }
                }}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Try Again
              </button>
              {/* Removed sample itinerary option to enforce real data only */}
            </div>
          </div>
        ) : (
          <>
            {/* Tabs - Only show when not loading and no error */}
            <div className="mb-8">
              <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                {[
                  { id: 'itinerary', label: 'Itinerary', icon: '🗓️' },
                  { id: 'hotels', label: 'Accommodations', icon: '🏨' },
                  { id: 'restaurants', label: 'Dining', icon: '🍽️' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg font-medium transition-all duration-300 text-xs ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-1.5 text-sm">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Layout: Itinerary (2/3) and Map (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
              {/* Left Side - Itinerary Content (2/3) */}
              <div className="lg:col-span-2 space-y-8 w-full">
                {/* Itinerary Summary */}
                {activeTab === 'itinerary' && itinerarySummary && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 w-full">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                    Journey Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {itinerarySummary.total_days}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">Total Days</div>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                          ${itinerarySummary.budget_estimate.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">Estimated Budget</div>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {dailyPlans.length}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">Planned Days</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'itinerary' && (
                <>
                  {/* Weather Information */}
                  {weatherInfo && (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 w-full">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        🌤️ Weather Information
                      </h3>
                      <div className="text-gray-600 dark:text-gray-400">
                        {typeof weatherInfo === 'string' ? (
                          <p className="text-lg">{weatherInfo}</p>
                        ) : (
                          <pre className="text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">{JSON.stringify(weatherInfo, null, 2)}</pre>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Travel Tips */}
                  {tips.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 w-full">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        💡 Travel Tips
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tips.map((tip, index) => (
                          <div key={index} className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
                            <span className="text-amber-500 mt-1 text-lg">•</span>
                            <p className="text-gray-700 dark:text-gray-300">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dailyPlans.map((plan) => (
                    <div key={plan.day} className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 w-full">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Day {plan.day}</h2>
                          <p className="text-xl text-gray-600 dark:text-gray-400">{plan.date}</p>
                        </div>
                        {plan.accommodation && (
                          <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Staying at</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{plan.accommodation.name}</p>
                            <div className="flex items-center justify-end text-amber-500">
                              <Star className="w-4 h-4 mr-1 fill-current" />
                              <span className="text-sm font-medium">{plan.accommodation.rating}</span>
                            </div>
                          </div>
                        )}
                      </div>

                                           {/* Accommodation Info */}
                     {plan.accommodation && (
                       <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                         <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🏨 Accommodation</h4>
                         <div className="flex items-center justify-between">
                           <div>
                             <p className="font-medium text-gray-900 dark:text-white">{plan.accommodation.name}</p>
                             <p className="text-sm text-gray-600 dark:text-gray-300">{plan.accommodation.location}</p>
                             {plan.accommodation.description && (
                               <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{plan.accommodation.description}</p>
                             )}
                           </div>
                           <div className="text-right">
                             <div className="flex items-center text-amber-500 mb-1">
                               <Star className="w-4 h-4 mr-1 fill-current" />
                               <span className="font-medium">{plan.accommodation.rating}</span>
                             </div>
                             {plan.accommodation.price && (
                               <p className="text-sm text-gray-600 dark:text-gray-300">${plan.accommodation.price}/night</p>
                             )}
                           </div>
                         </div>
                         {plan.accommodation.amenities && plan.accommodation.amenities.length > 0 && (
                           <div className="mt-3 flex flex-wrap gap-2">
                             {plan.accommodation.amenities.map((amenity, idx) => (
                               <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                                 {amenity}
                               </span>
                             ))}
                           </div>
                         )}
                       </div>
                     )}

                                           {/* Activities Timeline */}
                     <div className="space-y-6">
                       {plan.activities.map((activity, index) => (
                        <div 
                          key={index} 
                          className="flex items-start space-x-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-all duration-200 transform hover:scale-[1.02]"
                          onMouseEnter={(e) => handleMouseEnter(e, activity, 'activity')}
                          onMouseLeave={handleMouseLeave}
                        >
                           <div className="flex-shrink-0 w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center">
                             <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                           </div>
                           <div className="flex-1">
                             <div className="flex items-center justify-between mb-3">
                               <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{activity.title}</h4>
                               <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                                 {activity.time}
                               </span>
                             </div>
                             <p className="text-gray-600 dark:text-gray-400 mb-4">{activity.description}</p>
                             <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                               <span className="flex items-center space-x-2">
                                 <MapPin className="w-4 h-4" />
                                 <span>{activity.location}</span>
                               </span>
                               <span className="flex items-center space-x-2">
                                 <Clock className="w-4 h-4" />
                                 <span>{activity.duration}</span>
                               </span>
                               {activity.cost && (
                                 <span className="flex items-center space-x-2 text-green-600 dark:text-green-400 font-medium">
                                   <DollarSign className="w-4 h-4" />
                                   <span>${activity.cost}</span>
                                 </span>
                               )}
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>

                                           {/* Transport Information */}
                     {plan.transport && plan.transport.length > 0 && (
                       <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                         <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🚗 Transportation</h3>
                         <div className="space-y-3">
                           {plan.transport.map((transport, index) => (
                             <div key={index} className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-800">
                               <div className="flex items-center justify-between">
                                 <div>
                                   <h4 className="font-medium text-gray-900 dark:text-white">{transport.title || `Transport ${index + 1}`}</h4>
                                   <p className="text-sm text-gray-600 dark:text-gray-300">{transport.description}</p>
                                   {transport.location && (
                                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                       <MapPin className="w-3 h-3 inline mr-1" />
                                       {transport.location}
                                     </p>
                                   )}
                                 </div>
                                 <div className="text-right">
                                   {transport.cost && (
                                     <p className="text-sm font-medium text-green-600 dark:text-green-400">${transport.cost}</p>
                                   )}
                                   {transport.duration && (
                                     <p className="text-xs text-gray-500 dark:text-gray-400">{transport.duration}</p>
                                   )}
                                 </div>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                                           {/* Meals */}
                     <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                       <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                         <Utensils className="w-5 h-5 mr-2" />
                         Dining
                       </h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {plan.meals.map((restaurant, index) => {
                           const mealTimes = ['Breakfast', 'Lunch', 'Dinner'];
                           return (
                             <div 
                               key={index} 
                               className="p-5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200 transform hover:scale-[1.02]"
                               onMouseEnter={(e) => handleMouseEnter(e, restaurant, 'restaurant')}
                               onMouseLeave={handleMouseLeave}
                             >
                               <div className="flex items-center justify-between mb-3">
                                 <h5 className="font-semibold text-gray-900 dark:text-white">{mealTimes[index]}</h5>
                                 <div className="flex items-center text-amber-500">
                                   <Star className="w-4 h-4 fill-current mr-1" />
                                   <span className="text-sm font-medium">{restaurant.rating}</span>
                                 </div>
                               </div>
                               <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{restaurant.name}</h4>
                               <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{restaurant.cuisine} • {restaurant.priceRange}</p>
                               {restaurant.description && (
                                 <p className="text-xs text-gray-500 dark:text-gray-400">{restaurant.description}</p>
                               )}
                               {restaurant.location && (
                                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                   <MapPin className="w-3 h-3 inline mr-1" />
                                   {restaurant.location}
                                 </p>
                               )}
                             </div>
                           );
                         })}
                       </div>
                     </div>
                    </div>
                  ))}

                                     {/* Total Cost Summary */}
                   {dailyPlans.length > 0 && (
                     <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                       <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">💰 Cost Summary</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div>
                           <h4 className="font-medium text-gray-900 dark:text-white mb-4">Daily Breakdown</h4>
                           <div className="space-y-3">
                             {dailyPlans.map((plan) => {
                               const dayCost = plan.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
                               return (
                                 <div key={plan.day} className="flex justify-between text-sm">
                                   <span className="font-medium text-gray-700 dark:text-gray-300">Day {plan.day}</span>
                                   <span className="font-medium text-blue-600 dark:text-blue-400">${dayCost}</span>
                                 </div>
                               );
                             })}
                           </div>
                         </div>
                         <div>
                           <h4 className="font-medium text-gray-900 dark:text-white mb-4">Total Estimated Cost</h4>
                           <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                             ${dailyPlans.reduce((total, plan) => {
                               const dayCost = plan.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
                               return total + dayCost;
                             }, 0).toLocaleString()}
                           </div>
                           <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Activities only (excluding accommodation & meals)</p>
                         </div>
                       </div>
                     </div>
                   )}
                </>
              )}

              {activeTab === 'hotels' && (
                <>
                  {hotelsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="loading-spinner mx-auto mb-4"></div>
                        <p className="text-gray-300">Loading hotels...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                                           {/* Hotels Summary */}
                     <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                       <div className="flex items-center justify-between">
                         <div>
                           <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">🏨 Hotel Recommendations</h3>
                           <p className="text-sm text-gray-600 dark:text-gray-300">
                             {hotels.length} hotel{hotels.length !== 1 ? 's' : ''} found for {itineraryData?.destination}
                           </p>
                         </div>
                         <div className="text-right">
                           <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                             {hotels.length > 0 ? 
                               Math.round(hotels.reduce((sum, hotel) => sum + (hotel.rating || 0), 0) / hotels.length * 10) / 10 
                               : 0
                             }
                           </div>
                           <div className="text-sm text-gray-600 dark:text-gray-300">Average Rating</div>
                         </div>
                       </div>
                     </div>

                                     {/* Hotels Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {hotels.length > 0 ? (
                       hotels.map((hotel, index) => (
                         <div 
                           key={index} 
                           className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                           onMouseEnter={(e) => handleMouseEnter(e, hotel, 'hotel')}
                           onMouseLeave={handleMouseLeave}
                         >
                           <div className="flex items-start justify-between mb-4">
                             <h4 className="font-bold text-gray-900 dark:text-white text-lg">{hotel.name}</h4>
                             <div className="flex items-center text-amber-500">
                               <Star className="w-4 h-4 fill-current mr-1" />
                               <span className="text-sm font-medium">{hotel.rating}</span>
                             </div>
                           </div>
                           <p className="text-gray-600 dark:text-gray-400 mb-4">{hotel.description}</p>
                           <div className="space-y-3 text-sm">
                             <div className="flex items-center text-gray-500 dark:text-gray-400">
                               <MapPin className="w-4 h-4 mr-2" />
                               {hotel.location}
                             </div>
                             {hotel.price && (
                               <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                                 <DollarSign className="w-4 h-4 mr-2" />
                                 ${hotel.price}/night
                               </div>
                             )}
                           </div>
                           {hotel.amenities && hotel.amenities.length > 0 && (
                             <div className="flex flex-wrap gap-2 mt-4">
                               {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                                 <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded-full font-medium">
                                   {amenity}
                                 </span>
                               ))}
                             </div>
                           )}
                         </div>
                       ))
                     ) : (
                       <div className="col-span-full text-center py-16 text-gray-500 dark:text-gray-400">
                         <Hotel className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                         <p className="text-lg">No accommodations found for this destination.</p>
                       </div>
                     )}
                   </div>
                  </>
                  )}
                </>
              )}

              {activeTab === 'restaurants' && (
                <>
                  {restaurantsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="loading-spinner mx-auto mb-4"></div>
                        <p className="text-gray-300">Loading restaurants...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                                           {/* Restaurants Summary */}
                     <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                       <div className="flex items-center justify-between">
                         <div>
                           <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">🍽️ Restaurant Recommendations</h3>
                           <p className="text-sm text-gray-600 dark:text-gray-300">
                             {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found for {itineraryData?.destination}
                           </p>
                         </div>
                         <div className="text-right">
                           <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                             {restaurants.length > 0 ? 
                               Math.round(restaurants.reduce((sum, restaurant) => sum + (restaurant.rating || 0), 0) / restaurants.length * 10) / 10 
                               : 0
                             }
                           </div>
                           <div className="text-sm text-gray-600 dark:text-gray-300">Average Rating</div>
                         </div>
                       </div>
                     </div>

                                     {/* Cuisine Filter */}
                   {restaurants.length > 0 && (
                     <div className="mb-6">
                       <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Filter by Cuisine</h4>
                       <div className="flex flex-wrap gap-2">
                         {Array.from(new Set(restaurants.map(r => r.cuisine))).map((cuisine) => (
                           <button
                             key={cuisine}
                             className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                           >
                             {cuisine}
                           </button>
                         ))}
                       </div>
                     </div>
                   )}

                                     {/* Restaurants Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {restaurants.length > 0 ? (
                       restaurants.map((restaurant, index) => (
                         <div 
                           key={index} 
                           className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                           onMouseEnter={(e) => handleMouseEnter(e, restaurant, 'restaurant')}
                           onMouseLeave={handleMouseLeave}
                         >
                           <div className="flex items-start justify-between mb-4">
                             <h4 className="font-bold text-gray-900 dark:text-white text-lg">{restaurant.name}</h4>
                             <div className="flex items-center text-amber-500">
                               <Star className="w-4 h-4 fill-current mr-1" />
                               <span className="text-sm font-medium">{restaurant.rating}</span>
                             </div>
                           </div>
                           <p className="text-gray-600 dark:text-gray-400 mb-4">{restaurant.description}</p>
                           <div className="space-y-3 text-sm">
                             <div className="flex items-center text-gray-500 dark:text-gray-400">
                               <MapPin className="w-4 h-4 mr-2" />
                               {restaurant.location}
                             </div>
                             <div className="flex items-center justify-between">
                               <span className="mr-2">🍽️</span>
                               {restaurant.cuisine} • {restaurant.priceRange || restaurant.price_range || '$$'}
                             </div>
                           </div>
                         </div>
                       ))
                     ) : (
                       <div className="col-span-full text-center py-16 text-gray-500 dark:text-gray-400">
                         <Utensils className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                         <p className="text-lg">No restaurants found for this destination.</p>
                       </div>
                     )}
                   </div>
                  </>
                  )}
                </>
              )}
              </div>

              {/* Right Side - Google Maps (1/3) */}
              <div className="lg:col-span-1 w-full">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 h-[800px] sticky top-24 w-full">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    🗺️ Interactive Map
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Explore all locations from your itinerary
                  </p>
                  {(() => {
                    const locations = extractLocations();
                    return (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        📍 {locations.length} location{locations.length !== 1 ? 's' : ''} found
                      </div>
                    );
                  })()}
                  <div className="h-full w-full min-h-0 flex-1" style={{ minHeight: '600px' }}>
                    {(() => {
                      const locations = extractLocations();
                      console.log('Passing locations to GoogleMaps:', locations);
                      console.log('itineraryData:', itineraryData);
                      console.log('hotels:', hotels);
                      console.log('restaurants:', restaurants);
                      console.log('dailyPlans:', dailyPlans);
                      console.log('Map container dimensions:', { height: 'h-full', minHeight: '600px' });
                      
                      // Always show at least the destination if we have itinerary data
                      if (locations.length === 0 && itineraryData?.destination) {
                        console.log('No locations found, creating fallback destination location');
                        const fallbackLocation = {
                          id: 'fallback-destination',
                          name: itineraryData.destination,
                          type: 'destination' as const,
                          position: { lat: 19.0760, lng: 72.8777 },
                          description: 'Your travel destination'
                        };
                        return <GoogleMaps locations={[fallbackLocation]} />;
                      }
                      
                      // If still no locations, show a test location to verify map is working
                      if (locations.length === 0) {
                        console.log('No locations at all, showing test location');
                        const testLocation = {
                          id: 'test-location',
                          name: 'Test Location',
                          type: 'destination' as const,
                          position: { lat: 19.0760, lng: 72.8777 },
                          description: 'Test location to verify map functionality'
                        };
                        return <GoogleMaps locations={[testLocation]} />;
                      }
                      
                      // Ensure we always have at least one marker
                      const locationsWithTest = [...locations];
                      if (locationsWithTest.length === 0) {
                        console.log('No locations at all, creating default marker');
                        const defaultLocation = {
                          id: 'default-marker',
                          name: 'Mumbai Center',
                          type: 'destination' as const,
                          position: { lat: 19.0760, lng: 72.8777 },
                          description: 'Default location marker'
                        };
                        locationsWithTest.push(defaultLocation);
                      }
                      
                      console.log('Final locations being passed to GoogleMaps:', locationsWithTest);
                      return <GoogleMaps locations={locationsWithTest} />;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Universal Hover Popup */}
      {hoveredItem && hoverPosition && hoveredItemType && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[280px] max-w-[400px] pointer-events-none"
          style={{
            left: hoverPosition.x,
            top: hoverPosition.y,
            transform: 'translateY(-50%)'
          }}
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
            }
          }}
        >
          <div className="space-y-3">
            {/* Activity Popup */}
            {hoveredItemType === 'activity' && (
              <>
                {/* Image section */}
                {(hoveredItem as Activity).image && (
                  <div className="mb-3 -m-4 -mt-4">
                    <img 
                      src={(hoveredItem as Activity).image} 
                      alt={(hoveredItem as Activity).title}
                      className="w-full h-32 object-cover rounded-t-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{(hoveredItem as Activity).title}</h4>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-sm font-medium">
                    {(hoveredItem as Activity).time}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {(hoveredItem as Activity).description}
                </p>
                
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{(hoveredItem as Activity).location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{(hoveredItem as Activity).duration}</span>
                  </div>
                  {(hoveredItem as Activity).cost && (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                      <DollarSign className="w-3 h-3" />
                      <span>${(hoveredItem as Activity).cost}</span>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-400 dark:text-gray-500 capitalize pt-1 border-t border-gray-100 dark:border-gray-700">
                  {(hoveredItem as Activity).type} activity
                </div>
              </>
            )}

            {/* Hotel Popup */}
            {hoveredItemType === 'hotel' && (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{(hoveredItem as Hotel).name}</h4>
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    <span className="text-sm font-medium">{(hoveredItem as Hotel).rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {(hoveredItem as Hotel).description}
                </p>
                
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{(hoveredItem as Hotel).location}</span>
                  </div>
                  {(hoveredItem as Hotel).price && (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                      <DollarSign className="w-3 h-3" />
                      <span>${(hoveredItem as Hotel).price}/night</span>
                    </div>
                  )}
                </div>
                
                {(hoveredItem as Hotel).amenities && (hoveredItem as Hotel).amenities!.length > 0 && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">Amenities:</div>
                    <div className="flex flex-wrap gap-1">
                      {(hoveredItem as Hotel).amenities!.slice(0, 4).map((amenity, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs rounded">
                          {amenity}
                        </span>
                      ))}
                      {(hoveredItem as Hotel).amenities!.length > 4 && (
                        <span className="text-xs text-gray-400">+{(hoveredItem as Hotel).amenities!.length - 4} more</span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-400 dark:text-gray-500 capitalize pt-1 border-t border-gray-100 dark:border-gray-700">
                  🏨 Accommodation
                </div>
              </>
            )}

            {/* Restaurant Popup */}
            {hoveredItemType === 'restaurant' && (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{(hoveredItem as Restaurant).name}</h4>
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    <span className="text-sm font-medium">{(hoveredItem as Restaurant).rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {(hoveredItem as Restaurant).description}
                </p>
                
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{(hoveredItem as Restaurant).location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Utensils className="w-3 h-3" />
                    <span>{(hoveredItem as Restaurant).cuisine}</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                    <DollarSign className="w-3 h-3" />
                    <span>{(hoveredItem as Restaurant).priceRange || (hoveredItem as Restaurant).price_range}</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 dark:text-gray-500 capitalize pt-1 border-t border-gray-100 dark:border-gray-700">
                  🍽️ Restaurant
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPage; 