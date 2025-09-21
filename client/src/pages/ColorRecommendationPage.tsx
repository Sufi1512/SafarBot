import React, { useState } from 'react';
import { 
  Plane, 
  MapPin, 
  Heart, 
  Star, 
  Save, 
  Share2, 
  Edit, 
  Trash2, 
  Plus,
  ArrowRight,
  Check,
  Search,
  Filter,
  Download,
  Upload,
  X,
  AlertCircle
} from 'lucide-react';
import UnifiedButton from '../components/ui/UnifiedButton';

/**
 * Color Recommendation Page for SafarBot
 * 
 * Shows the best color combinations for a travel/trip planning application
 * based on psychology, accessibility, and brand alignment.
 */
const ColorRecommendationPage: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<'primary' | 'travel' | 'adventure' | 'luxury'>('travel');

  const colorThemes = {
    primary: {
      name: 'Primary Theme',
      description: 'Clean, professional, trustworthy',
      primary: 'primary',
      secondary: 'secondary', 
      accent: 'info',
      success: 'success',
      warning: 'warning',
      error: 'error'
    },
    travel: {
      name: 'Travel Theme',
      description: 'Adventure, exploration, wanderlust',
      primary: 'primary',
      secondary: 'secondary',
      accent: 'success', 
      success: 'success',
      warning: 'warning',
      error: 'error'
    },
    adventure: {
      name: 'Adventure Theme', 
      description: 'Bold, energetic, exciting',
      primary: 'purple',
      secondary: 'secondary',
      accent: 'primary',
      success: 'success', 
      warning: 'warning',
      error: 'error'
    },
    luxury: {
      name: 'Luxury Theme',
      description: 'Premium, sophisticated, elegant',
      primary: 'dark',
      secondary: 'secondary',
      accent: 'purple',
      success: 'success',
      warning: 'warning', 
      error: 'error'
    }
  };

  const currentTheme = colorThemes[selectedTheme];

  const travelActions = [
    { label: 'Plan Trip', icon: Plane, variant: 'primary' },
    { label: 'Save Itinerary', icon: Save, variant: 'success' },
    { label: 'Share Trip', icon: Share2, variant: 'secondary' },
    { label: 'Edit Details', icon: Edit, variant: 'primary' },
    { label: 'Delete Trip', icon: Trash2, variant: 'error' },
    { label: 'Add Place', icon: Plus, variant: 'success' },
    { label: 'Continue', icon: ArrowRight, variant: 'primary' },
    { label: 'Confirm Booking', icon: Check, variant: 'success' },
    { label: 'Search', icon: Search, variant: 'secondary' },
    { label: 'Filter Results', icon: Filter, variant: 'secondary' },
    { label: 'Download Guide', icon: Download, variant: 'info' },
    { label: 'Upload Photos', icon: Upload, variant: 'warning' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🎨 Color Recommendations for SafarBot
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Best color combinations for your travel application
              </p>
            </div>
            <UnifiedButton variant="primary" icon={ArrowRight} onClick={() => window.open('/button-test', '_blank')}>
              View All Buttons
            </UnifiedButton>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Theme Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🎯 Choose Your Theme
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(colorThemes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => setSelectedTheme(key as any)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedTheme === key
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {theme.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {theme.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recommended Color Palette */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            🎨 Recommended Color Palette: {currentTheme.name}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-lg mb-2 bg-${currentTheme.primary}-500`}></div>
              <h4 className="font-medium text-gray-900 dark:text-white">Primary</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Main actions</p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-lg mb-2 bg-${currentTheme.secondary}-500`}></div>
              <h4 className="font-medium text-gray-900 dark:text-white">Secondary</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Support actions</p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-lg mb-2 bg-${currentTheme.accent}-500`}></div>
              <h4 className="font-medium text-gray-900 dark:text-white">Accent</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Highlights</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-lg mb-2 bg-success-500"></div>
              <h4 className="font-medium text-gray-900 dark:text-white">Success</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Positive actions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-lg mb-2 bg-warning-500"></div>
              <h4 className="font-medium text-gray-900 dark:text-white">Warning</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Caution</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-lg mb-2 bg-error-500"></div>
              <h4 className="font-medium text-gray-900 dark:text-white">Error</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Destructive</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Why This Combination Works:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {selectedTheme === 'primary' && (
                <>
                  <li>• Blue conveys trust and reliability - perfect for travel planning</li>
                  <li>• Clean, professional appearance builds user confidence</li>
                  <li>• Excellent contrast ratios for accessibility</li>
                  <li>• Works well across all device types and screen sizes</li>
                </>
              )}
              {selectedTheme === 'travel' && (
                <>
                  <li>• Blue represents sky, ocean, and adventure</li>
                  <li>• Green accents evoke nature and positive experiences</li>
                  <li>• Creates excitement for travel and exploration</li>
                  <li>• Psychologically encourages booking and planning</li>
                </>
              )}
              {selectedTheme === 'adventure' && (
                <>
                  <li>• Purple suggests creativity and adventure</li>
                  <li>• Bold colors create excitement and energy</li>
                  <li>• Appeals to younger, adventurous travelers</li>
                  <li>• Stands out from typical travel sites</li>
                </>
              )}
              {selectedTheme === 'luxury' && (
                <>
                  <li>• Dark colors convey premium, sophisticated experience</li>
                  <li>• Purple accents suggest luxury and exclusivity</li>
                  <li>• Appeals to high-end travelers</li>
                  <li>• Creates sense of premium service quality</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Travel-Specific Button Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            ✈️ Travel-Specific Button Examples
          </h2>
          
          {/* Primary Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Primary Actions (Most Important)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <UnifiedButton 
                variant={currentTheme.primary as any} 
                size="md" 
                icon={Plane}
                fullWidth
              >
                Plan Trip
              </UnifiedButton>
              <UnifiedButton 
                variant={currentTheme.primary as any} 
                size="md" 
                icon={ArrowRight}
                iconPosition="right"
                fullWidth
              >
                Continue
              </UnifiedButton>
              <UnifiedButton 
                variant={currentTheme.primary as any} 
                size="md" 
                icon={Edit}
                fullWidth
              >
                Edit Trip
              </UnifiedButton>
              <UnifiedButton 
                variant={currentTheme.primary as any} 
                size="md" 
                icon={Check}
                fullWidth
              >
                Confirm Booking
              </UnifiedButton>
            </div>
          </div>

          {/* Success Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Success Actions (Positive Outcomes)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <UnifiedButton 
                variant="success" 
                size="md" 
                icon={Save}
                fullWidth
              >
                Save Itinerary
              </UnifiedButton>
              <UnifiedButton 
                variant="success" 
                size="md" 
                icon={Plus}
                fullWidth
              >
                Add Place
              </UnifiedButton>
              <UnifiedButton 
                variant="success" 
                size="md" 
                icon={Heart}
                fullWidth
              >
                Add to Favorites
              </UnifiedButton>
              <UnifiedButton 
                variant="success" 
                size="md" 
                icon={Star}
                fullWidth
              >
                Rate Experience
              </UnifiedButton>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Secondary Actions (Supporting)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <UnifiedButton 
                variant="secondary" 
                size="md" 
                icon={Search}
                fullWidth
              >
                Search
              </UnifiedButton>
              <UnifiedButton 
                variant="secondary" 
                size="md" 
                icon={Filter}
                fullWidth
              >
                Filter
              </UnifiedButton>
              <UnifiedButton 
                variant="outline" 
                size="md" 
                icon={Share2}
                fullWidth
              >
                Share
              </UnifiedButton>
              <UnifiedButton 
                variant="ghost" 
                size="md" 
                icon={Download}
                fullWidth
              >
                Download
              </UnifiedButton>
            </div>
          </div>

          {/* Destructive Actions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Destructive Actions (Use Sparingly)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <UnifiedButton 
                variant="error" 
                size="md" 
                icon={Trash2}
                fullWidth
              >
                Delete Trip
              </UnifiedButton>
              <UnifiedButton 
                variant="error" 
                size="md" 
                icon={X}
                fullWidth
              >
                Cancel Booking
              </UnifiedButton>
              <UnifiedButton 
                variant="warning" 
                size="md" 
                icon={AlertCircle}
                fullWidth
              >
                Report Issue
              </UnifiedButton>
              <UnifiedButton 
                variant="ghost" 
                size="md" 
                icon={X}
                fullWidth
              >
                Close
              </UnifiedButton>
            </div>
          </div>
        </div>

        {/* Size Recommendations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            📏 Size Recommendations for Travel App
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Hero Actions (Extra Large) - Main CTAs
              </h3>
              <div className="flex flex-wrap gap-3">
                <UnifiedButton variant={currentTheme.primary as any} size="xl" icon={Plane}>
                  Start Planning Your Trip
                </UnifiedButton>
                <UnifiedButton variant="success" size="xl" icon={ArrowRight} iconPosition="right">
                  Book Now
                </UnifiedButton>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Primary Actions (Large) - Important buttons
              </h3>
              <div className="flex flex-wrap gap-3">
                <UnifiedButton variant={currentTheme.primary as any} size="lg" icon={Save}>
                  Save Itinerary
                </UnifiedButton>
                <UnifiedButton variant="success" size="lg" icon={Check}>
                  Confirm Booking
                </UnifiedButton>
                <UnifiedButton variant={currentTheme.primary as any} size="lg" icon={Edit}>
                  Edit Trip
                </UnifiedButton>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Standard Actions (Medium) - Most common
              </h3>
              <div className="flex flex-wrap gap-3">
                <UnifiedButton variant={currentTheme.primary as any} size="md" icon={Plus}>
                  Add Place
                </UnifiedButton>
                <UnifiedButton variant="secondary" size="md" icon={Search}>
                  Search
                </UnifiedButton>
                <UnifiedButton variant="outline" size="md" icon={Share2}>
                  Share
                </UnifiedButton>
                <UnifiedButton variant="ghost" size="md" icon={Filter}>
                  Filter
                </UnifiedButton>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Compact Actions (Small) - Space-saving
              </h3>
              <div className="flex flex-wrap gap-3">
                <UnifiedButton variant={currentTheme.primary as any} size="sm" icon={Heart}>
                  Like
                </UnifiedButton>
                <UnifiedButton variant="secondary" size="sm" icon={Star}>
                  Rate
                </UnifiedButton>
                <UnifiedButton variant="outline" size="sm" icon={Edit}>
                  Edit
                </UnifiedButton>
                <UnifiedButton variant="ghost" size="sm" icon={Trash2}>
                  Delete
                </UnifiedButton>
              </div>
            </div>
          </div>
        </div>

        {/* Psychology & UX Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            🧠 Psychology & UX Tips for Travel Apps
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Color Psychology
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• <strong>Blue:</strong> Trust, reliability, sky, ocean</li>
                <li>• <strong>Green:</strong> Nature, growth, positive experiences</li>
                <li>• <strong>Purple:</strong> Creativity, luxury, adventure</li>
                <li>• <strong>Orange:</strong> Energy, enthusiasm, warmth</li>
                <li>• <strong>Red:</strong> Urgency, excitement, caution</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Button Hierarchy
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• <strong>Primary:</strong> Main conversion actions</li>
                <li>• <strong>Success:</strong> Positive confirmations</li>
                <li>• <strong>Secondary:</strong> Supporting actions</li>
                <li>• <strong>Outline:</strong> Alternative options</li>
                <li>• <strong>Ghost:</strong> Subtle, non-intrusive</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Implementation Guide */}
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-6">
            💻 Implementation Guide
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Recommended Theme: {currentTheme.name}</h3>
              <pre className="text-green-400 text-sm overflow-x-auto">
{`// Primary actions (most important)
<UnifiedButton variant="${currentTheme.primary}" size="lg">
  Plan Your Trip
</UnifiedButton>

// Success actions (positive outcomes)  
<UnifiedButton variant="success" size="md" icon={Save}>
  Save Itinerary
</UnifiedButton>

// Secondary actions (supporting)
<UnifiedButton variant="secondary" size="md" icon={Search}>
  Search Destinations
</UnifiedButton>

// Destructive actions (use sparingly)
<UnifiedButton variant="error" size="sm" icon={Trash2}>
  Delete Trip
</UnifiedButton>`}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Based on travel industry best practices and user psychology
          </p>
          <div className="flex justify-center space-x-4">
            <UnifiedButton variant="primary" onClick={() => window.open('/button-test', '_blank')}>
              Test All Buttons
            </UnifiedButton>
            <UnifiedButton variant="outline" onClick={() => window.open('/', '_blank')}>
              Back to App
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorRecommendationPage;
