import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  UserPlus, 
  Send, 
  Loader2,
  Check,
  AlertTriangle,
  Eye,
  Edit,
  Shield
} from 'lucide-react';
import ModernButton from './ui/ModernButton';
import ModernCard from './ui/ModernCard';
import { collaborationAPI } from '../services/api';

interface CollaborationInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  itineraryId: string;
  itineraryTitle: string;
  onInviteSent: () => void;
  onRefreshCollaborators?: () => void; // Callback to refresh collaborators data
}

interface InviteForm {
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  message: string;
}

const CollaborationInviteModal: React.FC<CollaborationInviteModalProps> = ({
  isOpen,
  onClose,
  itineraryId,
  itineraryTitle,
  onInviteSent,
  onRefreshCollaborators
}) => {
  const [formData, setFormData] = useState<InviteForm>({
    email: '',
    role: 'editor',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const roleOptions = [
    {
      value: 'viewer' as const,
      label: 'Viewer',
      description: 'Can view the itinerary',
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      value: 'editor' as const,
      label: 'Editor',
      description: 'Can view and edit the itinerary',
      icon: Edit,
      color: 'text-green-600'
    },
    {
      value: 'admin' as const,
      label: 'Admin',
      description: 'Can edit and manage collaborators',
      icon: Shield,
      color: 'text-purple-600'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await collaborationAPI.inviteCollaborator({
        itinerary_id: itineraryId,
        email: formData.email,
        role: formData.role,
        message: formData.message || undefined
      });

      setSuccess(true);
      
      // Refresh collaborators data in background
      if (onRefreshCollaborators) {
        onRefreshCollaborators();
      }
      
      // Reset form after success and call onInviteSent after showing success message
      setTimeout(() => {
        setFormData({
          email: '',
          role: 'editor',
          message: ''
        });
        setSuccess(false);
        onInviteSent(); // Call this after showing success message
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error('Error sending invitation:', err);
      
      // Extract error message from API response
      let errorMessage = 'Failed to send invitation. Please try again.';
      
      if (err.response?.data?.detail) {
        // FastAPI error format: {"detail": "error message"}
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        // Alternative error format: {"message": "error message"}
        errorMessage = err.response.data.message;
      } else if (err.message) {
        // Generic error message
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
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
          className="w-full max-w-md"
        >
          <ModernCard className="p-6 shadow-2xl border-0 bg-white dark:bg-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Invite Collaborator
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-48">
                    {itineraryTitle}
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

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl flex items-center space-x-3 shadow-lg"
              >
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-green-800 dark:text-green-200 font-semibold text-base block">
                    Invitation sent successfully!
                  </span>
                  <span className="text-green-600 dark:text-green-400 text-sm">
                    The collaborator will receive an email invitation.
                  </span>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-center space-x-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300 font-medium text-sm">
                  {error}
                </span>
              </motion.div>
            )}

            {/* Form */}
            {!success && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter email address"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Permission Level
                  </label>
                  <div className="space-y-2">
                    {roleOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <label
                          key={option.value}
                          className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                            formData.role === option.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={option.value}
                            checked={formData.role === option.value}
                            onChange={handleInputChange}
                            className="sr-only"
                            disabled={isLoading}
                          />
                          <IconComponent className={`w-4 h-4 ${option.color}`} />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900 dark:text-white">
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {option.description}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Add a personal message..."
                    disabled={isLoading}
                  />
                </div>

                {/* Submit Button */}
                <ModernButton
                  type="submit"
                  variant="solid"
                  size="sm"
                  className="w-full py-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </ModernButton>
              </form>
            )}
          </ModernCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CollaborationInviteModal;
