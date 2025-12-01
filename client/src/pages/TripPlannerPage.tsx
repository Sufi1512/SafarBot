import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Users, 
  IndianRupee, 
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
  MountainSnow,
  Briefcase
} from 'lucide-react';
import CustomDatePicker from '../components/ui/CustomDatePicker';
import ModernButton from '../components/ui/ModernButton';
import Dropdown, { DropdownOption } from '../components/ui/Dropdown';
import CounterInput from '../components/ui/CounterInput';
import PlacesAutocomplete from '../components/PlacesAutocomplete';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

const formatINR = (amount: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(Math.round(amount));

type BudgetTier = '0-50000' | '50000-100000' | '100000+';

const budgetTierConfig: Record<BudgetTier, {
  label: string;
  description: string;
  amount: number;
  apiValue: 'budget' | 'mid-range' | 'luxury';
}> = {
  '0-50000': {
    label: `${formatINR(0)} - ${formatINR(50000)}`,
    description: 'Budget-friendly stays and local travel',
    amount: 40000,
    apiValue: 'budget',
  },
  '50000-100000': {
    label: `${formatINR(50000)} - ${formatINR(100000)}`,
    description: 'Comfortable hotels and experiences',
    amount: 75000,
    apiValue: 'mid-range',
  },
  '100000+': {
    label: `${formatINR(100000)}+`,
    description: 'Premium stays and curated luxury',
    amount: 125000,
    apiValue: 'luxury',
  },
};

type TravelWith = 'solo' | 'couple' | 'family' | 'friends' | 'group' | 'business';
type FlightClass = 'economy' | 'premium' | 'business' | 'first';

const TripPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [destination, setDestination] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [days, setDays] = useState<number>(7);
  const [budget, setBudget] = useState<BudgetTier>('50000-100000');
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
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const budgetOptions: DropdownOption[] = (Object.entries(budgetTierConfig) as [BudgetTier, typeof budgetTierConfig[BudgetTier]][])
    .map(([value, config]) => ({
      value,
      label: config.label,
      icon: <IndianRupee className="w-4 h-4" />,
      description: config.description,
    }));

  const travelWithOptions: DropdownOption[] = [
    { value: 'solo', label: 'Solo Traveler', icon: <Users className="w-4 h-4" /> },
    { value: 'couple', label: 'Couple', icon: <Heart className="w-4 h-4" /> },
    { value: 'family', label: 'Family', icon: <Users className="w-4 h-4" /> },
    { value: 'friends', label: 'Friends Trip', icon: <Users className="w-4 h-4" /> },
    { value: 'group', label: 'Group Tour', icon: <Users className="w-4 h-4" /> },
    { value: 'business', label: 'Business Travel', icon: <Briefcase className="w-4 h-4" /> },
  ];

  const tripPaceOptions: DropdownOption[] = [
    { value: 'relaxed', label: 'Relaxed & Leisurely', icon: <Clock className="w-4 h-4" />, description: 'Take it slow, enjoy the moment' },
    { value: 'balanced', label: 'Balanced', icon: <Clock className="w-4 h-4" />, description: 'Mix of activities and relaxation' },
    { value: 'packed', label: 'Packed & Adventurous', icon: <Clock className="w-4 h-4" />, description: 'Maximum activities, fast-paced' },
  ];

  const flightClassOptions: DropdownOption[] = [
    { value: 'economy', label: 'Economy', icon: <Plane className="w-4 h-4" /> },
    { value: 'premium', label: 'Premium Economy', icon: <Plane className="w-4 h-4" /> },
    { value: 'business', label: 'Business Class', icon: <Plane className="w-4 h-4" /> },
    { value: 'first', label: 'First Class', icon: <Plane className="w-4 h-4" /> },
  ];

  const hotelRatingOptions: DropdownOption[] = [
    { value: 3, label: '3-star (Budget)', icon: <Hotel className="w-4 h-4" />, description: 'Comfortable, basic amenities' },
    { value: 4, label: '4-star (Mid-range)', icon: <Hotel className="w-4 h-4" />, description: 'Quality service, good facilities' },
    { value: 5, label: '5-star (Luxury)', icon: <Hotel className="w-4 h-4" />, description: 'Premium service, luxury amenities' },
  ];

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

  // Reset form submission state when component mounts
  useEffect(() => {
    setIsFormSubmitted(false);
  }, []);

  const toggleActivity = (key: string) => {
    setActivities(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setIsFormSubmitted(true);
    
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
      const budgetAmount = budgetTierConfig[budget].amount;
      const apiBudgetRange = budgetTierConfig[budget].apiValue;

      // Prepare API request with comprehensive data
      const apiRequest = {
        // Basic Information
        destination,
        start_date: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        end_date: endDate.toISOString().split('T')[0],
        total_days: days,
        budget: budgetAmount,
        budget_range: apiBudgetRange,
        
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

      if (import.meta.env.DEV) {
        console.debug('Preparing to navigate with data');
      }

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
          setBudget(data.budget || '50000-100000');
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
    <div className="min-h-screen bg-white dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 overflow-visible">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Plan Your Trip
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Tell us your preferences and let AI create a personalized itinerary.
          </p>

          {/* Progress indicator */}
          <div className="mt-6 max-w-md mx-auto">
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
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-visible">
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

        <form onSubmit={handleSubmit} className="space-y-6 overflow-visible" onClick={(e) => e.stopPropagation()}>
          {/* Basic Information Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 overflow-visible">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-600" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Destination field hidden if prefilled */}
              {!destination && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">
                    Where do you want to go?
                  </label>
                  <PlacesAutocomplete
                    value={destination}
                    onChange={setDestination}
                    placeholder="e.g., Paris, Tokyo, New York"
                    className="w-full"
                    icon={<MapPin className="w-5 h-5" />}
                  />
                </div>
              )}

              {/* Start Date field hidden if prefilled */}
              {!startDate && (
                <div className="space-y-2">

                  <label className="block text-sm font-medium text-gray-900 dark:text-white">
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  How many days?
                </label>
                <CounterInput
                  value={days}
                  min={1}
                  max={60}
                  onChange={(value) => setDays(value)}
                  className="w-full"
                  aria-label="Trip duration in days"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Auto-filled from your travel dates. Adjust if you want a longer or shorter stay.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  What's your budget (INR)?
                </label>
                <Dropdown
                  options={budgetOptions}
                  value={budget}
                  onChange={(value) => {
                    setBudget(value as BudgetTier);
                  }}
                  placeholder="Select budget range"
                  size="md"
                  variant="outline"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Travel Preferences Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 overflow-visible">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              Travel Preferences
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  Who are you traveling with?
                </label>
                <Dropdown
                  options={travelWithOptions}
                  value={travelWith}
                  onChange={(value) => {
                    setTravelWith(value as TravelWith);
                  }}
                  placeholder="Select travel companions"
                  size="md"
                  variant="outline"
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  What's your trip pace?
                </label>
                <Dropdown
                  options={tripPaceOptions}
                  value={tripPace}
                  onChange={(value) => {
                    setTripPace(value as any);
                  }}
                  placeholder="Select trip pace"
                  size="md"
                  variant="outline"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Interests Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 overflow-visible">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 overflow-visible">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Plane className="w-6 h-6 text-green-600" />
              Travel Details
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  Departure city
                </label>
                <PlacesAutocomplete
                  value={departureCity}
                  onChange={setDepartureCity}
                  placeholder="e.g., London, New York"
                  icon={<MapPin className="w-5 h-5" />}
                  className="pl-12"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  Flight class preference
                </label>
                <Dropdown
                  options={flightClassOptions}
                  value={flightClass}
                  onChange={(value) => {
                    setFlightClass(value as FlightClass);
                  }}
                  placeholder="Select flight class"
                  size="md"
                  variant="outline"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  Hotel rating preference
                </label>
                <Dropdown
                  options={hotelRatingOptions}
                  value={hotelRating}
                  onChange={(value) => {
                    setHotelRating(value as 3 | 4 | 5);
                  }}
                  placeholder="Select hotel rating"
                  size="md"
                  variant="outline"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  Email (optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all duration-200 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dietary Preferences Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 overflow-visible">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
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
          <div className="text-center pt-6">
            <ModernButton 
              size="md" 
              variant="solid" 
              type="submit" 
              className="px-8 py-3 text-base font-semibold"
              disabled={!destination || !startDate || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating Itinerary...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  Let AI Plan My Trip
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
      {showLoginModal && isFormSubmitted && (
        <AuthModal
          isOpen={showLoginModal}
          onClose={() => {
            setShowLoginModal(false);
            setIsFormSubmitted(false);
          }}
          onLoginSuccess={handleLoginSuccess}
          defaultMode="login"
        />
      )}
    </div>
  );
};

export default TripPlannerPage;


