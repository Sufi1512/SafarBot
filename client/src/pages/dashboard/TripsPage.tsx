import React, { useState } from 'react';
import { Calendar, MapPin, Plane, Hotel, Car, Clock, Users, DollarSign, Edit, Trash2, Eye, Share2, Download } from 'lucide-react';

interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  travelers: number;
  totalCost: number;
  image: string;
  itinerary: {
    flights: number;
    hotels: number;
    activities: number;
  };
  bookings: Booking[];
}

interface Booking {
  id: string;
  type: 'flight' | 'hotel' | 'car' | 'activity';
  title: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  cost: number;
}

const TripsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'ongoing' | 'completed'>('upcoming');
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  const trips: Trip[] = [
    {
      id: '1',
      title: 'Paris Romantic Getaway',
      destination: 'Paris, France',
      startDate: '2024-03-15',
      endDate: '2024-03-22',
      status: 'upcoming',
      travelers: 2,
      totalCost: 3200,
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=500&h=300&fit=crop',
      itinerary: {
        flights: 2,
        hotels: 1,
        activities: 5
      },
      bookings: [
        {
          id: 'b1',
          type: 'flight',
          title: 'Round-trip to Paris',
          date: '2024-03-15',
          time: '08:30',
          status: 'confirmed',
          cost: 1200
        },
        {
          id: 'b2',
          type: 'hotel',
          title: 'Hotel Le Meurice',
          date: '2024-03-15',
          time: '15:00',
          status: 'confirmed',
          cost: 1400
        },
        {
          id: 'b3',
          type: 'activity',
          title: 'Eiffel Tower Tour',
          date: '2024-03-16',
          time: '10:00',
          status: 'confirmed',
          cost: 100
        }
      ]
    },
    {
      id: '2',
      title: 'Tokyo Adventure',
      destination: 'Tokyo, Japan',
      startDate: '2024-02-10',
      endDate: '2024-02-20',
      status: 'ongoing',
      travelers: 1,
      totalCost: 2500,
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&h=300&fit=crop',
      itinerary: {
        flights: 2,
        hotels: 2,
        activities: 8
      },
      bookings: [
        {
          id: 'b4',
          type: 'flight',
          title: 'Flight to Tokyo',
          date: '2024-02-10',
          time: '14:20',
          status: 'confirmed',
          cost: 800
        },
        {
          id: 'b5',
          type: 'hotel',
          title: 'Park Hyatt Tokyo',
          date: '2024-02-10',
          time: '18:00',
          status: 'confirmed',
          cost: 1200
        }
      ]
    },
    {
      id: '3',
      title: 'Bali Wellness Retreat',
      destination: 'Bali, Indonesia',
      startDate: '2024-01-05',
      endDate: '2024-01-15',
      status: 'completed',
      travelers: 2,
      totalCost: 1800,
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=500&h=300&fit=crop',
      itinerary: {
        flights: 2,
        hotels: 1,
        activities: 6
      },
      bookings: []
    }
  ];

  const filteredTrips = trips.filter(trip => {
    if (selectedTab === 'upcoming') return trip.status === 'upcoming';
    if (selectedTab === 'ongoing') return trip.status === 'ongoing';
    if (selectedTab === 'completed') return trip.status === 'completed';
    return false;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'ongoing': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'flight': return <Plane className="h-4 w-4" />;
      case 'hotel': return <Hotel className="h-4 w-4" />;
      case 'car': return <Car className="h-4 w-4" />;
      case 'activity': return <MapPin className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return '✓';
      case 'pending': return '⏳';
      case 'cancelled': return '✗';
      default: return '?';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Trips</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track your travel plans</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Plan New Trip
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'upcoming', label: 'Upcoming', count: trips.filter(t => t.status === 'upcoming').length },
          { id: 'ongoing', label: 'Ongoing', count: trips.filter(t => t.status === 'ongoing').length },
          { id: 'completed', label: 'Completed', count: trips.filter(t => t.status === 'completed').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {filteredTrips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex space-x-4">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {trip.title}
                    </h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {trip.destination}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {trip.startDate} - {trip.endDate}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trip.status)}`}>
                      {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${trip.totalCost}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">total cost</div>
                </div>
              </div>

              {/* Itinerary Summary */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Plane className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {trip.itinerary.flights}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Flights</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Hotel className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {trip.itinerary.hotels}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Hotels</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {trip.itinerary.activities}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Activities</div>
                </div>
              </div>

              {/* Bookings */}
              {trip.bookings.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Recent Bookings
                  </h4>
                  <div className="space-y-2">
                    {trip.bookings.slice(0, 3).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getBookingIcon(booking.type)}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {booking.title}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {booking.date} at {booking.time}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            ${booking.cost}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          }`}>
                            {getStatusIcon(booking.status)} {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                <button className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4 inline mr-1" />
                  Cancel Trip
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTrips.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No {selectedTab} trips
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {selectedTab === 'upcoming' && "You don't have any upcoming trips planned."}
            {selectedTab === 'ongoing' && "You don't have any ongoing trips."}
            {selectedTab === 'completed' && "You haven't completed any trips yet."}
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Plan Your First Trip
          </button>
        </div>
      )}
    </div>
  );
};

export default TripsPage;


