import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { flightAPI, BookingOptionsResponse, BookingOption } from '../services/api';
import { 
  ArrowLeft, 
  AlertCircle, 
  Phone, 
  Globe, 
  Info, 
  Plane, 
  Clock, 
  Star,
  Shield,
  CheckCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

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
      <motion.div
        key={flight.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Card className="overflow-hidden" shadow="large" variant="elevated">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Plane className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-heading">
                    {flight.flight_segments?.[0]?.airline || 'Multiple Airlines'}
                  </h3>
                  <p className="text-primary-100 font-medium">
                    Flight {flight.flight_segments?.[0]?.flight_number || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold font-heading">
                  {formatPrice(flight.price, flight.currency)}
                </div>
                <div className="text-primary-100 font-medium flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {flight.total_duration}
                </div>
              </div>
            </div>
          </div>

          {/* Flight segments */}
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              {flight.flight_segments?.map((segment: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-gradient-to-r from-secondary-50 to-primary-50 dark:from-secondary-800 dark:to-primary-900/20 border border-secondary-200 dark:border-secondary-700 rounded-2xl p-6">
                    {/* Flight route visualization */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                          {segment.departure?.time || 'N/A'}
                        </div>
                        <div className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                          {segment.departure?.airport || 'N/A'}
                        </div>
                        <div className="text-xs text-secondary-500 dark:text-secondary-400">
                          {segment.departure?.airport_name || ''}
                        </div>
                      </div>
                      
                      {/* Flight path visualization */}
                      <div className="flex-1 flex items-center justify-center px-4">
                        <div className="relative w-full">
                          <div className="h-0.5 bg-gradient-to-r from-primary-300 to-primary-500 rounded-full"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 bg-primary-500 rounded-full border-4 border-white dark:border-secondary-800 shadow-lg"></div>
                          </div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <Plane className="w-4 h-4 text-primary-500" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 text-right">
                        <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                          {segment.arrival?.time || 'N/A'}
                        </div>
                        <div className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                          {segment.arrival?.airport || 'N/A'}
                        </div>
                        <div className="text-xs text-secondary-500 dark:text-secondary-400">
                          {segment.arrival?.airport_name || ''}
                        </div>
                      </div>
                    </div>
                    
                    {/* Flight details */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-secondary-600 dark:text-secondary-400">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{segment.duration || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-secondary-600 dark:text-secondary-400">
                          <Plane className="w-4 h-4" />
                          <span className="font-medium">Flight {segment.flight_number || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-success-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Confirmed</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Flight amenities */}
            {flight.amenities && flight.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-6"
              >
                <h4 className="text-lg font-semibold text-secondary-900 dark:text-white mb-3 flex items-center">
                  <Star className="w-5 h-5 text-warning-500 mr-2" />
                  Flight Amenities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {flight.amenities.map((amenity: string, index: number) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-full border border-primary-200 dark:border-primary-700"
                    >
                      {amenity}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  const renderBookingOption = (option: BookingOption, index: number) => {
    const isRecommended = option.together?.booking_request?.url;
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -5 }}
      >
        <Card 
          className={`relative overflow-hidden ${isRecommended ? 'ring-2 ring-primary-500 shadow-xl' : ''}`} 
          shadow="large"
          variant="elevated"
        >
          {/* Recommended badge */}
          {isRecommended && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="absolute top-4 right-4 z-10"
            >
              <div className="bg-gradient-to-r from-warning-500 to-warning-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>RECOMMENDED</span>
              </div>
            </motion.div>
          )}

          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-secondary-50/50 dark:from-primary-900/10 dark:to-secondary-900/10"></div>
          
          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <motion.div 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                    isRecommended 
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600' 
                      : 'bg-gradient-to-br from-secondary-500 to-secondary-600'
                  }`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {isRecommended ? (
                    <Globe className="w-8 h-8 text-white" />
                  ) : (
                    <Phone className="w-8 h-8 text-white" />
                  )}
                </motion.div>
                <div>
                  <h4 className="text-xl font-bold text-secondary-900 dark:text-white font-heading">
                    {option.together?.booking_request?.url ? 'Online Booking' : 'Phone Booking'}
                  </h4>
                  <p className="text-secondary-600 dark:text-secondary-300 font-medium">
                    {option.together?.booking_request?.url ? 'Book directly online' : 'Call to book'}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1 text-success-600">
                      <Shield className="w-4 h-4" />
                      <span className="text-xs font-medium">Secure</span>
                    </div>
                    <div className="flex items-center space-x-1 text-primary-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-medium">Best Price</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-2 text-sm text-secondary-600 dark:text-secondary-400">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>Instant Confirmation</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-secondary-600 dark:text-secondary-400">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-secondary-600 dark:text-secondary-400">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>Free Cancellation</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-secondary-600 dark:text-secondary-400">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>Mobile Ticket</span>
              </div>
            </div>

            <div className="space-y-3">
              {option.together?.booking_request?.url && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => handleBookNow(option)}
                    icon={Globe}
                    className="w-full"
                    size="lg"
                  >
                    Book Now Online
                  </Button>
                </motion.div>
              )}
              
              {option.together?.booking_phone && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => handleCallBooking(option)}
                    variant="outline"
                    icon={Phone}
                    className="w-full"
                    size="lg"
                  >
                    Call to Book: {option.together.booking_phone}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-bg dark:via-dark-bg dark:to-secondary-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-6"
            >
              <div className="w-full h-full border-4 border-primary-200 border-t-primary-500 rounded-full"></div>
            </motion.div>
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-4 font-heading">Loading Booking Options</h2>
            <p className="text-secondary-600 dark:text-secondary-300 text-lg">Please wait while we fetch the best booking options for you...</p>
            
            {/* Loading animation dots */}
            <div className="flex justify-center space-x-2 mt-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                  className="w-3 h-3 bg-primary-500 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-error-50 via-white to-secondary-50 dark:from-error-900/20 dark:via-dark-bg dark:to-secondary-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertCircle className="w-10 h-10 text-error-600 dark:text-error-400" />
            </motion.div>
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-4 font-heading">Error Loading Booking Options</h2>
            <p className="text-secondary-600 dark:text-secondary-300 mb-8 text-lg">{error}</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => navigate(-1)}
                icon={ArrowLeft}
                size="lg"
              >
                Back to Search
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-bg dark:via-dark-bg dark:to-secondary-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <motion.div
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              icon={ArrowLeft}
              size="sm"
            >
              Back
            </Button>
          </motion.div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-secondary-900 dark:text-white font-heading">Booking Options</h1>
            <p className="text-secondary-600 dark:text-secondary-300 mt-2">Choose your preferred booking method</p>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </motion.div>

        {/* Flight Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {bookingData?.selected_flights?.map((flight: any) => renderFlightDetails(flight))}
        </motion.div>

        {/* Booking Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white font-heading mb-4">Choose Your Booking Method</h2>
            <p className="text-secondary-600 dark:text-secondary-300 text-lg">Select the most convenient way to book your flight</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {bookingData?.booking_options?.map((option: BookingOption, index: number) => renderBookingOption(option, index))}
          </div>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12"
        >
          <Card className="p-8" shadow="large" variant="elevated">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
                <Info className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white font-heading">Important Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-4 h-4 text-success-600 dark:text-success-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-900 dark:text-white">Price Changes</h4>
                    <p className="text-sm text-secondary-600 dark:text-secondary-300">Prices are subject to change until booking is confirmed</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-warning-100 dark:bg-warning-900/30 rounded-full flex items-center justify-center mt-0.5">
                    <Calendar className="w-4 h-4 text-warning-600 dark:text-warning-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-900 dark:text-white">Travel Documents</h4>
                    <p className="text-sm text-secondary-600 dark:text-secondary-300">Please have your travel documents ready when booking</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mt-0.5">
                    <Phone className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-900 dark:text-white">Phone Bookings</h4>
                    <p className="text-sm text-secondary-600 dark:text-secondary-300">For phone bookings, please mention you found this deal on SafarBot</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-info-100 dark:bg-info-900/30 rounded-full flex items-center justify-center mt-0.5">
                    <Shield className="w-4 h-4 text-info-600 dark:text-info-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-900 dark:text-white">Secure Booking</h4>
                    <p className="text-sm text-secondary-600 dark:text-secondary-300">All bookings are processed through secure, trusted partners</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingOptionsPage; 