import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  MoreVertical, 
  Trash2, 
  Crown,
  Eye,
  Edit,
  Shield,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import ModernButton from './ui/ModernButton';
import { collaborationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Collaborator {
  user_id: string;
  name: string;
  email: string;
  role: 'owner' | 'viewer' | 'editor' | 'admin';
  joined_at: string;
  last_activity?: string;
}

interface CollaboratorsListProps {
  itineraryId: string;
  isOwner: boolean;
  onInviteClick: () => void;
}

const CollaboratorsList: React.FC<CollaboratorsListProps> = ({
  itineraryId,
  isOwner,
  onInviteClick
}) => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [owner, setOwner] = useState<Collaborator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const loadCollaborators = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await collaborationAPI.getCollaborators(itineraryId);
      setOwner(response.data.owner);
      setCollaborators(response.data.collaborators);
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

  const handleRemoveCollaborator = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from this collaboration?`)) {
      return;
    }

    try {
      setRemovingUserId(userId);
      await collaborationAPI.removeCollaborator(itineraryId, userId);
      
      // Remove from local state
      setCollaborators(prev => prev.filter(c => c.user_id !== userId));
    } catch (err: any) {
      console.error('Error removing collaborator:', err);
      alert(err.message || 'Failed to remove collaborator');
    } finally {
      setRemovingUserId(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-600" />;
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
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Collaborators
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {collaborators.length + 1} member{(collaborators.length + 1) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {isOwner && (
            <ModernButton
              onClick={onInviteClick}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite</span>
            </ModernButton>
          )}
        </div>
      </div>

      {/* Collaborators List */}
      <div className="p-6 space-y-4">
        {/* Owner */}
        {owner && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-xl border border-yellow-200 dark:border-yellow-700"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {owner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {owner.name}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(owner.role)}`}>
                    {getRoleIcon(owner.role)}
                    <span className="ml-1 capitalize">{owner.role}</span>
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {owner.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Joined {formatDate(owner.joined_at)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Collaborators */}
        {collaborators.map((collaborator) => (
          <motion.div
            key={collaborator.user_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {collaborator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {collaborator.name}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(collaborator.role)}`}>
                    {getRoleIcon(collaborator.role)}
                    <span className="ml-1 capitalize">{collaborator.role}</span>
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {collaborator.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Joined {formatDate(collaborator.joined_at)}
                  {collaborator.last_activity && (
                    <span className="ml-2">
                      • Last active {formatDate(collaborator.last_activity)}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Actions */}
            {isOwner && collaborator.user_id !== user?.id && (
              <div className="flex items-center space-x-2">
                {removingUserId === collaborator.user_id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                ) : (
                  <button
                    onClick={() => handleRemoveCollaborator(collaborator.user_id, collaborator.name)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700 rounded-lg transition-colors"
                    title="Remove collaborator"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        ))}

        {/* Empty State */}
        {collaborators.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No collaborators yet
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Invite people to collaborate on this itinerary
            </p>
            {isOwner && (
              <ModernButton
                onClick={onInviteClick}
                variant="outline"
                size="sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Collaborator
              </ModernButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaboratorsList;
