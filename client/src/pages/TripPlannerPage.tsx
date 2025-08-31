import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomDatePicker from '../components/ui/CustomDatePicker';
import ModernButton from '../components/ui/ModernButton';

type BudgetTier = 'low' | 'medium' | 'high';
type TravelWith = 'solo' | 'couple' | 'family';
type FlightClass = 'economy' | 'premium' | 'business' | 'first';

const TripPlannerPage: React.FC = () => {
  const navigate = useNavigate();
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

      // Prepare API request
      const apiRequest = {
        destination,
        start_date: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        end_date: endDate.toISOString().split('T')[0],
        budget: budgetAmount,
        interests: activities,
        travelers: travelWith === 'solo' ? 1 : travelWith === 'couple' ? 2 : travelWith === 'family' ? 4 : 2,
        accommodation_type: hotelRating === 3 ? 'budget' : hotelRating === 4 ? 'mid-range' : 'luxury'
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
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="mb-8 relative">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 12L3 7l18-4-4 18-5-7-5 3 3-5z" />
            </svg>
            Tell us your travel preferences
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            Just provide some basic information, and our trip planner will generate a customized itinerary based on your preferences.
          </p>
          <svg className="hidden sm:block absolute -top-8 right-0 w-28 h-28 text-primary-200/60" fill="none" stroke="currentColor" viewBox="0 0 200 200" aria-hidden="true">
            <path d="M10 150 C 60 120, 140 120, 190 90" strokeWidth="2" />
            <path d="M150 70 l20 -10 l-10 20" strokeWidth="2" />
          </svg>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {(destination || startDate) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 -mt-2">
              {destination && (
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 text-primary-800 border border-primary-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10c0 7.5-7.5 11.25-7.5 11.25S4.5 17.5 4.5 10a7.5 7.5 0 1115 0z" /></svg>
                  <span className="text-sm font-medium">{destination}</span>
                </div>
              )}
              {startDate && (
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 text-primary-800 border border-primary-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M5 19h14M7 15h.01M11 15h.01M15 15h.01" /></svg>
                  <span className="text-sm font-medium">{startDate.toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}
          {/* Destination field hidden if prefilled */}
          {!destination && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                What is your destination of choice?
              </label>
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="e.g., Paris, Tokyo, New York"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-600"
              />
            </div>
          )}

          {/* Start Date field hidden if prefilled */}
          {!startDate && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                When do you want to start your journey?
              </label>
              <CustomDatePicker
                value={startDate}
                onChange={(date: Date) => setStartDate(date)}
                minDate={new Date()}
                placeholder="Select start date"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-600"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                How many days will you be traveling?
              </label>
              <select
                value={days}
                onChange={e => setDays(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-600"
              >
                <option value={3}>3 days</option>
                <option value={5}>5 days</option>
                <option value={7}>7 days</option>
                <option value={10}>10 days</option>
                <option value={14}>14 days</option>
                <option value={21}>21 days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                What's your budget range?
              </label>
              <select
                value={budget}
                onChange={e => setBudget(e.target.value as BudgetTier)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-600"
              >
                <option value="low">Low ($500 - $1,500)</option>
                <option value="medium">Medium ($1,500 - $5,000)</option>
                <option value="high">High ($5,000+)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Who are you traveling with?
              </label>
              <select
                value={travelWith}
                onChange={e => setTravelWith(e.target.value as TravelWith)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-600"
              >
                <option value="solo">Solo Traveler</option>
                <option value="couple">Couple</option>
                <option value="family">Family</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                What are your interests?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'culture', label: 'Culture & History', icon: '🏛️' },
                  { key: 'nature', label: 'Nature & Outdoors', icon: '🌲' },
                  { key: 'food', label: 'Food & Dining', icon: '🍽️' },
                  { key: 'adventure', label: 'Adventure', icon: '🏔️' },
                  { key: 'relaxation', label: 'Relaxation', icon: '🧘' },
                  { key: 'shopping', label: 'Shopping', icon: '🛍️' },
                  { key: 'nightlife', label: 'Nightlife', icon: '🌃' },
                  { key: 'beaches', label: 'Beaches', icon: '🏖️' },
                  { key: 'city', label: 'City Life', icon: '🏙️' },
                  { key: 'hiking', label: 'Hiking', icon: '🥾' }
                ].map(({ key, label, icon }) => (
                  <label key={key} className="flex items-center gap-2 px-3 py-2 border-2 rounded-xl cursor-pointer border-gray-200 dark:border-gray-700 hover:border-primary-500">
                    <input type="checkbox" className="form-checkbox text-primary-600" checked={activities.includes(key)} onChange={() => toggleActivity(key)} />
                    <span className="text-gray-900 dark:text-white text-sm">{icon} {label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Departure city
              </label>
              <input
                type="text"
                value={departureCity}
                onChange={e => setDepartureCity(e.target.value)}
                placeholder="e.g., London, New York"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Preferred flight class
              </label>
              <select
                value={flightClass}
                onChange={e => setFlightClass(e.target.value as FlightClass)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-600"
              >
                <option value="economy">Economy</option>
                <option value="premium">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Hotel rating preference
              </label>
              <select
                value={hotelRating}
                onChange={e => setHotelRating(Number(e.target.value) as 3 | 4 | 5)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-600"
              >
                <option value={3}>3-star</option>
                <option value={4}>4-star</option>
                <option value={5}>5-star</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Trip pace</label>
              <select
                value={tripPace}
                onChange={e => setTripPace(e.target.value as any)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-600"
              >
                <option value="relaxed">Relaxed</option>
                <option value="balanced">Balanced</option>
                <option value="packed">Packed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email to receive itinerary (optional)</label>
            <div className="relative">
              <svg className="w-5 h-5 text-primary-600 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Dietary preferences
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 px-4 py-3 border-2 rounded-xl cursor-pointer border-gray-200 dark:border-gray-700 hover:border-primary-500">
                <input type="checkbox" className="form-checkbox text-primary-600" checked={halal} onChange={e => setHalal(e.target.checked)} />
                <span className="text-gray-900 dark:text-white">Halal</span>
              </label>
              <label className="flex items-center gap-3 px-4 py-3 border-2 rounded-xl cursor-pointer border-gray-200 dark:border-gray-700 hover:border-primary-500">
                <input type="checkbox" className="form-checkbox text-primary-600" checked={vegetarian} onChange={e => setVegetarian(e.target.checked)} />
                <span className="text-gray-900 dark:text-white">Vegetarian</span>
              </label>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="pt-4">
            <ModernButton 
              size="lg" 
              variant="primary" 
              type="submit" 
              className="px-8"
              disabled={!destination || !startDate}
            >
              🎯 Craft My Perfect Journey
            </ModernButton>
            
            {(!destination || !startDate) && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Please provide destination and start date to continue
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripPlannerPage;


