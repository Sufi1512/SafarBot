import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightAPI, BookingOptionsResponse, BookingOption, Flight } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

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
    <div key={flight.id} className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {flight.airline_logo && (
            <img src={flight.airline_logo} alt="Airline" className="w-8 h-8" />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {flight.flight_segments?.[0]?.airline || 'Multiple Airlines'}
            </h3>
            <p className="text-sm text-gray-600">
              Flight {flight.flight_segments?.[0]?.flight_number || 'N/A'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(flight.price, flight.currency)}
          </div>
          <div className="text-sm text-gray-600">{flight.total_duration}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flight.flight_segments?.map((segment, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-lg font-semibold">{segment.departure?.time || 'N/A'}</div>
                <div className="text-sm text-gray-600">{segment.departure?.airport || 'N/A'}</div>
                <div className="text-xs text-gray-500">{segment.departure?.airport_name || ''}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">{segment.duration || 'N/A'}</div>
                <div className="w-16 h-px bg-gray-300 my-1"></div>
                <div className="text-xs text-gray-400">Flight {segment.flight_number || 'N/A'}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">{segment.arrival?.time || 'N/A'}</div>
                <div className="text-sm text-gray-600">{segment.arrival?.airport || 'N/A'}</div>
                <div className="text-xs text-gray-500">{segment.arrival?.airport_name || ''}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {segment.aircraft || 'Unknown'} • {segment.travel_class || 'Economy'} • {segment.legroom || 'Standard'} legroom
            </div>
          </div>
        )) || <div className="text-gray-500">No flight segments available</div>}
      </div>

      {flight.layovers && flight.layovers.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Layovers</h4>
          {flight.layovers.map((layover, index) => (
            <div key={index} className="text-sm text-gray-600">
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
      <div key={index} className="bg-white rounded-lg shadow-md p-6 mb-4 border-2 hover:border-blue-300 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {details.airline_logos?.map((logo, idx) => (
              <img key={idx} src={logo} alt="Airline" className="w-8 h-8" />
            )) || <div className="w-8 h-8 bg-gray-200 rounded"></div>}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{details.book_with || 'Unknown Provider'}</h3>
              <p className="text-sm text-gray-600">{details.option_title || 'Standard Option'}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              {formatPrice(details.price || 0)}
            </div>
            <div className="text-sm text-gray-600">
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
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Flight Details</h4>
            <div className="text-sm text-gray-600">
              {details.marketed_as?.map((flight, idx) => (
                <div key={idx}>{flight}</div>
              )) || <div>No flight details available</div>}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Baggage</h4>
            <div className="text-sm text-gray-600">
              {details.baggage_prices?.map((baggage, idx) => (
                <div key={idx}>{baggage}</div>
              )) || <div>No baggage information available</div>}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Features</h4>
          <div className="flex flex-wrap gap-2">
            {details.extensions?.map((feature, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {feature}
              </span>
            )) || <span className="text-gray-500 text-sm">No features listed</span>}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => handleBookNow(option)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Book Now
          </button>
          {details.booking_phone && (
            <button
              onClick={() => handleCallBooking(option)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Call {details.booking_phone}
            </button>
          )}
        </div>

        {details.estimated_phone_service_fee && (
          <div className="text-xs text-gray-500 mt-2">
            Phone booking fee: {formatPrice(details.estimated_phone_service_fee)}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={loadBookingOptions} />;
  }

  if (!bookingData) {
    return <ErrorDisplay message="No booking data available" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search Results
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Booking Options</h1>
          <p className="text-gray-600 mt-2">Choose your preferred booking method</p>
        </div>

        {/* Price Insights */}
        {bookingData.price_insights && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Price Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-blue-700">Lowest Price</div>
                <div className="text-xl font-bold text-blue-900">
                  {formatPrice(bookingData.price_insights.lowest_price)}
                </div>
              </div>
              <div>
                <div className="text-sm text-blue-700">Price Level</div>
                <div className="text-lg font-semibold text-blue-900 capitalize">
                  {bookingData.price_insights.price_level}
                </div>
              </div>
              <div>
                <div className="text-sm text-blue-700">Typical Range</div>
                <div className="text-lg font-semibold text-blue-900">
                  {formatPrice(bookingData.price_insights.typical_price_range[0])} - {formatPrice(bookingData.price_insights.typical_price_range[1])}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Baggage Information */}
        {bookingData.baggage_prices && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Baggage Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bookingData.baggage_prices.together && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Round Trip</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {bookingData.baggage_prices.together.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {bookingData.baggage_prices.departing && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Departure</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {bookingData.baggage_prices.departing.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {bookingData.baggage_prices.returning && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Return</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {bookingData.baggage_prices.returning.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Flight Details */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Flight</h2>
          {bookingData.selected_flights && bookingData.selected_flights.length > 0 ? (
            bookingData.selected_flights.map(renderFlightDetails)
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    No flight details available
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Flight details are not available for this booking token. This could be due to:
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Invalid or expired booking token</li>
                      <li>Flight information not yet loaded</li>
                      <li>Temporary service interruption</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Booking Options */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Booking Options</h2>
          {bookingData.booking_options && bookingData.booking_options.length > 0 ? (
            bookingData.booking_options.map(renderBookingOption)
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    No booking options available
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Currently, there are no booking options available for this flight. This could be due to:
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Limited availability for this route</li>
                      <li>Temporary service interruption</li>
                      <li>Booking window restrictions</li>
                      <li>Real API data not yet available (using mock data)</li>
                    </ul>
                    <p className="mt-2">
                      Please try again later or contact the airline directly for booking assistance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Booking Confirmation Modal */}
        {selectedOption && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Redirecting to Booking</h3>
              <p className="text-gray-600 mb-4">
                You will be redirected to {selectedOption.together?.book_with} to complete your booking.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedOption(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBookNow(selectedOption)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingOptionsPage; 