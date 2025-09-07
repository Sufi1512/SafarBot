import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, DollarSign, Clock, Star, Save, Edit3, CheckCircle } from 'lucide-react';
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
          photo: placeDetails?.photos_link,
          website: placeDetails?.website,
          phone: placeDetails?.phone,
          openingHours: placeDetails?.operating_hours ? JSON.stringify(placeDetails.operating_hours) : undefined,
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
          photo: placeDetails?.photos_link,
          website: placeDetails?.website,
          phone: placeDetails?.phone,
          openingHours: placeDetails?.operating_hours ? JSON.stringify(placeDetails.operating_hours) : undefined,
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
        days: itineraryData.itinerary.daily_plans.map((plan) => ({
          day_number: plan.day,
          date: plan.date,
          activities: plan.activities.map(activity => ({
            name: activity.title,
            time: activity.time,
            location: activity.title,
            description: activity.title,
            cost: parseFloat(activity.estimated_cost.replace('$', '')) || 0
          })),
          meals: plan.meals.map(meal => ({
            name: meal.name,
            time: meal.time,
            location: meal.name,
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
      
      {/* Enhanced Header with better visibility */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 w-full backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            {/* Left side - Back button and Logo/Name */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/results')}
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 group shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {itineraryData.itinerary.destination} Itinerary
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{itineraryData.itinerary.total_days} days</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${calculateTotalCost().toFixed(0)} estimated</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{itineraryData.metadata.places_used_in_itinerary} places</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Enhanced Action buttons */}
            <div className="flex items-center space-x-3">
              <ModernButton
                onClick={handleEditItinerary}
                variant="outline"
                className="flex items-center space-x-2 px-6 py-3 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Edit3 className="w-4 h-4" />
                <span className="font-medium">Edit Itinerary</span>
              </ModernButton>
              <ModernButton
                onClick={handleSaveItinerary}
                variant="primary"
                className="flex items-center space-x-2 px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="font-medium">{isSaving ? 'Saving...' : 'Save Itinerary'}</span>
              </ModernButton>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Day Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-6 shadow-lg border-0 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-2 mb-6">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Schedule</h3>
              </div>
              <div className="space-y-3">
                {daySchedules.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 border-2 ${
                      selectedDay === day.day
                        ? 'bg-blue-50 text-blue-900 border-blue-200 shadow-md transform scale-105'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-lg">Day {day.day}</div>
                      <div className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                        {day.events.length} events
                      </div>
                    </div>
                    <div className="text-sm opacity-75 mb-1">{formatDate(day.date)}</div>
                    <div className="text-xs opacity-60 font-medium">{day.theme}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Enhanced Trip Summary */}
            <Card className="p-6 mt-6 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center space-x-2 mb-6">
                <Star className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trip Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Destination:</span>
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{itineraryData.itinerary.destination}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Duration:</span>
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{itineraryData.itinerary.total_days} days</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Total Cost:</span>
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">${calculateTotalCost().toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                    <Star className="w-4 h-4" />
                    <span>Places:</span>
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{itineraryData.metadata.places_used_in_itinerary}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Enhanced Day Details */}
          <div className="lg:col-span-3">
            {currentDay && (
              <Card className="p-8 shadow-xl border-0 bg-white dark:bg-gray-800">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Day {currentDay.day}: {currentDay.theme}
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {formatDate(currentDay.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Events</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {currentDay.events.length}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(currentDay.day / daySchedules.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-6">
                  {currentDay.events.map((event, index) => (
                    <div 
                      key={index} 
                      className="group relative flex items-start space-x-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 border border-gray-200 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-400 hover:shadow-lg transform hover:-translate-y-1"
                    >
                      {/* Timeline connector */}
                      {index < currentDay.events.length - 1 && (
                        <div className="absolute left-8 top-20 w-0.5 h-16 bg-gray-300 dark:bg-gray-500 group-hover:bg-blue-300 dark:group-hover:bg-blue-400 transition-colors"></div>
                      )}
                      
                      {/* Enhanced Event Icon */}
                      <div className="flex-shrink-0 relative">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${getEventColor(event.type)} border-2 border-white dark:border-gray-800 group-hover:scale-110 transition-transform duration-300`}>
                          {getEventIcon(event.type)}
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600">
                          {index + 1}
                        </div>
                      </div>

                      {/* Enhanced Event Photo */}
                      {event.photo && (
                        <div className="flex-shrink-0">
                          <img 
                            src={event.photo} 
                            alt={event.title}
                            className="w-20 h-20 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-shadow duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {event.title}
                            </h3>
                            {event.description && (
                              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {event.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-2 ml-4">
                            {event.time && (
                              <div className="flex items-center space-x-1 bg-white dark:bg-gray-700 px-3 py-1 rounded-full shadow-sm">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {event.time}
                                </span>
                              </div>
                            )}
                            {event.cost && event.cost !== '0' && (
                              <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                  {event.cost}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Enhanced metadata */}
                        <div className="flex flex-wrap items-center gap-3 mt-4">
                          {event.location && (
                            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-full">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">{event.location}</span>
                            </div>
                          )}
                          {event.duration && (
                            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-full">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">{event.duration}</span>
                            </div>
                          )}
                          {event.cuisine && (
                            <div className="flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/20 px-3 py-1 rounded-full">
                              <span className="text-sm">🍽️</span>
                              <span className="text-sm text-orange-600 dark:text-orange-400">{event.cuisine}</span>
                            </div>
                          )}
                          {event.priceRange && (
                            <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                              <span className="text-sm">💰</span>
                              <span className="text-sm text-yellow-600 dark:text-yellow-400">{event.priceRange}</span>
                            </div>
                          )}
                          {event.rating && (
                            <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm text-yellow-600 dark:text-yellow-400">{event.rating}</span>
                            </div>
                          )}
                          {event.reviews && (
                            <div className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                              <span className="text-sm">👥</span>
                              <span className="text-sm text-blue-600 dark:text-blue-400">{event.reviews} reviews</span>
                            </div>
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

      {/* Enhanced Save Confirmation Modal */}
      {showSaveConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-200 dark:border-gray-700 transform animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              🎉 Itinerary Saved!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
              Your amazing {itineraryData?.itinerary.destination} itinerary has been successfully saved to your trips.
            </p>
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="font-medium">Redirecting to your trips...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryGenerationPage;
