import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, DollarSign, Clock, Star, Save, Edit3, CheckCircle, Plus, Trash2, Replace } from 'lucide-react';
import { EnhancedItineraryResponse, savedItineraryAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ModernButton from '../components/ui/ModernButton';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ModernHeader from '../components/ModernHeader';

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

const ItineraryGenerationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [itineraryData, setItineraryData] = useState<EnhancedItineraryResponse | null>(null);
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const state = location.state as { itineraryData?: EnhancedItineraryResponse };
    if (state?.itineraryData) {
      setItineraryData(state.itineraryData);
      processItineraryData(state.itineraryData);
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

  const handleSaveItinerary = async () => {
    if (!itineraryData) return;
    
    if (!isAuthenticated || !user) {
      alert('Please log in to save your itinerary.');
      navigate('/');
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('Saving itinerary:', itineraryData);
      
      // Convert itinerary data to the format expected by the API
      const saveData = {
        title: `${itineraryData.itinerary.destination} Trip`,
        description: `AI-generated itinerary for ${itineraryData.itinerary.destination}`,
        destination: itineraryData.itinerary.destination,
        country: itineraryData.itinerary.destination, // You might want to extract country from destination
        city: itineraryData.itinerary.destination,
        duration_days: itineraryData.itinerary.total_days,
        start_date: itineraryData.itinerary.daily_plans[0]?.date,
        end_date: itineraryData.itinerary.daily_plans[itineraryData.itinerary.daily_plans.length - 1]?.date,
        budget: itineraryData.itinerary.budget_estimate,
        travel_style: ['leisure'], // Default travel style
        interests: [], // You might want to extract from the original request
        days: itineraryData.itinerary.daily_plans.map((plan, index) => ({
          day_number: plan.day,
          date: plan.date,
          activities: plan.activities.map(activity => ({
            name: activity.title,
            time: activity.time,
            location: activity.location || activity.title,
            description: activity.description || activity.title,
            cost: parseFloat(activity.estimated_cost.replace('$', '')) || 0
          })),
          meals: plan.meals.map(meal => ({
            name: meal.name,
            time: meal.time,
            location: meal.location || meal.name,
            description: `Great ${meal.cuisine} cuisine`,
            cost: 50 // Default meal cost
          })),
          transportation: plan.transportation.map(transport => ({
            method: transport.method,
            from: transport.from,
            to: transport.to,
            duration: transport.duration,
            cost: parseFloat(transport.cost.replace('$', '')) || 0
          })),
          estimated_cost: plan.activities.reduce((sum, activity) => 
            sum + (parseFloat(activity.estimated_cost.replace('$', '')) || 0), 0
          ) + plan.transportation.reduce((sum, transport) => 
            sum + (parseFloat(transport.cost.replace('$', '')) || 0), 0
          )
        }))
      };
      
      console.log('Sending save data:', saveData);
      
      // Call the actual API
      const savedItinerary = await savedItineraryAPI.createItinerary(saveData);
      console.log('Itinerary saved successfully:', savedItinerary);
      
      setShowSaveConfirmation(true);
      setTimeout(() => {
        setShowSaveConfirmation(false);
        navigate('/dashboard', { state: { activeTab: 'trips' } });
      }, 3000);
    } catch (error) {
      console.error('Error saving itinerary:', error);
      alert('Failed to save itinerary. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditItinerary = () => {
    navigate('/edit-itinerary', { 
      state: { 
        itineraryData,
        daySchedules 
      } 
    });
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
                onClick={() => navigate('/results')}
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
                    {itineraryData.itinerary.destination} Itinerary
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {itineraryData.itinerary.total_days} days • ${calculateTotalCost().toFixed(0)} estimated cost
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right side - Action buttons */}
            <div className="flex items-center space-x-4">
              <ModernButton
                onClick={handleEditItinerary}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Itinerary</span>
              </ModernButton>
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
                <span>{isSaving ? 'Saving...' : 'Save Itinerary'}</span>
              </ModernButton>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Day Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Schedule</h3>
              <div className="space-y-2">
                {daySchedules.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedDay === day.day
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium">Day {day.day}</div>
                    <div className="text-sm opacity-75">{formatDate(day.date)}</div>
                    <div className="text-xs opacity-60">{day.theme}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Trip Summary */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trip Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Destination:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{itineraryData.itinerary.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{itineraryData.itinerary.total_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Cost:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">${calculateTotalCost().toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Places:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{itineraryData.metadata.places_used_in_itinerary}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Day Details */}
          <div className="lg:col-span-3">
            {currentDay && (
              <Card className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Day {currentDay.day}: {currentDay.theme}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatDate(currentDay.date)}
                  </p>
                </div>

                <div className="space-y-4">
                  {currentDay.events.map((event, index) => (
                    <div 
                      key={index} 
                      className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      {/* Event Icon */}
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${getEventColor(event.type)}`}>
                          {getEventIcon(event.type)}
                        </div>
                      </div>

                      {/* Event Photo */}
                      {event.photo && (
                        <div className="flex-shrink-0">
                          <img 
                            src={event.photo} 
                            alt={event.title}
                            className="w-16 h-16 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {event.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {event.time && (
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {event.time}
                              </span>
                            )}
                            {event.cost && event.cost !== '0' && (
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                {event.cost}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {event.description && (
                          <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {event.location && (
                            <span>📍 {event.location}</span>
                          )}
                          {event.duration && (
                            <span>⏱️ {event.duration}</span>
                          )}
                          {event.cuisine && (
                            <span>🍽️ {event.cuisine}</span>
                          )}
                          {event.priceRange && (
                            <span>💰 {event.priceRange}</span>
                          )}
                          {event.rating && (
                            <span>⭐ {event.rating}</span>
                          )}
                          {event.reviews && (
                            <span>👥 {event.reviews} reviews</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
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
              Itinerary Saved!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your itinerary has been successfully saved to your trips.
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

export default ItineraryGenerationPage;
