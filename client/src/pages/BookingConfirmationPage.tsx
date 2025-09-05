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
  Shield
} from 'lucide-react';

const BookingConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  // Provide default booking data for demo purposes if no data is passed
  const defaultBookingData = {
    type: 'flight',
    booking: {
      price: 500,
      flight_segments: [
        {
          airline: 'Sample Airlines',
          flight_number: 'SA123',
          departure: {
            time: '08:00',
            airport: 'JFK',
            airport_name: 'John F. Kennedy International'
          },
          arrival: {
            time: '10:30',
            airport: 'LAX',
            airport_name: 'Los Angeles International'
          }
        }
      ],
      total_duration: '2h 30m',
      stops: 0,
      amenities: ['WiFi', 'Entertainment', 'Meals']
    },
    passengers: 1,
    total_price: 575,
    breakdown: [
      { description: 'Flight Price', amount: 500 },
      { description: 'Taxes & Fees', amount: 75 },
      { description: 'Service Fee', amount: 50 }
    ]
  };

  const bookingData = location.state || defaultBookingData;

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
    const { booking } = bookingData || {};
    const flightSegments = booking?.flight_segments || [];
    
    return (
      <div className="space-y-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white">
              {flightSegments[0]?.airline || 'Sample Airline'}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Flight {flightSegments[0]?.flight_number || 'AA123'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {flightSegments[0]?.departure?.time || '08:00'}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {flightSegments[0]?.departure?.airport || 'JFK'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {flightSegments[0]?.departure?.airport_name || 'John F. Kennedy International'}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-sm text-gray-600 dark:text-gray-300">{booking?.total_duration || '2h 30m'}</div>
            <div className="w-16 h-px bg-gradient-to-r from-cyan-400 to-blue-500"></div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {booking?.stops === 0 ? 'Direct' : `${booking?.stops || 0} stop${(booking?.stops || 0) > 1 ? 's' : ''}`}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {flightSegments[flightSegments.length - 1]?.arrival?.time || '10:30'}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {flightSegments[flightSegments.length - 1]?.arrival?.airport || 'LAX'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {flightSegments[flightSegments.length - 1]?.arrival?.airport_name || 'Los Angeles International'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(booking?.amenities || ['WiFi', 'Entertainment', 'Meals']).map((amenity: string, index: number) => (
            <span key={index} className="px-3 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 text-cyan-700 dark:text-cyan-300 text-xs rounded-full">
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
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Hotel className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{hotel.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{hotel.location}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Check-in & Check-out</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  Check-in: {formatDate(hotel.check_in)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  Check-out: {formatDate(hotel.check_out)}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Room Details</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {hotel.room_type} • {hotel.guests} guests
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  Free cancellation until {formatDate(hotel.cancellation_date)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {hotel.amenities && hotel.amenities.map((amenity: string, index: number) => (
            <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
              {amenity}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderPriceBreakdown = () => {
    const { total_price, breakdown } = bookingData || {};
    
    // Default breakdown if not provided
    const defaultBreakdown = [
      { description: 'Flight Price', amount: bookingData?.booking?.price || 0 },
      { description: 'Taxes & Fees', amount: Math.round((bookingData?.booking?.price || 0) * 0.15) },
      { description: 'Service Fee', amount: 50 }
    ];
    
    const priceBreakdown = breakdown || defaultBreakdown;
    const finalTotal = total_price || (bookingData?.booking?.price || 0) + Math.round((bookingData?.booking?.price || 0) * 0.15) + 50;
    
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {priceBreakdown.map((item: any, index: number) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.description}</span>
              <span className="text-sm text-gray-700 dark:text-gray-300 font-bold">₹{item.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-emerald-200 dark:border-emerald-700 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">₹{finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Simple Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Confirmation</h1>
              <p className="text-gray-600 dark:text-gray-300">Review and complete your booking</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          </div>
        </div>

        {!bookingComplete ? (
          <div className="space-y-8">
            {/* Booking Summary - Wide Rectangle */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Booking Summary</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Flight Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Plane className="w-6 h-6 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Flight Details</h3>
                  </div>
                  {renderFlightDetails()}
                </div>

                {/* Hotel Details */}
                {bookingData?.hotel && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-6">
                      <Hotel className="w-6 h-6 text-purple-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hotel Details</h3>
                    </div>
                    {renderHotelDetails()}
                  </div>
                )}

                {/* Price Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <DollarSign className="w-6 h-6 text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Price Summary</h3>
                  </div>
                  {renderPriceBreakdown()}
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard className="w-6 h-6 text-green-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Information</h2>
              </div>
              
              <div className="max-w-2xl">
                <div className="flex items-center space-x-2 mb-6">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Enter your payment details</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center mt-6"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2 animate-spin"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Pay ₹{((bookingData?.total_price) || (bookingData?.booking?.price || 0) + Math.round((bookingData?.booking?.price || 0) * 0.15) + 50).toLocaleString()}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Booking Confirmed!</h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Your booking has been successfully confirmed. You will receive a confirmation email shortly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-md transition-colors"
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