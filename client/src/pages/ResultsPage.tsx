import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, DollarSign, Clock, Star, AlertCircle, Hotel, Utensils } from 'lucide-react';
import { itineraryAPI, hotelAPI, restaurantAPI } from '../services/api';

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
}

interface Hotel {
  name: string;
  rating: number;
  price?: number;
  price_range?: string;
  amenities?: string[];
  location?: string;
  description?: string;
}

interface Restaurant {
  name: string;
  cuisine: string;
  rating: number;
  priceRange?: string;
  price_range?: string;
  description?: string;
  location?: string;
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
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    if (location.state) {
      setItineraryData(location.state);
      generateRealItinerary(location.state);
    } else {
      navigate('/');
    }
  }, [location.state, navigate]);

  const generateRealItinerary = async (data: ItineraryData) => {
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

      // Generate itinerary
      const itineraryResponse = await itineraryAPI.generateItinerary(apiRequest);
      console.log('Received itinerary response:', itineraryResponse);
      
      // Handle the response structure from your backend
      if (itineraryResponse && itineraryResponse.daily_plans !== undefined) {
        // Check if we got actual itinerary data
        if (itineraryResponse.daily_plans.length === 0) {
          console.warn('Received empty daily_plans from AI');
          throw new Error('AI could not generate a detailed itinerary. This might be due to complex requirements or server issues.');
        }
        
        // Process daily plans and normalize the data
        const normalizedDailyPlans = itineraryResponse.daily_plans.map(plan => ({
          ...plan,
          activities: plan.activities.map(activity => ({
            ...activity,
            cost: activity.cost || 0,
            type: activity.type || 'sightseeing'
          })),
          meals: plan.meals.map(meal => ({
            ...meal,
            priceRange: meal.priceRange || meal.price_range || '$$',
            description: meal.description || `Great ${meal.cuisine} cuisine`,
            location: meal.location || itineraryResponse.destination
          }))
        }));
        
        setDailyPlans(normalizedDailyPlans);
        
        // Set itinerary summary
        setItinerarySummary({
          total_days: itineraryResponse.total_days || data.days,
          budget_estimate: itineraryResponse.budget_estimate || 0,
          destination: itineraryResponse.destination || data.destination
        });
        
        // Update recommendations if available
        if (itineraryResponse.recommendations) {
          if (itineraryResponse.recommendations.hotels) {
            // Normalize hotel data from backend
            const normalizedHotels = itineraryResponse.recommendations.hotels.map(hotel => ({
              ...hotel,
              price: hotel.price || 100, // Default price if not provided
              priceRange: hotel.price_range || '$$',
              amenities: hotel.amenities || ['WiFi'],
              location: hotel.location || itineraryResponse.destination,
              description: hotel.description || `Great hotel in ${itineraryResponse.destination}`
            }));
            setHotels(normalizedHotels);
          }
          if (itineraryResponse.recommendations.restaurants) {
            // Normalize restaurant data from backend
            const normalizedRestaurants = itineraryResponse.recommendations.restaurants.map(restaurant => ({
              ...restaurant,
              priceRange: restaurant.price_range || restaurant.priceRange || '$$',
              description: restaurant.description || `Excellent ${restaurant.cuisine} cuisine`,
              location: restaurant.location || itineraryResponse.destination
            }));
            setRestaurants(normalizedRestaurants);
          }
          if (itineraryResponse.recommendations.tips) {
            setTips(itineraryResponse.recommendations.tips);
          }
        }
        
        // Set weather info if available
        if (itineraryResponse.weather_info) {
          setWeatherInfo(itineraryResponse.weather_info);
        }
      } else {
        throw new Error('Invalid response format from server');
      }

      // Only fetch additional hotels/restaurants if we don't have them from the itinerary
      if (!itineraryResponse.recommendations?.hotels || itineraryResponse.recommendations.hotels.length === 0) {
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

      if (!itineraryResponse.recommendations?.restaurants || itineraryResponse.recommendations.restaurants.length === 0) {
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
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockItinerary = (data: ItineraryData) => {
    const plans: DailyPlan[] = [];
    const startDate = new Date(data.startDate);
    
    for (let day = 1; day <= data.days; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day - 1);
      
      plans.push({
        day,
        date: currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        activities: generateDayActivities(day),
        accommodation: day === 1 ? {
          name: 'Grand Hotel Central',
          rating: 4.5,
          price: 150,
          amenities: ['WiFi', 'Pool', 'Breakfast'],
          location: 'City Center',
          description: 'Luxury hotel in the heart of the city'
        } : undefined,
        meals: generateDayMeals(day),
        totalCost: 200
      });
    }
    
    setDailyPlans(plans);
    
    // Mock hotels
    setHotels([
      {
        name: 'Grand Hotel Central',
        rating: 4.5,
        price: 150,
        amenities: ['WiFi', 'Pool', 'Breakfast'],
        location: 'City Center',
        description: 'Luxury hotel in the heart of the city'
      },
      {
        name: 'Boutique Garden Hotel',
        rating: 4.3,
        price: 120,
        amenities: ['WiFi', 'Garden', 'Spa'],
        location: 'Old Town',
        description: 'Charming boutique hotel with beautiful gardens'
      }
    ]);

    // Mock restaurants
    setRestaurants([
      {
        name: 'Local Bistro',
        cuisine: 'Local',
        rating: 4.5,
        priceRange: '$$',
        description: 'Authentic local cuisine in a cozy atmosphere',
        location: 'Downtown'
      },
      {
        name: 'Seafood Grill',
        cuisine: 'Seafood',
        rating: 4.7,
        priceRange: '$$$',
        description: 'Fresh seafood with ocean views',
        location: 'Waterfront'
      }
    ]);
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
          location: 'Central Market',
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
          location: 'National Museum',
          duration: '3 hours',
          cost: 30,
          type: 'sightseeing'
        },
        {
          time: '14:00',
          title: 'Park & Gardens',
          description: 'Relax in the beautiful botanical gardens',
          location: 'Botanical Gardens',
          duration: '2 hours',
          cost: 10,
          type: 'sightseeing'
        }
      );
    } else {
      activities.push(
        {
          time: '09:00',
          title: 'Day Trip',
          description: 'Visit nearby attractions and scenic viewpoints',
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            {/* Left side - Back button and Logo/Name */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {itineraryData.destination} Itinerary
                  </h1>
                  <p className="text-sm text-gray-500">
                    {itineraryData.days} days • {itineraryData.travelers} traveler{itineraryData.travelers > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right side - Trip details */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'itinerary', label: 'Itinerary', icon: '🗓️' },
                { id: 'hotels', label: 'Hotels', icon: '🏨' },
                { id: 'restaurants', label: 'Restaurants', icon: '🍽️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600 mb-2">Generating your perfect itinerary...</p>
              <p className="text-sm text-gray-500">This may take up to 2 minutes. Please be patient while our AI creates the best travel plan for you.</p>
              <div className="mt-4 text-xs text-gray-400">
                ✈️ Analyzing destinations • 🏨 Finding accommodations • 🍽️ Selecting restaurants
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg text-red-600 mb-2">
                {error.includes('timeout') ? 'Request Timed Out' : 'Something went wrong'}
              </p>
              <p className="text-gray-600 mb-4">{error}</p>
              {error.includes('timeout') && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    💡 <strong>Tip:</strong> AI itinerary generation can take time. Try simplifying your request or check your internet connection.
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => itineraryData && generateRealItinerary(itineraryData)}
                  className="btn-primary"
                >
                  Try Again
                </button>
                {error.includes('timeout') && (
                  <button
                    onClick={() => itineraryData && generateMockItinerary(itineraryData)}
                    className="btn-secondary"
                  >
                    Use Sample Itinerary
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Itinerary Summary */}
            {activeTab === 'itinerary' && itinerarySummary && (
              <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {itinerarySummary.total_days}
                    </div>
                    <div className="text-sm text-gray-600">Total Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${itinerarySummary.budget_estimate.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Estimated Budget</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {dailyPlans.length}
                    </div>
                    <div className="text-sm text-gray-600">Planned Days</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'itinerary' && (
              <>
                {/* Weather Information */}
                {weatherInfo && (
                  <div className="card bg-blue-50 border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      🌤️ Weather Information
                    </h3>
                    <div className="text-gray-700">
                      {typeof weatherInfo === 'string' ? (
                        <p>{weatherInfo}</p>
                      ) : (
                        <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(weatherInfo, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                )}

                {/* Travel Tips */}
                {tips.length > 0 && (
                  <div className="card bg-yellow-50 border-yellow-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      💡 Travel Tips
                    </h3>
                    <div className="space-y-2">
                      {tips.map((tip, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <p className="text-gray-700">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dailyPlans.map((plan) => (
                  <div key={plan.day} className="card">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Day {plan.day}</h2>
                        <p className="text-gray-600">{plan.date}</p>
                      </div>
                      {plan.accommodation && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Staying at</p>
                          <p className="font-medium text-gray-900">{plan.accommodation.name}</p>
                          <div className="flex items-center text-sm text-yellow-500">
                            <Star className="w-4 h-4 mr-1" />
                            {plan.accommodation.rating}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Accommodation Info */}
                    {plan.accommodation && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">🏨 Accommodation</h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{plan.accommodation.name}</p>
                            <p className="text-sm text-gray-600">{plan.accommodation.location}</p>
                            {plan.accommodation.description && (
                              <p className="text-sm text-gray-600 mt-1">{plan.accommodation.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-yellow-500 mb-1">
                              <Star className="w-4 h-4 mr-1" />
                              <span className="font-medium">{plan.accommodation.rating}</span>
                            </div>
                            {plan.accommodation.price && (
                              <p className="text-sm text-gray-600">${plan.accommodation.price}/night</p>
                            )}
                          </div>
                        </div>
                        {plan.accommodation.amenities && plan.accommodation.amenities.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {plan.accommodation.amenities.map((amenity, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
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
                        <div key={index} className="flex space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                              <Clock className="w-5 h-5 text-primary-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                              <span className="text-sm text-gray-500">{activity.time}</span>
                            </div>
                            <p className="text-gray-600 mt-1">{activity.description}</p>
                            <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {activity.location}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {activity.duration}
                              </div>
                              {activity.cost && (
                                <div className="flex items-center">
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  ${activity.cost}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Transport Information */}
                    {plan.transport && plan.transport.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚗 Transportation</h3>
                        <div className="space-y-3">
                          {plan.transport.map((transport, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">{transport.title || `Transport ${index + 1}`}</h4>
                                  <p className="text-sm text-gray-600">{transport.description}</p>
                                  {transport.location && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      <MapPin className="w-3 h-3 inline mr-1" />
                                      {transport.location}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  {transport.cost && (
                                    <p className="text-sm font-medium text-gray-900">${transport.cost}</p>
                                  )}
                                  {transport.duration && (
                                    <p className="text-xs text-gray-500">{transport.duration}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Meals */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🍽️ Recommended Restaurants</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plan.meals.map((restaurant, index) => {
                          const mealTimes = ['Breakfast', 'Lunch', 'Dinner'];
                          return (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">{mealTimes[index]}</span>
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                  <span className="text-sm text-gray-600">{restaurant.rating}</span>
                                </div>
                              </div>
                              <h4 className="font-medium text-gray-900">{restaurant.name}</h4>
                              <p className="text-sm text-gray-600">{restaurant.cuisine} • {restaurant.priceRange}</p>
                              <p className="text-xs text-gray-500 mt-1">{restaurant.description}</p>
                              {restaurant.location && (
                                <p className="text-xs text-gray-500 mt-1">
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
                  <div className="card bg-green-50 border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Cost Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Daily Breakdown</h4>
                        <div className="space-y-2">
                          {dailyPlans.map((plan) => {
                            const dayCost = plan.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
                            return (
                              <div key={plan.day} className="flex justify-between text-sm text-blue600">
                                <span className="font-medium text-blue-600">Day {plan.day}</span>
                                <span className="font-medium text-blue-600">${dayCost}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Total Estimated Cost</h4>
                        <div className="text-2xl font-bold text-green-600">
                          ${dailyPlans.reduce((total, plan) => {
                            const dayCost = plan.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
                            return total + dayCost;
                          }, 0).toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Activities only (excluding accommodation & meals)</p>
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
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading hotels...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Hotels Summary */}
                    <div className="card bg-blue-50 border-blue-200 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">🏨 Hotel Recommendations</h3>
                      <p className="text-sm text-gray-600">
                        {hotels.length} hotel{hotels.length !== 1 ? 's' : ''} found for {itineraryData?.destination}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {hotels.length > 0 ? 
                          Math.round(hotels.reduce((sum, hotel) => sum + (hotel.rating || 0), 0) / hotels.length * 10) / 10 
                          : 0
                        }
                      </div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                  </div>
                </div>

                {/* Hotels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotels.length > 0 ? (
                    hotels.map((hotel, index) => (
                      <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">{hotel.name}</h3>
                          <div className="flex items-center text-yellow-500">
                            <Star className="w-5 h-5 mr-1" />
                            <span className="font-medium">{hotel.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{hotel.description}</p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-2" />
                            {hotel.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {hotel.price ? `$${hotel.price}/night` : hotel.price_range || 'Price on request'}
                          </div>
                        </div>
                        {hotel.amenities && hotel.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {hotel.amenities.map((amenity, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="pt-4 border-t border-gray-200">
                          <button className="w-full btn-primary text-sm py-2">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <Hotel className="w-16 h-16 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Hotels Found</h3>
                      <p className="text-gray-600">We couldn't find any hotels for this destination. Please try again later.</p>
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
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading restaurants...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Restaurants Summary */}
                    <div className="card bg-green-50 border-green-200 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">🍽️ Restaurant Recommendations</h3>
                      <p className="text-sm text-gray-600">
                        {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found for {itineraryData?.destination}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {restaurants.length > 0 ? 
                          Math.round(restaurants.reduce((sum, restaurant) => sum + (restaurant.rating || 0), 0) / restaurants.length * 10) / 10 
                          : 0
                        }
                      </div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                  </div>
                </div>

                {/* Cuisine Filter */}
                {restaurants.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Filter by Cuisine</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(restaurants.map(r => r.cuisine))).map((cuisine) => (
                        <button
                          key={cuisine}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
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
                      <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                          <div className="flex items-center text-yellow-500">
                            <Star className="w-5 h-5 mr-1" />
                            <span className="font-medium">{restaurant.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{restaurant.description}</p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-2" />
                            {restaurant.location}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{restaurant.cuisine}</span>
                            <span className="text-sm text-gray-600">{restaurant.priceRange || restaurant.price_range || '$$'}</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-gray-200">
                          <button className="w-full btn-secondary text-sm py-2">
                            View Menu
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <Utensils className="w-16 h-16 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Restaurants Found</h3>
                      <p className="text-gray-600">We couldn't find any restaurants for this destination. Please try again later.</p>
                    </div>
                  )}
                </div>
                </>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ResultsPage; 