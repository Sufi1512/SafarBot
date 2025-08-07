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
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Plane className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {booking.flight_segments[0]?.airline || 'Multiple Airlines'}
            </h3>
            <p className="text-sm text-slate-600 font-medium">
              Flight {booking.flight_segments[0]?.flight_number || 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">
              {booking.flight_segments[0]?.departure.time || 'N/A'}
            </div>
            <div className="text-sm text-slate-700 font-medium">
              {booking.flight_segments[0]?.departure.airport || 'N/A'}
            </div>
            <div className="text-xs text-slate-500">
              {booking.flight_segments[0]?.departure.airport_name || 'N/A'}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-sm text-slate-600 font-medium mb-2">{booking.total_duration}</div>
            <div className="w-16 h-px bg-blue-300"></div>
            <div className="text-xs text-slate-500 mt-2 font-medium">
              {booking.stops === 0 ? 'Direct' : `${booking.stops} stop${booking.stops > 1 ? 's' : ''}`}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">
              {booking.flight_segments[booking.flight_segments.length - 1]?.arrival.time || 'N/A'}
            </div>
            <div className="text-sm text-slate-700 font-medium">
              {booking.flight_segments[booking.flight_segments.length - 1]?.arrival.airport || 'N/A'}
            </div>
            <div className="text-xs text-slate-500">
              {booking.flight_segments[booking.flight_segments.length - 1]?.arrival.airport_name || 'N/A'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {booking.amenities && booking.amenities.map((amenity: string, index: number) => (
            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
              {amenity}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderHotelDetails = () => {
    const { hotel } = bookingData;
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Hotel className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{hotel.name}</h3>
            <p className="text-sm text-slate-600 font-medium">{hotel.location}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-bold text-slate-800 mb-3">Check-in & Check-out</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-slate-700 font-medium">
                  Check-in: {formatDate(hotel.check_in)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-slate-700 font-medium">
                  Check-out: {formatDate(hotel.check_out)}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-800 mb-3">Room Details</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-slate-700 font-medium">
                  {hotel.room_type} • {hotel.guests} guests
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-slate-700 font-medium">
                  Free cancellation until {formatDate(hotel.cancellation_date)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {hotel.amenities && hotel.amenities.map((amenity: string, index: number) => (
            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
              {amenity}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderPriceBreakdown = () => {
    const { total_price, breakdown } = bookingData;
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Price Breakdown</h3>
        <div className="space-y-3">
          {breakdown.map((item: any, index: number) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-slate-700 font-medium">{item.description}</span>
              <span className="text-sm text-slate-700 font-bold">₹{item.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-blue-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-slate-800">Total</span>
              <span className="text-2xl font-bold text-blue-600">₹{total_price.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-700 font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-800">Booking Confirmation</h1>
        </div>

        {!bookingComplete ? (
          <div className="space-y-8">
            {/* Booking Summary */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h2 className="text-2xl font-bold text-slate-800">Booking Summary</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Flight Details */}
                <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Flight Details</h3>
                  {renderFlightDetails()}
                </div>

                {/* Hotel Details */}
                {bookingData.hotel && (
                  <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Hotel Details</h3>
                    {renderHotelDetails()}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-slate-800">Payment</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Price Breakdown */}
                <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-6">
                  {renderPriceBreakdown()}
                </div>

                {/* Payment Form */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-800">Payment Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full border-b-2 border-white w-5 h-5 mr-2"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-5 h-5 mr-2" />
                        Pay ₹{bookingData.total_price.toLocaleString()}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Booking Confirmed!</h2>
            <p className="text-lg text-slate-600 mb-8">
              Your booking has been successfully confirmed. You will receive a confirmation email shortly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Receipt
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-white hover:bg-blue-50 text-slate-700 border border-blue-200 font-bold py-3 px-6 rounded-lg transition-colors"
              >
                View My Bookings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingConfirmationPage; 