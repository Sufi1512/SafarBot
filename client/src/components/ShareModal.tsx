import React, { useState } from 'react';
import { X, Copy, Share2, Mail } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  description?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  description
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = async (platform: string) => {
    const shareText = `${title}${description ? ` - ${description}` : ''}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`);
        break;
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title,
              text: description,
              url
            });
          } catch (err) {
            console.error('Error sharing:', err);
          }
        }
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Share Itinerary</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
          {description && (
            <p className="text-sm text-gray-600 mb-3">{description}</p>
          )}
          
          {/* Link Input */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {copied ? (
                <>
                  <Copy className="h-4 w-4 inline mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 inline mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-3">
          <h5 className="font-medium text-gray-900">Share on</h5>
          
          <div className="grid grid-cols-2 gap-3">
            {typeof navigator !== 'undefined' && navigator.share && typeof navigator.share === 'function' && (
              <button
                onClick={() => handleShare('native')}
                className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Share</span>
              </button>
            )}
            
            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="h-5 w-5 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">f</span>
              </div>
              <span className="text-sm font-medium">Facebook</span>
            </button>
            
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="h-5 w-5 bg-blue-400 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">𝕏</span>
              </div>
              <span className="text-sm font-medium">Twitter</span>
            </button>
            
            <button
              onClick={() => handleShare('linkedin')}
              className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="h-5 w-5 bg-blue-700 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">in</span>
              </div>
              <span className="text-sm font-medium">LinkedIn</span>
            </button>
            
            <button
              onClick={() => handleShare('email')}
              className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Mail className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium">Email</span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
