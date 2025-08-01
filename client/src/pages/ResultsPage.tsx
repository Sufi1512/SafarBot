import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users, DollarSign, Clock, Star, Phone, Globe, Heart } from 'lucide-react';

interface DailyPlan {
  day: number;
  date: string;
  activities: Activity[];
  accommodation?: string;
  meals: Meal[];
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

interface Meal {
  time: string;
  restaurant: string;
  cuisine: string;
  price: string;
  rating: number;
}

interface ItineraryData {
  destination: string;
  startDate: string;
  endDate: string;
  days: number;
  travelers: number;
  budget: number;
  interests: string[];
}

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [itineraryData, setItineraryData] = useState<ItineraryData | null>(null);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'hotels' | 'restaurants'>('itinerary');

  useEffect(() => {
    if (location.state) {
      setItineraryData(location.state);
      generateMockItinerary(location.state);
    } else {
      navigate('/');
    }
  }, [location.state, navigate]);

  const generateMockItinerary = (data: ItineraryData) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
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
          activities: generateDayActivities(day, data),
          accommodation: day === 1 ? 'Grand Hotel Central' : undefined,
          meals: generateDayMeals(day, data)
        });
      }
      
      setDailyPlans(plans);
      setIsLoading(false);
    }, 2000);
  };

  const generateDayActivities = (day: number, data: ItineraryData): Activity[] => {
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

  const generateDayMeals = (day: number, data: ItineraryData): Meal[] => {
    const restaurants = [
      { name: 'Local Bistro', cuisine: 'Local', price: '$$', rating: 4.5 },
      { name: 'Seafood Grill', cuisine: 'Seafood', price: '$$$', rating: 4.7 },
      { name: 'Traditional Cafe', cuisine: 'Traditional', price: '$', rating: 4.3 },
      { name: 'Fine Dining', cuisine: 'International', price: '$$$$', rating: 4.8 }
    ];
    
    return [
      {
        time: '08:00',
        restaurant: restaurants[day % restaurants.length].name,
        cuisine: restaurants[day % restaurants.length].cuisine,
        price: restaurants[day % restaurants.length].price,
        rating: restaurants[day % restaurants.length].rating
      },
      {
        time: '13:00',
        restaurant: restaurants[(day + 1) % restaurants.length].name,
        cuisine: restaurants[(day + 1) % restaurants.length].cuisine,
        price: restaurants[(day + 1) % restaurants.length].price,
        rating: restaurants[(day + 1) % restaurants.length].rating
      },
      {
        time: '19:00',
        restaurant: restaurants[(day + 2) % restaurants.length].name,
        cuisine: restaurants[(day + 2) % restaurants.length].cuisine,
        price: restaurants[(day + 2) % restaurants.length].price,
        rating: restaurants[(day + 2) % restaurants.length].rating
      }
    ];
  };

  if (!itineraryData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Your {itineraryData.destination} Itinerary
                </h1>
                <p className="text-sm text-gray-500">
                  {itineraryData.days} days • {itineraryData.travelers} traveler{itineraryData.travelers > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(itineraryData.startDate).toLocaleDateString()} - {new Date(itineraryData.endDate).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Budget: ${itineraryData.budget}
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
              <p className="text-lg text-gray-600">Generating your perfect itinerary...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
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
                      <p className="font-medium text-gray-900">{plan.accommodation}</p>
                    </div>
                  )}
                </div>

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

                {/* Meals */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Meals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plan.meals.map((meal, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{meal.time}</span>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm text-gray-600">{meal.rating}</span>
                          </div>
                        </div>
                        <h4 className="font-medium text-gray-900">{meal.restaurant}</h4>
                        <p className="text-sm text-gray-600">{meal.cuisine} • {meal.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ResultsPage; 