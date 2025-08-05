import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Heart, 
  Plane, 
  Hotel, 
  AlertCircle,
  Search,
  Star,
  Globe,
  Shield,
  Zap,
  Award,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

interface TravelForm {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  interests: string[];
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TravelForm>({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: 1000,
    interests: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'flights' | 'hotels'>('itinerary');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const interestOptions = [
    { id: 'culture', label: 'Culture & History', icon: '🏛️' },
    { id: 'nature', label: 'Nature & Outdoors', icon: '🌲' },
    { id: 'food', label: 'Food & Dining', icon: '🍽️' },
    { id: 'adventure', label: 'Adventure', icon: '🏔️' },
    { id: 'relaxation', label: 'Relaxation', icon: '🧘' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'nightlife', label: 'Nightlife', icon: '🌙' },
    { id: 'photography', label: 'Photography', icon: '📸' }
  ];

  const handleInterestToggle = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.destination.trim()) {
      return 'Please enter a destination';
    }
    if (!formData.startDate) {
      return 'Please select a start date';
    }
    if (!formData.endDate) {
      return 'Please select an end date';
    }
    
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      return 'Start date cannot be in the past';
    }
    if (endDate <= startDate) {
      return 'End date must be after start date';
    }
    
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
      return 'Trip duration cannot exceed 30 days';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);

    try {
      // Calculate number of days
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      // Prepare API request data matching the backend format
      const apiRequest = {
        destination: formData.destination,
        start_date: formData.startDate,
        end_date: formData.endDate,
        budget: formData.budget,
        interests: formData.interests,
        travelers: formData.travelers,
        accommodation_type: 'hotel'
      };

      // Navigate to results page with form data
      navigate('/results', { 
        state: { 
          ...formData, 
          days,
          startDate: formData.startDate,
          endDate: formData.endDate,
          apiRequest // Pass the API request data for the results page
        } 
      });
    } catch (error) {
      console.error('Error preparing itinerary request:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlightSearch = () => {
    navigate('/flights');
  };

  const handleHotelSearch = () => {
    navigate('/hotels');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">SafarBot</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#destinations" className="text-gray-600 hover:text-gray-900 transition-colors">Destinations</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
              <button className="btn-primary px-6 py-2">Sign In</button>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
                <a href="#destinations" className="text-gray-600 hover:text-gray-900 transition-colors">Destinations</a>
                <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
                <button className="btn-primary px-6 py-2 w-full">Sign In</button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your AI Travel
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Companion</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
              Plan, book, and experience unforgettable journeys with our intelligent travel assistant
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary px-8 py-4 text-lg font-semibold">
                Start Planning
              </button>
              <button className="btn-secondary px-8 py-4 text-lg font-semibold">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Search Tabs */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('itinerary')}
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'itinerary'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>AI Itinerary</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('flights')}
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'flights'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Plane className="w-5 h-5" />
                    <span>Flights</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('hotels')}
                  className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'hotels'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Hotel className="w-5 h-5" />
                    <span>Hotels</span>
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'itinerary' && (
                <div>
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                        <p className="text-red-700">{error}</p>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Destination
                        </label>
                        <input
                          type="text"
                          value={formData.destination}
                          onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                          placeholder="Where do you want to go?"
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          End Date
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Users className="w-4 h-4 inline mr-2" />
                          Travelers
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={formData.travelers}
                          onChange={(e) => setFormData(prev => ({ ...prev, travelers: parseInt(e.target.value) }))}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <DollarSign className="w-4 h-4 inline mr-2" />
                          Budget (USD)
                        </label>
                        <input
                          type="number"
                          min="500"
                          step="100"
                          value={formData.budget}
                          onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Heart className="w-4 h-4 inline mr-2" />
                          Interests
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {interestOptions.slice(0, 4).map((interest) => (
                            <button
                              key={interest.id}
                              type="button"
                              onClick={() => handleInterestToggle(interest.id)}
                              className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                                formData.interests.includes(interest.id)
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                            >
                              <div className="text-lg mb-1">{interest.icon}</div>
                              <div className="text-xs font-medium">{interest.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !formData.destination || !formData.startDate || !formData.endDate}
                      className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Generating Itinerary...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Search className="w-5 h-5" />
                          <span>Generate AI Itinerary</span>
                        </div>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'flights' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plane className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Your Perfect Flight</h3>
                  <p className="text-gray-600 mb-6">Search and compare flights from hundreds of airlines</p>
                  <button
                    onClick={handleFlightSearch}
                    className="btn-primary px-8 py-3 flex items-center space-x-2 mx-auto"
                  >
                    <span>Search Flights</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {activeTab === 'hotels' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Hotel className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Book Your Stay</h3>
                  <p className="text-gray-600 mb-6">Discover and book hotels that match your preferences</p>
                  <button
                    onClick={handleHotelSearch}
                    className="btn-primary px-8 py-3 flex items-center space-x-2 mx-auto"
                  >
                    <span>Search Hotels</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose SafarBot?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of travel planning with our cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Planning</h3>
              <p className="text-gray-600">Get personalized itineraries created by advanced AI that understands your preferences</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Booking</h3>
              <p className="text-gray-600">Book flights and hotels with confidence using our secure payment system</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Best Prices</h3>
              <p className="text-gray-600">Find the best deals with our price comparison and smart recommendations</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 Support</h3>
              <p className="text-gray-600">Get help anytime with our round-the-clock customer support team</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section id="destinations" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Destinations</h2>
            <p className="text-xl text-gray-600">Explore trending destinations loved by travelers worldwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Paris', country: 'France', image: '🗼', rating: 4.8, price: 'From $800' },
              { name: 'Tokyo', country: 'Japan', image: '🗾', rating: 4.9, price: 'From $1200' },
              { name: 'New York', country: 'USA', image: '🏙️', rating: 4.7, price: 'From $600' },
              { name: 'Dubai', country: 'UAE', image: '🏜️', rating: 4.6, price: 'From $900' },
              { name: 'London', country: 'UK', image: '🇬🇧', rating: 4.8, price: 'From $700' },
              { name: 'Singapore', country: 'Singapore', image: '🌴', rating: 4.7, price: 'From $1000' }
            ].map((dest) => (
              <div key={dest.name} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <div className="text-6xl">{dest.image}</div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{dest.name}</h3>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{dest.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{dest.country}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-blue-600">{dest.price}</span>
                    <button className="btn-primary px-4 py-2 text-sm">
                      Explore
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of travelers who trust SafarBot for their perfect trips
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Start Planning Now
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">SafarBot</h3>
              </div>
              <p className="text-gray-400">
                Your AI-powered travel companion for unforgettable journeys.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">AI Itinerary</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Flight Booking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hotel Booking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Travel Insurance</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SafarBot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 