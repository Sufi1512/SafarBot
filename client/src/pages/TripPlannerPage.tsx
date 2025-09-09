import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Heart, 
  Plane, 
  Hotel, 
  Clock, 
  Mail, 
  Utensils,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Globe,
  Mountain,

  Coffee,
  ShoppingBag,
  Moon,
  Building,
  Waves,
  MountainSnow
} from 'lucide-react';
import CustomDatePicker from '../components/ui/CustomDatePicker';
import ModernButton from '../components/ui/ModernButton';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

type BudgetTier = 'low' | 'medium' | 'high';
type TravelWith = 'solo' | 'couple' | 'family';
type FlightClass = 'economy' | 'premium' | 'business' | 'first';

const TripPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [destination, setDestination] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [days, setDays] = useState<number>(7);
  const [budget, setBudget] = useState<BudgetTier>('medium');
  const [travelWith, setTravelWith] = useState<TravelWith>('couple');
  const [activities, setActivities] = useState<string[]>([]);
  const [halal, setHalal] = useState<boolean>(false);
  const [vegetarian, setVegetarian] = useState<boolean>(false);
  const [departureCity, setDepartureCity] = useState<string>('');
  const [flightClass, setFlightClass] = useState<FlightClass>('economy');
  const [hotelRating, setHotelRating] = useState<3 | 4 | 5>(4);
  const [tripPace, setTripPace] = useState<'relaxed' | 'balanced' | 'packed'>('balanced');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Prefill from query params if provided
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  useEffect(() => {
    const dest = query.get('destination');
    const sd = query.get('startDate');
    const ed = query.get('endDate');
    const trav = query.get('travelers');

    if (dest) setDestination(dest);
    if (sd) {
      const d = new Date(sd);
      if (!isNaN(d.getTime())) setStartDate(d);
    }
    // If both dates exist, infer days difference
    if (sd && ed) {
      const d1 = new Date(sd);
      const d2 = new Date(ed);
      const diff = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
      setDays(diff);
    }
    // Set travelers if provided
    if (trav) {
      const travelers = parseInt(trav);
      if (travelers === 1) setTravelWith('solo');
      else if (travelers === 2) setTravelWith('couple');
      else if (travelers >= 3) setTravelWith('family');
    }
  }, [query]);

  const toggleActivity = (key: string) => {
    setActivities(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store form data in localStorage for after login
      const formData = {
        destination,
        startDate: startDate?.toISOString(),
        days,
        budget,
        travelWith,
        activities,
        halal,
        vegetarian,
        departureCity,
        flightClass,
        hotelRating,
        tripPace,
        email,
        timestamp: Date.now()
      };
      
      localStorage.setItem('pendingItineraryData', JSON.stringify(formData));
      
      // Show login modal
      setShowLoginModal(true);
      return;
    }

    // If authenticated, proceed with itinerary generation
    proceedWithItineraryGeneration();
  };

  const proceedWithItineraryGeneration = async () => {
    setIsSubmitting(true);
    
    try {
      console.log('Form submission started');
      
      // Validate required fields
      if (!destination || !startDate) {
        throw new Error('Please provide destination and start date');
      }

      console.log('Validation passed:', { destination, startDate, days });

      // Calculate end date based on start date and days
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + days - 1);

      // Convert budget tier to actual budget amount
      const budgetAmount = budget === 'low' ? 1000 : budget === 'medium' ? 3000 : 8000;

      // Prepare API request with comprehensive data
      const apiRequest = {
        // Basic Information
        destination,
        start_date: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        end_date: endDate.toISOString().split('T')[0],
        total_days: days,
        budget: budgetAmount,
        budget_range: budget === 'low' ? 'budget' : budget === 'medium' ? 'mid-range' : 'luxury',
        
        // Travel Preferences
        travelers: travelWith === 'solo' ? 1 : travelWith === 'couple' ? 2 : travelWith === 'family' ? 4 : 2,
        travel_companion: travelWith,
        trip_pace: tripPace,
        interests: activities,
        
        // Travel Details
        departure_city: departureCity,
        flight_class_preference: flightClass,
        hotel_rating_preference: `${hotelRating}-star`,
        accommodation_type: hotelRating === 3 ? 'budget' : hotelRating === 4 ? 'mid-range' : 'luxury',
        email: email,
        
        // Dietary Preferences
        dietary_preferences: [
          ...(halal ? ['halal'] : []),
          ...(vegetarian ? ['vegetarian'] : [])
        ],
        halal_preferences: halal ? 'Halal food required' : undefined,
        vegetarian_preferences: vegetarian ? 'Vegetarian options preferred' : undefined
      };

      console.log('Preparing to navigate with data:', apiRequest);

      // Immediately navigate to results page with the data
      // The ResultsPage will handle its own loading state and API call
      console.log('Navigating to /results immediately');
      navigate('/results', {
        state: {
          destination,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          days,
          budget: budgetAmount,
          travelers: travelWith === 'solo' ? 1 : travelWith === 'couple' ? 2 : travelWith === 'family' ? 4 : 2,
          interests: activities,
          apiRequest: apiRequest, // Pass the API request data directly
          userPreferences: {
            destination,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            days,
            budget: budgetAmount,
            travelWith,
            activities,
            dietary: { halal, vegetarian },
            departureCity,
            flightClass,
            hotelRating,
            tripPace,
            email
          }
        }
      });
      console.log('Navigation completed');

    } catch (err: any) {
      console.error('Error preparing navigation:', err);
      setError(err.message || 'Failed to prepare navigation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    
    // Check if there's pending itinerary data
    const pendingData = localStorage.getItem('pendingItineraryData');
    if (pendingData) {
      try {
        const data = JSON.parse(pendingData);
        // Check if data is not too old (within 1 hour)
        if (Date.now() - data.timestamp < 3600000) {
          // Restore form data
          setDestination(data.destination || '');
          setStartDate(data.startDate ? new Date(data.startDate) : undefined);
          setDays(data.days || 7);
          setBudget(data.budget || 'medium');
          setTravelWith(data.travelWith || 'couple');
          setActivities(data.activities || []);
          setHalal(data.halal || false);
          setVegetarian(data.vegetarian || false);
          setDepartureCity(data.departureCity || '');
          setFlightClass(data.flightClass || 'economy');
          setHotelRating(data.hotelRating || 4);
          setTripPace(data.tripPace || 'balanced');
          setEmail(data.email || '');
          
          // Clear pending data
          localStorage.removeItem('pendingItineraryData');
          
          // Proceed with itinerary generation
          setTimeout(() => {
            proceedWithItineraryGeneration();
          }, 500); // Small delay to ensure state is updated
        } else {
          // Data is too old, clear it
          localStorage.removeItem('pendingItineraryData');
        }
      } catch (error) {
        console.error('Error parsing pending itinerary data:', error);
        localStorage.removeItem('pendingItineraryData');
      }
    }
  };

  // Activity options with icons
  const activityOptions = [
    { key: 'culture', label: 'Culture & History', icon: Building, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    { key: 'nature', label: 'Nature & Outdoors', icon: Mountain, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    { key: 'food', label: 'Food & Dining', icon: Utensils, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    { key: 'adventure', label: 'Adventure', icon: Mountain, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    { key: 'relaxation', label: 'Relaxation', icon: Coffee, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { key: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
    { key: 'nightlife', label: 'Nightlife', icon: Moon, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
    { key: 'beaches', label: 'Beaches', icon: Waves, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    { key: 'city', label: 'City Life', icon: Building, color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' },
    { key: 'hiking', label: 'Hiking', icon: MountainSnow, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' }
  ];

  // Calculate form completion percentage
  const formProgress = Math.round(
    ((destination ? 1 : 0) + (startDate ? 1 : 0) + (activities.length > 0 ? 1 : 0) + (departureCity ? 1 : 0)) / 4 * 100
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Trip Planning
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-6">
            Plan Your Dream Trip
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Tell us your preferences and let our AI create a personalized itinerary that matches your style, budget, and interests.
          </p>

          {/* Progress indicator */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Form Progress</span>
              <span>{formProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Pre-filled info display */}
        {(destination || startDate) && (
          <div className="mb-8 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Pre-filled Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {destination && (
                <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">{destination}</span>
                </div>
              )}
              {startDate && (
                <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border border-purple-200 dark:border-purple-700">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-purple-900 dark:text-purple-100">{startDate.toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Information Section */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-8 border border-gray-200/60 dark:border-gray-700/60 shadow-xl shadow-gray-200/30 dark:shadow-gray-900/30 hover:shadow-2xl hover:shadow-gray-200/40 dark:hover:shadow-gray-900/40 transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Globe className="w-6 h-6 text-blue-600" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Destination field hidden if prefilled */}
              {!destination && (
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                    Where do you want to go?
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={destination}
                      onChange={e => setDestination(e.target.value)}
                      placeholder="e.g., Paris, Tokyo, New York"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {/* Start Date field hidden if prefilled */}
              {!startDate && (
                <div className="space-y-3">

                  <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                    When do you want to start?
                  </label>  
                  
          
                    <CustomDatePicker
                      value={startDate}
                      onChange={(date: Date) => setStartDate(date)}
                      minDate={new Date()}
                      placeholder="Select start date"
                      
                      
                    />
                  
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                  How many days?
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={days}
                    onChange={e => setDays(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all duration-200 appearance-none"
                  >
                    <option value={3}>3 days</option>
                    <option value={5}>5 days</option>
                    <option value={7}>7 days</option>
                    <option value={10}>10 days</option>
                    <option value={14}>14 days</option>
                    <option value={21}>21 days</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                  What's your budget?
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={budget}
                    onChange={e => setBudget(e.target.value as BudgetTier)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all duration-200 appearance-none"
                  >
                    <option value="low">Budget ($500 - $1,500)</option>
                    <option value="medium">Mid-range ($1,500 - $5,000)</option>
                    <option value="high">Luxury ($5,000+)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Travel Preferences Section */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-8 border border-gray-200/60 dark:border-gray-700/60 shadow-xl shadow-gray-200/30 dark:shadow-gray-900/30 hover:shadow-2xl hover:shadow-gray-200/40 dark:hover:shadow-gray-900/40 transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-600" />
              Travel Preferences
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                  Who are you traveling with?
                </label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={travelWith}
                    onChange={e => setTravelWith(e.target.value as TravelWith)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-500/20 focus:border-purple-600 transition-all duration-200 appearance-none"
                  >
                    <option value="solo">Solo Traveler</option>
                    <option value="couple">Couple</option>
                    <option value="family">Family</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                  What's your trip pace?
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={tripPace}
                    onChange={e => setTripPace(e.target.value as any)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-500/20 focus:border-purple-600 transition-all duration-200 appearance-none"
                  >
                    <option value="relaxed">Relaxed & Leisurely</option>
                    <option value="balanced">Balanced</option>
                    <option value="packed">Packed & Active</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Interests Section */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-8 border border-gray-200/60 dark:border-gray-700/60 shadow-xl shadow-gray-200/30 dark:shadow-gray-900/30 hover:shadow-2xl hover:shadow-gray-200/40 dark:hover:shadow-gray-900/40 transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-600" />
              What interests you?
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {activityOptions.map(({ key, label, icon: Icon, color }) => (
                <label 
                  key={key} 
                  className={`group relative flex flex-col items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                    activities.includes(key)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={activities.includes(key)} 
                    onChange={() => toggleActivity(key)} 
                  />
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} transition-all duration-200 group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white text-center">{label}</span>
                  {activities.includes(key) && (
                    <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-blue-600" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Travel Details Section */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-8 border border-gray-200/60 dark:border-gray-700/60 shadow-xl shadow-gray-200/30 dark:shadow-gray-900/30 hover:shadow-2xl hover:shadow-gray-200/40 dark:hover:shadow-gray-900/40 transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Plane className="w-6 h-6 text-green-600" />
              Travel Details
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                  Departure city
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={departureCity}
                    onChange={e => setDepartureCity(e.target.value)}
                    placeholder="e.g., London, New York"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-4 focus:ring-green-500/20 focus:border-green-600 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                  Flight class preference
                </label>
                <div className="relative">
                  <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={flightClass}
                    onChange={e => setFlightClass(e.target.value as FlightClass)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-600 transition-all duration-200 appearance-none"
                  >
                    <option value="economy">Economy</option>
                    <option value="premium">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                  Hotel rating preference
                </label>
                <div className="relative">
                  <Hotel className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={hotelRating}
                    onChange={e => setHotelRating(Number(e.target.value) as 3 | 4 | 5)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-600 transition-all duration-200 appearance-none"
                  >
                    <option value={3}>3-star (Budget)</option>
                    <option value={4}>4-star (Mid-range)</option>
                    <option value={5}>5-star (Luxury)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                  Email (optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-4 focus:ring-green-500/20 focus:border-green-600 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dietary Preferences Section */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-8 border border-gray-200/60 dark:border-gray-700/60 shadow-xl shadow-gray-200/30 dark:shadow-gray-900/30 hover:shadow-2xl hover:shadow-gray-200/40 dark:hover:shadow-gray-900/40 transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Utensils className="w-6 h-6 text-orange-600" />
              Dietary Preferences
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                halal ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600'
              }`}>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500" 
                  checked={halal} 
                  onChange={e => setHalal(e.target.checked)} 
                />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
                    <span className="text-lg">🕌</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">Halal</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Halal food preferences</p>
                  </div>
                </div>
              </label>
              
              <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                vegetarian ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
              }`}>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500" 
                  checked={vegetarian} 
                  onChange={e => setVegetarian(e.target.checked)} 
                />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    <span className="text-lg">🥬</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">Vegetarian</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Vegetarian food preferences</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
              <div className="flex items-center gap-3 text-red-800 dark:text-red-200">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Submit Section */}
          <div className="text-center pt-8">
            <ModernButton 
              size="lg" 
              variant="solid" 
              type="submit" 
              className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              disabled={!destination || !startDate || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Crafting Your Journey...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  Craft My Perfect Journey
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </ModernButton>
            
            {(!destination || !startDate) && (
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Please provide destination and start date to continue
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <AuthModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
          defaultMode="login"
        />
      )}
    </div>
  );
};

export default TripPlannerPage;


