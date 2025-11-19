import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, Mail, MessageCircle, Link2, Download } from 'lucide-react';

interface ShareItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  itineraryId?: string;
  itineraryTitle?: string;
}

const ShareItineraryModal: React.FC<ShareItineraryModalProps> = ({
  isOpen,
  onClose,
  itineraryId,
  itineraryTitle
}) => {
  const [copied, setCopied] = useState(false);
  const [shareMethod, setShareMethod] = useState<string | null>(null);

  const shareUrl = itineraryId 
    ? `${window.location.origin}/public/itinerary/${itineraryId}`
    : window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async (method: string) => {
    setShareMethod(method);
    
    if (method === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: itineraryTitle || 'My Travel Itinerary',
          text: `Check out my travel itinerary: ${itineraryTitle || 'Amazing Trip'}`,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
    
    setTimeout(() => setShareMethod(null), 1000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 max-w-md w-full p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Share Itinerary</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Share URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Share via
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {navigator.share && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleShare('native')}
                  className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all flex flex-col items-center gap-2"
                >
                  <Share2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Native Share</span>
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.open(`mailto:?subject=${encodeURIComponent(itineraryTitle || 'Travel Itinerary')}&body=${encodeURIComponent(shareUrl)}`, '_blank')}
                className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200/50 dark:border-red-700/50 hover:border-red-300 dark:hover:border-red-600 transition-all flex flex-col items-center gap-2"
              >
                <Mail className="w-6 h-6 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Email</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${itineraryTitle || 'Travel Itinerary'}: ${shareUrl}`)}`, '_blank')}
                className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-700/50 hover:border-green-300 dark:hover:border-green-600 transition-all flex flex-col items-center gap-2"
              >
                <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">WhatsApp</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopy}
                className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all flex flex-col items-center gap-2"
              >
                <Link2 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Copy Link</span>
              </motion.button>
            </div>
          </div>

          {/* Export Options */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Export as
            </p>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                <Download className="w-4 h-4" />
                <span>JSON</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareItineraryModal;

