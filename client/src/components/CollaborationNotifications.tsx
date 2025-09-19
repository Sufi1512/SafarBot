import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  UserPlus, 
  Check, 
  X, 
  Clock, 
  Loader2,
  AlertTriangle,
  Users
} from 'lucide-react';
import ModernButton from './ui/ModernButton';
import { collaborationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Invitation {
  invitation_id: string;
  invitation_token: string;
  itinerary: {
    id: string;
    title: string;
    destination: string;
    cover_image?: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
  role: 'viewer' | 'editor' | 'admin';
  message?: string;
  expires_at: string;
  created_at: string;
}

interface CollaborationNotificationsProps {
  isOpen: boolean;
  onClose: () => void;
  onInvitationAccepted: (itineraryId: string) => void;
}

const CollaborationNotifications: React.FC<CollaborationNotificationsProps> = ({
  isOpen,
  onClose,
  onInvitationAccepted
}) => {
  const { } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingInvitations, setProcessingInvitations] = useState<Set<string>>(new Set());

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await collaborationAPI.getInvitations();
      setInvitations(response.data.invitations || []);
    } catch (err: any) {
      console.error('Error loading invitations:', err);
      setError(err.userMessage || err.message || 'Failed to load invitations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadInvitations();
    }
  }, [isOpen]);

  const handleAcceptInvitation = async (invitation: Invitation) => {
    try {
      setProcessingInvitations(prev => new Set(prev).add(invitation.invitation_id));
      
      const response = await collaborationAPI.acceptInvitation(invitation.invitation_token);
      
      // Remove from local state
      setInvitations(prev => prev.filter(inv => inv.invitation_id !== invitation.invitation_id));
      
      // Notify parent component with the new itinerary ID
      const newItineraryId = response.data?.itinerary_id || invitation.itinerary.id;
      onInvitationAccepted(newItineraryId);
      
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      alert(err.userMessage || err.message || 'Failed to accept invitation');
    } finally {
      setProcessingInvitations(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitation.invitation_id);
        return newSet;
      });
    }
  };

  const handleDeclineInvitation = async (invitation: Invitation) => {
    try {
      setProcessingInvitations(prev => new Set(prev).add(invitation.invitation_id));
      
      await collaborationAPI.declineInvitation(invitation.invitation_token);
      
      // Remove from local state
      setInvitations(prev => prev.filter(inv => inv.invitation_id !== invitation.invitation_id));
      
    } catch (err: any) {
      console.error('Error declining invitation:', err);
      alert(err.userMessage || err.message || 'Failed to decline invitation');
    } finally {
      setProcessingInvitations(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitation.invitation_id);
        return newSet;
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'editor':
        return <UserPlus className="w-4 h-4 text-green-600" />;
      case 'viewer':
        return <Bell className="w-4 h-4 text-blue-600" />;
      default:
        return <UserPlus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[80vh] overflow-hidden"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Collaboration Invitations
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading invitations...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <span className="ml-2 text-red-600">{error}</span>
                </div>
              ) : invitations.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No pending invitations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You don't have any collaboration invitations at the moment.
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {invitations.map((invitation) => {
                    const expired = isExpired(invitation.expires_at);
                    const processing = processingInvitations.has(invitation.invitation_id);
                    
                    return (
                      <motion.div
                        key={invitation.invitation_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border-2 ${
                          expired 
                            ? 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/10'
                            : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          {/* Itinerary Image */}
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            {invitation.itinerary.cover_image ? (
                              <img 
                                src={invitation.itinerary.cover_image} 
                                alt={invitation.itinerary.title}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <Users className="w-8 h-8 text-white" />
                            )}
                          </div>

                          {/* Invitation Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                {invitation.itinerary.title}
                              </h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(invitation.role)}`}>
                                {getRoleIcon(invitation.role)}
                                <span className="ml-1 capitalize">{invitation.role}</span>
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <strong>{invitation.owner.name}</strong> invited you to collaborate on this itinerary
                            </p>
                            
                            <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                              Destination: {invitation.itinerary.destination}
                            </p>
                            
                            {invitation.message && (
                              <div className="bg-white dark:bg-gray-600 rounded-lg p-3 mb-3">
                                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                  "{invitation.message}"
                                </p>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Expires {formatDate(invitation.expires_at)}</span>
                                </div>
                                {expired && (
                                  <span className="text-red-600 font-medium">Expired</span>
                                )}
                              </div>
                              
                              {!expired && (
                                <div className="flex items-center space-x-2">
                                  <ModernButton
                                    onClick={() => handleDeclineInvitation(invitation)}
                                    variant="bordered"
                                    size="sm"
                                    disabled={processing}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    {processing ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <X className="w-3 h-3" />
                                    )}
                                    <span className="ml-1">Decline</span>
                                  </ModernButton>
                                  
                                  <ModernButton
                                    onClick={() => handleAcceptInvitation(invitation)}
                                    variant="solid"
                                    size="sm"
                                    disabled={processing}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {processing ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                    <span className="ml-1">Accept</span>
                                  </ModernButton>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CollaborationNotifications;
