import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightAPI, BookingOptionsResponse, BookingOption } from '../services/api';
import { ArrowLeft, Plane, AlertCircle } from 'lucide-react';

const BookingOptionsPage: React.FC = () => {
  const { bookingToken } = useParams<{ bookingToken: string }>();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<BookingOptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingToken) {
      loadBookingOptions();
    } else {
      setError('No booking token provided. Please select a flight first.');
      setLoading(false);
    }
  }, [bookingToken]);

  const loadBookingOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading booking options for token:', bookingToken);
      const data = await flightAPI.getBookingOptions(bookingToken!);
      console.log('Received booking data:', data);
      console.log('Selected flights count:', data.selected_flights?.length || 0);
      console.log('Booking options count:', data.booking_options?.length || 0);
      setBookingData(data);
    } catch (err: any) {
      console.error('Error loading booking options:', err);
      setError(err.message || 'Failed to load booking options');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (option: BookingOption) => {
    // In a real application, this would redirect to the booking provider's website
    if (option.together?.booking_request?.url) {
      window.open(option.together.booking_request.url, '_blank');
    }
  };

  const handleCallBooking = (option: BookingOption) => {
    if (option.together?.booking_phone) {
      window.open(`tel:${option.together.booking_phone}`, '_self');
    }
  };

  const formatPrice = (price: number, currency: string = 'INR') => {
    return `${currency === 'INR' ? '₹' : '$'}${price.toLocaleString()}`;
  };

  const renderFlightDetails = (flight: any) => {
    console.log('Rendering flight details:', flight);
    return (
      <div key={flight.id} className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {flight.airline_logo && (
              <img src={flight.airline_logo} alt="Airline" className="w-8 h-8" />
            )}
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {flight.flight_segments?.[0]?.airline || 'Multiple Airlines'}
              </h3>
              <p className="text-sm text-slate-600 font-medium">
                Flight {flight.flight_segments?.[0]?.flight_number || 'N/A'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {formatPrice(flight.price, flight.currency)}
            </div>
            <div className="text-sm text-slate-600 font-medium">{flight.total_duration}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {flight.flight_segments?.map((segment: any, index: number) => (
            <div key={index} className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="text-xl font-bold text-slate-800">{segment.departure?.time || 'N/A'}</div>
                  <div className="text-sm text-slate-700 font-medium">{segment.departure?.airport || 'N/A'}</div>
                  <div className="text-xs text-slate-500">{segment.departure?.airport_name || ''}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-600 font-medium">{segment.duration || 'N/A'}</div>
                  <div className="w-16 h-px bg-blue-300 my-2"></div>
                  <div className="text-xs text-slate-500 font-medium">Flight {segment.flight_number || 'N/A'}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-slate-800">{segment.arrival?.time || 'N/A'}</div>
                  <div className="text-sm text-slate-700 font-medium">{segment.arrival?.airport || 'N/A'}</div>
                  <div className="text-xs text-slate-500">{segment.arrival?.airport_name || ''}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBookingOption = (option: BookingOption, index: number) => {
    const isRecommended = option.together?.booking_request?.url;
    return (
      <div key={index} className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border ${isRecommended ? 'border-blue-200' : 'border-slate-200'} p-6 mb-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isRecommended ? 'bg-blue-100' : 'bg-slate-100'}`}>
              <Plane className={`w-6 h-6 ${isRecommended ? 'text-blue-600' : 'text-slate-600'}`} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-800">
                {option.together?.booking_request?.url ? 'Online Booking' : 'Phone Booking'}
              </h4>
              <p className="text-sm text-slate-600 font-medium">
                {option.together?.booking_request?.url ? 'Book directly online' : 'Call to book'}
              </p>
            </div>
          </div>
          {isRecommended && (
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
              RECOMMENDED
            </span>
          )}
        </div>

        <div className="space-y-3">
          {option.together?.booking_request?.url && (
            <button
              onClick={() => handleBookNow(option)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Book Now Online
            </button>
          )}
          
          {option.together?.booking_phone && (
            <button
              onClick={() => handleCallBooking(option)}
              className="w-full bg-white hover:bg-blue-50 text-slate-700 border border-blue-200 font-bold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Call to Book: {option.together.booking_phone}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full border-b-2 border-blue-600 w-12 h-12 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Loading Booking Options</h2>
            <p className="text-slate-600">Please wait while we fetch the best booking options for you...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Error Loading Booking Options</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/flights')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Flight Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/flights')}
            className="flex items-center text-blue-600 hover:text-blue-700 font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Flights
          </button>
          <h1 className="text-3xl font-bold text-slate-800">Booking Options</h1>
        </div>

        {/* Flight Details */}
        {bookingData?.selected_flights?.map((flight) => renderFlightDetails(flight))}

        {/* Booking Options */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Choose Your Booking Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookingData?.booking_options?.map((option, index) => renderBookingOption(option, index))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-blue-50/50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-3">Important Information</h3>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span className="text-sm font-medium">Prices are subject to change until booking is confirmed</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span className="text-sm font-medium">Please have your travel documents ready when booking</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span className="text-sm font-medium">For phone bookings, please mention you found this deal on SafarBot</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingOptionsPage; 