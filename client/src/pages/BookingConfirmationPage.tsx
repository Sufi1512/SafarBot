import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Plane, 
  Hotel, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  ArrowLeft,
  Download,
  Share2,
  Mail,
  Phone,
  CreditCard,
  Shield
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
    const { booking, passengers } = bookingData;
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Plane className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{booking.airline}</h3>
            <p className="text-sm text-gray-600">Flight {booking.flightNumber}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{booking.departure.time}</div>
            <div className="text-sm text-gray-600">{booking.departure.airport}</div>
            <div className="text-xs text-gray-500">{formatDate(booking.departure.date)}</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-sm text-gray-500 mb-2">{booking.duration}</div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="text-xs text-gray-500 mt-2">
              {booking.stops === 0 ? 'Direct' : `${booking.stops} stop${booking.stops > 1 ? 's' : ''}`}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{booking.arrival.time}</div>
            <div className="text-sm text-gray-600">{booking.arrival.airport}</div>
            <div className="text-xs text-gray-500">{formatDate(booking.arrival.date)}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {booking.amenities.map((amenity: string, index: number) => (
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

  const calculateTotal = () => {
    if (bookingData.type === 'flight') {
      return bookingData.booking.price * bookingData.passengers;
    } else {
      const nights = Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24));
      return bookingData.room.price * nights;
    }
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
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Booking Confirmation</h1>
              </div>
            </div>
            <p className="text-sm text-gray-500">Complete your booking</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!bookingComplete ? (
          <div className="space-y-8">
            {/* Booking Summary */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Summary</h2>
              {bookingData.type === 'flight' ? renderFlightDetails() : renderHotelDetails()}
            </div>

            {/* Price Breakdown */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Price Breakdown</h2>
              <div className="space-y-4">
                {bookingData.type === 'flight' ? (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Flight Ticket × {bookingData.passengers}</span>
                    <span className="font-medium">${bookingData.booking.price} × {bookingData.passengers}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Room Rate × {Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights</span>
                    <span className="font-medium">${bookingData.room.price} × {Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24))}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">${calculateTotal()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="input-field flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Secure Payment</h3>
                  <p className="text-blue-800 text-sm">
                    Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Pay ${calculateTotal()}</span>
                </div>
              )}
            </button>
          </div>
        ) : (
          /* Booking Complete */
          <div className="text-center space-y-8">
            <div className="card bg-green-50 border-green-200">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-900 mb-2">Booking Confirmed!</h2>
                  <p className="text-green-800">
                    Your {bookingData.type === 'flight' ? 'flight' : 'hotel'} has been successfully booked.
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
              <div className="text-left space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Reference:</span>
                  <span className="font-medium">SB{Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Date:</span>
                  <span className="font-medium">{formatDate(new Date().toISOString())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Paid:</span>
                  <span className="font-medium">${calculateTotal()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-primary flex items-center justify-center space-x-2 py-3">
                <Download className="w-5 h-5" />
                <span>Download Receipt</span>
              </button>
              <button className="btn-secondary flex items-center justify-center space-x-2 py-3">
                <Mail className="w-5 h-5" />
                <span>Email Confirmation</span>
              </button>
              <button className="btn-secondary flex items-center justify-center space-x-2 py-3">
                <Share2 className="w-5 h-5" />
                <span>Share Booking</span>
              </button>
            </div>

            {/* Next Steps */}
            <div className="card bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">What's Next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Confirmation Email</p>
                    <p className="text-blue-800 text-sm">You'll receive a detailed confirmation email within 5 minutes.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Travel Documents</p>
                    <p className="text-blue-800 text-sm">
                      {bookingData.type === 'flight' 
                        ? 'Your e-ticket will be available in your account within 24 hours.'
                        : 'Your hotel voucher will be sent to your email.'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Customer Support</p>
                    <p className="text-blue-800 text-sm">Need help? Contact our 24/7 support team at +1-800-SAFARBOT.</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="btn-primary px-8 py-3"
            >
              Back to Home
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingConfirmationPage; 