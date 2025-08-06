import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Plane, 
  Hotel, 
  Calendar, 
  Users, 
  DollarSign,
  ArrowLeft,
  Download,
  CreditCard,
  Shield,
  X
} from 'lucide-react';

const BookingConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const bookingData = location.state;

  if (!bookingData) {
    navigate('/');
    return null;
  }

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setBookingComplete(true);
      setIsProcessing(false);
    }, 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderFlightDetails = () => {
    const { booking } = bookingData;
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Plane className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {booking.flight_segments[0]?.airline || 'Multiple Airlines'}
            </h3>
            <p className="text-sm text-gray-600">
              Flight {booking.flight_segments[0]?.flight_number || 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {booking.flight_segments[0]?.departure.time || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">
              {booking.flight_segments[0]?.departure.airport || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">
              {booking.flight_segments[0]?.departure.airport_name || 'N/A'}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-sm text-gray-500 mb-2">{booking.total_duration}</div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="text-xs text-gray-500 mt-2">
              {booking.stops === 0 ? 'Direct' : `${booking.stops} stop${booking.stops > 1 ? 's' : ''}`}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {booking.flight_segments[booking.flight_segments.length - 1]?.arrival.time || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">
              {booking.flight_segments[booking.flight_segments.length - 1]?.arrival.airport || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">
              {booking.flight_segments[booking.flight_segments.length - 1]?.arrival.airport_name || 'N/A'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {booking.amenities && booking.amenities.map((amenity: string, index: number) => (
            <span
              key={index}
              className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
            >
              {amenity}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderHotelDetails = () => {
    const { hotel, room, checkIn, checkOut, guests } = bookingData;
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Hotel className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
            <p className="text-sm text-gray-600">{hotel.location}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Room Details</h4>
            <p className="text-sm text-gray-600">{room.type}</p>
            <p className="text-sm text-gray-600">{room.description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {room.amenities.map((amenity: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Stay Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <span>Check-in: {formatDate(checkIn)}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <span>Check-out: {formatDate(checkOut)}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 text-gray-400 mr-2" />
                <span>{guests} guest{guests > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center">
                <Hotel className="w-4 h-4 text-gray-400 mr-2" />
                <span>{nights} night{nights > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
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
                onClick={() => navigate('/')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center pulse-glow">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold gradient-text">Booking Confirmation</h1>
              </div>
            </div>
            {/* Right side - Description */}
            <p className="text-sm text-gray-300">Complete your booking process</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Booking Summary */}
          <div className="card-3d">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Booking Summary</h2>
                <p className="text-gray-300">Review your booking details before payment</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  ${bookingData.totalAmount}
                </div>
                <div className="text-sm text-gray-300">Total Amount</div>
              </div>
            </div>

            {/* Flight Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Plane className="w-5 h-5 mr-2" />
                Flight Details
              </h3>
              {renderFlightDetails()}
            </div>

            {/* Hotel Details (if applicable) */}
            {bookingData.hotel && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Hotel className="w-5 h-5 mr-2" />
                  Hotel Details
                </h3>
                {renderHotelDetails()}
              </div>
            )}

            {/* Passenger Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Passenger Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">First Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Last Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Phone</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Card Number</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter cardholder name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Expiry Date</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">CVV</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="glass bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Secure Payment</h4>
                  <p className="text-sm text-gray-300">
                    Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 btn-primary py-3 flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="loading-spinner w-5 h-5"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Payment</span>
                    <DollarSign className="w-5 h-5" />
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn-secondary py-3 flex items-center justify-center space-x-2"
              >
                <span>Cancel</span>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Success Modal */}
          {bookingComplete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="glass-dark rounded-lg p-8 max-w-md w-full mx-4 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
                <p className="text-gray-300 mb-6">
                  Your booking has been successfully confirmed. You will receive a confirmation email shortly.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 btn-primary"
                  >
                    Return Home
                  </button>
                  <button className="flex-1 btn-secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookingConfirmationPage; 