import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Crown,
  Eye,
  Edit,
  Shield,
  Loader2,
  AlertTriangle,
  Check,
  X,
  Clock,
  Search,
  Filter,
  Mail,
  Calendar,
  Activity,
  Star,
  UserCheck,
  Settings,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import ModernButton from './ui/ModernButton';
import ConfirmModal from './ConfirmModal';
import Dropdown from './ui/Dropdown';
import { collaborationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface Collaborator {
  user_id: string;
  name: string;
  email: string;
  role: 'owner' | 'viewer' | 'editor' | 'admin';
  status?: 'accepted' | 'pending' | 'rejected';
  joined_at: string;
  last_activity?: string;
}

interface Invitation {
  invitation_id: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  status: 'pending' | 'accepted' | 'rejected';
  invited_at: string;
  expires_at?: string;
  message?: string;
  accepted_at?: string;
  declined_at?: string;
}

interface CollaboratorsListProps {
  itineraryId: string;
  itineraryTitle?: string;
  isOwner: boolean;
  onInviteClick: () => void;
  refreshTrigger?: number; // When this changes, refresh the data
}

const CollaboratorsList: React.FC<CollaboratorsListProps> = ({
  itineraryId,
  itineraryTitle,
  isOwner,
  onInviteClick,
  refreshTrigger
}) => {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [owner, setOwner] = useState<Collaborator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [userToRemove, setUserToRemove] = useState<{id: string, name: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'joined' | 'activity'>('name');
  const [resendingInvitationId, setResendingInvitationId] = useState<string | null>(null);
  const [showResendModal, setShowResendModal] = useState(false);
  const [invitationToResend, setInvitationToResend] = useState<{id: string, email: string, itinerary_id: string} | null>(null);
  const [resendMessage, setResendMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Get current user's role in this collaboration
  const currentUserRole = useMemo(() => {
    if (isOwner) return 'owner';
    const userCollaborator = collaborators.find(c => c.user_id === user?.id);
    return userCollaborator?.role || 'viewer';
  }, [isOwner, collaborators, user?.id]);

  // Check if user can manage collaborators (owner or admin)
  const canManageCollaborators = isOwner || currentUserRole === 'admin';

  // Role options for dropdown
  const roleOptions = [
    { value: 'viewer', label: 'Viewer', icon: <Eye className="w-4 h-4" />, description: 'Can view the itinerary' },
    { value: 'editor', label: 'Editor', icon: <Edit className="w-4 h-4" />, description: 'Can edit the itinerary' },
    { value: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4" />, description: 'Can manage collaborators' }
  ];

  // Filter and sort collaborators
  const filteredAndSortedCollaborators = useMemo(() => {
    let filtered = collaborators.filter(collaborator => {
      const matchesSearch = searchQuery === '' || 
        collaborator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collaborator.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = filterRole === 'all' || collaborator.role === filterRole;
      
      return matchesSearch && matchesRole;
    });

    // Sort collaborators
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'role':
          const roleOrder: { [key: string]: number } = { 'admin': 0, 'editor': 1, 'viewer': 2, 'owner': -1 };
          return (roleOrder[a.role] || 3) - (roleOrder[b.role] || 3);
        case 'joined':
          return new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime();
        case 'activity':
          const aActivity = a.last_activity ? new Date(a.last_activity).getTime() : 0;
          const bActivity = b.last_activity ? new Date(b.last_activity).getTime() : 0;
          return bActivity - aActivity;
        default:
          return 0;
      }
    });

    return filtered;
  }, [collaborators, searchQuery, filterRole, sortBy]);

  // Filter invitations
  const filteredInvitations = useMemo(() => {
    return invitations.filter(invitation => {
      const matchesSearch = searchQuery === '' || 
        invitation.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [invitations, searchQuery]);

  const loadCollaborators = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await collaborationAPI.getCollaborators(itineraryId);
      setOwner(response.data.owner);
      setCollaborators(response.data.collaborators || []);
      setInvitations(response.data.invitations || []);
    } catch (err: any) {
      console.error('Error loading collaborators:', err);
      setError(err.message || 'Failed to load collaborators');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollaborators();
  }, [itineraryId]);

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadCollaborators();
    }
  }, [refreshTrigger]);

  const handleRemoveClick = (userId: string, userName: string) => {
    setUserToRemove({ id: userId, name: userName });
    setShowRemoveConfirm(true);
  };

  const handleRemoveCollaborator = async () => {
    if (!userToRemove) return;

    try {
      setRemovingUserId(userToRemove.id);
      await collaborationAPI.removeCollaborator(itineraryId, userToRemove.id);
      
      // Remove from local state
      setCollaborators(prev => prev.filter(c => c.user_id !== userToRemove.id));
      
      // Show success message
      showSuccess('Collaborator Removed', `${userToRemove.name} has been removed from the itinerary.`);
      
      // Close modal
      setShowRemoveConfirm(false);
      setUserToRemove(null);
    } catch (err: any) {
      console.error('Error removing collaborator:', err);
      
      // Extract error message from API response
      let errorMessage = 'Failed to remove collaborator';
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showError('Cannot Remove Collaborator', errorMessage);
    } finally {
      setRemovingUserId(null);
    }
  };

  const handleCancelRemove = () => {
    setShowRemoveConfirm(false);
    setUserToRemove(null);
  };

  const handleUpdateRole = async (userId: string, role: 'viewer' | 'editor' | 'admin') => {
    try {
      setUpdatingUserId(userId);
      
      // Call API to update role
      await collaborationAPI.updateCollaboratorRole(itineraryId, userId, role);
      
      // Update local state
      setCollaborators(prev => prev.map(c => 
        c.user_id === userId ? { ...c, role } : c
      ));
      
      setEditingUserId(null);
    } catch (err: any) {
      console.error('Error updating role:', err);
      
      // Extract error message from API response
      let errorMessage = 'Failed to update role';
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showError('Cannot Update Role', errorMessage);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const startEditing = (userId: string, currentRole: string) => {
    setEditingUserId(userId);
    setNewRole(currentRole as 'viewer' | 'editor' | 'admin');
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setNewRole('viewer');
  };

  const handleResendClick = (invitationId: string, email: string) => {
    setInvitationToResend({ 
      id: invitationId, 
      email, 
      itinerary_id: itineraryId 
    });
    setResendMessage('');
    setShowResendModal(true);
  };

  const handleResendInvitation = async () => {
    if (!invitationToResend) return;

    try {
      setResendingInvitationId(invitationToResend.id);
      await collaborationAPI.resendInvitation({
        invitation_id: invitationToResend.id,
        itinerary_id: invitationToResend.itinerary_id,
        email: invitationToResend.email,
        message: resendMessage || undefined
      });
      
      // Refresh the collaborators list
      await loadCollaborators();
      
      // Show success message
      setSuccessMessage(`Invitation successfully resent to ${invitationToResend.email}`);
      setShowSuccessMessage(true);
      
      // Close modal
      setShowResendModal(false);
      setInvitationToResend(null);
      setResendMessage('');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      console.error('Error resending invitation:', err);
      
      // Extract error message from API response
      let errorMessage = 'Failed to resend invitation';
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showError('Cannot Resend Invitation', errorMessage);
    } finally {
      setResendingInvitationId(null);
    }
  };

  const handleCancelResend = () => {
    setShowResendModal(false);
    setInvitationToResend(null);
    setResendMessage('');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-orange-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'editor':
        return <Edit className="w-4 h-4 text-green-600" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-blue-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'editor':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'viewer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'accepted':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading collaborators...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <span className="ml-2 text-red-600">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-900/5 dark:shadow-gray-900/20 overflow-hidden">
      {/* Modern Header with Gradient */}
      <div className="relative p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 dark:from-blue-400/5 dark:to-purple-400/5"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Users className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {itineraryTitle ? `Team for ${itineraryTitle}` : 'Collaboration Team'}
              </h3>
                <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span className="font-medium">{collaborators.length + 1} member{(collaborators.length + 1) !== 1 ? 's' : ''}</span>
                  </div>
                {invitations.length > 0 && (
                    <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{invitations.length} pending</span>
                    </div>
                  )}
                </div>
            </div>
          </div>
          
          {canManageCollaborators && (
            <ModernButton
              onClick={onInviteClick}
                variant="solid"
              size="sm"
                className="flex items-center space-x-1 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite</span>
            </ModernButton>
          )}
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg border transition-all duration-200 ${
                  showFilters 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Filter className="w-3 h-3" />
                <span className="text-xs font-medium">Filters</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="name">Name</option>
                      <option value="role">Role</option>
                      <option value="joined">Date Joined</option>
                      <option value="activity">Last Activity</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 space-y-6">
        {/* Owner Card */}
        {owner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 via-orange-400/10 to-red-400/10 dark:from-amber-400/5 dark:via-orange-400/5 dark:to-red-400/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-red-900/20 rounded-xl border border-amber-200/50 dark:border-amber-700/50 p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                      <Star className="w-3 h-3 text-white" />
                    </div>
              </div>
              <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {owner.name}
                      </h4>
                      <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-800 dark:text-amber-300 text-sm font-semibold rounded-full flex items-center space-x-1">
                        <Crown className="w-4 h-4" />
                        <span>Owner</span>
                  </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{owner.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {formatDate(owner.joined_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Itinerary Owner</div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">Full Access</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Team Members Section */}
        {filteredAndSortedCollaborators.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2">
                  <Users className="w-3 h-3 text-white" />
                </div>
                Team Members ({filteredAndSortedCollaborators.length})
            </h4>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {searchQuery && `Filtered from ${collaborators.length} total`}
              </div>
            </div>
            
            <div className="grid gap-3">
              <AnimatePresence>
                {filteredAndSortedCollaborators.map((collaborator, index) => (
          <motion.div
            key={collaborator.user_id}
                    initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="group relative"
          >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-indigo-400/5 to-purple-400/5 dark:from-blue-400/3 dark:via-indigo-400/3 dark:to-purple-400/3 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:border-blue-200 dark:group-hover:border-blue-700/50">
                      <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                              <span className="text-white font-bold text-xs">
                  {collaborator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                              <UserCheck className="w-1.5 h-1.5 text-white" />
                            </div>
                          </div>
                          
              <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="text-base font-semibold text-gray-900 dark:text-white">
                    {collaborator.name}
                              </h5>
                  
                  {/* Role Display/Edit */}
                  {editingUserId === collaborator.user_id ? (
                                <div className="flex items-center space-x-2 bg-white dark:bg-gray-700 p-2 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                      <div className="w-48">
                        <Dropdown
                          options={roleOptions}
                          value={newRole}
                          onChange={(value) => setNewRole(value as 'viewer' | 'editor' | 'admin')}
                          placeholder="Select role"
                          size="sm"
                          variant="outline"
                          disabled={updatingUserId === collaborator.user_id}
                                    />
                      </div>
                      <button
                        onClick={() => handleUpdateRole(collaborator.user_id, newRole)}
                        disabled={updatingUserId === collaborator.user_id}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 shadow-sm"
                        title="Save role"
                      >
                        {updatingUserId === collaborator.user_id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        <span>Save</span>
                      </button>
                      <button
                        onClick={cancelEditing}
                        disabled={updatingUserId === collaborator.user_id}
                                    className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 shadow-sm"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(collaborator.role)} flex items-center space-x-1 shadow-sm`}>
                        {getRoleIcon(collaborator.role)}
                                    <span className="capitalize">{collaborator.role}</span>
                      </span>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(collaborator.status || 'accepted')} flex items-center space-x-1`}>
                        {getStatusIcon(collaborator.status || 'accepted')}
                                    <span className="capitalize">{collaborator.status || 'accepted'}</span>
                      </span>
                    </div>
                  )}
                </div>
                            
                            <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>{collaborator.email}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>Joined {formatDate(collaborator.joined_at)}</span>
                              </div>
                  {collaborator.last_activity && (
                                <div className="flex items-center space-x-1">
                                  <Activity className="w-3 h-3" />
                                  <span>Active {formatDate(collaborator.last_activity)}</span>
                                </div>
                              )}
                            </div>
              </div>
            </div>

            {/* Actions */}
                        <div className="flex items-center space-x-1">
            {canManageCollaborators && collaborator.user_id !== user?.id && editingUserId !== collaborator.user_id && (
                            <>
                              <button
                                onClick={() => startEditing(collaborator.user_id, collaborator.role)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                                title="Change role"
                              >
                                <Settings className="w-3 h-3" />
                              </button>
                {removingUserId === collaborator.user_id ? (
                                <div className="flex items-center space-x-1 text-gray-500 px-2 py-1">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span className="text-xs">Removing...</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRemoveClick(collaborator.user_id, collaborator.name)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                    title="Remove collaborator"
                  >
                                  <Trash2 className="w-3 h-3" />
                  </button>
                )}
                            </>
                          )}
                        </div>
                      </div>
              </div>
          </motion.div>
              ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Pending Invitations Section */}
        {filteredInvitations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mr-2">
                  <Clock className="w-3 h-3 text-white" />
                </div>
                Pending Invitations ({filteredInvitations.length})
            </h4>
            </div>
            
            <div className="grid gap-3">
              <AnimatePresence>
                {filteredInvitations.map((invitation, index) => (
                <motion.div
                  key={invitation.invitation_id}
                    initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="group relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 via-orange-400/5 to-yellow-400/5 dark:from-amber-400/3 dark:via-orange-400/3 dark:to-yellow-400/3 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                    <div className="relative bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-200/50 dark:border-amber-700/50 p-4 shadow-sm hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/25">
                              <span className="text-white font-bold text-xs">
                        {invitation.email.split('@')[0].substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                              <Clock className="w-1.5 h-1.5 text-white" />
                            </div>
                          </div>
                          
                    <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="text-base font-semibold text-gray-900 dark:text-white">
                                {invitation.email}
                              </h5>
                      <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(invitation.role)} flex items-center space-x-1 shadow-sm`}>
                          {getRoleIcon(invitation.role)}
                                  <span className="capitalize">{invitation.role}</span>
                        </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invitation.status)} flex items-center space-x-1`}>
                          {getStatusIcon(invitation.status)}
                                  <span className="capitalize">{invitation.status}</span>
                        </span>
                      </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>Invited {formatDate(invitation.invited_at)}</span>
                              </div>
                        {invitation.expires_at && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Expires {formatDate(invitation.expires_at)}</span>
                                </div>
                              )}
                            </div>
                            
                      {invitation.message && (
                              <div className="mt-1 p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-amber-200/50 dark:border-amber-700/50">
                                <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                          "{invitation.message}"
                        </p>
                              </div>
                            )}
                          </div>
                        </div>
                    
                    {/* Resend Button */}
                    {canManageCollaborators && (
                      <div className="flex items-center space-x-1">
                        {resendingInvitationId === invitation.invitation_id ? (
                          <div className="flex items-center space-x-1 text-gray-500 px-2 py-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="text-xs">Resending...</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleResendClick(invitation.invitation_id, invitation.email)}
                            className="flex items-center space-x-1 px-2 py-1.5 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all duration-200"
                            title="Resend invitation"
                          >
                            <Mail className="w-3 h-3" />
                            <span className="text-xs font-medium">Resend</span>
                          </button>
                        )}
                      </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredAndSortedCollaborators.length === 0 && filteredInvitations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                <UserPlus className="w-3 h-3 text-white" />
              </div>
            </div>
            
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No matching members found' : 'No team members yet'}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm">
              {searchQuery 
                ? 'Try adjusting your search terms or filters to find team members.'
                : 'Invite people to collaborate on this itinerary and build your dream team.'
              }
            </p>
            
            {canManageCollaborators && (
              <ModernButton
                onClick={onInviteClick}
                variant="solid"
                size="sm"
                className="shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Invite Team Members
              </ModernButton>
            )}
          </motion.div>
        )}
      </div>

      {/* Resend Invitation Modal */}
      {showResendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Resend Invitation
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send a new invitation email
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipient Email
                  </label>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {invitationToResend?.email}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={resendMessage}
                    onChange={(e) => setResendMessage(e.target.value)}
                    placeholder="Add a personal message to the invitation..."
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium">What happens when you resend:</p>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• A new invitation email will be sent</li>
                        <li>• The invitation expiry date will be reset</li>
                        <li>• Previous invitation links will become invalid</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancelResend}
                  disabled={resendingInvitationId !== null}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResendInvitation}
                  disabled={resendingInvitationId !== null}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {resendingInvitationId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Resending...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Resend Invitation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      <AnimatePresence>
        {showSuccessMessage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSuccessMessage(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Invitation Sent!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {successMessage}
                </p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-green-800 dark:text-green-200">
                  <p className="font-medium">What happens next:</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• The recipient will receive a new invitation email</li>
                    <li>• They can accept or decline the invitation</li>
                    <li>• You'll be notified when they respond</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        )}
      </AnimatePresence>

      {/* Remove Confirmation Modal */}
      <ConfirmModal
        isOpen={showRemoveConfirm}
        onClose={handleCancelRemove}
        onConfirm={handleRemoveCollaborator}
        title="Remove Collaborator"
        message={`Are you sure you want to remove ${userToRemove?.name} from this collaboration? This action cannot be undone.`}
        confirmText={removingUserId ? "Removing..." : "Remove"}
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default CollaboratorsList;
