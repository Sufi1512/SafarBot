import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightAPI, BookingOptionsResponse, BookingOption } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { ArrowLeft, Plane, AlertCircle } from 'lucide-react';

const BookingOptionsPage: React.FC = () => {
  const { bookingToken } = useParams<{ bookingToken: string }>();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<BookingOptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<BookingOption | null>(null);

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
    setSelectedOption(option);
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
    <div key={flight.id} className="card-3d mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {flight.airline_logo && (
            <img src={flight.airline_logo} alt="Airline" className="w-8 h-8" />
          )}
          <div>
            <h3 className="text-lg font-semibold text-white">
              {flight.flight_segments?.[0]?.airline || 'Multiple Airlines'}
            </h3>
            <p className="text-sm text-gray-300">
              Flight {flight.flight_segments?.[0]?.flight_number || 'N/A'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {formatPrice(flight.price, flight.currency)}
          </div>
          <div className="text-sm text-gray-300">{flight.total_duration}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flight.flight_segments?.map((segment: any, index: number) => (
          <div key={index} className="glass border border-white/20 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-lg font-semibold text-white">{segment.departure?.time || 'N/A'}</div>
                <div className="text-sm text-gray-300">{segment.departure?.airport || 'N/A'}</div>
                <div className="text-xs text-gray-400">{segment.departure?.airport_name || ''}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400">{segment.duration || 'N/A'}</div>
                <div className="w-16 h-px bg-white/30 my-1"></div>
                <div className="text-xs text-gray-400">Flight {segment.flight_number || 'N/A'}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-white">{segment.arrival?.time || 'N/A'}</div>
                <div className="text-sm text-gray-300">{segment.arrival?.airport || 'N/A'}</div>
                <div className="text-xs text-gray-400">{segment.arrival?.airport_name || ''}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {segment.aircraft || 'Unknown'} • {segment.travel_class || 'Economy'} • {segment.legroom || 'Standard'} legroom
            </div>
          </div>
        )) || <div className="text-gray-400">No flight segments available</div>}
      </div>

      {flight.layovers && flight.layovers.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-white mb-2">Layovers</h4>
          {flight.layovers.map((layover: any, index: number) => (
            <div key={index} className="text-sm text-gray-300">
              {layover.duration || 0} min at {layover.airport || 'Unknown'} ({layover.airport_name || ''})
              {layover.overnight && ' - Overnight'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
  };

  const renderBookingOption = (option: BookingOption, index: number) => {
    console.log('Rendering booking option:', option);
    const details = option.together || option.departing;
    if (!details) {
      console.log('No booking details found for option:', option);
      return null;
    }

    return (
      <div key={index} className="card-3d mb-4 border-2 hover:border-blue-400 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {details.airline_logos?.map((logo, idx) => (
              <img key={idx} src={logo} alt="Airline" className="w-8 h-8" />
            )) || <div className="w-8 h-8 bg-white/20 rounded border border-white/30"></div>}
            <div>
              <h3 className="text-lg font-semibold text-white">{details.book_with || 'Unknown Provider'}</h3>
              <p className="text-sm text-gray-300">{details.option_title || 'Standard Option'}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {formatPrice(details.price || 0)}
            </div>
            <div className="text-sm text-gray-300">
              {details.local_prices?.map((price, idx) => (
                <span key={idx}>
                  {formatPrice(price.price || 0, price.currency || 'INR')}
                  {idx < (details.local_prices?.length || 0) - 1 && ' • '}
                </span>
              )) || formatPrice(details.price || 0)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Flight Details</h4>
            <div className="text-sm text-gray-300">
              {details.marketed_as?.map((flight, idx) => (
                <div key={idx}>{flight}</div>
              )) || <div>No flight details available</div>}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Baggage</h4>
            <div className="text-sm text-gray-300">
              {details.baggage_prices?.map((baggage, idx) => (
                <div key={idx}>{baggage}</div>
              )) || <div>No baggage information available</div>}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-white mb-2">Features</h4>
          <div className="flex flex-wrap gap-2">
            {details.extensions?.map((feature, idx) => (
              <span key={idx} className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded border border-white/20">
                {feature}
              </span>
            )) || <span className="text-gray-400 text-sm">No features listed</span>}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => handleBookNow(option)}
            className="flex-1 btn-primary"
          >
            Book Now
          </button>
          {details.booking_phone && (
            <button
              onClick={() => handleCallBooking(option)}
              className="px-4 py-2 btn-secondary"
            >
              Call {details.booking_phone}
            </button>
          )}
        </div>

        {details.estimated_phone_service_fee && (
          <div className="text-xs text-gray-400 mt-2">
            Phone booking fee: {formatPrice(details.estimated_phone_service_fee)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">
      {/* Header */}
      <header className="glass-dark sticky top-0 z-50 border-b border-white/10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            {/* Left side - Back button and Logo/Name */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/flights')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center pulse-glow">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold gradient-text">Booking Options</h1>
              </div>
            </div>
            {/* Right side - Description */}
            <p className="text-sm text-gray-300">Choose your preferred booking method</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-300">Loading booking options...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-lg text-red-300 mb-2">Error Loading Booking Options</p>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={loadBookingOptions}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : bookingData ? (
          <div className="space-y-8">
            {/* Flight Details */}
            <div className="card-3d">
              <h2 className="text-xl font-semibold text-white mb-4">Selected Flight</h2>
              {bookingData.selected_flights?.map((flight) => renderFlightDetails(flight))}
            </div>

            {/* Booking Options */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Available Booking Options</h2>
              {bookingData.booking_options?.map((option, index) => renderBookingOption(option, index))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-300">No booking data available</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingOptionsPage; 