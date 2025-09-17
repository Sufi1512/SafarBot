import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MapPin, 
  Grid,
  List,
  Search,
  Plus,
  Filter,
  X,
  Bookmark
} from 'lucide-react';
import Dropdown, { DropdownOption } from '../../components/ui/Dropdown';
import { savedItineraryAPI } from '../../services/cachedApi';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthenticatedApi } from '../../hooks/useAuthenticatedApi';
import ItineraryCard from '../../components/ItineraryCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ShareModal from '../../components/ShareModal';
import CollaborationInviteModal from '../../components/CollaborationInviteModal';
import CollaboratorsList from '../../components/CollaboratorsList';
import CollaborationNotifications from '../../components/CollaborationNotifications';

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
  const { callApi } = useAuthenticatedApi();
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [filteredItineraries, setFilteredItineraries] = useState<SavedItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsRefreshing] = useState(false);
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
  const [editingItineraryId, setEditingItineraryId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Cache for full itinerary data to avoid unnecessary API calls
  const [itineraryCache, setItineraryCache] = useState<Map<string, any>>(new Map());
  
  // Collaboration state
  const [collaborationInviteModalOpen, setCollaborationInviteModalOpen] = useState(false);
  const [collaborationNotificationsOpen, setCollaborationNotificationsOpen] = useState(false);
  const [selectedItineraryForCollaboration, setSelectedItineraryForCollaboration] = useState<SavedItinerary | null>(null);
  const [showCollaborators, setShowCollaborators] = useState<string | null>(null);

  // Dropdown options
  const statusOptions: DropdownOption[] = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ];

  const sortOptions: DropdownOption[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'views', label: 'Most Views' },
    { value: 'likes', label: 'Most Likes' },
  ];

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

  const loadItineraries = async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      const skip = (page - 1) * itemsPerPage;
      const data = await callApi(() => savedItineraryAPI.getItineraries({
        limit: itemsPerPage,
        skip: skip,
        status: statusFilter === 'all' ? undefined : statusFilter as any,
        is_favorite: favoritesOnly || undefined
      }));
      
      setItineraries(data);
      setTotalItems(data.length); // In a real app, you'd get total count from API
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Error loading itineraries:', err);
      setError(err.message || 'Failed to load saved itineraries');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Removed unused handleRefresh function

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
      await callApi(() => savedItineraryAPI.toggleFavorite(itineraryId));
      
      // Update cache if it exists
      setItineraryCache(prev => {
        const newCache = new Map(prev);
        const cachedItinerary = newCache.get(itineraryId);
        if (cachedItinerary) {
          newCache.set(itineraryId, { ...cachedItinerary, is_favorite: !cachedItinerary.is_favorite });
        }
        return newCache;
      });
      
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

  const handleEditItinerary = async (itineraryId: string) => {
    try {
      setEditingItineraryId(itineraryId);
      
      // Check cache first
      let fullItinerary = itineraryCache.get(itineraryId);
      
      if (!fullItinerary) {
        // Fetch the full itinerary data with days array if not in cache
        fullItinerary = await callApi(() => savedItineraryAPI.getItinerary(itineraryId));
        
        // Cache the result
        setItineraryCache(prev => new Map(prev).set(itineraryId, fullItinerary));
      }
      
      // Navigate to edit page with complete itinerary data
      navigate('/edit-itinerary', { 
        state: { 
          itineraryData: fullItinerary,
          isEditing: true 
        } 
      });
    } catch (error: any) {
      console.error('Error loading itinerary for editing:', error);
      alert('Failed to load itinerary for editing. Please try again.');
    } finally {
      setEditingItineraryId(null);
    }
  };

  const handleDeleteItinerary = async (itineraryId: string) => {
    if (!window.confirm('Are you sure you want to delete this itinerary? This action cannot be undone.')) {
      return;
    }

    try {
      // Call API to delete itinerary
      await callApi(() => savedItineraryAPI.deleteItinerary(itineraryId));
      
      // Remove from local state
      setItineraries(prev => prev.filter(i => i.id !== itineraryId));
      
      // Remove from cache
      setItineraryCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(itineraryId);
        return newCache;
      });
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
      const shareResponse = await callApi(() => savedItineraryAPI.shareItinerary(itineraryId));
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

  // Collaboration handlers
  const handleInviteCollaborator = (itinerary: SavedItinerary) => {
    setSelectedItineraryForCollaboration(itinerary);
    setCollaborationInviteModalOpen(true);
  };

  const handleShowCollaborators = (itineraryId: string) => {
    setShowCollaborators(showCollaborators === itineraryId ? null : itineraryId);
  };

  const handleInvitationSent = () => {
    // Refresh the itineraries to show updated collaboration status
    loadItineraries(currentPage);
  };

  const handleInvitationAccepted = (_itineraryId: string) => {
    // Refresh the itineraries to show the new collaboration
    loadItineraries(currentPage);
  };

  const handleViewItinerary = (itineraryId: string) => {
    navigate(`/saved-itinerary/${itineraryId}`);
  };

  const handleCreateNew = () => {
    navigate('/trip-planner');
  };

  // UI helpers for filters
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    favoritesOnly ||
    sortBy !== 'newest';

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setFavoritesOnly(false);
    setSortBy('newest');
    setCurrentPage(1);
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
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stats and Info Bar */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-blue-200/50 dark:border-gray-600/50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {filteredItineraries.length} of {itineraries.length} itineraries
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {itineraries.length === 0 ? 'No itineraries yet' : 
                 filteredItineraries.length === itineraries.length ? 'All itineraries shown' : 
                 'Filtered results'}
              </div>
            </div>
          </div>
          
          {hasActiveFilters && (
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-full font-medium">
                Active Filters
              </div>
              <motion.button
                onClick={clearAllFilters}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Clear all
              </motion.button>
            </motion.div>
          )}
        </div>
        
        <motion.button
          onClick={handleCreateNew}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          <span>Create New Itinerary</span>
        </motion.button>
      </motion.div>

      {/* Enhanced Search and Filters */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-0 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search itineraries by title, location, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-sm border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
            />
            {searchQuery && (
              <motion.button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Desktop Filters */}
            <div className="hidden lg:flex flex-wrap items-center justify-between w-full gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-[180px]">
                  <Dropdown
                    options={statusOptions}
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value as any)}
                    label="Status"
                    size="sm"
                    variant="outline"
                  />
                </div>

                <div className="min-w-[180px]">
                  <Dropdown
                    options={sortOptions}
                    value={sortBy}
                    onChange={(value) => setSortBy(value as any)}
                    label="Sort by"
                    size="sm"
                    variant="outline"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="min-w-[180px]">
                  <motion.button
                    onClick={() => setFavoritesOnly(!favoritesOnly)}
                    className={`w-full px-2 py-1.5 text-xs rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-1.5 font-medium shadow-sm hover:shadow-md ${
                      favoritesOnly
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 ring-4 ring-red-500/20 shadow-lg'
                        : 'bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-cyan-400 dark:hover:border-cyan-500'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Heart className={`w-3 h-3 ${favoritesOnly ? 'fill-current' : ''}`} />
                    <span>Favorites Only</span>
                  </motion.button>
                </div>

                <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <motion.button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2.5 transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Grid className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2.5 transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <List className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden flex items-center justify-between">
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </motion.button>
            </div>
          </div>

          {/* Mobile Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <Dropdown
                    options={statusOptions}
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value as any)}
                    label="Status"
                    size="sm"
                    variant="outline"
                  />

                  <Dropdown
                    options={sortOptions}
                    value={sortBy}
                    onChange={(value) => setSortBy(value as any)}
                    label="Sort by"
                    size="sm"
                    variant="outline"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setFavoritesOnly(!favoritesOnly)}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2 text-sm font-medium ${
                      favoritesOnly 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300' 
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favoritesOnly ? 'fill-current' : ''}`} />
                    <span>Favorites Only</span>
                  </button>

                  <div className="flex border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 transition-all duration-200 ${
                        viewMode === 'grid' 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 transition-all duration-200 ${
                        viewMode === 'list' 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {hasActiveFilters && (
          <motion.div 
            className="mt-4 flex flex-wrap items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Active Filters:</span>
            {searchQuery.trim() !== '' && (
              <motion.button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                title="Remove search filter"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <span>Search: "{searchQuery}"</span>
                <X className="w-3 h-3" />
              </motion.button>
            )}
            {statusFilter !== 'all' && (
              <motion.button
                onClick={() => setStatusFilter('all')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                title="Clear status filter"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <span>Status: {statusFilter}</span>
                <X className="w-3 h-3" />
              </motion.button>
            )}
            {favoritesOnly && (
              <motion.button
                onClick={() => setFavoritesOnly(false)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                title="Show all (not just favorites)"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Heart className="w-3 h-3 fill-current" />
                <span>Favorites</span>
                <X className="w-3 h-3" />
              </motion.button>
            )}
            {sortBy !== 'newest' && (
              <motion.button
                onClick={() => setSortBy('newest')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                title="Reset sort"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <span>Sort: {sortBy}</span>
                <X className="w-3 h-3" />
              </motion.button>
            )}
            <motion.button
              onClick={clearAllFilters}
              className="ml-auto inline-flex items-center px-3 py-1.5 rounded-lg text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Clear all
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Itineraries Grid/List */}
      <AnimatePresence mode="wait">
        {filteredItineraries.length > 0 ? (
          <motion.div 
            className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
            }
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <AnimatePresence>
              {filteredItineraries.map((itinerary, index) => (
                <motion.div
                  key={itinerary.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -5, 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <ItineraryCard
                    itinerary={itinerary}
                    onToggleFavorite={handleToggleFavorite}
                    onEdit={handleEditItinerary}
                    onDelete={handleDeleteItinerary}
                    onShare={handleShareItinerary}
                    onView={handleViewItinerary}
                    onInviteCollaborator={handleInviteCollaborator}
                    onShowCollaborators={handleShowCollaborators}
                    viewMode={viewMode}
                    editingItineraryId={editingItineraryId}
                    isOwner={true}
                    isCollaborative={false}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5, type: "spring", stiffness: 200 }}
            >
              <MapPin className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
            </motion.div>
            <motion.h3 
              className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              {searchQuery || statusFilter !== 'all' || favoritesOnly 
                ? 'No itineraries found' 
                : 'No itineraries yet'
              }
            </motion.h3>
            <motion.p 
              className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              {searchQuery || statusFilter !== 'all' || favoritesOnly
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Start planning your next adventure by creating your first itinerary. Our AI will help you build the perfect travel plan.'
              }
            </motion.p>
            {!searchQuery && statusFilter === 'all' && !favoritesOnly && (
              <motion.button 
                onClick={handleCreateNew}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Your First Itinerary
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collaborators List */}
      {showCollaborators && (
        <div className="mt-8">
          <CollaboratorsList
            itineraryId={showCollaborators}
            isOwner={true}
            onInviteClick={() => {
              const itinerary = itineraries.find(i => i.id === showCollaborators);
              if (itinerary) {
                handleInviteCollaborator(itinerary);
              }
            }}
          />
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

      {/* Collaboration Invite Modal */}
      {selectedItineraryForCollaboration && (
        <CollaborationInviteModal
          isOpen={collaborationInviteModalOpen}
          onClose={() => {
            setCollaborationInviteModalOpen(false);
            setSelectedItineraryForCollaboration(null);
          }}
          itineraryId={selectedItineraryForCollaboration.id}
          itineraryTitle={selectedItineraryForCollaboration.title}
          onInviteSent={handleInvitationSent}
        />
      )}

      {/* Collaboration Notifications Modal */}
      <CollaborationNotifications
        isOpen={collaborationNotificationsOpen}
        onClose={() => setCollaborationNotificationsOpen(false)}
        onInvitationAccepted={handleInvitationAccepted}
      />
    </motion.div>
  );
};

export default SavedPage;
