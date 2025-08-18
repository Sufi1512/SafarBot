import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plane, 
  Calendar, 
  Users, 
  MapPin, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  ArrowRight
} from 'lucide-react';
import { flightAPI, Flight, FlightSearchRequest, AirportSuggestion } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const FlightBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy',
    tripType: 'round-trip' // 'one-way' or 'round-trip'
  });
  const [isSearching, setIsSearching] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    maxPrice: 1000,
    maxStops: 2,
    airlines: [] as string[]
  });
  const [fromSuggestions, setFromSuggestions] = useState<AirportSuggestion[]>([]);
  const [toSuggestions, setToSuggestions] = useState<AirportSuggestion[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  // Load popular flights on component mount
  useEffect(() => {
    const loadPopularFlights = async () => {
      try {
        await flightAPI.getPopularFlights();
        // Popular flights loaded but not used in current UI
      } catch (error) {
        console.error('Error loading popular flights:', error);
      }
    };
    
    loadPopularFlights();
  }, []);

  // Airport suggestions functions
  const handleFromInputChange = async (value: string) => {
    setSearchForm(prev => ({ ...prev, from: value }));
    if (value.length >= 2) {
      try {
        const suggestions = await flightAPI.getAirportSuggestions(value);
        setFromSuggestions(suggestions);
        setShowFromSuggestions(true);
      } catch (error) {
        console.error('Error getting airport suggestions:', error);
      }
    } else {
      setFromSuggestions([]);
      setShowFromSuggestions(false);
    }
  };

  const handleToInputChange = async (value: string) => {
    setSearchForm(prev => ({ ...prev, to: value }));
    if (value.length >= 2) {
      try {
        const suggestions = await flightAPI.getAirportSuggestions(value);
        setToSuggestions(suggestions);
        setShowToSuggestions(true);
      } catch (error) {
        console.error('Error getting airport suggestions:', error);
      }
    } else {
      setToSuggestions([]);
      setShowToSuggestions(false);
    }
  };

  const selectFromAirport = (airport: AirportSuggestion) => {
    setSearchForm(prev => ({ ...prev, from: airport.code }));
    setShowFromSuggestions(false);
  };

  const selectToAirport = (airport: AirportSuggestion) => {
    setSearchForm(prev => ({ ...prev, to: airport.code }));
    setShowToSuggestions(false);
  };

  const handleTripTypeChange = (tripType: string) => {
    setSearchForm(prev => ({ 
      ...prev, 
      tripType,
      // Clear return date if switching to one-way
      returnDate: tripType === 'one-way' ? '' : prev.returnDate
    }));
  };

  const popularDestinations = [
    { name: 'New York', code: 'JFK', country: 'USA' },
    { name: 'London', code: 'LHR', country: 'UK' },
    { name: 'Paris', code: 'CDG', country: 'France' },
    { name: 'Tokyo', code: 'NRT', country: 'Japan' },
    { name: 'Dubai', code: 'DXB', country: 'UAE' },
    { name: 'Singapore', code: 'SIN', country: 'Singapore' }
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    try {
      const searchRequest: FlightSearchRequest = {
        from_location: searchForm.from,
        to_location: searchForm.to,
        departure_date: searchForm.departureDate,
        return_date: searchForm.tripType === 'round-trip' ? searchForm.returnDate : undefined,
        passengers: searchForm.passengers,
        class_type: searchForm.class
      };
      
      const response = await flightAPI.searchFlights(searchRequest);
      setFlights(response.flights);
    } catch (error: any) {
      console.error('Flight search error:', error);
      // Show error message instead of fallback
      alert('No flights found. Please check your search criteria and try again.');
      setFlights([]);
    } finally {
      setIsSearching(false);
    }
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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Page Header */}
      <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Flight Search
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Find the best flights for your journey with real-time pricing and booking options
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6" shadow="large">
            <form onSubmit={handleSearch} className="space-y-6">
              {/* Trip Type Selector */}
              <div className="flex items-center space-x-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Trip Type:</label>
                <div className="flex items-center space-x-2">
                  <label className={`flex items-center px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                    searchForm.tripType === 'one-way' 
                      ? 'border-accent bg-accent/10 text-accent' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 hover:border-accent'
                  }`}>
                    <input
                      type="radio"
                      name="tripType"
                      value="one-way"
                      checked={searchForm.tripType === 'one-way'}
                      onChange={(e) => handleTripTypeChange(e.target.value)}
                      className="mr-2 text-accent focus:ring-accent"
                    />
                    <span className="text-sm font-medium">One Way</span>
                  </label>
                  <label className={`flex items-center px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                    searchForm.tripType === 'round-trip' 
                      ? 'border-accent bg-accent/10 text-accent' 
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 hover:border-accent'
                  }`}>
                    <input
                      type="radio"
                      name="tripType"
                      value="round-trip"
                      checked={searchForm.tripType === 'round-trip'}
                      onChange={(e) => handleTripTypeChange(e.target.value)}
                      className="mr-2 text-accent focus:ring-accent"
                    />
                    <span className="text-sm font-medium">Round Trip</span>
                  </label>
                </div>
              </div>
              
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                searchForm.tripType === 'round-trip' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
              }`}>
                {/* From */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    From
                  </label>
                  <input
                    type="text"
                    value={searchForm.from}
                    onChange={(e) => handleFromInputChange(e.target.value)}
                    onFocus={() => searchForm.from.length >= 2 && setShowFromSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                    placeholder="Airport code or city"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                    required
                  />
                  {showFromSuggestions && fromSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {fromSuggestions.map((airport, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          onClick={() => selectFromAirport(airport)}
                        >
                          <div className="font-medium text-gray-900 dark:text-white">{airport.code}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">{airport.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{airport.city}, {airport.country}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* To */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    To
                  </label>
                  <input
                    type="text"
                    value={searchForm.to}
                    onChange={(e) => handleToInputChange(e.target.value)}
                    onFocus={() => searchForm.to.length >= 2 && setShowToSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                    placeholder="Airport code or city"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                    required
                  />
                  {showToSuggestions && toSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {toSuggestions.map((airport, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          onClick={() => selectToAirport(airport)}
                        >
                          <div className="font-medium text-gray-900 dark:text-white">{airport.code}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">{airport.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{airport.city}, {airport.country}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Departure Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Departure
                  </label>
                  <input
                    type="date"
                    value={searchForm.departureDate}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, departureDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Return Date - Only show for round-trip */}
                {searchForm.tripType === 'round-trip' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Return
                    </label>
                    <input
                      type="date"
                      value={searchForm.returnDate}
                      onChange={(e) => setSearchForm(prev => ({ ...prev, returnDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                      min={searchForm.departureDate}
                      required={searchForm.tripType === 'round-trip'}
                    />
                  </div>
                )}

                {/* Passengers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Passengers
                  </label>
                  <select
                    value={searchForm.passengers}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Trip:</span> {searchForm.tripType === 'one-way' ? 'One Way' : 'Round Trip'}
                    {searchForm.tripType === 'round-trip' && searchForm.returnDate && (
                      <span className="ml-2 text-gray-500 dark:text-gray-400">
                        ({searchForm.departureDate} → {searchForm.returnDate})
                      </span>
                    )}
                  </div>
                  <select
                    value={searchForm.class}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, class: e.target.value }))}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="economy">Economy</option>
                    <option value="premium">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                </div>
                <Button
                  type="submit"
                  loading={isSearching}
                  icon={Search}
                  size="lg"
                >
                  {isSearching 
                    ? 'Searching...' 
                    : `Search ${searchForm.tripType === 'one-way' ? 'One-Way' : 'Round-Trip'} Flights`
                  }
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Popular Destinations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Popular Destinations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularDestinations.map((dest) => (
              <Card
                key={dest.code}
                className="p-4 text-center cursor-pointer hover:shadow-lg transition-all duration-200"
                hover={true}
                onClick={() => setSearchForm(prev => ({ ...prev, to: dest.name }))}
              >
                <div className="text-3xl mb-3">✈️</div>
                <div className="font-semibold text-gray-900 dark:text-white">{dest.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{dest.country}</div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Search Results */}
        {flights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {flights.length} flights found
              </h2>
              <Button
                variant="outline"
                icon={Filter}
                onClick={() => setShowFilters(!showFilters)}
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
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-white"
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
            <div className="space-y-4">
              {flights.map((flight) => (
                <Card
                  key={flight.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedFlight?.id === flight.id 
                      ? 'ring-2 ring-accent bg-accent/5' 
                      : ''
                  }`}
                  hover={true}
                  onClick={() => handleFlightSelect(flight)}
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
                          {flight.flight_segments[0]?.airline || 'Multiple Airlines'}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{flight.flight_type}</div>
                      </div>

                      {/* Flight Route */}
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {flight.flight_segments[0]?.departure.time}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {flight.flight_segments[0]?.departure.airport}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {flight.flight_segments[0]?.departure.airport_name}
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
                            {flight.flight_segments[flight.flight_segments.length - 1]?.arrival.time}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {flight.flight_segments[flight.flight_segments.length - 1]?.arrival.airport}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {flight.flight_segments[flight.flight_segments.length - 1]?.arrival.airport_name}
                          </div>
                        </div>
                      </div>

                      {/* Carbon Emissions */}
                      <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Carbon Emissions</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {Math.round(flight.carbon_emissions.this_flight / 1000)}kg CO₂
                        </div>
                        <div className={`text-xs ${
                          flight.carbon_emissions.difference_percent < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {flight.carbon_emissions.difference_percent > 0 ? '+' : ''}
                          {flight.carbon_emissions.difference_percent}% vs typical
                        </div>
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
                      {flight.flight_segments.map((segment, _index) => (
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
                            {segment.amenities.slice(0, 3).map((amenity, _amenityIndex) => (
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
                      {flight.layovers.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Layovers:</div>
                          <div className="space-y-2">
                            {flight.layovers.map((layover, index) => (
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
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-800 p-4 shadow-lg"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Selected Flight</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedFlight.flight_segments[0]?.airline} {selectedFlight.flight_segments[0]?.flight_number} • 
                  {selectedFlight.flight_segments[0]?.departure.airport} → {selectedFlight.flight_segments[selectedFlight.flight_segments.length - 1]?.arrival.airport}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedFlight.total_duration} • {selectedFlight.stops === 0 ? 'Direct' : `${selectedFlight.stops} stop${selectedFlight.stops > 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{selectedFlight.price}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">per passenger</div>
                </div>
                <Button
                  onClick={handleBooking}
                  icon={ArrowRight}
                  iconPosition="right"
                  size="lg"
                >
                  Continue to Booking
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FlightBookingPage; 