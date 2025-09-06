import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, DollarSign, Clock, Star, Save, Plus, Trash2, Replace, Search, X, CheckCircle } from 'lucide-react';
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
  const [itineraryData, setItineraryData] = useState<EnhancedItineraryResponse | null>(null);
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | AdditionalPlace | null>(null);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [selectedEventToReplace, setSelectedEventToReplace] = useState<TimelineEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const state = location.state as { 
      itineraryData?: EnhancedItineraryResponse;
      daySchedules?: DaySchedule[];
    };
    if (state?.itineraryData) {
      setItineraryData(state.itineraryData);
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

  const processItineraryData = (data: EnhancedItineraryResponse) => {
    const schedules: DaySchedule[] = data.itinerary.daily_plans.map((plan) => {
      const events: TimelineEvent[] = [];

      // Add check-in for first day
      if (plan.day === 1) {
        events.push({
          time: '12:00',
          type: 'checkin',
          title: 'Hotel Check-in',
          description: 'Arrive at your accommodation',
          location: data.itinerary.accommodation_suggestions[0]?.location || 'Hotel',
          cost: '0',
          placeId: data.itinerary.accommodation_suggestions[0]?.place_id
        });
      }

      // Add check-out for last day
      if (plan.day === data.itinerary.total_days) {
        events.push({
          time: '09:00',
          type: 'checkout',
          title: 'Hotel Check-out',
          description: 'Depart from your accommodation',
          location: data.itinerary.accommodation_suggestions[0]?.location || 'Hotel',
          cost: '0',
          placeId: data.itinerary.accommodation_suggestions[0]?.place_id
        });
      }

      // Add activities
      plan.activities.forEach((activity) => {
        const placeDetails = data.place_details[activity.place_id];
        events.push({
          time: activity.time,
          type: 'activity',
          title: activity.title,
          description: placeDetails?.description || activity.title,
          location: placeDetails?.address || activity.title,
          duration: activity.duration,
          cost: activity.estimated_cost,
          placeId: activity.place_id,
          rating: placeDetails?.rating,
          photo: placeDetails?.photo,
          website: placeDetails?.website,
          phone: placeDetails?.phone,
          openingHours: placeDetails?.opening_hours,
          reviews: placeDetails?.reviews,
          types: placeDetails?.types
        });
      });

      // Add meals
      plan.meals.forEach((meal) => {
        const placeDetails = data.place_details[meal.place_id];
        events.push({
          time: meal.time,
          type: 'meal',
          title: meal.name,
          description: placeDetails?.description || `Great ${meal.cuisine} cuisine`,
          location: placeDetails?.address || meal.name,
          cuisine: meal.cuisine,
          priceRange: meal.price_range,
          placeId: meal.place_id,
          rating: placeDetails?.rating,
          photo: placeDetails?.photo,
          website: placeDetails?.website,
          phone: placeDetails?.phone,
          openingHours: placeDetails?.opening_hours,
          reviews: placeDetails?.reviews,
          types: placeDetails?.types
        });
      });

      // Add transportation
      plan.transportation.forEach((transport) => {
        events.push({
          time: transport.from === 'Hotel' ? 'Before next activity' : 'After previous activity',
          type: 'transport',
          title: `${transport.method} to ${transport.to}`,
          description: `Travel from ${transport.from} to ${transport.to}`,
          duration: transport.duration,
          cost: transport.cost
        });
      });

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

  const calculateTotalCost = () => {
    if (!itineraryData) return 0;
    
    let total = 0;
    itineraryData.itinerary.daily_plans.forEach(plan => {
      plan.activities.forEach(activity => {
        const cost = parseFloat(activity.estimated_cost.replace('$', '')) || 0;
        total += cost;
      });
      plan.transportation.forEach(transport => {
        const cost = parseFloat(transport.cost.replace('$', '')) || 0;
        total += cost;
      });
    });
    
    return total;
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
          title: place.title,
          description: place.description,
          location: place.address,
          duration: '2 hours',
          cost: '$50',
          placeId: place.place_id,
          rating: place.rating,
          photo: place.photo,
          website: place.website,
          phone: place.phone,
          openingHours: place.opening_hours,
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
        title: place.title,
        description: place.description,
        location: place.address,
        duration: '2 hours',
        cost: '$50',
        placeId: place.place_id,
        rating: place.rating,
        photo: place.photo,
        website: place.website,
        phone: place.phone,
        openingHours: place.opening_hours,
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
      
      // Convert edited itinerary data to the format expected by the API
      const saveData = {
        title: `${itineraryData.itinerary.destination} Trip (Edited)`,
        description: `AI-generated itinerary for ${itineraryData.itinerary.destination} - Customized`,
        destination: itineraryData.itinerary.destination,
        country: itineraryData.itinerary.destination,
        city: itineraryData.itinerary.destination,
        duration_days: itineraryData.itinerary.total_days,
        start_date: daySchedules[0]?.date,
        end_date: daySchedules[daySchedules.length - 1]?.date,
        budget: itineraryData.itinerary.budget_estimate,
        travel_style: ['leisure'],
        interests: [],
        days: daySchedules.map((daySchedule) => ({
          day_number: daySchedule.day,
          date: daySchedule.date,
          activities: daySchedule.events
            .filter(event => event.type === 'activity')
            .map(event => ({
              name: event.title,
              time: event.time,
              location: event.location || event.title,
              description: event.description || event.title,
              cost: parseFloat(event.cost?.replace('$', '') || '0') || 0
            })),
          meals: daySchedule.events
            .filter(event => event.type === 'meal')
            .map(event => ({
              name: event.title,
              time: event.time,
              location: event.location || event.title,
              description: event.description || event.title,
              cost: 50 // Default meal cost
            })),
          transportation: daySchedule.events
            .filter(event => event.type === 'transport')
            .map(event => ({
              method: event.title.split(' to ')[0] || 'Transport',
              from: 'Previous location',
              to: event.title.split(' to ')[1] || 'Next location',
              duration: event.duration || '30 minutes',
              cost: parseFloat(event.cost?.replace('$', '') || '0') || 0
            })),
          estimated_cost: daySchedule.events.reduce((sum, event) => 
            sum + (parseFloat(event.cost?.replace('$', '') || '0') || 0), 0
          )
        }))
      };
      
      console.log('Sending edited save data:', saveData);
      
      // Call the actual API
      const savedItinerary = await savedItineraryAPI.createItinerary(saveData);
      console.log('Edited itinerary saved successfully:', savedItinerary);
      
      setShowSaveConfirmation(true);
      setTimeout(() => {
        setShowSaveConfirmation(false);
        navigate('/dashboard', { state: { activeTab: 'trips' } });
      }, 3000);
    } catch (error) {
      console.error('Error saving edited itinerary:', error);
      alert('Failed to save edited itinerary. Please try again.');
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
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            {/* Left side - Back button and Logo/Name */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/itinerary-generation', { state: { itineraryData, daySchedules } })}
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
                    Edit {itineraryData.itinerary.destination} Itinerary
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Customize your perfect trip
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right side - Save button */}
            <div className="flex items-center space-x-4">
              <ModernButton
                onClick={handleSaveItinerary}
                variant="primary"
                className="flex items-center space-x-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </ModernButton>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Current Itinerary */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Current Itinerary
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAddPlaceModal(true)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Place</span>
                  </button>
                </div>
              </div>

              {/* Day Navigation */}
              <div className="mb-6">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {daySchedules.map((day) => (
                    <button
                      key={day.day}
                      onClick={() => setSelectedDay(day.day)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedDay === day.day
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Day {day.day}
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

                  <div className="space-y-3">
                    {currentDay.events.map((event, index) => (
                      <div 
                        key={index} 
                        className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        {/* Event Icon */}
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getEventColor(event.type)}`}>
                            {getEventIcon(event.type)}
                          </div>
                        </div>

                        {/* Event Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {event.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {event.time && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {event.time}
                                </span>
                              )}
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleReplaceEvent(event)}
                                  className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                                  title="Replace"
                                >
                                  <Replace className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleRemoveEvent(daySchedules.findIndex(day => day.day === selectedDay), index)}
                                  className="p-1 text-red-600 hover:text-red-700 transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {event.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {event.location && (
                              <span>📍 {event.location}</span>
                            )}
                            {event.duration && (
                              <span>⏱️ {event.duration}</span>
                            )}
                            {event.cost && event.cost !== '0' && (
                              <span>💰 {event.cost}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Panel - Explore Places */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Explore Places
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search places..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Save Confirmation Modal */}
      {showSaveConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Changes Saved!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your itinerary has been successfully updated.
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
