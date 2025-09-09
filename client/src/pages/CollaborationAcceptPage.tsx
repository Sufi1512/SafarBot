import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Check, 
  X, 
  Loader2, 
  AlertTriangle,
  Users,
  Calendar,
  MapPin
} from 'lucide-react';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';
import { collaborationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CollaborationAcceptPage: React.FC = () => {
  const { invitationToken } = useParams<{ invitationToken: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [invitation, setInvitation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [action, setAction] = useState<'accept' | 'decline' | null>(null);

  useEffect(() => {
    if (!invitationToken) {
      setError('Invalid invitation link');
      setIsLoading(false);
      return;
    }

    // If user is not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
      const returnUrl = `/collaboration/accept/${invitationToken}`;
      navigate('/login', { 
        state: { 
          from: returnUrl,
          message: 'Please log in to accept the collaboration invitation'
        } 
      });
      return;
    }

    // Load invitation details
    loadInvitation();
  }, [invitationToken, isAuthenticated, navigate]);

  const loadInvitation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the public endpoint to get invitation info
      const response = await fetch(`http://localhost:8000/api/v1/collaboration/invitation/${invitationToken}/info`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to load invitation');
      }
      
      const result = await response.json();
      setInvitation(result.data);
    } catch (err: any) {
      console.error('Error loading invitation:', err);
      setError(err.message || 'Failed to load invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!invitationToken) return;
    
    try {
      setIsProcessing(true);
      setAction('accept');
      
      await collaborationAPI.acceptInvitation(invitationToken);
      
      setSuccess(true);
      
      // Redirect to the itinerary after a short delay
      setTimeout(() => {
        navigate(`/saved-itinerary/${invitation.itinerary.id}`);
      }, 2000);
      
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setIsProcessing(false);
      setAction(null);
    }
  };

  const handleDecline = async () => {
    if (!invitationToken) return;
    
    try {
      setIsProcessing(true);
      setAction('decline');
      
      await collaborationAPI.declineInvitation(invitationToken);
      
      setSuccess(true);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error declining invitation:', err);
      setError(err.message || 'Failed to decline invitation');
    } finally {
      setIsProcessing(false);
      setAction(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Users className="w-5 h-5 text-purple-600" />;
      case 'editor':
        return <Users className="w-5 h-5 text-green-600" />;
      case 'viewer':
        return <Users className="w-5 h-5 text-blue-600" />;
      default:
        return <Users className="w-5 h-5 text-gray-600" />;
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
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <ModernCard className="p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Invalid Invitation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <ModernButton
            onClick={() => navigate('/dashboard')}
            variant="solid"
          >
            Go to Dashboard
          </ModernButton>
        </ModernCard>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <ModernCard className="p-8 max-w-md w-full text-center">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {action === 'accept' ? 'Invitation Accepted!' : 'Invitation Declined'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {action === 'accept' 
              ? 'You are now a collaborator on this itinerary. Redirecting...'
              : 'You have declined the collaboration invitation. Redirecting...'
            }
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
        </ModernCard>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <ModernCard className="p-8 shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Users className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Collaboration Invitation
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You've been invited to collaborate on a travel itinerary
            </p>
          </div>

          {/* Invitation Details */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              {/* Itinerary Image */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                {invitation.itinerary.cover_image ? (
                  <img 
                    src={invitation.itinerary.cover_image} 
                    alt={invitation.itinerary.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <MapPin className="w-10 h-10 text-white" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {invitation.itinerary.title}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{invitation.itinerary.destination}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Invited by <strong>{invitation.owner_email}</strong></span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Expires {formatDate(invitation.invitation.expires_at)}</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <span className={`inline-flex items-center space-x-2 px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(invitation.invitation.role)}`}>
                    {getRoleIcon(invitation.invitation.role)}
                    <span className="capitalize">{invitation.invitation.role}</span>
                  </span>
                </div>
              </div>
            </div>
            
            {invitation.invitation.message && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Personal Message:</strong>
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 italic">
                  "{invitation.invitation.message}"
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ModernButton
              onClick={handleDecline}
              variant="bordered"
              size="lg"
              disabled={isProcessing}
              className="flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              {isProcessing && action === 'decline' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <X className="w-5 h-5" />
              )}
              <span>Decline</span>
            </ModernButton>
            
            <ModernButton
              onClick={handleAccept}
              variant="solid"
              size="lg"
              disabled={isProcessing}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              {isProcessing && action === 'accept' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              <span>Accept Invitation</span>
            </ModernButton>
          </div>

          {/* Security Note */}
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Security Note:</strong> This invitation is unique to you and will expire in 7 days. 
              If you didn't expect this invitation, you can safely decline it.
            </p>
          </div>
        </ModernCard>
      </motion.div>
    </div>
  );
};

export default CollaborationAcceptPage;
