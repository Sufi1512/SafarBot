import React, { useState, useEffect } from 'react';
import { 
  TrendingDown, 
  ExternalLink, 
  Star, 
  DollarSign,
  CheckCircle,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface PriceComparisonItem {
  id: string;
  platform: string;
  price: number;
  originalPrice?: number;
  currency: string;
  rating?: number;
  reviews?: number;
  bookingUrl: string;
  affiliateId: string;
  commission: number;
  features: string[];
  lastUpdated: string;
  isRecommended?: boolean;
}

interface PriceComparisonProps {
  type: 'flight' | 'hotel';
  destination: string;
  dates: {
    start: string;
    end?: string;
  };
}

const PriceComparison: React.FC<PriceComparisonProps> = ({
  type,
  destination,
  dates
}) => {
  const [comparisonData, setComparisonData] = useState<PriceComparisonItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'commission'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [showAffiliateInfo, setShowAffiliateInfo] = useState(false);

  useEffect(() => {
    loadComparisonData();
  }, [type, destination, dates]);

  const loadComparisonData = () => {
    setIsLoading(true);
    
    // Mock data for demonstration
    const mockData: PriceComparisonItem[] = [
      {
        id: '1',
        platform: 'Booking.com',
        price: 850,
        originalPrice: 950,
        currency: 'USD',
        rating: 4.5,
        reviews: 1247,
        bookingUrl: 'https://booking.com/affiliate-link-1',
        affiliateId: 'safarbot_booking_1',
        commission: 8.5,
        features: ['Free Cancellation', 'Best Price Guarantee', '24/7 Support'],
        lastUpdated: '2024-02-15T10:30:00Z',
        isRecommended: true
      },
      {
        id: '2',
        platform: 'Expedia',
        price: 920,
        currency: 'USD',
        rating: 4.3,
        reviews: 892,
        bookingUrl: 'https://expedia.com/affiliate-link-2',
        affiliateId: 'safarbot_expedia_1',
        commission: 7.2,
        features: ['Price Match', 'Rewards Program', 'Mobile App'],
        lastUpdated: '2024-02-15T09:45:00Z'
      },
      {
        id: '3',
        platform: 'Agoda',
        price: 780,
        originalPrice: 880,
        currency: 'USD',
        rating: 4.4,
        reviews: 567,
        bookingUrl: 'https://agoda.com/affiliate-link-3',
        affiliateId: 'safarbot_agoda_1',
        commission: 9.1,
        features: ['Instant Confirmation', 'Best Rate Guarantee'],
        lastUpdated: '2024-02-15T11:15:00Z',
        isRecommended: true
      },
      {
        id: '4',
        platform: 'Hotels.com',
        price: 890,
        currency: 'USD',
        rating: 4.2,
        reviews: 445,
        bookingUrl: 'https://hotels.com/affiliate-link-4',
        affiliateId: 'safarbot_hotels_1',
        commission: 6.8,
        features: ['Price Match', 'Rewards Program'],
        lastUpdated: '2024-02-15T08:20:00Z'
      },
      {
        id: '5',
        platform: 'Trip.com',
        price: 820,
        originalPrice: 920,
        currency: 'USD',
        rating: 4.1,
        reviews: 234,
        bookingUrl: 'https://trip.com/affiliate-link-5',
        affiliateId: 'safarbot_trip_1',
        commission: 8.9,
        features: ['Best Price Guarantee', '24/7 Support'],
        lastUpdated: '2024-02-15T12:00:00Z'
      }
    ];

    // Simulate API delay
    setTimeout(() => {
      setComparisonData(mockData);
      setIsLoading(false);
    }, 1000);
  };

  const handleSort = (field: 'price' | 'rating' | 'commission') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedData = [...comparisonData].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortBy) {
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'rating':
        aValue = a.rating || 0;
        bValue = b.rating || 0;
        break;
      case 'commission':
        aValue = a.commission;
        bValue = b.commission;
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  const filteredData = sortedData.filter(item => 
    filterPlatform === 'all' || item.platform.toLowerCase().includes(filterPlatform.toLowerCase())
  );

  const getPriceChange = (item: PriceComparisonItem) => {
    if (!item.originalPrice) return null;
    const change = ((item.originalPrice - item.price) / item.originalPrice) * 100;
    return Math.round(change);
  };

  const handleBookingClick = (item: PriceComparisonItem) => {
    // Track affiliate click
    console.log(`Affiliate click: ${item.affiliateId}`);
    
    // In a real app, you would track this with analytics
    // analytics.track('affiliate_click', {
    //   platform: item.platform,
    //   affiliate_id: item.affiliateId,
    //   price: item.price,
    //   commission: item.commission
    // });
    
    // Open booking URL
    window.open(item.bookingUrl, '_blank');
  };

  const getBestDeal = () => {
    return comparisonData.reduce((best, current) => 
      current.price < best.price ? current : best
    );
  };

  const formatPrice = (price: number, currency: string) => {
    return `${currency === 'USD' ? '$' : '₹'}${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full border-b-2 border-blue-600 w-12 h-12 mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Loading Price Comparison</h3>
          <p className="text-slate-600">Finding the best deals for you...</p>
        </div>
      </div>
    );
  }

  const bestDeal = getBestDeal();

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100 p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Price Comparison for {destination}
          </h2>
          <p className="text-slate-600 font-medium">
            {type === 'flight' ? 'Flight' : 'Hotel'} • {dates.start} {dates.end && `- ${dates.end}`}
          </p>
        </div>
        
        {bestDeal && (
          <div className="mt-4 lg:mt-0">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">Best Deal</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">
                {formatPrice(bestDeal.price, bestDeal.currency)}
              </div>
              <div className="text-sm text-slate-600 font-medium">
                on {bestDeal.platform}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700 font-medium"
            >
              <option value="all">All Platforms</option>
              <option value="booking">Booking.com</option>
              <option value="expedia">Expedia</option>
              <option value="agoda">Agoda</option>
              <option value="hotels">Hotels.com</option>
              <option value="trip">Trip.com</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-slate-700">Sort by:</span>
          <button
            onClick={() => handleSort('price')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'price' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-slate-700 border border-blue-200 hover:bg-blue-50'
            }`}
          >
            Price {sortBy === 'price' && (sortOrder === 'asc' ? <SortAsc className="w-4 h-4 inline ml-1" /> : <SortDesc className="w-4 h-4 inline ml-1" />)}
          </button>
          <button
            onClick={() => handleSort('rating')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'rating' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-slate-700 border border-blue-200 hover:bg-blue-50'
            }`}
          >
            Rating {sortBy === 'rating' && (sortOrder === 'asc' ? <SortAsc className="w-4 h-4 inline ml-1" /> : <SortDesc className="w-4 h-4 inline ml-1" />)}
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="space-y-4">
        {filteredData.map((item) => {
          const priceChange = getPriceChange(item);
          return (
            <div
              key={item.id}
              className={`bg-white border rounded-xl p-6 transition-all duration-200 hover:shadow-lg ${
                item.isRecommended 
                  ? 'border-blue-200 shadow-md' 
                  : 'border-slate-200 hover:border-blue-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                {/* Platform Info */}
                <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      item.isRecommended ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                      <span className={`text-lg font-bold ${
                        item.isRecommended ? 'text-blue-600' : 'text-slate-600'
                      }`}>
                        {item.platform.charAt(0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-bold text-slate-800">{item.platform}</h3>
                      {item.isRecommended && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    
                    {item.rating && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(item.rating!) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-600 font-medium">
                          {item.rating} ({item.reviews?.toLocaleString()} reviews)
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {item.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex flex-col items-end space-y-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-3xl font-bold text-slate-800">
                        {formatPrice(item.price, item.currency)}
                      </span>
                      {priceChange && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                          -{priceChange}%
                        </span>
                      )}
                    </div>
                    
                    {item.originalPrice && (
                      <div className="text-sm text-slate-500 line-through">
                        {formatPrice(item.originalPrice, item.currency)}
                      </div>
                    )}
                    
                    <div className="text-xs text-slate-500 font-medium">
                      Updated {formatDate(item.lastUpdated)}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleBookingClick(item)}
                      className={`px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2 ${
                        item.isRecommended
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-white hover:bg-blue-50 text-slate-700 border border-blue-200'
                      }`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Book Now</span>
                    </button>
                    
                    <div className="text-xs text-slate-500 text-center">
                      Commission: {item.commission}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Affiliate Info Toggle */}
      <div className="mt-8 pt-6 border-t border-blue-200">
        <button
          onClick={() => setShowAffiliateInfo(!showAffiliateInfo)}
          className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center space-x-1"
        >
          <span>{showAffiliateInfo ? 'Hide' : 'Show'} Affiliate Information</span>
          <DollarSign className="w-4 h-4" />
        </button>
        
        {showAffiliateInfo && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="text-lg font-bold text-slate-800 mb-2">How Our Affiliate Program Works</h4>
            <p className="text-sm text-slate-700 mb-3">
              We partner with leading travel platforms to bring you the best deals. When you book through our links, 
              we earn a small commission at no extra cost to you. This helps us keep SafarBot free and continue improving our services.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-slate-700 font-medium">No extra cost to you</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-slate-700 font-medium">Same prices as direct booking</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-slate-700 font-medium">Helps support SafarBot</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceComparison; 