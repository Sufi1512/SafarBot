import React, { useState, useEffect } from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  ExternalLink, 
  Star, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
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
  passengers?: number;
  guests?: number;
}

const PriceComparison: React.FC<PriceComparisonProps> = ({
  type,
  destination,
  dates,
  passengers = 1,
  guests = 1
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
        features: ['Free Night Program', 'Price Match'],
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
        features: ['Asian Market Specialists', 'Multi-language Support'],
        lastUpdated: '2024-02-15T12:00:00Z'
      }
    ];

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

  const filteredData = filterPlatform === 'all' 
    ? sortedData 
    : sortedData.filter(item => item.platform.toLowerCase().includes(filterPlatform.toLowerCase()));

  const getPriceChange = (item: PriceComparisonItem) => {
    if (!item.originalPrice) return null;
    const change = item.originalPrice - item.price;
    const percentage = (change / item.originalPrice) * 100;
    return { change, percentage };
  };

  const handleBookingClick = (item: PriceComparisonItem) => {
    // Track affiliate click
    console.log('Affiliate click tracked:', {
      platform: item.platform,
      affiliateId: item.affiliateId,
      price: item.price,
      commission: item.commission,
      timestamp: new Date().toISOString()
    });

    // Open booking URL in new tab
    window.open(item.bookingUrl, '_blank');
  };

  const getBestDeal = () => {
    return comparisonData.reduce((best, current) => 
      current.price < best.price ? current : best
    );
  };

  const bestDeal = getBestDeal();

  if (isLoading) {
    return (
      <div className="bg-white/10 rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-300">Comparing prices across platforms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Price Comparison</h2>
          <p className="text-gray-300">
            {type === 'flight' ? 'Flight' : 'Hotel'} prices for {destination}
          </p>
        </div>
        <button
          onClick={() => setShowAffiliateInfo(!showAffiliateInfo)}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
        >
          <DollarSign className="w-4 h-4" />
          <span>Affiliate Info</span>
        </button>
      </div>

      {/* Affiliate Information */}
      {showAffiliateInfo && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Affiliate Partnership</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-300 mb-2">Commission Rates:</p>
              <ul className="space-y-1 text-gray-300">
                <li>• Booking.com: 8.5%</li>
                <li>• Expedia: 7.2%</li>
                <li>• Agoda: 9.1%</li>
                <li>• Hotels.com: 6.8%</li>
                <li>• Trip.com: 8.9%</li>
              </ul>
            </div>
            <div>
              <p className="text-gray-300 mb-2">Benefits:</p>
              <ul className="space-y-1 text-gray-300">
                <li>• No extra cost to you</li>
                <li>• Same prices as direct booking</li>
                <li>• Supports SafarBot development</li>
                <li>• Exclusive member benefits</li>
              </ul>
            </div>
            <div>
              <p className="text-gray-300 mb-2">How it works:</p>
              <ul className="space-y-1 text-gray-300">
                <li>• Click any booking link</li>
                <li>• Complete your booking</li>
                <li>• We earn a small commission</li>
                <li>• You get the same price</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Best Deal Highlight */}
      {bestDeal && (
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <p className="font-semibold text-green-400">Best Deal Found!</p>
                <p className="text-sm text-gray-300">
                  {bestDeal.platform} - ${bestDeal.price} ({bestDeal.commission}% commission)
                </p>
              </div>
            </div>
            <button
              onClick={() => handleBookingClick(bestDeal)}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Book Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/10 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-300" />
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
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
          <span className="text-sm text-gray-300">Sort by:</span>
          {[
            { key: 'price', label: 'Price' },
            { key: 'rating', label: 'Rating' },
            { key: 'commission', label: 'Commission' }
          ].map((sort) => (
            <button
              key={sort.key}
              onClick={() => handleSort(sort.key as any)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                sortBy === sort.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <span>{sort.label}</span>
              {sortBy === sort.key && (
                sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Comparison Table */}
      <div className="bg-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Features
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredData.map((item) => {
                const priceChange = getPriceChange(item);
                return (
                  <tr key={item.id} className={`hover:bg-white/5 ${item.isRecommended ? 'bg-purple-600/10' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {item.platform.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{item.platform}</div>
                          {item.isRecommended && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Recommended
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium">${item.price}</div>
                        {priceChange && (
                          <div className="flex items-center space-x-1 text-xs text-green-400">
                            <TrendingDown className="w-3 h-3" />
                            <span>Save ${priceChange.change} ({priceChange.percentage.toFixed(1)}%)</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.rating ? (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm">{item.rating}</span>
                          <span className="text-xs text-gray-400">({item.reviews})</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <span className="font-medium">{item.commission}%</span>
                        <div className="text-xs text-gray-400">
                          ${((item.price * item.commission) / 100).toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.features.slice(0, 2).map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                          >
                            {feature}
                          </span>
                        ))}
                        {item.features.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{item.features.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(item.lastUpdated).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleBookingClick(item)}
                        className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-sm">Book</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Price Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">${Math.min(...comparisonData.map(d => d.price))}</p>
            <p className="text-sm text-gray-300">Lowest Price</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">${Math.max(...comparisonData.map(d => d.price))}</p>
            <p className="text-sm text-gray-300">Highest Price</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">${(comparisonData.reduce((sum, d) => sum + d.price, 0) / comparisonData.length).toFixed(0)}</p>
            <p className="text-sm text-gray-300">Average Price</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">${(comparisonData.reduce((sum, d) => sum + (d.price * d.commission / 100), 0)).toFixed(2)}</p>
            <p className="text-sm text-gray-300">Total Commission</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceComparison; 