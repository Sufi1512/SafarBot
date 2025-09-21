import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, DollarSign, Clock, Star, AlertCircle, Hotel, Utensils } from 'lucide-react';
import { itineraryAPI, EnhancedItineraryResponse, PlaceDetails, AdditionalPlace } from '../services/api';
import api from '../services/api';
import GoogleMaps from '../components/GoogleMaps';
import PlaceDetailsModal from '../components/PlaceDetailsModal';
import AdditionalPlaces from '../components/AdditionalPlaces';
import EnhancedHoverPopup from '../components/EnhancedHoverPopup';
import WeatherCard from '../components/WeatherCard';
import { WeatherDisplay } from '../components/WeatherDisplay';
import ModernHeader from '../components/ModernHeader';

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
  theme?: string;
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
  
  // Enhanced API Response State
  const [enhancedResponse, setEnhancedResponse] = useState<EnhancedItineraryResponse | null>(null);
  const [allPlaceDetails, setAllPlaceDetails] = useState<Record<string, PlaceDetails>>({});
  const [weatherData, setWeatherData] = useState<any>(null);
  
  // Legacy state for backward compatibility
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'additional' | 'map'>('itinerary');
  const [itinerarySummary, setItinerarySummary] = useState<{
    total_days: number;
    budget_estimate: number;
    destination: string;
  } | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const hasGeneratedRef = useRef(false);

  // Place Details Modal State
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | AdditionalPlace | null>(null);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  
  // Enhanced hover popup state for all cards
  const [hoveredPlace, setHoveredPlace] = useState<PlaceDetails | AdditionalPlace | null>(null);
  const [hoveredPlaceType, setHoveredPlaceType] = useState<'activity' | 'hotel' | 'restaurant' | 'attraction' | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [isHoverPopupVisible, setIsHoverPopupVisible] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Legacy hover state for backward compatibility
  const [hoveredItem, setHoveredItem] = useState<Activity | Hotel | Restaurant | null>(null);
  const [hoveredItemType, setHoveredItemType] = useState<'activity' | 'hotel' | 'restaurant' | null>(null);

  // Enhanced helper function for hover events with place details
  const handlePlaceHover = (
    e: React.MouseEvent,
    place: PlaceDetails | AdditionalPlace,
    type: 'activity' | 'hotel' | 'restaurant' | 'attraction'
  ) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate optimal position
    let x = rect.right + 15; // Add more space for better UX
    let y = rect.top + (rect.height / 2); // Center vertically on the element
    
    // Check if popup would go off-screen to the right
    if (x + 400 > viewportWidth - 20) { // 400px is max popup width
      x = rect.left - 415; // Position to the left with 15px gap
    }
    
    // Check if popup would go off-screen vertically
    if (y + 300 > viewportHeight - 20) { // 300px is approximate popup height
      y = viewportHeight - 320;
    }
    if (y < 20) {
      y = 20;
    }
    
    setHoverPosition({ x, y });
    setHoveredPlace(place);
    setHoveredPlaceType(type);
    setIsHoverPopupVisible(true);
  };

  const handlePlaceHoverLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredPlace(null);
      setHoveredPlaceType(null);
      setHoverPosition(null);
      setIsHoverPopupVisible(false);
    }, 150); // Reduced delay for more responsive feel
  };

  // Legacy helper function for hover events (for backward compatibility)
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



  // SERP API functionality for fetching restaurants has been removed
  useEffect(() => {
    console.log('SERP API functionality for restaurants has been removed');
    // No longer fetching restaurants via SERP API
  }, [itineraryData?.destination]);

  // Helper functions for enhanced API
  // (Removed unused handlePlaceClick to satisfy linter)

  const handleAddToItinerary = (place: PlaceDetails | AdditionalPlace) => {
    // For now, just close the modal. In the future, this could add to itinerary
    console.log('Adding place to itinerary:', place);
    setIsPlaceModalOpen(false);
    // TODO: Implement actual itinerary addition logic
  };

  // Enhanced location extraction with place details
  const extractLocations = () => {
    const locations: Location[] = [];
    
    console.log('Enhanced extractLocations called with:', {
      enhancedResponse: !!enhancedResponse,
      placeDetailsCount: Object.keys(allPlaceDetails).length,
      itineraryData,
      hotels: hotels.length,
      dailyPlans: dailyPlans.length
    });
    
    // Default coordinates for fallback (will be updated based on destination)
    let defaultCoordinates = { lat: 40.7128, lng: -74.0060 }; // New York as global default
    
    // Try to get destination coordinates from the destination name
    const getDestinationCoordinates = (destination: string) => {
      // Common city coordinates - this should ideally come from backend API
      const cityCoordinates: Record<string, { lat: number; lng: number }> = {
        // Major global cities
        'new york': { lat: 40.7128, lng: -74.0060 },
        'london': { lat: 51.5074, lng: -0.1278 },
        'paris': { lat: 48.8566, lng: 2.3522 },
        'tokyo': { lat: 35.6762, lng: 139.6503 },
        'rome': { lat: 41.9028, lng: 12.4964 },
        'barcelona': { lat: 41.3851, lng: 2.1734 },
        'sydney': { lat: -33.8688, lng: 151.2093 },
        'dubai': { lat: 25.2048, lng: 55.2708 },
        'riyadh': { lat: 24.7136, lng: 46.6753 },
        'singapore': { lat: 1.3521, lng: 103.8198 },
        'mumbai': { lat: 19.0760, lng: 72.8777 },
        'delhi': { lat: 28.7041, lng: 77.1025 },
        'bangalore': { lat: 12.9716, lng: 77.5946 },
        'istanbul': { lat: 41.0082, lng: 28.9784 },
        'amsterdam': { lat: 52.3676, lng: 4.9041 },
        'berlin': { lat: 52.5200, lng: 13.4050 },
        'madrid': { lat: 40.4168, lng: -3.7038 },
        'los angeles': { lat: 34.0522, lng: -118.2437 },
        'san francisco': { lat: 37.7749, lng: -122.4194 },
        'chicago': { lat: 41.8781, lng: -87.6298 },
        'toronto': { lat: 43.6510, lng: -79.3470 },
        'vancouver': { lat: 49.2827, lng: -123.1207 },
        'beijing': { lat: 39.9042, lng: 116.4074 },
        'shanghai': { lat: 31.2304, lng: 121.4737 },
        'hong kong': { lat: 22.3193, lng: 114.1694 },
        'seoul': { lat: 37.5665, lng: 126.9780 },
        'bangkok': { lat: 13.7563, lng: 100.5018 },
        'kuala lumpur': { lat: 3.1390, lng: 101.6869 },
        'jakarta': { lat: -6.2088, lng: 106.8456 },
        'manila': { lat: 14.5995, lng: 120.9842 },
        'moscow': { lat: 55.7558, lng: 37.6176 },
        'st petersburg': { lat: 59.9311, lng: 30.3609 },
        'cairo': { lat: 30.0444, lng: 31.2357 },
        'cape town': { lat: -33.9249, lng: 18.4241 },
        'johannesburg': { lat: -26.2041, lng: 28.0473 },
        'lagos': { lat: 6.5244, lng: 3.3792 },
        'nairobi': { lat: -1.2921, lng: 36.8219 },
        'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
        'sao paulo': { lat: -23.5558, lng: -46.6396 },
        'buenos aires': { lat: -34.6118, lng: -58.3960 },
        'mexico city': { lat: 19.4326, lng: -99.1332 },
        'lima': { lat: -12.0464, lng: -77.0428 }
      };
      
      const destLower = destination.toLowerCase().trim();
      return cityCoordinates[destLower] || defaultCoordinates;
    };
    
    // Set default coordinates based on destination
    const destination = itineraryData?.destination || enhancedResponse?.itinerary?.destination;
    if (destination) {
      defaultCoordinates = getDestinationCoordinates(destination);
    }

    // Helper function to get coordinates from place details
    const getCoordinatesFromPlace = (placeDetails: PlaceDetails | null, fallbackIndex: number = 0) => {
      if (placeDetails?.gps_coordinates) {
        return {
          lat: placeDetails.gps_coordinates.latitude,
          lng: placeDetails.gps_coordinates.longitude
        };
      }
      // Fallback to destination-based coordinates with slight offset
      return {
        lat: defaultCoordinates.lat + (fallbackIndex * 0.01),
        lng: defaultCoordinates.lng + (fallbackIndex * 0.01)
      };
    };

    // Add destination
    if (destination) {
      locations.push({
        id: 'destination',
        name: destination,
        type: 'destination' as const,
        position: defaultCoordinates,
        description: 'Your travel destination'
      });
      console.log('Added destination:', destination, 'at coordinates:', defaultCoordinates);
    }

    // Add places from enhanced response place details
    if (enhancedResponse?.place_details) {
      console.log('Processing enhanced place details...');
      Object.entries(enhancedResponse.place_details).forEach(([placeId, placeDetails], index) => {
        // Skip places with invalid data
        if (!placeDetails.title || !placeDetails.title.trim()) {
          console.log(`Skipping place with invalid title: ${placeId}`);
          return;
        }
        
        const position = getCoordinatesFromPlace(placeDetails, index);
        
        // Validate coordinates before adding
        if (isNaN(position.lat) || isNaN(position.lng)) {
          console.log(`Skipping place with invalid coordinates: ${placeDetails.title} at ${position}`);
          return;
        }
        
        locations.push({
          id: placeId,
          name: placeDetails.title,
          type: (placeDetails.category === 'hotels' ? 'hotel' : 
                 placeDetails.category === 'restaurants' ? 'restaurant' : 'activity') as 'hotel' | 'restaurant' | 'activity',
          position,
          description: placeDetails.description || placeDetails.address,
          rating: placeDetails.rating,
          price: (placeDetails as any).price_range || (placeDetails as any).price,
          // Extra metadata for richer map popups
          address: placeDetails.address,
          website: placeDetails.website,
          phone: (placeDetails as any).phone,
          open_state: (placeDetails as any).open_state,
          hours: placeDetails.hours || (placeDetails as any).operating_hours,
          thumbnail: placeDetails.thumbnail || placeDetails.serpapi_thumbnail
        } as any);
        
        console.log(`Added enhanced place: ${placeDetails.title} at`, position);
      });
    }

    // Add hotels with real coordinates based on their location
    hotels.forEach((hotel, index) => {
      if (hotel.location) {
        console.log('Processing hotel location:', hotel.location);
        
        // Use default coordinates with offset for hotels
        const position = {
          lat: defaultCoordinates.lat + (index * 0.01),
          lng: defaultCoordinates.lng + (index * 0.01)
        };
        
        console.log(`Hotel "${hotel.name}" location "${hotel.location}" positioned at:`, position);
        
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



    // Add activities from daily plans with real coordinates
    dailyPlans.forEach((plan, planIndex) => {
      plan.activities.forEach((activity, activityIndex) => {
        if (activity.location && activity.location !== destination) {
          console.log('Processing activity location:', activity.location);
          
          // Use default coordinates with offset for activities
          const position = {
            lat: defaultCoordinates.lat + (planIndex * 0.02) + (activityIndex * 0.005),
            lng: defaultCoordinates.lng + (planIndex * 0.02) + (activityIndex * 0.005)
          };
          
          console.log(`Activity "${activity.title}" location "${activity.location}" positioned at:`, position);
          
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

    // Support injecting a ready enhanced itinerary via navigation state
    const injected = (location.state as any)?.injectedEnhancedResponse as EnhancedItineraryResponse | undefined;
    if (injected) {
      console.log('Detected injected enhanced itinerary in navigation state. Rendering without API call.');
      const injectedMeta = (location.state as any);
      // Build minimal ItineraryData from injected meta if available
      const dataFromInjected: ItineraryData = {
        destination: injected.itinerary?.destination || injectedMeta.destination || 'Trip',
        startDate: injectedMeta.startDate || new Date().toISOString(),
        endDate: injectedMeta.endDate || new Date().toISOString(),
        days: injected.itinerary?.total_days || injectedMeta.days || injected.itinerary?.daily_plans?.length || 1,
        travelers: injectedMeta.travelers || 1,
        budget: injected.itinerary?.budget_estimate || injectedMeta.budget || 0,
        interests: injectedMeta.interests || []
      };
      setItineraryData(dataFromInjected);
      try {
        processEnhancedItineraryResponse(injected, dataFromInjected);
      } catch (e) {
        console.error('Failed to process injected itinerary:', e);
        setError(e instanceof Error ? e.message : 'Failed to render provided itinerary');
      }
      return;
    }
    
    // Start itinerary generation (API)
    console.log('Starting itinerary generation...');
    setItineraryData(location.state as any);
    generateRealItinerary(location.state as any);
  }, [location.state, navigate]);
  
  // Separate useEffect for cleanup when location state changes
  useEffect(() => {
    return () => {
      // Reset flags when component unmounts or location changes
      hasGeneratedRef.current = false;
    };
  }, [location.state]);

  // Scroll detection for ModernHeader visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    
    console.log(`Attempt 1 of 1`);
    
    console.log('Setting loading state and starting API call...');
    setIsLoading(true);
    setError(null);

    try {
      // Use the API request data if available, otherwise prepare it
      const apiRequest = {
        ...(data.apiRequest || {
          destination: data.destination,
          start_date: data.startDate,
          end_date: data.endDate,
          budget: data.budget,
          interests: data.interests,
          travelers: data.travelers,
          accommodation_type: 'hotel'
        }),
        dietary_preferences: (data.apiRequest as any)?.dietary_preferences || []
      };

      console.log('Sending API request:', apiRequest);
      console.log('API base URL:', import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || (
        import.meta.env.PROD 
          ? 'https://safarbot-uevw.onrender.com/api/v1' 
          : 'http://localhost:8000/api/v1'
      ));

      // Generate enhanced itinerary
      
      console.log('About to call enhanced itineraryAPI...');
      
      // Fast health check (non-blocking)
      api.get('/health', { timeout: 5000 }).then((resp) => {
        console.log('Health check:', resp.status);
      }).catch((healthError) => {
        console.warn('Health check failed (non-blocking):', healthError?.message || healthError);
      });
      
      let enhancedItineraryResponse;
      try {
        // Use the enhanced API with complete place metadata
        enhancedItineraryResponse = await itineraryAPI.generateEnhancedItinerary(apiRequest);
        console.log('Enhanced itinerary response received:', enhancedItineraryResponse);
        console.log('Response keys:', Object.keys(enhancedItineraryResponse || {}));
        console.log('Itinerary structure:', enhancedItineraryResponse?.itinerary);
        console.log('Place details count:', Object.keys(enhancedItineraryResponse?.place_details || {}).length);
        console.log('Additional places:', enhancedItineraryResponse?.additional_places);
        console.log('Metadata:', enhancedItineraryResponse?.metadata);
      } catch (apiError: any) {
        console.error('Enhanced API call failed:', apiError);
        
        // If it's a network/connection error, show error
        if (apiError.message?.includes('Network Error') || 
            apiError.message?.includes('timeout') ||
            (apiError as any).code === 'ECONNABORTED') {
          console.log('Network error detected.');
          setError('Network error while generating enhanced itinerary. Please check your connection and try again.');
          return;
        }
        
        throw apiError;
      }
      
      // Process and store the response in state
      processEnhancedItineraryResponse(enhancedItineraryResponse, data);

    } catch (error) {
      console.error('Error generating itinerary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate itinerary. Please try again.';
      setError(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to process an already available enhanced response (injected or from API)
  const processEnhancedItineraryResponse = (enhancedItineraryResponse: EnhancedItineraryResponse, dataFallback?: ItineraryData) => {
    // Store the complete enhanced response
    setEnhancedResponse(enhancedItineraryResponse);
    setAllPlaceDetails(enhancedItineraryResponse?.place_details || {});
    
    // Extract weather data from response
    if (enhancedItineraryResponse?.weather) {
      setWeatherData(enhancedItineraryResponse.weather);
      console.log('✅ Weather data extracted from response:', enhancedItineraryResponse.weather);
    } else {
      console.log('⚠️ No weather data found in response');
    }

    // Handle the itinerary part of the response
    const itineraryDataInner = enhancedItineraryResponse?.itinerary as any;
    console.log('Processing itinerary data (helper):', itineraryDataInner);
    
    if (itineraryDataInner && itineraryDataInner.daily_plans !== undefined) {
      if (itineraryDataInner.daily_plans.length === 0) {
        console.warn('Received empty daily_plans from enhanced API');
        throw new Error('AI could not generate a detailed itinerary. This might be due to complex requirements or server issues.');
      }

      // Process daily plans from enhanced API
      const normalizedDailyPlans = itineraryDataInner.daily_plans.map((plan: any) => ({
        ...plan,
        activities: plan.activities.map((activity: any) => {
          const placeDetails = enhancedItineraryResponse?.place_details?.[activity.place_id];
          return {
            ...activity,
            cost: activity.estimated_cost || 0,
            type: activity.type || 'sightseeing',
            location: placeDetails?.address || activity.location || itineraryDataInner.destination,
            description: placeDetails?.description || activity.title
          };
        }),
        meals: plan.meals?.map((meal: any) => {
          const placeDetails = enhancedItineraryResponse?.place_details?.[meal.place_id];
          return {
            ...meal,
            priceRange: meal.price_range || '$$',
            description: placeDetails?.description || `Great ${meal.cuisine} cuisine`,
            location: placeDetails?.address || meal.location || itineraryDataInner.destination,
            rating: placeDetails?.rating || 4.0
          };
        }) || [],
        transport: plan.transportation?.map((transport: any) => ({
          ...transport,
          cost: transport.cost || 0
        })) || []
      }));

      setDailyPlans(normalizedDailyPlans);

      // Set itinerary summary from enhanced response
      setItinerarySummary({
        total_days: itineraryDataInner.total_days || dataFallback?.days,
        budget_estimate: itineraryDataInner.budget_estimate || 0,
        destination: itineraryDataInner.destination || dataFallback?.destination
      });

      // Convert accommodation suggestions to legacy hotel format for compatibility
      if (itineraryDataInner.accommodation_suggestions) {
        const hotelsFromAccommodation = itineraryDataInner.accommodation_suggestions.map((acc: any) => {
          const placeDetails = enhancedItineraryResponse?.place_details?.[acc.place_id];
          return {
            name: acc.name,
            rating: placeDetails?.rating || 4.0,
            price_range: acc.price_range,
            amenities: ['WiFi'],
            location: placeDetails?.address || acc.location,
            description: placeDetails?.description || `Great ${acc.type} in ${itineraryDataInner.destination}`,
            place_id: acc.place_id
          } as any;
        });
        setHotels(hotelsFromAccommodation);
      }

      // Set travel tips
      let allTips: string[] = [];
      if (itineraryDataInner.travel_tips) {
        allTips = [...itineraryDataInner.travel_tips];
      }
      
      // Add weather recommendations if available
      if (enhancedItineraryResponse?.weather?.recommendations) {
        allTips = [...allTips, ...enhancedItineraryResponse.weather.recommendations];
      }
      
      setTips(allTips);

      hasGeneratedRef.current = true;
      console.log('✅ Successfully processed enhanced itinerary (helper)');
    } else {
      console.error('❌ Invalid enhanced response format. Expected daily_plans but got:', {
        hasItinerary: !!enhancedItineraryResponse?.itinerary,
        hasPlaceDetails: !!enhancedItineraryResponse?.place_details,
        itineraryKeys: Object.keys(itineraryDataInner || {}),
        itineraryData: itineraryDataInner
      });
      throw new Error('Invalid enhanced response format from server - missing itinerary data');
    }
  };



  if (!itineraryData) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900 overflow-x-hidden">
      {/* ModernHeader - appears when scrolling */}
      {isScrolled && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <ModernHeader />
        </div>
      )}
      
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
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {enhancedResponse?.itinerary.destination || itineraryData.destination} Itinerary
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {enhancedResponse?.itinerary.total_days || itineraryData.days} days • {itineraryData.travelers} traveler{itineraryData.travelers > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right side - Trip details only */}
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
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
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 pt-8">
                {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-8">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
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
            
            {error.includes('timeout') && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-8 max-w-lg mx-auto">
                <p className="text-amber-800 dark:text-amber-200">
                  💡 <strong>Tip:</strong> AI itinerary generation can take time. Try simplifying your request or check your internet connection.
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  if (itineraryData) {
                    hasGeneratedRef.current = false;
                    generateRealItinerary(itineraryData);
                  }
                }}
                className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
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
                  { id: 'additional', label: 'Explore More', icon: '✨' },
                  { id: 'map', label: 'Map View', icon: '🗺️' }
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

            {/* Action Buttons - Simple and Small */}
            <div className="flex items-center justify-center space-x-3 mb-8">
              <button
                onClick={() => navigate('/itinerary', { state: { itineraryData: enhancedResponse } })}
                className="flex items-center space-x-2 px-6 py-3 bg-secondary-500 hover:bg-secondary-600 text-white rounded-xl text-sm transition-colors font-medium"
              >
                <span>📅</span>
                <span>View Timeline</span>
              </button>
              <button
                onClick={() => navigate('/itinerary-generation', { state: { itineraryData: enhancedResponse } })}
                className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm transition-colors font-medium"
              >
                <span>💾</span>
                <span>Save Itinerary</span>
              </button>
              <button
                onClick={() => navigate('/edit-itinerary', { state: { itineraryData: enhancedResponse } })}
                className="flex items-center space-x-2 px-6 py-3 bg-success-500 hover:bg-success-600 text-white rounded-xl text-sm transition-colors font-medium"
              >
                <span>✏️</span>
                <span>Edit Itinerary</span>
              </button>
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
                    {weatherData && (
                      <div className="text-center">
                        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {Math.round(weatherData.current.temperature)}°C
                          </span>
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">Current Weather</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {weatherData.current.description}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Weather Information */}
                  {weatherData ? (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                        🌤️ Current Weather
                      </h3>
                      <div className="max-w-2xl mx-auto">
                        <WeatherDisplay 
                          weatherData={weatherData}
                          compact={false}
                          className="shadow-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                        🌤️ Current Weather
                      </h3>
                      <div className="max-w-md mx-auto">
                        <WeatherCard 
                          city={itinerarySummary.destination} 
                          compact={false}
                          className="shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'itinerary' && (
                <>


                  {/* Travel Tips */}
                  {tips.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 w-full">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        💡 Travel Tips
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tips.map((tip, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
                            <span className="text-amber-500 mt-1 text-sm">•</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dailyPlans.map((plan) => (
                    <div key={plan.day} className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 w-full">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Day {plan.day}</h2>
                          <p className="text-lg text-gray-600 dark:text-gray-400">{plan.date}</p>
                          {plan.theme && (
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">{plan.theme}</p>
                          )}
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
                       {plan.activities.map((activity, index) => {
                         // Try to get enhanced place details for this activity
                         // For enhanced API response, activities have place_id
                         const enhancedPlaceDetails = enhancedResponse?.place_details?.[(activity as any).place_id];
                         
                         return (
                           <div 
                             key={index} 
                             className="flex items-start space-x-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-all duration-200 transform hover:scale-[1.02]"
                             onMouseEnter={(e) => {
                               if (enhancedPlaceDetails) {
                                 handlePlaceHover(e, enhancedPlaceDetails, 'activity');
                               } else {
                                 handleMouseEnter(e, activity, 'activity');
                               }
                             }}
                             onMouseLeave={enhancedPlaceDetails ? handlePlaceHoverLeave : handleMouseLeave}
                             onClick={() => {
                               if (enhancedPlaceDetails) {
                                 setSelectedPlace(enhancedPlaceDetails);
                                 setIsPlaceModalOpen(true);
                               }
                             }}
                           >
                                                        <div className="flex-shrink-0 w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center">
                               <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                             </div>
                             <div className="flex-1">
                               <div className="flex items-center justify-between mb-2">
                                 <h4 className="text-base font-semibold text-gray-900 dark:text-white">{activity.title}</h4>
                                 <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                   {activity.time}
                                 </span>
                               </div>
                               <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{activity.description}</p>
                               <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                 <span className="flex items-center space-x-1">
                                   <MapPin className="w-3 h-3" />
                                   <span>{activity.location}</span>
                                 </span>
                                 <span className="flex items-center space-x-1">
                                   <Clock className="w-3 h-3" />
                                   <span>{activity.duration}</span>
                                 </span>
                                 {activity.cost && (
                                   <span className="flex items-center space-x-1 text-green-600 dark:text-green-400 font-medium">
                                     <DollarSign className="w-3 h-3" />
                                     <span>{activity.cost}</span>
                                   </span>
                                 )}
                               </div>
                             </div>
                           </div>
                         );
                       })}
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
                           // Try to get enhanced place details for this restaurant
                           const enhancedPlaceDetails = enhancedResponse?.place_details?.[(restaurant as any).place_id];
                           
                           return (
                             <div 
                               key={index} 
                               className="p-5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200 transform hover:scale-[1.02]"
                               onMouseEnter={(e) => {
                                 if (enhancedPlaceDetails) {
                                   handlePlaceHover(e, enhancedPlaceDetails, 'restaurant');
                                 } else {
                                   handleMouseEnter(e, restaurant, 'restaurant');
                                 }
                               }}
                               onMouseLeave={enhancedPlaceDetails ? handlePlaceHoverLeave : handleMouseLeave}
                               onClick={() => {
                                 if (enhancedPlaceDetails) {
                                   setSelectedPlace(enhancedPlaceDetails);
                                   setIsPlaceModalOpen(true);
                                 }
                               }}
                             >
                               <div className="flex items-center justify-between mb-2">
                                 <h5 className="text-sm font-semibold text-gray-900 dark:text-white">{mealTimes[index]}</h5>
                                 <div className="flex items-center text-amber-500">
                                   <Star className="w-3 h-3 fill-current mr-1" />
                                   <span className="text-xs font-medium">{restaurant.rating}</span>
                                 </div>
                               </div>
                               <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{restaurant.name}</h4>
                               <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{restaurant.cuisine} • {restaurant.priceRange}</p>
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
                               const activityCost = plan.activities.reduce((sum, activity) => {
                                 const cost = typeof activity.cost === 'string' ? parseFloat(activity.cost) || 0 : (activity.cost || 0);
                                 return sum + cost;
                               }, 0);
                               
                               const transportCost = plan.transport?.reduce((sum, transport) => {
                                 const cost = typeof transport.cost === 'string' ? parseFloat(transport.cost) || 0 : (transport.cost || 0);
                                 return sum + cost;
                               }, 0) || 0;
                               
                               const dayCost = activityCost + transportCost;
                               
                               return (
                                 <div key={plan.day} className="flex justify-between text-sm">
                                   <span className="font-medium text-gray-700 dark:text-gray-300">Day {plan.day}</span>
                                   <span className="font-medium text-blue-600 dark:text-blue-400">${dayCost.toFixed(0)}</span>
                                 </div>
                               );
                             })}
                           </div>
                         </div>
                         <div>
                           <h4 className="font-medium text-gray-900 dark:text-white mb-4">Total Estimated Cost</h4>
                           <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                             ${dailyPlans.reduce((total, plan) => {
                               const activityCost = plan.activities.reduce((sum, activity) => {
                                 const cost = typeof activity.cost === 'string' ? parseFloat(activity.cost) || 0 : (activity.cost || 0);
                                 return sum + cost;
                               }, 0);
                               
                               const transportCost = plan.transport?.reduce((sum, transport) => {
                                 const cost = typeof transport.cost === 'string' ? parseFloat(transport.cost) || 0 : (transport.cost || 0);
                                 return sum + cost;
                               }, 0) || 0;
                               
                               return total + activityCost + transportCost;
                             }, 0).toFixed(0)}
                           </div>
                           <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Activities & transportation (excluding accommodation & meals)</p>
                         </div>
                       </div>
                     </div>
                   )}
                </>
              )}

              {/* Additional Places Tab */}
              {activeTab === 'additional' && enhancedResponse && (
                                  <AdditionalPlaces
                    additionalPlaces={enhancedResponse.additional_places}
                    onAddToItinerary={handleAddToItinerary}
                    onPlaceHover={handlePlaceHover}
                    onPlaceHoverLeave={handlePlaceHoverLeave}
                  />
              )}

              {/* Map Tab - Full width map */}
              {activeTab === 'map' && (
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="h-96 lg:h-[600px]">
                    {(() => {
                      const locations = extractLocations();
                      console.log('Map tab - locations:', locations);
                      return <GoogleMaps locations={locations} />;
                    })()}
                  </div>
                </div>
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
                      console.log('dailyPlans:', dailyPlans);
                      console.log('Map container dimensions:', { height: 'h-full', minHeight: '600px' });
                      
                      // Always show at least the destination if we have itinerary data
                      if (locations.length === 0 && itineraryData?.destination) {
                        console.log('No locations found, creating fallback destination location');
                        const fallbackLocation = {
                          id: 'fallback-destination',
                          name: itineraryData.destination,
                          type: 'destination' as const,
                          position: { lat: 40.7128, lng: -74.0060 },
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
                          position: { lat: 40.7128, lng: -74.0060 },
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
                          name: 'Default Center',
                          type: 'destination' as const,
                          position: { lat: 40.7128, lng: -74.0060 },
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

      {/* Enhanced Hover Popup */}
      <EnhancedHoverPopup
        place={hoveredPlace}
        position={hoverPosition}
        type={hoveredPlaceType}
        isVisible={isHoverPopupVisible}
        onMouseEnter={() => {
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
          }
        }}
        onMouseLeave={handlePlaceHoverLeave}
      />



      {/* Place Details Modal */}
      <PlaceDetailsModal
        place={selectedPlace}
        isOpen={isPlaceModalOpen}
        onClose={() => setIsPlaceModalOpen(false)}
        onAddToItinerary={handleAddToItinerary}
        showAddButton={true}
      />
    </div>
  );
};

export default ResultsPage; 