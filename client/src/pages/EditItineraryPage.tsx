import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, DollarSign, Clock, Star, Save, Plus, Trash2, Replace, Search, X, CheckCircle, Edit3 } from 'lucide-react';
import { EnhancedItineraryResponse, PlaceDetails, AdditionalPlace, savedItineraryAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ModernButton from '../components/ui/ModernButton';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ModernHeader from '../components/ModernHeader';
import PlaceDetailsModal from '../components/PlaceDetailsModal';
import AdditionalPlaces from '../components/AdditionalPlaces';

interface TimelineEvent {
  time: string;
  type: 'activity' | 'meal' | 'transport' | 'checkin' | 'checkout';
  title: string;
  description?: string;
  location?: string;
  duration?: string;
  cost?: string;
  cuisine?: string;
  priceRange?: string;
  rating?: number;
  placeId?: string;
  photo?: string;
  website?: string;
  phone?: string;
  openingHours?: string;
  reviews?: number;
  types?: string[];
}

interface DaySchedule {
  day: number;
  date: string;
  theme: string;
  events: TimelineEvent[];
}

const EditItineraryPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [itineraryData, setItineraryData] = useState<EnhancedItineraryResponse | any>(null);
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [selectedPlace] = useState<PlaceDetails | AdditionalPlace | null>(null);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [selectedEventToReplace, setSelectedEventToReplace] = useState<TimelineEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState<'building' | 'saved'>('building');
  const [originalItineraryId, setOriginalItineraryId] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { 
      itineraryData?: EnhancedItineraryResponse | any;
      daySchedules?: DaySchedule[];
      isEditing?: boolean;
    };
    
    if (state?.itineraryData) {
      setItineraryData(state.itineraryData);
      
      // Detect edit mode based on data structure and isEditing flag
      const isSavedItinerary = state.itineraryData && state.itineraryData.id && state.itineraryData.days;
      const isBuildingPhase = state.itineraryData && state.itineraryData.itinerary && state.itineraryData.itinerary.daily_plans;
      
      if (state.isEditing || isSavedItinerary) {
        setEditMode('saved');
        setOriginalItineraryId(state.itineraryData.id);
        console.log('Edit mode: Saved itinerary edit', { id: state.itineraryData.id });
      } else if (isBuildingPhase) {
        setEditMode('building');
        setOriginalItineraryId(null);
        console.log('Edit mode: Building phase edit');
      } else {
        setEditMode('building');
        setOriginalItineraryId(null);
        console.log('Edit mode: Default to building phase');
      }
      
      if (state.daySchedules) {
        setDaySchedules(state.daySchedules);
      } else {
        processItineraryData(state.itineraryData);
      }
    } else {
      setError('No itinerary data found');
    }
    setIsLoading(false);
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

  const processItineraryData = (data: EnhancedItineraryResponse | any) => {
    // Add null checks to prevent undefined access
    console.log('Processing itinerary data:', data);
    
    // Check if it's EnhancedItineraryResponse structure
    const isEnhancedResponse = data && data.itinerary && data.itinerary.daily_plans;
    // Check if it's SavedItinerary structure
    const isSavedItinerary = data && data.days && Array.isArray(data.days);
    
    if (!isEnhancedResponse && !isSavedItinerary) {
      console.error('Invalid itinerary data structure:', data);
      console.error('Data structure breakdown:', {
        hasData: !!data,
        hasItinerary: !!(data && data.itinerary),
        hasDailyPlans: !!(data && data.itinerary && data.itinerary.daily_plans),
        hasDays: !!(data && data.days),
        dataKeys: data ? Object.keys(data) : 'no data',
        itineraryKeys: data && data.itinerary ? Object.keys(data.itinerary) : 'no itinerary'
      });
      
      const errorMessage = data 
        ? `Invalid itinerary data structure. Expected either:
          - EnhancedItineraryResponse with data.itinerary.daily_plans
          - SavedItinerary with data.days array
          Received keys: ${Object.keys(data).join(', ')}`
        : 'No itinerary data provided';
      
      setError(errorMessage);
      return;
    }

    // Handle both data structures
    const dailyPlans = isEnhancedResponse ? data.itinerary.daily_plans : data.days;
    const itineraryData = isEnhancedResponse ? data.itinerary : data;
    const placeDetails = isEnhancedResponse ? data.place_details : {};

    const schedules: DaySchedule[] = dailyPlans.map((plan: any) => {
      const events: TimelineEvent[] = [];

      // Add check-in for first day
      if (plan.day === 1) {
        events.push({
          time: '12:00',
          type: 'checkin',
          title: 'Hotel Check-in',
          description: 'Arrive at your accommodation',
          location: itineraryData.accommodation_suggestions?.[0]?.location || 'Hotel',
          cost: '0',
          placeId: itineraryData.accommodation_suggestions?.[0]?.place_id
        });
      }

      // Add check-out for last day
      if (plan.day === itineraryData.total_days || plan.day === itineraryData.duration_days) {
        events.push({
          time: '09:00',
          type: 'checkout',
          title: 'Hotel Check-out',
          description: 'Depart from your accommodation',
          location: itineraryData.accommodation_suggestions?.[0]?.location || 'Hotel',
          cost: '0',
          placeId: itineraryData.accommodation_suggestions?.[0]?.place_id
        });
      }

      // Add activities
      plan.activities?.forEach((activity: any) => {
        const activityPlaceDetails = placeDetails?.[activity.place_id];
        events.push({
          time: activity.time,
          type: 'activity',
          title: activity.title,
          description: activityPlaceDetails?.description || activity.title,
          location: activityPlaceDetails?.address || activity.title,
          duration: activity.duration,
          cost: activity.estimated_cost,
          placeId: activity.place_id,
          rating: activityPlaceDetails?.rating,
          photo: activityPlaceDetails?.photos_link,
          website: activityPlaceDetails?.website,
          phone: activityPlaceDetails?.phone,
          openingHours: activityPlaceDetails?.operating_hours ? JSON.stringify(activityPlaceDetails.operating_hours) : undefined,
          reviews: activityPlaceDetails?.reviews,
          types: activityPlaceDetails?.types
        });
      });

      // Add meals
      plan.meals?.forEach((meal: any) => {
        const mealPlaceDetails = placeDetails?.[meal.place_id];
        events.push({
          time: meal.time,
          type: 'meal',
          title: meal.name,
          description: mealPlaceDetails?.description || `Great ${meal.cuisine} cuisine`,
          location: mealPlaceDetails?.address || meal.name,
          cuisine: meal.cuisine,
          priceRange: meal.price_range,
          placeId: meal.place_id,
          rating: mealPlaceDetails?.rating,
          photo: mealPlaceDetails?.photos_link,
          website: mealPlaceDetails?.website,
          phone: mealPlaceDetails?.phone,
          openingHours: mealPlaceDetails?.operating_hours ? JSON.stringify(mealPlaceDetails.operating_hours) : undefined,
          reviews: mealPlaceDetails?.reviews,
          types: mealPlaceDetails?.types
        });
      });

      // Add transportation - handle both array and object formats
      if (plan.transportation) {
        const transportationArray = Array.isArray(plan.transportation) 
          ? plan.transportation 
          : [plan.transportation];
        
        transportationArray.forEach((transport: any) => {
          events.push({
            time: transport.from === 'Hotel' ? 'Before next activity' : 'After previous activity',
            type: 'transport',
            title: `${transport.method || transport.type} to ${transport.to}`,
            description: `Travel from ${transport.from} to ${transport.to}`,
            duration: transport.duration,
            cost: transport.cost
          });
        });
      }

      // Sort events by time
      events.sort((a, b) => {
        if (a.time === 'Before next activity') return -1;
        if (b.time === 'Before next activity') return 1;
        if (a.time === 'After previous activity') return 1;
        if (b.time === 'After previous activity') return -1;
        return a.time.localeCompare(b.time);
      });

      return {
        day: plan.day,
        date: plan.date,
        theme: plan.theme,
        events
      };
    });

    setDaySchedules(schedules);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'activity': return '🎯';
      case 'meal': return '🍽️';
      case 'transport': return '🚗';
      case 'checkin': return '🏨';
      case 'checkout': return '✈️';
      default: return '📍';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'activity': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meal': return 'bg-green-100 text-green-800 border-green-200';
      case 'transport': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'checkin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'checkout': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };


  const handleRemoveEvent = (dayIndex: number, eventIndex: number) => {
    const newDaySchedules = [...daySchedules];
    newDaySchedules[dayIndex].events.splice(eventIndex, 1);
    setDaySchedules(newDaySchedules);
  };

  const handleReplaceEvent = (event: TimelineEvent) => {
    setSelectedEventToReplace(event);
    setShowAddPlaceModal(true);
  };

  const handleAddPlace = (place: PlaceDetails | AdditionalPlace) => {
    if (selectedEventToReplace) {
      // Replace existing event
      const newDaySchedules = [...daySchedules];
      const dayIndex = newDaySchedules.findIndex(day => 
        day.events.some(event => event === selectedEventToReplace)
      );
      const eventIndex = newDaySchedules[dayIndex].events.findIndex(event => 
        event === selectedEventToReplace
      );
      
      if (dayIndex !== -1 && eventIndex !== -1) {
        newDaySchedules[dayIndex].events[eventIndex] = {
          time: selectedEventToReplace.time,
          type: selectedEventToReplace.type,
          title: place.title || 'Unknown Place',
          description: place.description,
          location: place.address,
          duration: '2 hours',
          cost: '$50',
          placeId: place.place_id,
          rating: place.rating,
          photo: (place as any).photos_link || (place as any).thumbnail || (place as any).serpapi_thumbnail,
          website: place.website,
          phone: place.phone,
          openingHours: place.operating_hours,
          reviews: place.reviews,
          types: place.types
        };
        setDaySchedules(newDaySchedules);
      }
    } else {
      // Add new event to selected day
      const newEvent: TimelineEvent = {
        time: '14:00',
        type: 'activity',
        title: place.title || 'Unknown Place',
        description: place.description,
        location: place.address,
        duration: '2 hours',
        cost: '$50',
        placeId: place.place_id,
        rating: place.rating,
        photo: (place as any).photos_link || (place as any).thumbnail || (place as any).serpapi_thumbnail,
        website: place.website,
        phone: place.phone,
        openingHours: place.operating_hours,
        reviews: place.reviews,
        types: place.types
      };
      
      const newDaySchedules = [...daySchedules];
      const dayIndex = newDaySchedules.findIndex(day => day.day === selectedDay);
      if (dayIndex !== -1) {
        newDaySchedules[dayIndex].events.push(newEvent);
        setDaySchedules(newDaySchedules);
      }
    }
    
    setSelectedEventToReplace(null);
    setShowAddPlaceModal(false);
  };

  const handleSaveItinerary = async () => {
    if (!itineraryData) return;
    
    if (!isAuthenticated || !user) {
      alert('Please log in to save your itinerary.');
      navigate('/');
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('Saving edited itinerary:', { itineraryData, daySchedules });
      console.log('Budget estimate type:', typeof (itineraryData.itinerary?.budget_estimate || itineraryData.budget));
      console.log('Budget estimate value:', itineraryData.itinerary?.budget_estimate || itineraryData.budget);
      
      // Helper function to safely parse cost values
      const parseCost = (value: any): number => {
        if (value === null || value === undefined) return 0;
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          return parseFloat(value.replace('$', '').replace(',', '')) || 0;
        }
        return 0;
      };
      
      // Convert edited itinerary data to the format expected by the API
      const saveData = {
        title: `${itineraryData.itinerary?.destination || itineraryData.destination} Trip (Edited)`,
        description: `AI-generated itinerary for ${itineraryData.itinerary?.destination || itineraryData.destination} - Customized`,
        destination: itineraryData.itinerary?.destination || itineraryData.destination || 'Unknown Destination',
        country: itineraryData.itinerary?.destination || itineraryData.destination || 'Unknown Country',
        city: itineraryData.itinerary?.destination || itineraryData.destination || 'Unknown City',
        duration_days: parseInt(String(itineraryData.itinerary?.total_days || itineraryData.duration_days)) || 1,
        start_date: daySchedules[0]?.date || undefined,
        end_date: daySchedules[daySchedules.length - 1]?.date || undefined,
        budget: parseCost(itineraryData.itinerary?.budget_estimate || itineraryData.budget),
        travel_style: ['leisure'],
        interests: [],
        days: daySchedules.length > 0 ? daySchedules.map((daySchedule) => {
          const transportEvents = daySchedule.events.filter(event => event.type === 'transport');
          const accommodationEvents = daySchedule.events.filter(event => event.type === 'checkin' || event.type === 'checkout');
          
          return {
            day_number: parseInt(String(daySchedule.day)) || 1,
            date: null, // Backend expects None/null, not a string date
            activities: daySchedule.events
              .filter(event => event.type === 'activity')
              .map(event => ({
                name: event.title,
                time: event.time,
                location: event.location || event.title,
                description: event.description || event.title,
                cost: parseCost(event.cost)
              })),
            meals: daySchedule.events
              .filter(event => event.type === 'meal')
              .map(event => ({
                name: event.title,
                time: event.time,
                location: event.location || event.title,
                description: event.description || event.title,
                cost: 50.0 // Default meal cost
              })),
            transportation: transportEvents.length > 0 ? {
              // Backend expects a single dict, not an array
              primary_method: transportEvents[0].title || 'Transport',
              from: 'Previous location',
              to: 'Next location',
              duration: transportEvents[0].duration || '30 minutes',
              cost: parseCost(transportEvents[0].cost),
              all_transportation: transportEvents // Keep all transportation data in a nested field
            } : null,
            accommodations: accommodationEvents.length > 0 ? {
              name: accommodationEvents[0].title,
              type: 'hotel',
              cost_per_night: parseCost(accommodationEvents[0].cost)
            } : null,
            estimated_cost: parseFloat(daySchedule.events.reduce((sum, event) => 
              sum + parseCost(event.cost), 0
            ).toFixed(2))
          };
        }) : []
      };
      
      console.log('Sending edited save data:', JSON.stringify(saveData, null, 2));
      console.log('Transportation structure check:', saveData.days.map(day => ({ day: day.day_number, transportation: day.transportation })));
      
      // Validate required fields
      if (!saveData.title || !saveData.destination || !saveData.country || !saveData.city) {
        throw new Error('Missing required fields: title, destination, country, or city');
      }
      
      if (saveData.days.length === 0) {
        throw new Error('No days data available to save');
      }
      
      // Call the appropriate API based on edit mode
      let savedItinerary;
      if (editMode === 'saved' && originalItineraryId) {
        // Update existing saved itinerary
        savedItinerary = await savedItineraryAPI.updateItinerary(originalItineraryId, saveData as any);
        console.log('Saved itinerary updated successfully:', savedItinerary);
      } else {
        // Create new saved itinerary
        savedItinerary = await savedItineraryAPI.createItinerary(saveData as any);
        console.log('New itinerary saved successfully:', savedItinerary);
      }
      
      setShowSaveConfirmation(true);
      setTimeout(() => {
        setShowSaveConfirmation(false);
        navigate('/dashboard', { state: { activeTab: 'trips' } });
      }, 3000);
    } catch (error: any) {
      console.error('Error saving edited itinerary:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to save edited itinerary: ${error.response?.data?.detail || error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your itinerary..." />
      </div>
    );
  }

  if (error || !itineraryData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'No itinerary data found'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back Home
          </button>
        </Card>
      </div>
    );
  }

  const currentDay = daySchedules.find(day => day.day === selectedDay);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ModernHeader - appears when scrolling */}
      {isScrolled && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <ModernHeader />
        </div>
      )}
      
      {/* Enhanced Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 w-full backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            {/* Left side - Back button and Logo/Name */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/itinerary-generation', { state: { itineraryData, daySchedules } })}
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 group shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white" />
              </button>
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  editMode === 'saved' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-r from-green-500 to-green-600'
                }`}>
                  <Edit3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {editMode === 'saved' ? 'Edit' : 'Customize'} {itineraryData.itinerary?.destination || itineraryData.destination} Itinerary
                    </h1>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      editMode === 'saved' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {editMode === 'saved' ? 'Saved' : 'Building'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{itineraryData.itinerary?.total_days || itineraryData.duration_days} days</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{editMode === 'saved' ? 'Modify your saved trip' : 'Customize your trip'}</span>
                    </span>
                    {editMode === 'saved' && (
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Saved</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Enhanced Save button */}
            <div className="flex items-center space-x-3">
              <ModernButton
                onClick={handleSaveItinerary}
                variant="solid"
                className={`flex items-center space-x-2 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200 ${
                  editMode === 'saved'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                }`}
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {isSaving 
                    ? (editMode === 'saved' ? 'Updating...' : 'Saving...') 
                    : (editMode === 'saved' ? 'Update Itinerary' : 'Save Itinerary')
                  }
                </span>
              </ModernButton>
            </div>
          </div>
        </div>
      </header>

      {/* Status Indicator */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-4">
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
          editMode === 'saved'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
            : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            editMode === 'saved' ? 'bg-blue-500' : 'bg-green-500'
          }`}></div>
          <span>
            {editMode === 'saved' 
              ? 'Editing saved itinerary' 
              : 'Building new itinerary'
            }
          </span>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Panel - Current Itinerary */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="p-6 shadow-lg border-0 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Current Itinerary
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAddPlaceModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">Add Place</span>
                  </button>
                </div>
              </div>
              
              {/* Add visual indicator for where places can be added */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Click on any event to replace it, or use "Add Place" to insert new places</span>
                </div>
              </div>

              {/* Enhanced Day Navigation */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Day to Edit</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {daySchedules.length} days total
                  </span>
                </div>
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {daySchedules.map((day) => (
                    <button
                      key={day.day}
                      onClick={() => setSelectedDay(day.day)}
                      className={`px-6 py-4 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border-2 min-w-[120px] ${
                        selectedDay === day.day
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg transform scale-105'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-transparent hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">Day {day.day}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            selectedDay === day.day
                              ? 'bg-white/20 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                          }`}>
                            {day.events.length} events
                          </span>
                        </div>
                        {day.date && (
                          <span className={`text-xs ${
                            selectedDay === day.day
                              ? 'text-white/80'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {new Date(day.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Details */}
              {currentDay && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Day {currentDay.day}: {currentDay.theme}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(currentDay.date)}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {currentDay.events.map((event, index) => (
                      <div 
                        key={index} 
                        className="group relative flex items-start space-x-6 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer hover:shadow-xl transform hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600"
                        onClick={() => handleReplaceEvent(event)}
                      >
                        {/* Enhanced Event Icon */}
                        <div className="flex-shrink-0 relative">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-md ${getEventColor(event.type)} border-2 border-white dark:border-gray-800 group-hover:scale-110 transition-transform duration-300`}>
                            {getEventIcon(event.type)}
                          </div>
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>

                        {/* Enhanced Event Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {event.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {event.time && (
                                <div className="flex items-center space-x-1 bg-white dark:bg-gray-700 px-2 py-1 rounded-full shadow-sm">
                                  <Clock className="w-3 h-3 text-gray-500" />
                                  <span className="text-xs text-gray-600 dark:text-gray-300">
                                    {event.time}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReplaceEvent(event);
                                  }}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                                  title="Replace this place"
                                >
                                  <Replace className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveEvent(daySchedules.findIndex(day => day.day === selectedDay), index);
                                  }}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                                  title="Remove this place"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2">
                            {event.location && (
                              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                                <MapPin className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600 dark:text-gray-300">{event.location}</span>
                              </div>
                            )}
                            {event.duration && (
                              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600 dark:text-gray-300">{event.duration}</span>
                              </div>
                            )}
                            {event.cost && event.cost !== '0' && (
                              <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                <DollarSign className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-green-600 dark:text-green-400">{event.cost}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Hover indicator */}
                        <div className="absolute inset-0 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            Click to replace
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add place button at the end */}
                    <div className="mt-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer group"
                         onClick={() => setShowAddPlaceModal(true)}>
                      <div className="flex items-center justify-center space-x-3 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Add a new place to this day</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Panel - Explore Places */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="p-6 shadow-lg border-0 bg-white dark:bg-gray-800">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center">
                    <Search className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Explore Places
                  </h2>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search places..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                  />
                </div>
              </div>

              {/* Additional Places Component */}
              {itineraryData && (
                <AdditionalPlaces
                  additionalPlaces={itineraryData.additional_places}
                  onAddToItinerary={handleAddPlace}
                  onPlaceHover={() => {}}
                  onPlaceHoverLeave={() => {}}
                />
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Place Details Modal */}
      <PlaceDetailsModal
        place={selectedPlace}
        isOpen={isPlaceModalOpen}
        onClose={() => setIsPlaceModalOpen(false)}
        onAddToItinerary={handleAddPlace}
        showAddButton={true}
      />

      {/* Add Place Modal */}
      {showAddPlaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl mx-4 w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedEventToReplace ? 'Replace Place' : 'Add Place to Itinerary'}
              </h3>
              <button
                onClick={() => {
                  setShowAddPlaceModal(false);
                  setSelectedEventToReplace(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search for places to add..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {itineraryData && (
                <AdditionalPlaces
                  additionalPlaces={itineraryData.additional_places}
                  onAddToItinerary={handleAddPlace}
                  onPlaceHover={() => {}}
                  onPlaceHoverLeave={() => {}}
                />
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddPlaceModal(false);
                  setSelectedEventToReplace(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="flex flex-col space-y-3">
          {/* Quick Add Place Button */}
          <button
            onClick={() => setShowAddPlaceModal(true)}
            className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group transform hover:scale-110"
            title="Add Place"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
          </button>
          
          {/* Quick Save Button */}
          <button
            onClick={handleSaveItinerary}
            disabled={isSaving}
            className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group transform hover:scale-110 ${
              editMode === 'saved'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={editMode === 'saved' ? 'Update Itinerary' : 'Save Itinerary'}
          >
            {isSaving ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
            )}
          </button>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      {showSaveConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {editMode === 'saved' ? 'Itinerary Updated!' : 'Itinerary Saved!'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {editMode === 'saved' 
                ? 'Your itinerary has been updated successfully.'
                : 'Your itinerary has been saved successfully. You can find it in your dashboard.'
              }
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span>Redirecting to your trips...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditItineraryPage;
