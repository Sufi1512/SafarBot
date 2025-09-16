import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hotel, 
  Users, 
  MapPin, 
  Search, 
  Filter, 
  Star, 
  ArrowRight,
  Heart,
  Eye,
  X,
  Map,
  List,
  Grid,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  ChevronDown,
  Calendar,
  CalendarDays
} from 'lucide-react';
import Button from '../components/ui/Button';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';
import CustomDatePicker from '../components/ui/CustomDatePicker';

interface HotelRoom {
  id: string;
  type: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  available: boolean;
}

interface Hotel {
  id: string;
  name: string;
  rating: number;
  price: number;
  location: string;
  description: string;
  amenities: string[];
  images: string[];
  rooms: HotelRoom[];
  reviews: {
    rating: number;
    count: number;
  };
}

const HotelBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({
    destination: '',
    expectedDate: undefined as Date | undefined,
    days: 1,
    guests: 2,
    rooms: 1
  });
  const [isSearching, setIsSearching] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [filters, setFilters] = useState({
    maxPrice: 500,
    minRating: 0,
    amenities: [] as string[]
  });
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const [showRoomsDropdown, setShowRoomsDropdown] = useState(false);
  const guestsDropdownRef = useRef<HTMLDivElement>(null);
  const roomsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guestsDropdownRef.current && !guestsDropdownRef.current.contains(event.target as Node)) {
        setShowGuestsDropdown(false);
      }
      if (roomsDropdownRef.current && !roomsDropdownRef.current.contains(event.target as Node)) {
        setShowRoomsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const popularDestinations = [
    { name: 'New York', image: '🏙️', country: 'USA' },
    { name: 'Paris', image: '🗼', country: 'France' },
    { name: 'London', image: '🇬🇧', country: 'UK' },
    { name: 'Tokyo', image: '🗾', country: 'Japan' },
    { name: 'Dubai', image: '🏜️', country: 'UAE' },
    { name: 'Singapore', image: '🌴', country: 'Singapore' }
  ];

  const hotelCategories = [
    { name: 'Luxury', icon: Sparkles, count: 45, color: 'from-yellow-400 to-orange-500' },
    { name: 'Business', icon: TrendingUp, count: 32, color: 'from-gray-400 to-gray-600' },
    { name: 'Boutique', icon: Award, count: 28, color: 'from-purple-400 to-pink-500' },
    { name: 'Budget', icon: Clock, count: 67, color: 'from-green-400 to-green-600' }
  ];

  const featuredHotels = [
    {
      id: 'featured-1',
      name: 'The Ritz-Carlton',
      rating: 4.9,
      price: 450,
      location: 'Central Park, New York',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      badge: 'Best Luxury',
      discount: 15
    },
    {
      id: 'featured-2',
      name: 'Marriott Downtown',
      rating: 4.7,
      price: 280,
      location: 'Financial District, New York',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      badge: 'Business Choice',
      discount: 20
    },
    {
      id: 'featured-3',
      name: 'Boutique Garden Inn',
      rating: 4.6,
      price: 195,
      location: 'Greenwich Village, New York',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      badge: 'Trending',
      discount: 10
    }
  ];

  const mockHotels: Hotel[] = [
    {
      id: '1',
      name: 'Grand Plaza Hotel',
      rating: 4.8,
      price: 250,
      location: 'Downtown, New York',
      description: 'Luxury hotel in the heart of Manhattan with stunning city views and world-class amenities.',
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Parking'],
      images: ['hotel1.jpg', 'hotel1-2.jpg', 'hotel1-3.jpg'],
      rooms: [
        {
          id: '1-1',
          type: 'Deluxe Room',
          description: 'Spacious room with city view',
          price: 250,
          capacity: 2,
          amenities: ['WiFi', 'TV', 'Mini Bar'],
          available: true
        },
        {
          id: '1-2',
          type: 'Suite',
          description: 'Luxury suite with separate living area',
          price: 450,
          capacity: 4,
          amenities: ['WiFi', 'TV', 'Mini Bar', 'Jacuzzi'],
          available: true
        }
      ],
      reviews: { rating: 4.8, count: 1247 }
    },
    {
      id: '2',
      name: 'Boutique Garden Hotel',
      rating: 4.5,
      price: 180,
      location: 'Central Park Area, New York',
      description: 'Charming boutique hotel with beautiful gardens and personalized service.',
      amenities: ['WiFi', 'Garden', 'Restaurant', 'Concierge'],
      images: ['hotel2.jpg', 'hotel2-2.jpg'],
      rooms: [
        {
          id: '2-1',
          type: 'Garden View Room',
          description: 'Cozy room overlooking the gardens',
          price: 180,
          capacity: 2,
          amenities: ['WiFi', 'TV', 'Garden View'],
          available: true
        }
      ],
      reviews: { rating: 4.5, count: 892 }
    },
    {
      id: '3',
      name: 'Business Center Hotel',
      rating: 4.3,
      price: 150,
      location: 'Financial District, New York',
      description: 'Modern business hotel with conference facilities and easy access to major attractions.',
      amenities: ['WiFi', 'Business Center', 'Restaurant', 'Fitness Center'],
      images: ['hotel3.jpg'],
      rooms: [
        {
          id: '3-1',
          type: 'Business Room',
          description: 'Efficient room for business travelers',
          price: 150,
          capacity: 2,
          amenities: ['WiFi', 'TV', 'Work Desk'],
          available: true
        }
      ],
      reviews: { rating: 4.3, count: 567 }
    }
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!searchForm.destination.trim()) {
      alert('Please enter a destination');
      return;
    }
    if (!searchForm.expectedDate) {
      alert('Please select expected date');
      return;
    }
    if (!searchForm.days || searchForm.days < 1) {
      alert('Please enter number of days (min 1)');
      return;
    }
    
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      setHotels(mockHotels);
      setIsSearching(false);
    }, 2000);
  };

  const handleHotelSelect = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setSelectedRoom(null);
  };

  const handleRoomSelect = (room: HotelRoom) => {
    setSelectedRoom(room);
  };

  const handleBooking = () => {
    if (selectedHotel && selectedRoom) {
      const checkIn = searchForm.expectedDate ? new Date(searchForm.expectedDate) : undefined;
      const checkOut = checkIn ? new Date(checkIn.getTime() + (searchForm.days || 1) * 24 * 60 * 60 * 1000) : undefined;
      navigate('/booking-confirmation', { 
        state: { 
          type: 'hotel', 
          hotel: selectedHotel,
          room: selectedRoom,
          checkIn,
          checkOut,
          guests: searchForm.guests
        } 
      });
    }
  };

  const calculateNights = () => {
    return searchForm.days && searchForm.days > 0 ? searchForm.days : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <video
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/src/asset/videos/bg-video2.mp4" type="video/mp4" />
        </video>
        
        <div className="relative z-20 flex items-center justify-center h-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white max-w-4xl mx-auto px-4"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/40">
                <Hotel className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold">
                Find Your Perfect Stay
              </h1>
            </div>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Discover amazing hotels and accommodations worldwide with exclusive deals and instant booking
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {hotelCategories.map((category) => (
                <div key={category.name} className="flex items-center space-x-2 bg-white/30 backdrop-blur-md rounded-full px-4 py-2 border border-white/40">
                  <category.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-xs opacity-75">({category.count})</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-[66px] relative z-30">
        {/* Enhanced Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <ModernCard className="p-8 shadow-2xl border-0 bg-white dark:bg-gray-800 backdrop-blur-md border border-white/20 dark:border-gray-700/50 overflow-visible">
            <form onSubmit={handleSearch} className="space-y-6 overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-visible">
                {/* Destination */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2 text-accent" />
                    Destination
                  </label>
                  <div className="relative">
                  <input
                    type="text"
                    value={searchForm.destination}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="Where are you going?"
                      className="w-full px-4 py-3 pl-10 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-accent bg-white dark:bg-dark-card text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 text-sm"
                    required
                  />
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Expected Date */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2 text-accent" />
                    Expected Date
                  </label>
                  <CustomDatePicker
                    value={searchForm.expectedDate}
                    onChange={(date) => setSearchForm(prev => ({ ...prev, expectedDate: date }))}
                    placeholder="Select expected date"
                    minDate={new Date()}
                  />
                </div>

                {/* Days */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <CalendarDays className="w-4 h-4 inline mr-2 text-accent" />
                    Days
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={searchForm.days}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, days: Math.max(1, parseInt(e.target.value || '1')) }))}
                    placeholder="Number of days"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-accent bg-white dark:bg-dark-card text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 text-sm"
                  />
                </div>

                {/* Guests & Rooms */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Users className="w-4 h-4 inline mr-2 text-accent" />
                      Guests
                    </label>
                    <div className="relative" ref={guestsDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
                        className="w-full px-4 py-3 pr-10 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-accent bg-white dark:bg-dark-card text-gray-900 dark:text-white transition-all duration-300 hover:border-accent/50 dark:hover:border-accent/50 focus:outline-none text-left flex items-center justify-between group text-sm"
                      >
                        <span className="font-medium">
                          {searchForm.guests} {searchForm.guests === 1 ? 'Guest' : 'Guests'}
                        </span>
                      </button>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div className="w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center group-hover:from-accent/20 group-hover:to-accent/10 transition-all duration-300">
                          <ChevronDown className={`w-3 h-3 text-gray-500 group-hover:text-accent transition-all duration-300 ${showGuestsDropdown ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Custom Dropdown */}
                    <AnimatePresence>
                      {showGuestsDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-2xl z-[9999] overflow-hidden backdrop-blur-md max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
                        >
                          {[1, 2, 3, 4].map((num, index) => (
                            <motion.button
                              key={num}
                              type="button"
                              onClick={() => {
                                setSearchForm(prev => ({ ...prev, guests: num }));
                                setShowGuestsDropdown(false);
                              }}
                              className={`w-full px-4 py-2 text-left transition-all duration-200 hover:bg-accent/10 ${
                                searchForm.guests === num 
                                  ? 'bg-gradient-to-r from-accent to-accent/80 text-white' 
                                  : 'text-gray-900 dark:text-white hover:text-accent'
                              } ${index === 0 ? 'rounded-t-2xl' : ''} ${index === 3 ? 'rounded-b-2xl' : ''}`}
                              whileHover={{ scale: 1.02, x: 4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{num} {num === 1 ? 'Guest' : 'Guests'}</span>
                                {searchForm.guests === num && (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Hotel className="w-4 h-4 inline mr-2 text-accent" />
                      Rooms
                    </label>
                    <div className="relative" ref={roomsDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowRoomsDropdown(!showRoomsDropdown)}
                        className="w-full px-4 py-3 pr-10 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-accent bg-white dark:bg-dark-card text-gray-900 dark:text-white transition-all duration-300 hover:border-accent/50 dark:hover:border-accent/50 focus:outline-none text-left flex items-center justify-between group text-sm"
                      >
                        <span className="font-medium">
                          {searchForm.rooms} {searchForm.rooms === 1 ? 'Room' : 'Rooms'}
                        </span>
                      </button>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div className="w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center group-hover:from-accent/20 group-hover:to-accent/10 transition-all duration-300">
                          <ChevronDown className={`w-3 h-3 text-gray-500 group-hover:text-accent transition-all duration-300 ${showRoomsDropdown ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Custom Dropdown */}
                    <AnimatePresence>
                      {showRoomsDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-2xl z-[9999] overflow-hidden backdrop-blur-md max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
                        >
                          {[1, 2, 3, 4].map((num, index) => (
                            <motion.button
                              key={num}
                              type="button"
                              onClick={() => {
                                setSearchForm(prev => ({ ...prev, rooms: num }));
                                setShowRoomsDropdown(false);
                              }}
                              className={`w-full px-4 py-2 text-left transition-all duration-200 hover:bg-accent/10 ${
                                searchForm.rooms === num 
                                  ? 'bg-gradient-to-r from-accent to-accent/80 text-white' 
                                  : 'text-gray-900 dark:text-white hover:text-accent'
                              } ${index === 0 ? 'rounded-t-2xl' : ''} ${index === 3 ? 'rounded-b-2xl' : ''}`}
                              whileHover={{ scale: 1.02, x: 4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{num} {num === 1 ? 'Room' : 'Rooms'}</span>
                                {searchForm.rooms === num && (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-4 pt-4">
                {calculateNights() > 0 && (
                  <div className="flex items-center space-x-2 bg-accent/10 px-4 py-2 rounded-full">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-accent">
                      {calculateNights()} night{calculateNights() > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                <ModernButton
                  type="submit"
                  loading={isSearching}
                  icon={Search}
                  size="lg"
                  className="px-12 py-4 min-w-[200px]"
                >
                  {isSearching ? 'Searching...' : 'Search Hotels'}
                </ModernButton>
              </div>
            </form>
          </ModernCard>
        </motion.div>

        {/* Featured Hotels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Featured Hotels</h2>
              <p className="text-gray-600 dark:text-gray-300">Handpicked accommodations with exclusive deals</p>
            </div>
            <ModernButton variant="bordered" icon={ArrowRight} iconPosition="right">
              View All
            </ModernButton>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredHotels.map((hotel, index) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="group cursor-pointer"
              >
                <ModernCard className="overflow-hidden p-0 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">
                        {hotel.badge}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        -{hotel.discount}%
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <button className="p-2 bg-white/30 backdrop-blur-md rounded-full hover:bg-white/40 transition-colors border border-white/40 shadow-sm">
                        <Heart className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{hotel.name}</h3>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">{hotel.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">${hotel.price}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">per night</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium text-gray-900 dark:text-white">{hotel.rating}</span>
                        <span className="text-sm text-gray-500">(4.2k reviews)</span>
                      </div>
                      <ModernButton size="sm">
                        View Details
                      </ModernButton>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Popular Destinations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Popular Destinations</h2>
            <p className="text-gray-600 dark:text-gray-300">Explore trending destinations around the world</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {popularDestinations.map((dest, index) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSearchForm(prev => ({ ...prev, destination: dest.name }))}
              >
                <ModernCard className="p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{dest.image}</div>
                  <div className="font-bold text-gray-900 dark:text-white mb-1">{dest.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{dest.country}</div>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search Results */}
        {hotels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-8"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {hotels.length} hotels found
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Showing results for {searchForm.destination}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white dark:bg-gray-700 shadow-sm' 
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white dark:bg-gray-700 shadow-sm' 
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'map' 
                        ? 'bg-white dark:bg-gray-700 shadow-sm' 
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Map className="w-4 h-4" />
                  </button>
                </div>
                
                <ModernButton
                  variant="bordered"
                  icon={Filter}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters
                </ModernButton>
              </div>
            </div>

            {/* Enhanced Filters Panel */}
            {showFilters && (
              <ModernCard className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                      Max Price per Night
                    </label>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="50"
                        max="1000"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                        <span>$50</span>
                        <span className="font-semibold text-accent">${filters.maxPrice}</span>
                        <span>$1000</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                      Minimum Rating
                    </label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-accent bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                    >
                      <option value={0}>Any Rating</option>
                      <option value={3}>3+ Stars</option>
                      <option value={4}>4+ Stars</option>
                      <option value={4.5}>4.5+ Stars</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                      Hotel Type
                    </label>
                    <div className="space-y-2">
                      {['Luxury', 'Business', 'Boutique', 'Budget'].map(type => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 dark:border-gray-600 text-accent focus:ring-accent"
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                      Amenities
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: 'WiFi', icon: Wifi },
                        { name: 'Pool', icon: Waves },
                        { name: 'Gym', icon: Dumbbell },
                        { name: 'Restaurant', icon: Utensils },
                        { name: 'Parking', icon: Car },
                        { name: 'Spa', icon: Sparkles }
                      ].map(amenity => (
                        <label key={amenity.name} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 dark:border-gray-600 text-accent focus:ring-accent"
                          />
                          <amenity.icon className="w-4 h-4 ml-2 text-gray-500" />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{amenity.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </ModernCard>
            )}

            {/* Hotel Results */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {hotels.map((hotel, index) => (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => handleHotelSelect(hotel)}
                  >
                    <ModernCard className={`overflow-hidden p-0 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                      selectedHotel?.id === hotel.id 
                        ? 'ring-2 ring-accent bg-accent/5' 
                        : ''
                    }`}>
                      {/* Hotel Image */}
                      <div className="relative h-56 overflow-hidden">
                        <div className="h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Hotel className="w-20 h-20 text-gray-500" />
                        </div>
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/95 backdrop-blur-md text-gray-900 px-3 py-1 rounded-full text-sm font-medium border border-white/60 shadow-sm">
                            {hotel.rating} ⭐
                          </span>
                        </div>
                        <div className="absolute top-4 right-4">
                          <button className="p-2 bg-white/30 backdrop-blur-md rounded-full hover:bg-white/40 transition-colors border border-white/40 shadow-sm">
                            <Heart className="w-5 h-5 text-white" />
                          </button>
                        </div>
                        <div className="absolute bottom-4 right-4">
                          <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">
                            Best Price
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Hotel Info */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{hotel.name}</h3>
                            <div className="flex items-center space-x-2 mb-3">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">{hotel.location}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{hotel.rating}</span>
                              </div>
                              <span className="text-sm text-gray-500">({hotel.reviews.count} reviews)</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">${hotel.price}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">per night</div>
                            <div className="text-xs text-green-600 font-medium mt-1">Free cancellation</div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{hotel.description}</p>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {hotel.amenities.slice(0, 4).map((amenity, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full border border-accent/20 font-medium"
                            >
                              {amenity}
                            </span>
                          ))}
                          {hotel.amenities.length > 4 && (
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-700">
                              +{hotel.amenities.length - 4} more
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex space-x-3">
                            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                              <Heart className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-accent transition-colors">
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                          <ModernButton size="sm" icon={ArrowRight} iconPosition="right">
                            View Rooms
                          </ModernButton>
                        </div>
                      </div>
                    </ModernCard>
                  </motion.div>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-6">
                {hotels.map((hotel, index) => (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => handleHotelSelect(hotel)}
                  >
                    <ModernCard className={`p-6 hover:shadow-xl transition-all duration-300 ${
                      selectedHotel?.id === hotel.id 
                        ? 'ring-2 ring-accent bg-accent/5' 
                        : ''
                    }`}>
                      <div className="flex gap-6">
                        {/* Hotel Image */}
                        <div className="w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Hotel className="w-12 h-12 text-gray-500" />
                        </div>
                        
                        {/* Hotel Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{hotel.name}</h3>
                              <div className="flex items-center space-x-2 mb-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">{hotel.location}</span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{hotel.rating}</span>
                                </div>
                                <span className="text-sm text-gray-500">({hotel.reviews.count} reviews)</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">${hotel.price}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">per night</div>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{hotel.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {hotel.amenities.slice(0, 3).map((amenity, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full border border-accent/20"
                                >
                                  {amenity}
                                </span>
                              ))}
                            </div>
                            <ModernButton size="sm">
                              View Details
                            </ModernButton>
                          </div>
                        </div>
                      </div>
                    </ModernCard>
                  </motion.div>
                ))}
              </div>
            )}

            {viewMode === 'map' && (
              <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Map View</h3>
                  <p className="text-gray-500 dark:text-gray-400">Interactive map coming soon</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Hotel Details Modal */}
        {selectedHotel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-dark-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedHotel.name}</h2>
                  <button
                    onClick={() => setSelectedHotel(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>

                {/* Hotel Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Hotel Information</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{selectedHotel.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{selectedHotel.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {selectedHotel.rating} ({selectedHotel.reviews.count} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Amenities</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedHotel.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Available Rooms */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Available Rooms</h3>
                  <div className="space-y-4">
                    {selectedHotel.rooms.map((room) => (
                      <div
                        key={room.id}
                        className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedRoom?.id === room.id 
                            ? 'border-accent bg-accent/5' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-accent'
                        }`}
                        onClick={() => handleRoomSelect(room)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{room.type}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{room.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>Capacity: {room.capacity} guests</span>
                              <div className="flex space-x-1">
                                {room.amenities.slice(0, 3).map((amenity, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                    {amenity}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900 dark:text-white">${room.price}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">per night</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking Button */}
                {selectedRoom && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Selected Room</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {selectedRoom.type} • ${selectedRoom.price} × {calculateNights()} nights
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${selectedRoom.price * calculateNights()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Total</div>
                      </div>
                    </div>
                    <Button
                      onClick={handleBooking}
                      icon={ArrowRight}
                      iconPosition="right"
                      className="w-full mt-4"
                      size="lg"
                    >
                      Book Now
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelBookingPage; 