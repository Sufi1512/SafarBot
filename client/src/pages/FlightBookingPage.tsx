import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plane, 
  Calendar, 
  Users, 
  MapPin, 
  Filter, 
  Star, 
  Clock, 
  ArrowRight,
  Sparkles,
  Flame,
  Trophy,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { flightAPI, Flight, FlightSearchRequest, AirportSuggestion, AirIQSearchResponse } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AirportAutocomplete from '../components/AirportAutocomplete';
import bgVideo2 from '../asset/videos/flight-bg.mp4';

const FlightBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    children: 0,
    infants: 0,
    class: 'economy',
    tripType: 'round-trip', // 'one-way' or 'round-trip'
    airlineId: '',
    fareType: 'N', // N: Normal, C: Corporate, R: Retail
    onlyDirect: false
  });
  const [isSearching, setIsSearching] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarPosition, setCalendarPosition] = useState({ x: 0, y: 0 });
  const [filters, setFilters] = useState({
    maxPrice: 1000,
    maxStops: 2,
    airlines: [] as string[]
  });
  // Removed hardcoded airport suggestions - now using Google Places API

  // Load popular flights on component mount with error handling
  useEffect(() => {
    let isMounted = true;
    
    const loadPopularFlights = async () => {
      try {
        if (isMounted) {
          await flightAPI.getPopularFlights();
          // Popular flights loaded but not used in current UI
        }
      } catch (error) {
        // Silently handle error - this is non-critical data
        console.error('Error loading popular flights:', error);
        // Don't throw error to prevent page crash
      }
    };
    
    // Small delay to ensure component is fully mounted during navigation
    const timeoutId = setTimeout(() => {
      loadPopularFlights();
    }, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Airport selection handlers using Google Places API
  const handleFromAirportSelect = (airport: AirportSuggestion) => {
    setSearchForm(prev => ({ ...prev, from: airport.code }));
  };

  const handleToAirportSelect = (airport: AirportSuggestion) => {
    setSearchForm(prev => ({ ...prev, to: airport.code }));
  };

  const handleTripTypeChange = (tripType: string) => {
    setSearchForm(prev => ({ 
      ...prev, 
      tripType,
      // Clear return date if switching to one-way
      returnDate: tripType === 'one-way' ? '' : prev.returnDate
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form based on trip type
      if (searchForm.tripType === 'round-trip' && !searchForm.returnDate) {
        alert('Please select a return date for round-trip flights.');
        return;
      }
      
      if (!searchForm.from || !searchForm.to || !searchForm.departureDate) {
        alert('Please fill in all required fields.');
        return;
      }
      
      setIsSearching(true);
      
      const searchRequest: FlightSearchRequest = {
        from_location: searchForm.from,
        to_location: searchForm.to,
        departure_date: searchForm.departureDate,
        return_date: searchForm.tripType === 'round-trip' ? searchForm.returnDate : undefined,
        passengers: searchForm.passengers,
        child_count: searchForm.children,
        infant_count: searchForm.infants,
        class_type: searchForm.class,
        airline_id: searchForm.airlineId,
        fare_type: searchForm.fareType,
        only_direct: searchForm.onlyDirect,
        trip_type_special: false
      };
      
      const response: AirIQSearchResponse = await flightAPI.searchFlights(searchRequest);
      
      // Convert AirIQ response to Flight format for display
      const convertedFlights = convertAirIQToFlights(response);
      setFlights(convertedFlights);
    } catch (error: any) {
      console.error('Flight search error:', error);
      // Show error message instead of fallback
      alert('No flights found. Please check your search criteria and try again.');
      setFlights([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Helper function to convert AirIQ response to Flight format
  const convertAirIQToFlights = (airiqResponse: AirIQSearchResponse): Flight[] => {
    const flights: Flight[] = [];
    
    try {
      const { ItineraryFlightList, Trackid } = airiqResponse;
      
      if (!ItineraryFlightList || ItineraryFlightList.length === 0) {
        return [];
      }
      
      ItineraryFlightList.forEach((itinerary, itinIndex) => {
        itinerary.Items.forEach((item, itemIndex) => {
          const { FlightDetails, Fares } = item;
          
          if (!FlightDetails || FlightDetails.length === 0) return;
          
          // Get fare information
          let price = 0;
          let currency = 'INR';
          
          if (Fares && Fares.length > 0 && Fares[0].Faredescription && Fares[0].Faredescription.length > 0) {
            price = parseFloat(Fares[0].Faredescription[0].GrossAmount || '0');
            currency = Fares[0].Currency || 'INR';
          }
          
          // Get first flight details
          const firstFlight = FlightDetails[0];
          const lastFlight = FlightDetails[FlightDetails.length - 1];
          
          // Parse departure time
          const depParts = firstFlight.DepartureDateTime.split(' ');
          const depTime = depParts.length >= 4 ? depParts[3] : '';
          const depDate = depParts.length >= 3 ? `${depParts[0]} ${depParts[1]} ${depParts[2]}` : '';
          
          // Parse arrival time
          const arrParts = lastFlight.ArrivalDateTime.split(' ');
          const arrTime = arrParts.length >= 4 ? arrParts[3] : '';
          const arrDate = arrParts.length >= 3 ? `${arrParts[0]} ${arrParts[1]} ${arrParts[2]}` : '';
          
          // Calculate total duration
          let totalMinutes = 0;
          FlightDetails.forEach(fd => {
            totalMinutes += parseInt(fd.JourneyTime || '0');
          });
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          const duration = `${hours}h ${minutes}m`;
          
          // Create flight object
          const flight: Flight = {
            id: `${Trackid}_${itinIndex}_${itemIndex}`,
            airline: firstFlight.AirlineDescription || '',
            airline_logo: '',
            flight_number: firstFlight.FlightNumber || '',
            departure: {
              airport: firstFlight.Origin,
              airport_code: firstFlight.Origin,
              airport_name: '',
              city: firstFlight.Origin,
              time: depTime,
              date: depDate
            },
            arrival: {
              airport: lastFlight.Destination,
              airport_code: lastFlight.Destination,
              airport_name: '',
              city: lastFlight.Destination,
              time: arrTime,
              date: arrDate
            },
            duration: duration,
            price: price,
            currency: currency,
            stops: FlightDetails.length - 1,
            layovers: FlightDetails.length > 1 ? FlightDetails.slice(0, -1).map((fd) => ({
              airport: fd.Destination,
              airport_code: fd.Destination,
              duration: `${parseInt(fd.JourneyTime || '0')}m`,
              city: fd.Destination
            })) : [],
            amenities: firstFlight.Baggage ? [firstFlight.Baggage] : [],
            booking_token: Trackid,
            // Store raw AirIQ data for booking
            airiq_data: {
              FlightDetails,
              Fares,
              Trackid
            }
          };
          
          flights.push(flight);
        });
      });
    } catch (error) {
      console.error('Error converting AirIQ response:', error);
    }
    
    return flights;
  };

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
  };

  const handleBooking = () => {
    if (selectedFlight) {
      // Navigate to booking confirmation
      navigate('/booking-confirmation', { 
        state: { 
          type: 'flight', 
          booking: selectedFlight,
          passengers: searchForm.passengers
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section with Background Video */}
      <section className="relative min-h-[100vh] pt-20 pb-8 overflow-hidden">
        {/* Hero Background Video */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            className="w-full h-full object-cover object-center"
            src={bgVideo2}
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-8">
            
            {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Flight Search</span>
          </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
            >
              <span className="gradient-text-with-shimmer" style={{ animationDelay: '0.5s' }}>
                Find Your Perfect Flight
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-6 font-light"
            >
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Discover the best flight deals with real-time pricing,
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="font-medium text-primary-600"
              >
                instant booking, and personalized recommendations.
              </motion.span>
            </motion.p>
      </div>

          {/* Enhanced Search Card */}
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-7xl mx-auto"
          >
            <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-4 lg:p-6 hover:shadow-3xl transition-all duration-500" style={{ zIndex: 1 }}>
              {/* Enhanced Card Background Pattern */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-50/40 via-blue-50/40 to-purple-50/40 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-purple-900/20" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-emerald-400/5 to-teal-500/5 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="text-center mb-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold mb-3 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    <span>AI-Powered Flight Search</span>
                  </motion.div>
                  <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2"
                  >
                    Where will you fly today?
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                    className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
                  >
                    Discover amazing destinations with our intelligent flight search. Get real-time prices, best deals, and personalized recommendations.
                  </motion.p>
                </div>

            <form onSubmit={handleSearch} className="space-y-4">
                  {/* Enhanced Trip Type Selector */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                    className="flex items-center justify-center space-x-4 mb-4"
                  >
                    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-2xl p-1 shadow-inner">
                      <label className={`flex items-center px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    searchForm.tripType === 'one-way' 
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg transform scale-105' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-white/50 dark:hover:bg-gray-600/50'
                  }`}>
                    <input
                      type="radio"
                      name="tripType"
                      value="one-way"
                      checked={searchForm.tripType === 'one-way'}
                      onChange={(e) => handleTripTypeChange(e.target.value)}
                          className="sr-only"
                    />
                        <Plane className="w-3 h-3 mr-1.5" />
                        <span className="text-xs font-semibold">One Way</span>
                  </label>
                      <label className={`flex items-center px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    searchForm.tripType === 'round-trip' 
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg transform scale-105' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-white/50 dark:hover:bg-gray-600/50'
                  }`}>
                    <input
                      type="radio"
                      name="tripType"
                      value="round-trip"
                      checked={searchForm.tripType === 'round-trip'}
                      onChange={(e) => handleTripTypeChange(e.target.value)}
                          className="sr-only"
                    />
                        <ArrowRight className="w-3 h-3 mr-1.5" />
                        <span className="text-xs font-semibold">Round Trip</span>
                  </label>
                </div>
                  </motion.div>
              
              {/* Form Fields Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* From */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-500" />
                    <span>From</span>
                  </label>
                  <AirportAutocomplete
                    value={searchForm.from}
                    onChange={(value) => setSearchForm(prev => ({ ...prev, from: value }))}
                    onAirportSelect={handleFromAirportSelect}
                    placeholder="Departure airport"
                    required
                  />
                </div>

                {/* To */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-500" />
                    <span>To</span>
                  </label>
                  <AirportAutocomplete
                    value={searchForm.to}
                    onChange={(value) => setSearchForm(prev => ({ ...prev, to: value }))}
                    onAirportSelect={handleToAirportSelect}
                    placeholder="Destination airport"
                    required
                  />
                </div>


                {/* Adults */}
                <div className="relative">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <Users className="w-3 h-3 text-cyan-500" />
                        <span>Adults</span>
                  </label>
                      <div className="relative group">
                        <input
                          type="number"
                          min="1"
                          max="9"
                          value={searchForm.passengers}
                          onChange={(e) => setSearchForm(prev => ({ ...prev, passengers: Math.max(1, Math.min(9, parseInt(e.target.value) || 1)) }))}
                          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-sm font-medium hover:border-cyan-400 shadow-sm hover:shadow-md"
                          aria-label="Number of adults"
                        />
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500 group-hover:text-blue-500 transition-colors z-10 pointer-events-none" />
                      </div>
                </div>

                {/* Children */}
                <div className="relative">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <Users className="w-3 h-3 text-purple-500" />
                        <span>Children</span>
                  </label>
                      <div className="relative group">
                        <input
                          type="number"
                          min="0"
                          max="9"
                          value={searchForm.children}
                          onChange={(e) => setSearchForm(prev => ({ ...prev, children: Math.max(0, Math.min(9, parseInt(e.target.value) || 0)) }))}
                          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-sm font-medium hover:border-purple-400 shadow-sm hover:shadow-md"
                          aria-label="Number of children"
                        />
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500 group-hover:text-purple-600 transition-colors z-10 pointer-events-none" />
                      </div>
                </div>

                {/* Infants */}
                <div className="relative">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <Users className="w-3 h-3 text-pink-500" />
                        <span>Infants</span>
                  </label>
                      <div className="relative group">
                        <input
                          type="number"
                          min="0"
                          max="4"
                          value={searchForm.infants}
                          onChange={(e) => setSearchForm(prev => ({ ...prev, infants: Math.max(0, Math.min(4, parseInt(e.target.value) || 0)) }))}
                          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 text-sm font-medium hover:border-pink-400 shadow-sm hover:shadow-md"
                          aria-label="Number of infants"
                        />
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-500 group-hover:text-pink-600 transition-colors z-10 pointer-events-none" />
                      </div>
                </div>

                {/* Class Selection */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                    <Star className="w-3 h-3 text-cyan-500" />
                    <span>Class</span>
                  </label>
                  <div className="relative group">
                    <select
                      value={searchForm.class}
                      onChange={(e) => setSearchForm(prev => ({ ...prev, class: e.target.value }))}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-sm font-medium hover:border-cyan-400 shadow-sm hover:shadow-md cursor-pointer group-hover:bg-white dark:group-hover:bg-gray-700"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1rem',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none'
                      }}
                    >
                      <option value="economy" className="py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Economy</option>
                      <option value="premium" className="py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Premium Economy</option>
                      <option value="business" className="py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Business</option>
                      <option value="first" className="py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">First Class</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Date Selection Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.0 }}
                className="mt-4 max-w-md mx-auto"
              >
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-500" />
                  <span>Travel Dates</span>
                </label>
                <div className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 rounded-xl p-2">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Departure</div>
                      <div 
                        className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-sm"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setCalendarPosition({
                            x: rect.left + rect.width / 2,
                            y: rect.bottom + 10
                          });
                          setShowCalendar(!showCalendar);
                        }}
                      >
                        {searchForm.departureDate ? 
                          new Date(searchForm.departureDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          }) : 'Select date'
                        }
                      </div>
                    </div>
                    
                    {searchForm.tripType === 'round-trip' && (
                      <>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Return</div>
                          <div 
                            className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 text-sm"
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setCalendarPosition({
                                x: rect.left + rect.width / 2,
                                y: rect.bottom + 10
                              });
                              setShowCalendar(!showCalendar);
                            }}
                          >
                            {searchForm.returnDate ? 
                              new Date(searchForm.returnDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric'
                              }) : 'Select date'
                            }
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Click to open calendar
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Advanced Options */}
              {/* <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.2 }}
                className="mt-4"
              >
                <details className="group">
                  <summary className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <Filter className="w-3 h-3" />
                    <span>Advanced Options</span>
                    <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <Plane className="w-3 h-3 text-cyan-500" />
                        <span>Airline (Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={searchForm.airlineId}
                        onChange={(e) => setSearchForm(prev => ({ ...prev, airlineId: e.target.value.toUpperCase().slice(0, 2) }))}
                        placeholder="e.g., AI, 6E"
                        maxLength={2}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-sm placeholder:text-gray-400"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2-letter airline code</p>
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <Star className="w-3 h-3 text-cyan-500" />
                        <span>Fare Type</span>
                      </label>
                      <div className="relative group">
                        <select
                          value={searchForm.fareType}
                          onChange={(e) => setSearchForm(prev => ({ ...prev, fareType: e.target.value }))}
                          className="w-full pl-3 pr-8 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-sm font-medium appearance-none hover:border-cyan-400 shadow-sm hover:shadow-md cursor-pointer"
                        >
                          <option value="N">Normal Fare</option>
                          <option value="C">Corporate Fare</option>
                          <option value="R">Retail Fare</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <Plane className="w-3 h-3 text-cyan-500" />
                        <span>Flight Type</span>
                      </label>
                      <label className="flex items-center justify-between px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm cursor-pointer hover:border-cyan-400 transition-all duration-300 shadow-sm hover:shadow-md">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Direct flights only</span>
                        <input
                          type="checkbox"
                          checked={searchForm.onlyDirect}
                          onChange={(e) => setSearchForm(prev => ({ ...prev, onlyDirect: e.target.checked }))}
                          className="w-5 h-5 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 dark:focus:ring-cyan-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </label>
                    </div>
                  </div>
                </details>
              </motion.div> */}


              {/* Search Button Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.2 }}
                className="text-center mt-6"
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block"
                >
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-12 py-4 text-base font-bold shadow-2xl hover:shadow-3xl transform transition-all duration-300 inline-flex items-center justify-center whitespace-nowrap bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 hover:from-primary-700 hover:via-primary-800 hover:to-primary-900 text-white border-0 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSearching ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Finding Best Flights...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-3 animate-pulse" />
                        Search {searchForm.tripType === 'one-way' ? 'One-Way' : 'Round-Trip'} Flights
                        <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  ✨ Real-time pricing • Best price guarantee • Instant booking
                </p>
              </motion.div>
                 </form>
               </div>
             </div>
           </motion.div>
         </div>
       </section>

       {/* Date Picker Calendar Popup - Outside of card structure */}
       {showCalendar && (
         <>
           {/* Backdrop */}
           <div 
             className="fixed inset-0 z-[100]"
             onClick={() => setShowCalendar(false)}
           />
           
           {/* Calendar Popup */}
           <motion.div
             initial={{ opacity: 0, scale: 0.9, y: -10 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.9, y: -10 }}
             transition={{ duration: 0.2 }}
             className="fixed bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-2xl z-[101] w-80"
             style={{
               left: `${Math.min(Math.max(calendarPosition.x - 160, 20), window.innerWidth - 340)}px`,
               top: `${Math.min(calendarPosition.y, window.innerHeight - 400)}px`
             }}
           >
           {/* Calendar Header with Month/Year Navigation */}
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <button
                 onClick={() => {
                   if (currentMonth === 0) {
                     setCurrentMonth(11);
                     setCurrentYear(currentYear - 1);
                   } else {
                     setCurrentMonth(currentMonth - 1);
                   }
                 }}
                 className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
               >
                 <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
               </button>
               
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                 {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { 
                   month: 'short', 
                   year: 'numeric' 
                 })}
               </h3>
               
               <button
                 onClick={() => {
                   if (currentMonth === 11) {
                     setCurrentMonth(0);
                     setCurrentYear(currentYear + 1);
                   } else {
                     setCurrentMonth(currentMonth + 1);
                   }
                 }}
                 className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
               >
                 <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
               </button>
             </div>
             
             <button
               onClick={() => setShowCalendar(false)}
               className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
             >
               <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
             </button>
           </div>
           
           {/* Calendar Grid */}
           <div className="grid grid-cols-7 gap-0.5">
             {/* Day Headers */}
             {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
               <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
                 {day}
               </div>
             ))}
             
             {/* Calendar Days */}
             {(() => {
               const today = new Date();
               const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
               const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
               const firstDayOfWeek = firstDayOfMonth.getDay();
               const daysInMonth = lastDayOfMonth.getDate();
               
               const calendarDays = [];
               
               // Add previous month's trailing days
               for (let i = firstDayOfWeek - 1; i >= 0; i--) {
                 const date = new Date(currentYear, currentMonth, -i);
                 calendarDays.push({ date, isCurrentMonth: false });
               }
               
               // Add current month's days
               for (let day = 1; day <= daysInMonth; day++) {
                 const date = new Date(currentYear, currentMonth, day);
                 calendarDays.push({ date, isCurrentMonth: true });
               }
               
               // Add next month's leading days to complete the grid
               const remainingDays = 42 - calendarDays.length;
               for (let day = 1; day <= remainingDays; day++) {
                 const date = new Date(currentYear, currentMonth + 1, day);
                 calendarDays.push({ date, isCurrentMonth: false });
               }
               
               return calendarDays.map(({ date, isCurrentMonth }, i) => {
                 const isToday = date.toDateString() === today.toDateString();
                 const dateString = date.toISOString().split('T')[0];
                 const isDeparture = dateString === searchForm.departureDate;
                 const isReturn = dateString === searchForm.returnDate;
                 const isPast = date < today;
                 
                 return (
                   <div
                     key={i}
                     className={`relative p-2 rounded transition-all duration-200 text-center ${
                       isCurrentMonth 
                         ? isPast
                           ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                           : 'text-gray-900 dark:text-white cursor-pointer hover:bg-cyan-50 dark:hover:bg-gray-700'
                         : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                     } ${
                       isToday ? 'bg-cyan-100 dark:bg-cyan-900/30 font-bold' : ''
                     } ${
                       isDeparture ? 'bg-blue-500 text-white hover:bg-blue-600' : ''
                     } ${
                       isReturn ? 'bg-green-500 text-white hover:bg-green-600' : ''
                     }`}
                     onClick={() => {
                       if (isCurrentMonth && !isPast) {
                         const dateString = date.toISOString().split('T')[0];
                         
                         if (searchForm.tripType === 'round-trip') {
                           if (!searchForm.departureDate) {
                             setSearchForm(prev => ({ ...prev, departureDate: dateString }));
                           } else if (!searchForm.returnDate && dateString > searchForm.departureDate) {
                             setSearchForm(prev => ({ ...prev, returnDate: dateString }));
                             setShowCalendar(false);
                           } else if (dateString <= searchForm.departureDate) {
                             setSearchForm(prev => ({ ...prev, departureDate: dateString, returnDate: '' }));
                           } else {
                             setSearchForm(prev => ({ ...prev, departureDate: dateString, returnDate: '' }));
                           }
                         } else {
                           setSearchForm(prev => ({ ...prev, departureDate: dateString }));
                           setShowCalendar(false);
                         }
                       }
                     }}
                   >
                     <span className="text-xs font-medium">
                       {date.getDate()}
                     </span>
                   </div>
                 );
               });
             })()}
           </div>
           
           {/* Legend */}
           <div className="flex items-center justify-center gap-3 mt-3 text-xs text-gray-600 dark:text-gray-300">
             <div className="flex items-center gap-1">
               <div className="w-2 h-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-full"></div>
               <span>Today</span>
             </div>
             {searchForm.tripType === 'round-trip' ? (
               <>
                 <div className="flex items-center gap-1">
                   <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                   <span>Departure</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                   <span>Return</span>
                 </div>
               </>
             ) : (
               <div className="flex items-center gap-1">
                 <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                 <span>Selected</span>
               </div>
             )}
           </div>
           </motion.div>
         </>
       )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search Results */}
        {flights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Results Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Trophy className="w-4 h-4" />
                <span>Search Results</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
                {flights.length} Amazing Flights Found
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Choose from our carefully selected flight options with the best prices and routes
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Available Flights
                </h3>
                <div className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                  {flights.length} options
                </div>
              </div>
              <Button
                variant="outline"
                icon={Filter}
                onClick={() => setShowFilters(!showFilters)}
                className="shadow-md hover:shadow-lg"
              >
                Filters
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Price</label>
                    <input
                      type="range"
                      min="100"
                      max="2000"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600 dark:text-gray-300">₹{filters.maxPrice}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Stops</label>
                    <select
                      value={filters.maxStops}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxStops: parseInt(e.target.value) }))}
                      className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                    >
                      <option value={0}>Direct</option>
                      <option value={1}>1 Stop</option>
                      <option value={2}>2+ Stops</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Airlines</label>
                    <div className="space-y-2">
                      {['Emirates', 'British Airways', 'Air France', 'Lufthansa'].map(airline => (
                        <label key={airline} className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 dark:border-gray-600 text-accent focus:ring-accent"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{airline}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Flight Results */}
            <div className="space-y-6">
              {flights.map((flight, index) => (
                <motion.div
                  key={flight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 ${
                    selectedFlight?.id === flight.id 
                        ? 'ring-2 ring-primary-500 bg-primary-50/50 dark:bg-primary-900/20 shadow-xl' 
                        : 'hover:shadow-xl'
                  }`}
                  hover={true}
                  onClick={() => handleFlightSelect(flight)}
                    variant="glass"
                >
                  {/* Main Flight Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-6">
                      {/* Airline Info */}
                      <div className="text-center">
                        {flight.airline_logo ? (
                          <img src={flight.airline_logo} alt="Airline" className="w-12 h-12 mb-2" />
                        ) : (
                          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-2">
                            <Plane className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {flight.flight_segments?.[0]?.airline || flight.airline || 'Multiple Airlines'}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{flight.flight_type}</div>
                      </div>

                      {/* Flight Route */}
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {flight.flight_segments?.[0]?.departure.time || flight.departure.time}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {flight.flight_segments?.[0]?.departure.airport || flight.departure.airport}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {flight.flight_segments?.[0]?.departure.airport_name || flight.departure.airport}
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="text-sm text-gray-600 dark:text-gray-300">{flight.total_duration}</div>
                          <div className="w-16 h-px bg-gray-300 dark:bg-gray-600 my-2"></div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {flight.flight_segments?.[flight.flight_segments.length - 1]?.arrival.time || flight.arrival.time}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {flight.flight_segments?.[flight.flight_segments.length - 1]?.arrival.airport || flight.arrival.airport}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {flight.flight_segments?.[flight.flight_segments.length - 1]?.arrival.airport_name || flight.arrival.airport}
                          </div>
                        </div>
                      </div>

                      {/* Carbon Emissions */}
                      <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Carbon Emissions</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {flight.carbon_emissions ? `${Math.round(flight.carbon_emissions.this_flight / 1000)}kg CO₂` : 'N/A'}
                        </div>
                        {flight.carbon_emissions && (
                          <div className={`text-xs ${
                            flight.carbon_emissions.difference_percent < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {flight.carbon_emissions.difference_percent > 0 ? '+' : ''}
                            {flight.carbon_emissions.difference_percent}% vs typical
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price and Rating */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{flight.price}
                        <span className="text-sm font-normal text-gray-600 dark:text-gray-300 ml-1">{flight.currency}</span>
                      </div>
                      <div className="flex items-center justify-end text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {flight.rating}
                      </div>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => handleFlightSelect(flight)}
                          size="sm"
                          className="w-full"
                        >
                          Select
                        </Button>
                        {flight.booking_token ? (
                          <Button 
                            onClick={() => {
                              console.log('Navigating to booking options with token:', flight.booking_token);
                              navigate(`/booking-options/${encodeURIComponent(flight.booking_token!)}`);
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            View Booking Options
                          </Button>
                        ) : (
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                            Booking options not available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Flight Segments Details */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="space-y-3">
                      {flight.flight_segments?.map((segment: any, _index: number) => (
                        <div key={segment.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Segment Route */}
                            <div className="flex items-center space-x-3">
                              <div className="text-center">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{segment.departure.time}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">{segment.departure.airport}</div>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className="text-xs text-gray-500 dark:text-gray-400">{segment.duration}</div>
                                <div className="w-12 h-px bg-gray-300 dark:bg-gray-600 my-1"></div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{segment.aircraft}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{segment.arrival.time}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">{segment.arrival.airport}</div>
                              </div>
                            </div>

                            {/* Flight Details */}
                            <div className="flex items-center space-x-2">
                              <div className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-lg border border-accent/20">
                                {segment.airline} {segment.flight_number}
                              </div>
                              <div className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                                {segment.travel_class}
                              </div>
                              {segment.overnight && (
                                <div className="text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-lg border border-orange-200 dark:border-orange-800">
                                  Overnight
                                </div>
                              )}
                              {segment.often_delayed && (
                                <div className="text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2 py-1 rounded-lg border border-red-200 dark:border-red-800">
                                  Often Delayed
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Amenities */}
                          <div className="flex space-x-1">
                            {segment.amenities.slice(0, 3).map((amenity: string, _amenityIndex: number) => (
                              <span
                                key={_amenityIndex}
                                className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full border border-green-200 dark:border-green-800"
                                title={amenity}
                              >
                                {amenity}
                              </span>
                            ))}
                            {segment.amenities.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-700">
                                +{segment.amenities.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Layovers */}
                      {flight.layovers && flight.layovers.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Layovers:</div>
                          <div className="space-y-2">
                            {flight.layovers.map((layover: any, index: number) => (
                              <div key={index} className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {layover.duration}min at {layover.airport} ({layover.airport_name})
                                  {layover.overnight && ' - Overnight'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Booking Summary */}
        {selectedFlight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-6 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Plane className="w-8 h-8 text-white" />
                  </div>
              <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Selected Flight</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {selectedFlight.flight_segments?.[0]?.airline || selectedFlight.airline} {selectedFlight.flight_segments?.[0]?.flight_number || selectedFlight.flight_number}
                    </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedFlight.flight_segments?.[0]?.departure.airport || selectedFlight.departure.airport} → {selectedFlight.flight_segments?.[selectedFlight.flight_segments.length - 1]?.arrival.airport || selectedFlight.arrival.airport}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedFlight.total_duration} • {selectedFlight.stops === 0 ? 'Direct' : `${selectedFlight.stops} stop${selectedFlight.stops > 1 ? 's' : ''}`}
                </p>
              </div>
                </div>
                <div className="flex items-center space-x-6">
                <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                      ₹{selectedFlight.price}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">per passenger</div>
                </div>
                <Button
                  onClick={handleBooking}
                  icon={ArrowRight}
                  iconPosition="right"
                  size="lg"
                    className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    ✨ Continue to Booking
                </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FlightBookingPage; 