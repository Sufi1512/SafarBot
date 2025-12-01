import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, IndianRupee, Clock, Star, AlertCircle, Hotel, Utensils } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { itineraryAPI, EnhancedItineraryResponse, PlaceDetails, AdditionalPlace } from '../services/api';
import GoogleMaps from '../components/GoogleMaps';
import PlaceDetailsModal from '../components/PlaceDetailsModal';
import AdditionalPlaces from '../components/AdditionalPlaces';
import EnhancedHoverPopup from '../components/EnhancedHoverPopup';
import WeatherCard from '../components/WeatherCard';
import { WeatherDisplay } from '../components/WeatherDisplay';
import ModernHeader from '../components/ModernHeader';
import { parseLocationForWeather } from '../utils/locationUtils';
import { prefetchPlaceMedia } from '../utils/imagePrefetcher';
import { photoPrefetcher } from '../utils/photoPrefetcher';

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
  cost?: number | string;
  costValue?: number;
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
  priceValue?: number;
  description?: string;
  location?: string;
  image?: string;
}

const USD_TO_INR_RATE = 83;

type BudgetTier = '0-50000' | '50000-100000' | '100000+';

interface ItineraryData {
  destination: string;
  startDate: string;
  endDate: string;
  days: number;
  travelers: number;
  budget: number;
  budgetTier?: BudgetTier;
  interests: string[];
  apiRequest?: {
    destination: string;
    start_date: string;
    end_date: string;
    budget: number;
    interests: string[];
    travelers: number;
    accommodation_type: string;
    budget_range?: string;
  };
}

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [itineraryData, setItineraryData] = useState<ItineraryData | null>(null);
  const formatINR = useCallback((amount: number) => {
    if (!amount || Number.isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  }, []);

  const convertCostToINR = useCallback((
    value?: string | number | null,
  ): { display: string; numeric: number } => {
    if (value === null || value === undefined || value === '') {
      return { display: '', numeric: 0 };
    }

    if (typeof value === 'number' && !Number.isNaN(value)) {
      const amountInInr = value * USD_TO_INR_RATE;
      return { display: formatINR(amountInInr), numeric: amountInInr };
    }

    const raw = String(value).trim();
    if (!raw) {
      return { display: '', numeric: 0 };
    }

    if (/free/i.test(raw)) {
      return { display: 'Free', numeric: 0 };
    }

    const alreadyINR = /₹|INR|Rs\.?/i.test(raw);
    const digitMatches = [...raw.matchAll(/\d+(?:\.\d+)?/g)] as RegExpMatchArray[];

    const leadingText = digitMatches.length > 0 ? raw.slice(0, digitMatches[0].index || 0).trim() : raw;
    const trailingText = digitMatches.length > 0
      ? raw.slice((digitMatches[digitMatches.length - 1].index || 0) + digitMatches[digitMatches.length - 1][0].length).trim()
      : '';

    if (alreadyINR) {
      const numbers = digitMatches.map((match) => parseFloat(match[0])).filter((num) => !Number.isNaN(num));
      const numeric = numbers.length ? numbers.reduce((sum, num) => sum + num, 0) / numbers.length : 0;
      const display = raw
        .replace(/Rs\.?/gi, '₹')
        .replace(/INR/gi, '₹')
        .replace(/\$/g, '₹');
      return { display, numeric };
    }

    const numbers = digitMatches.map((match) => parseFloat(match[0])).filter((num) => !Number.isNaN(num));
    if (!numbers.length) {
      return { display: raw.replace(/\$/g, '₹'), numeric: 0 };
    }

    const convertedAmounts = numbers.map((num) => num * USD_TO_INR_RATE);
    const separator = raw.toLowerCase().includes(' to ')
      ? ' to '
      : raw.includes('-')
        ? ' - '
        : numbers.length > 1
          ? ', '
          : '';

    const formattedParts = convertedAmounts.map((amount) => formatINR(amount));
    const displayCore = formattedParts.join(separator);
    const display = [leadingText, displayCore, trailingText].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    const numeric = convertedAmounts.reduce((sum, amount) => sum + amount, 0) / convertedAmounts.length;

    return { display, numeric };
  }, [formatINR]);
  
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousLocationStateRef = useRef(location.state);
  const isInitializedRef = useRef(false);

  const itineraryBudgetDisplay = useMemo(() => {
    const enhancedBudget = enhancedResponse?.itinerary?.budget_estimate;
    if (typeof enhancedBudget === 'number' && !Number.isNaN(enhancedBudget)) {
      return formatINR(enhancedBudget);
    }

    if (itinerarySummary?.budget_estimate && !Number.isNaN(itinerarySummary.budget_estimate)) {
      return formatINR(itinerarySummary.budget_estimate);
    }

    return 'N/A';
  }, [enhancedResponse, itinerarySummary, formatINR]);

  const userBudgetDisplay = useMemo(() => {
    const rawBudgetValue = itineraryData?.budget as number | string | undefined;
    if (typeof rawBudgetValue === 'number' && !Number.isNaN(rawBudgetValue)) {
      return formatINR(rawBudgetValue);
    }

    if (typeof rawBudgetValue === 'string') {
      const parsed = Number(rawBudgetValue.replace(/[^0-9.]/g, ''));
      if (!Number.isNaN(parsed)) {
        return formatINR(parsed);
      }
    }

    return 'N/A';
  }, [itineraryData, formatINR]);

  const navbarBudgetDisplay = useMemo(() => {
    if (isLoading) {
      return userBudgetDisplay;
    }

    if (itineraryBudgetDisplay !== 'N/A') {
      return itineraryBudgetDisplay;
    }

    return userBudgetDisplay;
  }, [isLoading, itineraryBudgetDisplay, userBudgetDisplay]);

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

  // Enhanced helper function for hover events with place details - memoized
  const handlePlaceHover = useCallback((
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
  }, []); // Empty dependency array since it only uses refs and setters

  const handlePlaceHoverLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredPlace(null);
      setHoveredPlaceType(null);
      setHoverPosition(null);
      setIsHoverPopupVisible(false);
    }, 150); // Reduced delay for more responsive feel
  }, []); // Empty dependency array since it only uses refs and setters

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



  useEffect(() => {
    if (!enhancedResponse) {
      return;
    }

    const placeDetailsList = Object.values(enhancedResponse.place_details || {});
    const additionalPlacesList: AdditionalPlace[] = [];

    if (enhancedResponse.additional_places) {
      Object.values(enhancedResponse.additional_places).forEach((group) => {
        if (Array.isArray(group)) {
          additionalPlacesList.push(...group);
        }
      });
    }

    if (placeDetailsList.length === 0 && additionalPlacesList.length === 0) {
      return;
    }

    const prefetch = async () => {
      try {
        const summary = await prefetchPlaceMedia({
          placeDetails: placeDetailsList as PlaceDetails[],
          additionalPlaces: additionalPlacesList as AdditionalPlace[]
        });

        console.debug('Prefetched hover media', summary);
      } catch (prefetchError) {
        console.warn('Image prefetch skipped:', prefetchError);
      }
    };

    prefetch();
  }, [enhancedResponse]);


  // SERP API functionality for fetching restaurants has been removed
  // No longer fetching restaurants via SERP API

  // Helper functions for enhanced API
  // (Removed unused handlePlaceClick to satisfy linter)

  const handleAddToItinerary = (_place: PlaceDetails | AdditionalPlace) => {
    // For now, just close the modal. In the future, this could add to itinerary
    setIsPlaceModalOpen(false);
    // TODO: Implement actual itinerary addition logic
  };

  // Enhanced location extraction with place details - memoized to prevent unnecessary recalculations
  const extractLocations = useMemo(() => {
    const locations: Location[] = [];
    
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
    }

    // Add places from allPlaceDetails (which contains all places used in itinerary)
    if (allPlaceDetails && Object.keys(allPlaceDetails).length > 0) {
      Object.entries(allPlaceDetails).forEach(([placeId, placeDetails], index) => {
        // Skip places with invalid data
        if (!placeDetails.title || !placeDetails.title.trim()) {
          return;
        }
        
        // Try to get real GPS coordinates from place details
        let position = defaultCoordinates;
        
        // Check for gps_coordinates object
        if (placeDetails.gps_coordinates && 
            typeof placeDetails.gps_coordinates.latitude === 'number' && 
            typeof placeDetails.gps_coordinates.longitude === 'number') {
          position = {
            lat: placeDetails.gps_coordinates.latitude,
            lng: placeDetails.gps_coordinates.longitude
          };
        } 
        // Check for coordinates object (alternative format)
        else if ((placeDetails as any).coordinates && 
                 typeof (placeDetails as any).coordinates.lat === 'number' && 
                 typeof (placeDetails as any).coordinates.lng === 'number') {
          position = {
            lat: (placeDetails as any).coordinates.lat,
            lng: (placeDetails as any).coordinates.lng
          };
        }
        // Fallback to destination with offset
        else {
          position = {
            lat: defaultCoordinates.lat + (index * 0.01),
            lng: defaultCoordinates.lng + (index * 0.01)
          };
        }
        
        // Validate coordinates before adding
        if (isNaN(position.lat) || isNaN(position.lng) || 
            Math.abs(position.lat) > 90 || Math.abs(position.lng) > 180) {
          return;
        }
        
        // Determine place type from category
        let placeType: 'hotel' | 'restaurant' | 'activity' = 'activity';
        if (placeDetails.category) {
          const categoryLower = placeDetails.category.toLowerCase();
          if (categoryLower.includes('hotel') || categoryLower.includes('lodging')) placeType = 'hotel';
          else if (categoryLower.includes('restaurant') || categoryLower.includes('cafe') || categoryLower.includes('food')) placeType = 'restaurant';
        }
        
        locations.push({
          id: placeId,
          name: placeDetails.title,
          type: placeType,
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
      });
    } else {
      // Fallback to enhancedResponse if allPlaceDetails is empty
      if (enhancedResponse?.place_details) {
        Object.entries(enhancedResponse.place_details).forEach(([placeId, placeDetails], index) => {
          const place = placeDetails as PlaceDetails;
          if (!place.title || !place.title.trim()) return;
          
          const position = getCoordinatesFromPlace(place, index);
          if (isNaN(position.lat) || isNaN(position.lng) || 
              Math.abs(position.lat) > 90 || Math.abs(position.lng) > 180) return;
          
          // Determine place type
          let placeType: 'hotel' | 'restaurant' | 'activity' = 'activity';
          if (place.category) {
            const categoryLower = place.category.toLowerCase();
            if (categoryLower.includes('hotel') || categoryLower.includes('lodging')) placeType = 'hotel';
            else if (categoryLower.includes('restaurant') || categoryLower.includes('cafe') || categoryLower.includes('food')) placeType = 'restaurant';
          }
          
          locations.push({
            id: placeId,
            name: place.title,
            type: placeType,
            position,
            description: place.description || place.address,
            rating: place.rating,
            price: place.price_range || place.price,
            thumbnail: place.thumbnail || place.serpapi_thumbnail
          } as any);
        });
      }
    }

    // Add hotels with real coordinates based on their location
    hotels.forEach((hotel, index) => {
      if (hotel.location) {
        // Use default coordinates with offset for hotels
        const position = {
          lat: defaultCoordinates.lat + (index * 0.01),
          lng: defaultCoordinates.lng + (index * 0.01)
        };
        
        // Validate coordinates
        if (!isNaN(position.lat) && !isNaN(position.lng) && 
            Math.abs(position.lat) <= 90 && Math.abs(position.lng) <= 180) {
          locations.push({
            id: `hotel-${index}`,
            name: hotel.name,
            type: 'hotel' as const,
            position,
            description: hotel.description,
            rating: hotel.rating,
            price: hotel.price
          });
        }
      }
    });

    // Add activities from daily plans with real coordinates
    dailyPlans.forEach((plan, planIndex) => {
      plan.activities.forEach((activity, activityIndex) => {
        if (activity.location && activity.location !== destination) {
          // Use default coordinates with offset for activities
          const position = {
            lat: defaultCoordinates.lat + (planIndex * 0.02) + (activityIndex * 0.005),
            lng: defaultCoordinates.lng + (planIndex * 0.02) + (activityIndex * 0.005)
          };
          
          // Validate coordinates
          if (!isNaN(position.lat) && !isNaN(position.lng) && 
              Math.abs(position.lat) <= 90 && Math.abs(position.lng) <= 180) {
            locations.push({
              id: `activity-${planIndex}-${activityIndex}`,
              name: activity.title,
              type: 'activity' as const,
              position,
              description: activity.description
            });
          }
        }
      });
    });
    
    // Add restaurants from meals in daily plans
    dailyPlans.forEach((plan, planIndex) => {
      plan.meals.forEach((meal, mealIndex) => {
        // Try to get place details for the meal
        const mealPlaceId = (meal as any).place_id;
        const mealPlaceDetails = enhancedResponse?.place_details?.[mealPlaceId] || allPlaceDetails[mealPlaceId];
        
        if (mealPlaceDetails && mealPlaceDetails.gps_coordinates) {
          const position = {
            lat: mealPlaceDetails.gps_coordinates.latitude,
            lng: mealPlaceDetails.gps_coordinates.longitude
          };
          
          if (!isNaN(position.lat) && !isNaN(position.lng) && 
              Math.abs(position.lat) <= 90 && Math.abs(position.lng) <= 180) {
            locations.push({
              id: `restaurant-${planIndex}-${mealIndex}`,
              name: meal.name,
              type: 'restaurant' as const,
              position,
              description: meal.description || mealPlaceDetails.description,
              rating: meal.rating || mealPlaceDetails.rating,
              price: meal.priceRange || meal.price_range
            });
          }
        } else if (meal.location) {
          // Fallback to offset coordinates
          const position = {
            lat: defaultCoordinates.lat + (planIndex * 0.015) + (mealIndex * 0.003),
            lng: defaultCoordinates.lng + (planIndex * 0.015) + (mealIndex * 0.003)
          };
          
          if (!isNaN(position.lat) && !isNaN(position.lng) && 
              Math.abs(position.lat) <= 90 && Math.abs(position.lng) <= 180) {
            locations.push({
              id: `restaurant-${planIndex}-${mealIndex}`,
              name: meal.name,
              type: 'restaurant' as const,
              position,
              description: meal.description,
              rating: meal.rating,
              price: meal.priceRange || meal.price_range
            });
          }
        }
      });
    });

    // Only log in development for debugging
    if (import.meta.env.DEV && locations.length > 0) {
      console.debug(`Extracted ${locations.length} locations for map`);
    }
    return locations;
  }, [enhancedResponse, allPlaceDetails, dailyPlans, hotels, itineraryData]); // Include itineraryData in dependencies

  useEffect(() => {
    if (authLoading) {
      return;
    }
    
    // Check authentication first
    if (!isAuthenticated || !user) {
      setError('Please log in to access your itinerary results.');
      navigate('/login', { 
        state: { 
          from: '/results',
          message: 'Please log in to access your itinerary results.' 
        } 
      });
      return;
    }
    
    // Prevent multiple initializations
    if (isInitializedRef.current) {
      return;
    }
    
    // If no location state, redirect to home
    if (!location.state) {
      navigate('/');
      return;
    }
    
    // If we're already loading, don't start another process
    if (isLoading) {
      return;
    }
    
    // If we already have the data, don't regenerate
    if (hasGeneratedRef.current) {
      return;
    }
    
    // Mark as initialized to prevent re-runs
    isInitializedRef.current = true;

    // Support injecting a ready enhanced itinerary via navigation state
    const injected = (location.state as any)?.injectedEnhancedResponse as EnhancedItineraryResponse | undefined;
    if (injected) {
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
    setItineraryData(location.state as any);
    generateRealItinerary(location.state as any);
  }, [authLoading, location.state]); // Empty dependency array to run only once on mount
  
  // Reset guards when location state changes (e.g., user runs planner again)
  useEffect(() => {
    if (previousLocationStateRef.current !== location.state) {
      previousLocationStateRef.current = location.state;
      hasGeneratedRef.current = false;
      isInitializedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
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
    // Check if user is authenticated before generating itinerary
    if (!isAuthenticated || !user) {
      setError('Please log in to generate your itinerary.');
      // Store the form data for after login
      localStorage.setItem('pendingItineraryData', JSON.stringify(data));
      // Redirect to login page
      navigate('/login', { 
        state: { 
          from: '/results',
          message: 'Please log in to generate your itinerary.' 
        } 
      });
      return;
    }
    
    // Prevent duplicate API calls and add retry limit
    if (isLoading) {
      return;
    }
    
    // Double-check with ref to prevent multiple calls
    if (hasGeneratedRef.current) {
      return;
    }
    
    // Cancel any inflight request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Mark as generated immediately to prevent race conditions
    hasGeneratedRef.current = true;
    
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

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
      
      let enhancedItineraryResponse;
      try {
        // Use the enhanced API with complete place metadata
        enhancedItineraryResponse = await itineraryAPI.generateEnhancedItinerary(apiRequest, { signal: controller.signal });
        // Only log in development for debugging
        if (import.meta.env.DEV) {
          console.debug('Enhanced itinerary response received');
        }
      } catch (apiError: any) {
        if (apiError?.code === 'ERR_CANCELED' || apiError?.name === 'CanceledError') {
          hasGeneratedRef.current = false;
          setError('Itinerary generation cancelled.');
          return;
        }
        
        // If it's a network/connection error, show error
        if (apiError.message?.includes('Network Error') || 
            apiError.message?.includes('timeout') ||
            (apiError as any).code === 'ECONNABORTED') {
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
      if (errorMessage === 'Itinerary generation cancelled.') {
        hasGeneratedRef.current = false;
      }
    } finally {
      setIsLoading(false);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleCancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    hasGeneratedRef.current = false;
    setIsLoading(false);
    setError('Itinerary generation cancelled.');
  }, []);

  // Helper to process an already available enhanced response (injected or from API)
  const processEnhancedItineraryResponse = (enhancedItineraryResponse: EnhancedItineraryResponse, dataFallback?: ItineraryData) => {
    // Store the complete enhanced response
    setEnhancedResponse(enhancedItineraryResponse);
    setAllPlaceDetails(enhancedItineraryResponse?.place_details || {});
    
    // Automatically prefetch all photos from the response
    if ((enhancedItineraryResponse as any)?.photo_prefetch) {
      photoPrefetcher.prefetchPhotos((enhancedItineraryResponse as any).photo_prefetch)
        .catch(() => {
          // Silently fail - prefetch is optional
        });
    }
    
    // Extract weather data from response
    if (enhancedItineraryResponse?.weather) {
      setWeatherData(enhancedItineraryResponse.weather);
    }

    // Handle the itinerary part of the response
    const itineraryDataInner = enhancedItineraryResponse?.itinerary as any;
    
    if (itineraryDataInner && itineraryDataInner.daily_plans !== undefined) {
      if (itineraryDataInner.daily_plans.length === 0) {
        console.warn('Received empty daily_plans from enhanced API');
        throw new Error('AI could not generate a detailed itinerary. This might be due to complex requirements or server issues.');
      }

      // Process daily plans from enhanced API
      const normalizedDailyPlans = itineraryDataInner.daily_plans.map((plan: any) => {
        const normalizedTransport = plan.transportation?.map((transport: any) => {
          const titleFallback = [transport.from, transport.to]
            .filter(Boolean)
            .join(' → ');
          const locationFallback = [transport.from, transport.to]
            .filter(Boolean)
            .join(' to ');
          const costResult = convertCostToINR(transport.cost ?? transport.estimated_cost ?? '');

          return {
            ...transport,
            title: transport.title || (titleFallback ? `Travel: ${titleFallback}` : 'Transportation'),
            description:
              transport.description ||
              (transport.method ? `Take ${transport.method}` : 'Getting around'),
            location: transport.location || locationFallback || itineraryDataInner.destination,
            cost: costResult.display,
            costValue: costResult.numeric,
            duration: transport.duration || transport.time || transport.estimated_duration || '',
          };
        }) || [];

        return {
          ...plan,
          activities: plan.activities.map((activity: any) => {
            const placeDetails = enhancedItineraryResponse?.place_details?.[activity.place_id];
            const primaryCost = convertCostToINR(activity.estimated_cost ?? activity.cost ?? null);
            const fallbackCost = !primaryCost.display && placeDetails?.price ? convertCostToINR(placeDetails.price) : { display: '', numeric: 0 };
            const costDisplay = primaryCost.display || fallbackCost.display;
            const costNumeric = primaryCost.display ? primaryCost.numeric : fallbackCost.numeric;

            return {
              ...activity,
              cost: costDisplay,
              costValue: costNumeric,
              type: activity.type || 'sightseeing',
              location: placeDetails?.address || activity.location || itineraryDataInner.destination,
              description: placeDetails?.description || activity.title,
            };
          }),
          meals: plan.meals?.map((meal: any) => {
            const placeDetails = enhancedItineraryResponse?.place_details?.[meal.place_id];
            const priceResult = convertCostToINR(meal.price_range || placeDetails?.price || meal.priceRange || meal.price);
            return {
              ...meal,
              priceRange: priceResult.display || meal.price_range || '$$',
              priceValue: priceResult.numeric,
              description: placeDetails?.description || `Great ${meal.cuisine} cuisine`,
              location: placeDetails?.address || meal.location || itineraryDataInner.destination,
              rating: placeDetails?.rating || 4.0,
            };
          }) || [],
          transport: normalizedTransport,
          transportation: normalizedTransport,
        };
      });

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
          const priceResult = convertCostToINR(acc.price_range || placeDetails?.price || acc.price);
          return {
            name: acc.name,
            rating: placeDetails?.rating || 4.0,
            price_range: priceResult.display || acc.price_range,
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



  // Performance optimization: Memoize tab content to prevent unnecessary re-renders
  const memoizedTabContent = useMemo(() => {
    if (activeTab === 'additional' && enhancedResponse) {
      const additionalPlaces = {
        hotels: enhancedResponse.additional_places?.hotels || [],
        restaurants: enhancedResponse.additional_places?.restaurants || [],
        cafes: enhancedResponse.additional_places?.cafes || [],
        attractions: enhancedResponse.additional_places?.attractions || [],
        interest_based: enhancedResponse.additional_places?.interest_based || []
      };
      return (
        <AdditionalPlaces
          additionalPlaces={additionalPlaces}
          onAddToItinerary={handleAddToItinerary}
          onPlaceHover={handlePlaceHover}
          onPlaceHoverLeave={handlePlaceHoverLeave}
          enablePagination={true}
        />
      );
    }
    return null;
  }, [activeTab, enhancedResponse, handleAddToItinerary, handlePlaceHover, handlePlaceHoverLeave]);

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
          <div className="flex items-center justify-between py-1.5">
            {/* Left side - Back button and Logo/Name */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/trip-planner')}
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white" />
              </button>
              <div className="flex items-center space-x-3">
                {/* <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div> */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
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
              
                <span className="hidden sm:inline">Budget: {navbarBudgetDisplay}</span>
                <span className="sm:hidden">{navbarBudgetDisplay}</span>
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
            <button
              onClick={handleCancelGeneration}
              className="mt-10 inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-200"
            >
              Cancel generation
            </button>
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm"
              >
                Try Again
              </button>
              {/* Removed sample itinerary option to enforce real data only */}
            </div>
          </div>
        ) : (
          <>


            {/* Split Layout: Itinerary (2/3) and Map (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
              {/* Left Side - Itinerary Content (2/3) */}
              <div className="lg:col-span-2 space-y-6 w-full">
                {/* Itinerary Summary - Ultra Compact */}
                {activeTab === 'itinerary' && itinerarySummary && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md border border-gray-200 dark:border-gray-700 w-full">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2 text-center">
                    Journey Overview
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {itinerarySummary.total_days}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-600 dark:text-green-400 mb-1">
                        {formatINR(itinerarySummary.budget_estimate)}
                      </div>
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Budget</div>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {dailyPlans.length}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">Planned</div>
                    </div>
                  </div>
                  
                  {/* Weather Information */}
                  {weatherData ? (
                    <div className="mt-4">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 text-center">
                        🌤️ Current Weather
                      </h3>
                      <div className="max-w-2xl mx-auto">
                        <WeatherDisplay 
                          weatherData={weatherData}
                          compact={true}
                          className="shadow-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 text-center">
                        🌤️ Current Weather
                      </h3>
                      <div className="max-w-lg mx-auto">
                        <WeatherCard 
                          {...parseLocationForWeather(itinerarySummary.destination)}
                          compact={true}
                          className="shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tabs - Only show when not loading and no error */}
              <div className="mb-8">
                <div className="flex space-x-1 bg-white dark:bg-gray-800 p-0.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  {[
                    { id: 'itinerary', label: 'Itinerary', icon: '🗓️' },
                    { id: 'additional', label: 'Explore More', icon: '✨' },
                    { id: 'map', label: 'Map View', icon: '🗺️' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center px-2 py-1.5 rounded-md font-medium transition-all duration-300 text-xs ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="mr-1 text-xs">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

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
                                    <IndianRupee className="w-3 h-3" />
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
                                     <p className="text-sm font-medium text-green-600 dark:text-green-400">{transport.cost}</p>
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
                   {/* {dailyPlans.length > 0 && (
                     <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                       <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">💰 Cost Summary</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div>
                           <h4 className="font-medium text-gray-900 dark:text-white mb-4">Daily Breakdown</h4>
                           <div className="space-y-3">
                             {dailyPlans.map((plan) => {
                               // Calculate activity costs from metadata
                              const activityCost = plan.activities.reduce((sum, activity) => {
                                const enhancedActivity = activity as Activity & { costValue?: number };
                                return sum + (enhancedActivity.costValue || 0);
                              }, 0);

                              const mealCost = plan.meals.reduce((sum, meal) => {
                                const enhancedMeal = meal as Restaurant & { priceValue?: number };
                                return sum + (enhancedMeal.priceValue || 0);
                              }, 0);

                              const transportCost = (plan.transport || []).reduce((sum, transport: any) => {
                                return sum + (transport.costValue || 0);
                              }, 0);

                              const dayCost = activityCost + mealCost + transportCost;
                               
                               return (
                                 <div key={plan.day} className="flex justify-between text-sm">
                                   <span className="font-medium text-gray-700 dark:text-gray-300">Day {plan.day}</span>
                                  <span className="font-medium text-blue-600 dark:text-blue-400">{formatINR(dayCost)}</span>
                                 </div>
                               );
                             })}
                           </div>
                         </div>
                         <div>
                           <h4 className="font-medium text-gray-900 dark:text-white mb-4">Total Estimated Cost</h4>
                           <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {formatINR(
                              dailyPlans.reduce((total, plan) => {
                                const activityCost = plan.activities.reduce((sum, activity) => {
                                  const enhancedActivity = activity as Activity & { costValue?: number };
                                  return sum + (enhancedActivity.costValue || 0);
                                }, 0);

                                const mealCost = plan.meals.reduce((sum, meal) => {
                                  const enhancedMeal = meal as Restaurant & { priceValue?: number };
                                  return sum + (enhancedMeal.priceValue || 0);
                                }, 0);

                                const transportCost = (plan.transport || []).reduce((sum, transport: any) => {
                                  return sum + (transport.costValue || 0);
                                }, 0);

                                return total + activityCost + mealCost + transportCost;
                              }, 0)
                            )}
                           </div>
                           <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Activities, meals & transportation (excluding accommodation)</p>
                         </div>
                       </div>
                     </div>
                   )} */}

                  {/* Action Buttons - Adjusted Size and Spacing */}
                  <div className="flex items-center justify-center gap-6 mt-8">
                    <button
                      onClick={() => navigate('/itinerary', { state: { itineraryData: enhancedResponse } })}
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-base font-medium transition-colors"
                    >
                      View Timeline
                    </button>
                    <button
                      onClick={() => navigate('/itinerary-generation', { state: { itineraryData: enhancedResponse } })}
                      className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-base font-medium transition-colors"
                    >
                      Save Itinerary
                    </button>
                    <button
                      onClick={() => navigate('/edit-itinerary', { state: { itineraryData: enhancedResponse } })}
                      className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-base font-medium transition-colors"
                    >
                      Edit Itinerary
                    </button>
                  </div>
                </>
              )}

              {/* Additional Places Tab */}
              {memoizedTabContent}

              {/* Map Tab - Full width map */}
              {activeTab === 'map' && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="h-96 lg:h-[600px]">
                    <GoogleMaps locations={extractLocations} />
                  </div>
                </div>
              )}


              </div>

              {/* Right Side - Google Maps (1/3) */}
              <div className="lg:col-span-1 w-full">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 h-[600px] sticky top-4 w-full">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                    🗺️ Interactive Map
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Explore all locations from your itinerary
                  </p>
                  {(() => {
                    const locations = extractLocations;
                    return (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        📍 {locations.length} location{locations.length !== 1 ? 's' : ''} found
                      </div>
                    );
                  })()}
                  <div className="h-full w-full min-h-0 flex-1" style={{ minHeight: '500px' }}>
                    {(() => {
                      const locations = extractLocations;
                      
                      // Always show at least the destination if we have itinerary data
                      if (locations.length === 0 && itineraryData?.destination) {
                        const destination = itineraryData.destination;
                        // Try to get coordinates for destination
                        const getDestinationCoordinates = (dest: string) => {
                          const cityCoordinates: Record<string, { lat: number; lng: number }> = {
                            'new york': { lat: 40.7128, lng: -74.0060 },
                            'london': { lat: 51.5074, lng: -0.1278 },
                            'paris': { lat: 48.8566, lng: 2.3522 },
                            'tokyo': { lat: 35.6762, lng: 139.6503 },
                            'mumbai': { lat: 19.0760, lng: 72.8777 },
                            'delhi': { lat: 28.7041, lng: 77.1025 },
                            'dubai': { lat: 25.2048, lng: 55.2708 },
                            'singapore': { lat: 1.3521, lng: 103.8198 }
                          };
                          return cityCoordinates[dest.toLowerCase().trim()] || { lat: 40.7128, lng: -74.0060 };
                        };
                        
                        const fallbackLocation = {
                          id: 'fallback-destination',
                          name: destination,
                          type: 'destination' as const,
                          position: getDestinationCoordinates(destination),
                          description: 'Your travel destination'
                        };
                        return <GoogleMaps locations={[fallbackLocation]} />;
                      }
                      
                      // Return locations if available, otherwise empty array (map will show default)
                      return <GoogleMaps locations={locations.length > 0 ? locations : []} />;
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
                      <IndianRupee className="w-3 h-3" />
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
                      <IndianRupee className="w-3 h-3" />
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
                    <IndianRupee className="w-3 h-3" />
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