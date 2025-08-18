import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Hotel, 
  Calendar, 
  Users, 
  MapPin, 
  Search, 
  Filter, 
  Star, 
  ArrowRight,
  Heart,
  Eye,
  X
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

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
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1
  });
  const [isSearching, setIsSearching] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    maxPrice: 500,
    minRating: 0,
    amenities: [] as string[]
  });

  const popularDestinations = [
    { name: 'New York', image: '🏙️', country: 'USA' },
    { name: 'Paris', image: '🗼', country: 'France' },
    { name: 'London', image: '🇬🇧', country: 'UK' },
    { name: 'Tokyo', image: '🗾', country: 'Japan' },
    { name: 'Dubai', image: '🏜️', country: 'UAE' },
    { name: 'Singapore', image: '🌴', country: 'Singapore' }
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
      navigate('/booking-confirmation', { 
        state: { 
          type: 'hotel', 
          hotel: selectedHotel,
          room: selectedRoom,
          checkIn: searchForm.checkIn,
          checkOut: searchForm.checkOut,
          guests: searchForm.guests
        } 
      });
    }
  };

  const calculateNights = () => {
    if (searchForm.checkIn && searchForm.checkOut) {
      const checkIn = new Date(searchForm.checkIn);
      const checkOut = new Date(searchForm.checkOut);
      return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    }
    return 0;
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
                <Hotel className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Hotel Search
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Find the perfect place to stay with our curated selection of hotels
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Destination */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Destination
                  </label>
                  <input
                    type="text"
                    value={searchForm.destination}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="Where are you going?"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Check-in */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={searchForm.checkIn}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Check-out */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={searchForm.checkOut}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Guests
                  </label>
                  <select
                    value={searchForm.guests}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>

                {/* Rooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Hotel className="w-4 h-4 inline mr-2" />
                    Rooms
                  </label>
                  <select
                    value={searchForm.rooms}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, rooms: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                  >
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Room' : 'Rooms'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {calculateNights() > 0 && `${calculateNights()} night${calculateNights() > 1 ? 's' : ''}`}
                </div>
                <Button
                  type="submit"
                  loading={isSearching}
                  icon={Search}
                  size="lg"
                >
                  {isSearching ? 'Searching...' : 'Search Hotels'}
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
                key={dest.name}
                className="p-4 text-center cursor-pointer hover:shadow-lg transition-all duration-200"
                hover={true}
                onClick={() => setSearchForm(prev => ({ ...prev, destination: dest.name }))}
              >
                <div className="text-3xl mb-3">{dest.image}</div>
                <div className="font-semibold text-gray-900 dark:text-white">{dest.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{dest.country}</div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Search Results */}
        {hotels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {hotels.length} hotels found
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Price per Night</label>
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600 dark:text-gray-300">${filters.maxPrice}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum Rating</label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                    >
                      <option value={0}>Any Rating</option>
                      <option value={3}>3+ Stars</option>
                      <option value={4}>4+ Stars</option>
                      <option value={4.5}>4.5+ Stars</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amenities</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Parking'].map(amenity => (
                        <label key={amenity} className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 dark:border-gray-600 text-accent focus:ring-accent"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Hotel Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {hotels.map((hotel) => (
                <Card
                  key={hotel.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedHotel?.id === hotel.id 
                      ? 'ring-2 ring-accent bg-accent/5' 
                      : ''
                  }`}
                  hover={true}
                  onClick={() => handleHotelSelect(hotel)}
                >
                  {/* Hotel Image Placeholder */}
                  <div className="h-48 bg-gradient-to-r from-accent to-primary-600 rounded-xl mb-4 flex items-center justify-center">
                    <Hotel className="w-16 h-16 text-white opacity-50" />
                  </div>

                  <div className="space-y-4">
                    {/* Hotel Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{hotel.name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">{hotel.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{hotel.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">({hotel.reviews.count} reviews)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">${hotel.price}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">per night</div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{hotel.description}</p>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.slice(0, 4).map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full border border-accent/20"
                        >
                          {amenity}
                        </span>
                      ))}
                      {hotel.amenities.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-700">
                          +{hotel.amenities.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                          <Heart className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-accent transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                      <Button size="sm">
                        View Rooms
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Hotel Details Modal */}
        {selectedHotel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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