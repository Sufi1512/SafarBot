import React, { useState, useEffect } from 'react';
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
  X,
  Sparkles,
  Compass,
  Map,
  Clock,
  TrendingUp
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
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 20
    }));
    setParticles(newParticles);
  }, []);

  const interestOptions = [
    { id: 'culture', label: 'Culture & History', icon: '🏛️', color: 'from-blue-500 to-cyan-500' },
    { id: 'nature', label: 'Nature & Outdoors', icon: '🌲', color: 'from-green-500 to-emerald-500' },
    { id: 'food', label: 'Food & Dining', icon: '🍽️', color: 'from-orange-500 to-red-500' },
    { id: 'adventure', label: 'Adventure', icon: '🏔️', color: 'from-purple-500 to-pink-500' },
    { id: 'relaxation', label: 'Relaxation', icon: '🧘', color: 'from-indigo-500 to-blue-500' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️', color: 'from-pink-500 to-rose-500' },
    { id: 'nightlife', label: 'Nightlife', icon: '🌙', color: 'from-yellow-500 to-orange-500' },
    { id: 'photography', label: 'Photography', icon: '📸', color: 'from-teal-500 to-cyan-500' }
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
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      const apiRequest = {
        destination: formData.destination,
        start_date: formData.startDate,
        end_date: formData.endDate,
        budget: formData.budget,
        interests: formData.interests,
        travelers: formData.travelers,
        accommodation_type: 'hotel'
      };

      navigate('/results', { 
        state: { 
          ...formData, 
          days,
          startDate: formData.startDate,
          endDate: formData.endDate,
          apiRequest
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="glass-dark sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center pulse-glow">
                <Plane className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">SafarBot</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="nav-link">Features</a>
              <a href="#destinations" className="nav-link">Destinations</a>
              <a href="#about" className="nav-link">About</a>
              <button className="btn-primary px-6 py-2">Sign In</button>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-white/10 slide-in-left">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="nav-link">Features</a>
                <a href="#destinations" className="nav-link">Destinations</a>
                <a href="#about" className="nav-link">About</a>
                <button className="btn-primary px-6 py-2 w-full">Sign In</button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-up">
            <div className="mb-6">
              <Sparkles className="w-16 h-16 text-blue-400 mx-auto float-animation" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              Your AI Travel
              <span className="gradient-text block"> Companion</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Plan, book, and experience unforgettable journeys with our intelligent travel assistant
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary px-8 py-4 text-lg font-semibold hover-scale">
                Start Planning
              </button>
              <button className="btn-secondary px-8 py-4 text-lg font-semibold hover-scale">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Search Tabs */}
          <div className="max-w-5xl mx-auto">
            <div className="card-3d p-8">
              {/* Tab Navigation */}
              <div className="tab-container mb-8">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('itinerary')}
                    className={`tab-button flex-1 ${activeTab === 'itinerary' ? 'active' : ''}`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Globe className="w-5 h-5" />
                      <span>AI Itinerary</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('flights')}
                    className={`tab-button flex-1 ${activeTab === 'flights' ? 'active' : ''}`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Plane className="w-5 h-5" />
                      <span>Flights</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('hotels')}
                    className={`tab-button flex-1 ${activeTab === 'hotels' ? 'active' : ''}`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Hotel className="w-5 h-5" />
                      <span>Hotels</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'itinerary' && (
                <div className="slide-in-left">
                  {error && (
                    <div className="mb-6 p-4 glass-dark border border-red-500/30 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                        <p className="text-red-300">{error}</p>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Destination
                        </label>
                        <input
                          type="text"
                          value={formData.destination}
                          onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                          placeholder="Where do you want to go?"
                          className="input-field w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                          className="input-field w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          End Date
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                          className="input-field w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Users className="w-4 h-4 inline mr-2" />
                          Travelers
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={formData.travelers}
                          onChange={(e) => setFormData(prev => ({ ...prev, travelers: parseInt(e.target.value) }))}
                          className="input-field w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <DollarSign className="w-4 h-4 inline mr-2" />
                          Budget (USD)
                        </label>
                        <input
                          type="number"
                          min="500"
                          step="100"
                          value={formData.budget}
                          onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                          className="input-field w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Heart className="w-4 h-4 inline mr-2" />
                          Interests
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {interestOptions.slice(0, 4).map((interest) => (
                            <button
                              key={interest.id}
                              type="button"
                              onClick={() => handleInterestToggle(interest.id)}
                              className={`p-3 rounded-xl border-2 transition-all duration-300 hover-scale ${
                                formData.interests.includes(interest.id)
                                  ? `border-transparent bg-gradient-to-r ${interest.color} text-white`
                                  : 'border-white/20 bg-white/5 hover:border-white/40'
                              }`}
                            >
                              <div className="text-xl mb-1">{interest.icon}</div>
                              <div className="text-xs font-medium">{interest.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !formData.destination || !formData.startDate || !formData.endDate}
                      className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover-scale"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="loading-spinner mr-3"></div>
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
                <div className="text-center py-8 slide-in-right">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 float-animation">
                    <Plane className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Find Your Perfect Flight</h3>
                  <p className="text-gray-300 mb-8">Search and compare flights from hundreds of airlines</p>
                  <button
                    onClick={handleFlightSearch}
                    className="btn-primary px-8 py-3 flex items-center space-x-2 mx-auto hover-scale"
                  >
                    <span>Search Flights</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {activeTab === 'hotels' && (
                <div className="text-center py-8 slide-in-right">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 float-animation">
                    <Hotel className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Book Your Stay</h3>
                  <p className="text-gray-300 mb-8">Discover and book hotels that match your preferences</p>
                  <button
                    onClick={handleHotelSearch}
                    className="btn-primary px-8 py-3 flex items-center space-x-2 mx-auto hover-scale"
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
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-up">
            <h2 className="text-5xl font-bold mb-4">Why Choose SafarBot?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of travel planning with our cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "AI-Powered Planning",
                description: "Get personalized itineraries created by advanced AI that understands your preferences",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Secure Booking",
                description: "Book flights and hotels with confidence using our secure payment system",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Best Prices",
                description: "Find the best deals with our price comparison and smart recommendations",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "24/7 Support",
                description: "Get help anytime with our round-the-clock customer support team",
                color: "from-orange-500 to-red-500"
              }
            ].map((feature, index) => (
              <div key={index} className="card-3d text-center hover-lift">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section id="destinations" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-up">
            <h2 className="text-5xl font-bold mb-4">Popular Destinations</h2>
            <p className="text-xl text-gray-300">Explore trending destinations loved by travelers worldwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Paris', country: 'France', image: '🗼', rating: 4.8, price: 'From $800', color: 'from-blue-500 to-purple-500' },
              { name: 'Tokyo', country: 'Japan', image: '🗾', rating: 4.9, price: 'From $1200', color: 'from-pink-500 to-red-500' },
              { name: 'New York', country: 'USA', image: '🏙️', rating: 4.7, price: 'From $600', color: 'from-yellow-500 to-orange-500' },
              { name: 'Dubai', country: 'UAE', image: '🏜️', rating: 4.6, price: 'From $900', color: 'from-orange-500 to-red-500' },
              { name: 'London', country: 'UK', image: '🇬🇧', rating: 4.8, price: 'From $700', color: 'from-blue-500 to-indigo-500' },
              { name: 'Singapore', country: 'Singapore', image: '🌴', rating: 4.7, price: 'From $1000', color: 'from-green-500 to-teal-500' }
            ].map((dest, index) => (
              <div key={dest.name} className="card-3d overflow-hidden hover-lift">
                <div className={`h-48 bg-gradient-to-br ${dest.color} flex items-center justify-center relative overflow-hidden`}>
                  <div className="text-6xl z-10">{dest.image}</div>
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">{dest.name}</h3>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{dest.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-3">{dest.country}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-blue-400">{dest.price}</span>
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
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="card-3d p-12">
            <h2 className="text-5xl font-bold mb-4 gradient-text">Ready to Start Your Journey?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of travelers who trust SafarBot for their perfect trips
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary px-8 py-4 text-lg font-semibold hover-scale">
                Start Planning Now
              </button>
              <button className="btn-secondary px-8 py-4 text-lg font-semibold hover-scale">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-dark border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Plane className="w-6 h-6 text-white" />
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
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SafarBot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 