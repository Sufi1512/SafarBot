import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MapPin, 
  Grid,
  List,
  Search,
  Bookmark
} from 'lucide-react';
import { savedItineraryAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ItineraryCard from '../../components/ItineraryCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ShareModal from '../../components/ShareModal';

interface SavedItinerary {
  id: string;
  title: string;
  description?: string;
  destination: string;
  country: string;
  city: string;
  duration_days: number;
  budget?: number;
  travel_style: string[];
  interests: string[];
  total_estimated_cost?: number;
  is_favorite: boolean;
  tags: string[];
  cover_image?: string;
  status: string;
  views_count: number;
  likes_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
}

const SavedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [filteredItineraries, setFilteredItineraries] = useState<SavedItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'views' | 'likes'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<{title: string, url: string, description?: string} | null>(null);

  // Load saved itineraries
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/');
      return;
    }

    loadItineraries(currentPage);
  }, [isAuthenticated, user, navigate, currentPage]);

  // Reload data when filters change
  useEffect(() => {
    if (isAuthenticated && user) {
      setCurrentPage(1);
      loadItineraries(1);
    }
  }, [statusFilter, favoritesOnly]);

  // Filter and sort itineraries
  useEffect(() => {
    let filtered = [...itineraries];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(itinerary =>
        itinerary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itinerary.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itinerary.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(itinerary => itinerary.status === statusFilter);
    }

    // Favorites filter
    if (favoritesOnly) {
      filtered = filtered.filter(itinerary => itinerary.is_favorite);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'views':
          return b.views_count - a.views_count;
        case 'likes':
          return b.likes_count - a.likes_count;
        default:
          return 0;
      }
    });

    setFilteredItineraries(filtered);
  }, [itineraries, searchQuery, statusFilter, favoritesOnly, sortBy]);

  const loadItineraries = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const skip = (page - 1) * itemsPerPage;
      const data = await savedItineraryAPI.getItineraries({
        limit: itemsPerPage,
        skip: skip,
        status: statusFilter === 'all' ? undefined : statusFilter as any,
        is_favorite: favoritesOnly || undefined
      });
      
      setItineraries(data);
      setTotalItems(data.length); // In a real app, you'd get total count from API
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Error loading itineraries:', err);
      setError(err.message || 'Failed to load saved itineraries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (itineraryId: string) => {
    try {
      // Find the itinerary
      const itinerary = itineraries.find(i => i.id === itineraryId);
      if (!itinerary) return;

      // Optimistically update the UI
      setItineraries(prev => prev.map(i => 
        i.id === itineraryId 
          ? { ...i, is_favorite: !i.is_favorite }
          : i
      ));

      // Call API to update favorite status
      await savedItineraryAPI.toggleFavorite(itineraryId);
      
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      // Revert the optimistic update
      setItineraries(prev => prev.map(i => 
        i.id === itineraryId 
          ? { ...i, is_favorite: !i.is_favorite }
          : i
      ));
      alert('Failed to update favorite status. Please try again.');
    }
  };

  const handleEditItinerary = (itineraryId: string) => {
    const itinerary = itineraries.find(i => i.id === itineraryId);
    if (itinerary) {
      // Navigate to edit page with itinerary data
      navigate('/edit-itinerary', { 
        state: { 
          itineraryData: itinerary,
          isEditing: true 
        } 
      });
    }
  };

  const handleDeleteItinerary = async (itineraryId: string) => {
    if (!window.confirm('Are you sure you want to delete this itinerary? This action cannot be undone.')) {
      return;
    }

    try {
      // Call API to delete itinerary
      await savedItineraryAPI.deleteItinerary(itineraryId);
      
      // Remove from local state
      setItineraries(prev => prev.filter(i => i.id !== itineraryId));
    } catch (err: any) {
      console.error('Error deleting itinerary:', err);
      alert('Failed to delete itinerary. Please try again.');
    }
  };

  const handleShareItinerary = async (itineraryId: string) => {
    try {
      const itinerary = itineraries.find(i => i.id === itineraryId);
      if (!itinerary) return;

      // Call API to share itinerary and get public link
      const shareResponse = await savedItineraryAPI.shareItinerary(itineraryId);
      const shareUrl = `${window.location.origin}${shareResponse.public_url}`;
      
      // Update the itinerary in local state to reflect it's now public
      setItineraries(prev => prev.map(i => 
        i.id === itineraryId 
          ? { ...i, is_public: true, shares_count: i.shares_count + 1 }
          : i
      ));
      
      // Show share modal
      setShareData({
        title: itinerary.title,
        url: shareUrl,
        description: `Check out my travel itinerary for ${itinerary.destination}`
      });
      setShowShareModal(true);
    } catch (err: any) {
      console.error('Error sharing itinerary:', err);
      alert('Failed to share itinerary. Please try again.');
    }
  };

  const handleViewItinerary = (itineraryId: string) => {
    navigate(`/saved-itinerary/${itineraryId}`);
  };

  const handleCreateNew = () => {
    navigate('/trip-planner');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading your saved itineraries..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-red-500 mb-4">
          <Bookmark className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Itineraries</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => loadItineraries()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Itineraries</h1>
          <p className="text-gray-600 mt-1">
            {filteredItineraries.length} of {itineraries.length} itineraries
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <MapPin className="w-4 h-4" />
            <span>Create New</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search itineraries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="views">Most Views</option>
              <option value="likes">Most Likes</option>
            </select>

            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`px-3 py-2 rounded-lg border transition-colors flex items-center space-x-2 ${
                favoritesOnly 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${favoritesOnly ? 'fill-current' : ''}`} />
              <span>Favorites</span>
            </button>

            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Itineraries Grid/List */}
      {filteredItineraries.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {filteredItineraries.map((itinerary) => (
            <ItineraryCard
              key={itinerary.id}
              itinerary={itinerary}
              onToggleFavorite={handleToggleFavorite}
              onEdit={handleEditItinerary}
              onDelete={handleDeleteItinerary}
              onShare={handleShareItinerary}
              onView={handleViewItinerary}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'all' || favoritesOnly 
              ? 'No itineraries found' 
              : 'No itineraries yet'
            }
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {searchQuery || statusFilter !== 'all' || favoritesOnly
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Start planning your next adventure by creating your first itinerary. Our AI will help you build the perfect travel plan.'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && !favoritesOnly && (
            <button 
              onClick={handleCreateNew}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Create Your First Itinerary
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredItineraries.length > 0 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === Math.ceil(totalItems / itemsPerPage) || 
                  Math.abs(page - currentPage) <= 2
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareData && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setShareData(null);
          }}
          title={shareData.title}
          url={shareData.url}
          description={shareData.description}
        />
      )}
    </div>
  );
};

export default SavedPage;
