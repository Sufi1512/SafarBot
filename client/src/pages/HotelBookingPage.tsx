import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Hotel, 
  Calendar, 
  Users, 
  MapPin, 
  Search, 
  Filter, 
  Star, 
  ArrowRight,
  ArrowLeft,
  Heart,
  Eye,
  X
} from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
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
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Hotel className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Hotel Booking</h1>
              </div>
            </div>
            <p className="text-sm text-gray-500">Find the perfect place to stay</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Destination
                </label>
                <input
                  type="text"
                  value={searchForm.destination}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="Where are you going?"
                  className="input-field"
                  required
                />
              </div>

              {/* Check-in */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Check-in
                </label>
                <input
                  type="date"
                  value={searchForm.checkIn}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, checkIn: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              {/* Check-out */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Check-out
                </label>
                <input
                  type="date"
                  value={searchForm.checkOut}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, checkOut: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              {/* Guests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Guests
                </label>
                <select
                  value={searchForm.guests}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                  className="input-field"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>

              {/* Rooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hotel className="w-4 h-4 inline mr-2" />
                  Rooms
                </label>
                <select
                  value={searchForm.rooms}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, rooms: parseInt(e.target.value) }))}
                  className="input-field"
                >
                  {[1, 2, 3, 4].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Room' : 'Rooms'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {calculateNights() > 0 && `${calculateNights()} night${calculateNights() > 1 ? 's' : ''}`}
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="btn-primary px-8 py-3 flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>{isSearching ? 'Searching...' : 'Search Hotels'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Popular Destinations */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Destinations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularDestinations.map((dest) => (
              <button
                key={dest.name}
                onClick={() => setSearchForm(prev => ({ ...prev, destination: dest.name }))}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 text-center"
              >
                <div className="text-3xl mb-2">{dest.image}</div>
                <div className="font-medium text-gray-900">{dest.name}</div>
                <div className="text-sm text-gray-500">{dest.country}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {hotels.length > 0 && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {hotels.length} hotels found
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="card bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Price per Night</label>
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600">${filters.maxPrice}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseInt(e.target.value) }))}
                      className="input-field"
                    >
                      <option value={0}>Any Rating</option>
                      <option value={3}>3+ Stars</option>
                      <option value={4}>4+ Stars</option>
                      <option value={4.5}>4.5+ Stars</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Parking'].map(amenity => (
                        <label key={amenity} className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hotel Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className={`card cursor-pointer transition-all duration-200 ${
                    selectedHotel?.id === hotel.id 
                      ? 'ring-2 ring-green-500 bg-green-50' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleHotelSelect(hotel)}
                >
                  {/* Hotel Image Placeholder */}
                  <div className="h-48 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
                    <Hotel className="w-16 h-16 text-white opacity-50" />
                  </div>

                  <div className="space-y-4">
                    {/* Hotel Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{hotel.name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{hotel.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium">{hotel.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">({hotel.reviews.count} reviews)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">${hotel.price}</div>
                        <div className="text-sm text-gray-600">per night</div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm">{hotel.description}</p>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.slice(0, 4).map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {hotel.amenities.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{hotel.amenities.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Heart className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                      <button className="btn-primary text-sm px-4 py-2">
                        View Rooms
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hotel Details Modal */}
        {selectedHotel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedHotel.name}</h2>
                  <button
                    onClick={() => setSelectedHotel(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Hotel Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Hotel Information</h3>
                    <p className="text-gray-600 mb-4">{selectedHotel.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">{selectedHotel.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {selectedHotel.rating} ({selectedHotel.reviews.count} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedHotel.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Available Rooms */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Available Rooms</h3>
                  <div className="space-y-4">
                    {selectedHotel.rooms.map((room) => (
                      <div
                        key={room.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedRoom?.id === room.id 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleRoomSelect(room)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{room.type}</h4>
                            <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Capacity: {room.capacity} guests</span>
                              <div className="flex space-x-1">
                                {room.amenities.slice(0, 3).map((amenity, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                    {amenity}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">${room.price}</div>
                            <div className="text-sm text-gray-600">per night</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking Button */}
                {selectedRoom && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">Selected Room</h4>
                        <p className="text-sm text-gray-600">
                          {selectedRoom.type} • ${selectedRoom.price} × {calculateNights()} nights
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          ${selectedRoom.price * calculateNights()}
                        </div>
                        <div className="text-sm text-gray-600">Total</div>
                      </div>
                    </div>
                    <button
                      onClick={handleBooking}
                      className="w-full btn-primary mt-4 py-3 flex items-center justify-center space-x-2"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HotelBookingPage; 