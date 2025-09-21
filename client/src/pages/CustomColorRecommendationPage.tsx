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
  AlertCircle,
  Globe,
  Camera,
  Navigation
} from 'lucide-react';
import UnifiedButton from '../components/ui/UnifiedButton';

/**
 * Custom Color Recommendation Page for SafarBot
 * 
 * Uses your existing design system colors to create the best combinations
 * for your travel application.
 */
const CustomColorRecommendationPage: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<'google' | 'travel' | 'premium' | 'adventure'>('google');

  // Your existing color system mapped to semantic meanings
  const colorThemes = {
    google: {
      name: 'Google Material Theme',
      description: 'Clean, modern, Google-inspired design',
      primary: '#1A73E8', // --color-blue-27
      secondary: '#5F6368', // --color-blue-31 (grayscale)
      accent: '#2B9A66', // --color-green-12
      success: '#2B9A66', // --color-green-12
      warning: '#FFC53D', // --color-orange-8
      error: '#DD4425', // --color-red-12
      background: '#FFFFFF', // --color-grayscale-15
      surface: '#F9F9F9', // --color-grayscale-19
      border: '#E0E0E0', // --color-grayscale-25
    },
    travel: {
      name: 'Travel Optimized',
      description: 'Perfect for travel apps - trust, adventure, nature',
      primary: '#0588F0', // --color-blue-25 (darker blue)
      secondary: '#838383', // --color-grayscale-39
      accent: '#2B9A66', // --color-green-12
      success: '#2B9A66', // --color-green-12
      warning: '#FFC53D', // --color-orange-8
      error: '#DC3E42', // --color-red-14
      background: '#FFFFFF',
      surface: '#F9F9F9',
      border: '#E0E0E0',
    },
    premium: {
      name: 'Premium Luxury',
      description: 'Sophisticated, high-end travel experience',
      primary: '#202020', // --color-grayscale-45
      secondary: '#646464', // --color-grayscale-41
      accent: '#A144AF', // --color-pink-6
      success: '#2B9A66',
      warning: '#FFC53D',
      error: '#DD4425',
      background: '#FFFFFF',
      surface: '#FCFCFC', // --color-grayscale-17
      border: '#D9D9D9', // --color-grayscale-27
    },
    adventure: {
      name: 'Adventure Bold',
      description: 'Energetic, exciting, adventure-focused',
      primary: '#01C4FF', // --color-teal-16
      secondary: '#838383',
      accent: '#A144AF', // --color-pink-6
      success: '#2B9A66',
      warning: '#FFC53D',
      error: '#DD4425',
      background: '#FFFFFF',
      surface: '#F9F9F9',
      border: '#E0E0E0',
    }
  };

  const currentTheme = colorThemes[selectedTheme];

  const travelActions = [
    { label: 'Plan Trip', icon: Plane, variant: 'primary', priority: 'high' },
    { label: 'Save Itinerary', icon: Save, variant: 'success', priority: 'high' },
    { label: 'Share Trip', icon: Share2, variant: 'secondary', priority: 'medium' },
    { label: 'Edit Details', icon: Edit, variant: 'primary', priority: 'medium' },
    { label: 'Delete Trip', icon: Trash2, variant: 'error', priority: 'low' },
    { label: 'Add Place', icon: Plus, variant: 'success', priority: 'medium' },
    { label: 'Continue', icon: ArrowRight, variant: 'primary', priority: 'high' },
    { label: 'Confirm Booking', icon: Check, variant: 'success', priority: 'high' },
    { label: 'Search', icon: Search, variant: 'secondary', priority: 'medium' },
    { label: 'Filter Results', icon: Filter, variant: 'secondary', priority: 'medium' },
    { label: 'Download Guide', icon: Download, variant: 'info', priority: 'low' },
    { label: 'Upload Photos', icon: Upload, variant: 'warning', priority: 'low' },
    { label: 'View Map', icon: MapPin, variant: 'secondary', priority: 'medium' },
    { label: 'Take Photo', icon: Camera, variant: 'secondary', priority: 'low' },
    { label: 'Navigate', icon: Navigation, variant: 'primary', priority: 'medium' },
    { label: 'Explore', icon: Globe, variant: 'secondary', priority: 'medium' },
  ];

  const getVariantFromTheme = (action: any) => {
    if (action.variant === 'primary') return 'primary';
    if (action.variant === 'success') return 'success';
    if (action.variant === 'error') return 'error';
    if (action.variant === 'warning') return 'warning';
    if (action.variant === 'info') return 'info';
    return 'secondary';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentTheme.background }}>
      {/* Header */}
      <div className="shadow-sm border-b" style={{ 
        backgroundColor: currentTheme.background, 
        borderColor: currentTheme.border 
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: currentTheme.primary }}>
                🎨 Your Design System Colors for SafarBot
              </h1>
              <p className="mt-2" style={{ color: currentTheme.secondary }}>
                Optimized color combinations using your existing CSS custom properties
              </p>
            </div>
            <UnifiedButton 
              variant="primary" 
              icon={ArrowRight} 
              onClick={() => window.open('/button-test', '_blank')}
              style={{ backgroundColor: currentTheme.primary }}
            >
              View All Buttons
            </UnifiedButton>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Theme Selector */}
        <div className="rounded-xl p-6 shadow-lg mb-8" style={{ backgroundColor: currentTheme.background, border: `1px solid ${currentTheme.border}` }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: currentTheme.primary }}>
            🎯 Choose Your Theme (Using Your Colors)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(colorThemes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => setSelectedTheme(key as any)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedTheme === key
                    ? 'border-2'
                    : 'border'
                }`}
                style={{
                  borderColor: selectedTheme === key ? currentTheme.primary : currentTheme.border,
                  backgroundColor: selectedTheme === key ? `${currentTheme.primary}10` : currentTheme.surface
                }}
              >
                <h3 className="font-semibold mb-1" style={{ color: currentTheme.primary }}>
                  {theme.name}
                </h3>
                <p className="text-sm" style={{ color: currentTheme.secondary }}>
                  {theme.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette Display */}
        <div className="rounded-xl p-6 shadow-lg mb-8" style={{ backgroundColor: currentTheme.background, border: `1px solid ${currentTheme.border}` }}>
          <h2 className="text-xl font-semibold mb-6" style={{ color: currentTheme.primary }}>
            🎨 Your Color Palette: {currentTheme.name}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto rounded-lg mb-2" 
                style={{ backgroundColor: currentTheme.primary }}
              ></div>
              <h4 className="font-medium text-sm" style={{ color: currentTheme.primary }}>Primary</h4>
              <p className="text-xs" style={{ color: currentTheme.secondary }}>{currentTheme.primary}</p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto rounded-lg mb-2" 
                style={{ backgroundColor: currentTheme.secondary }}
              ></div>
              <h4 className="font-medium text-sm" style={{ color: currentTheme.primary }}>Secondary</h4>
              <p className="text-xs" style={{ color: currentTheme.secondary }}>{currentTheme.secondary}</p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto rounded-lg mb-2" 
                style={{ backgroundColor: currentTheme.accent }}
              ></div>
              <h4 className="font-medium text-sm" style={{ color: currentTheme.primary }}>Accent</h4>
              <p className="text-xs" style={{ color: currentTheme.secondary }}>{currentTheme.accent}</p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto rounded-lg mb-2" 
                style={{ backgroundColor: currentTheme.success }}
              ></div>
              <h4 className="font-medium text-sm" style={{ color: currentTheme.primary }}>Success</h4>
              <p className="text-xs" style={{ color: currentTheme.secondary }}>{currentTheme.success}</p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto rounded-lg mb-2" 
                style={{ backgroundColor: currentTheme.warning }}
              ></div>
              <h4 className="font-medium text-sm" style={{ color: currentTheme.primary }}>Warning</h4>
              <p className="text-xs" style={{ color: currentTheme.secondary }}>{currentTheme.warning}</p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto rounded-lg mb-2" 
                style={{ backgroundColor: currentTheme.error }}
              ></div>
              <h4 className="font-medium text-sm" style={{ color: currentTheme.primary }}>Error</h4>
              <p className="text-xs" style={{ color: currentTheme.secondary }}>{currentTheme.error}</p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto rounded-lg mb-2 border" 
                style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.border }}
              ></div>
              <h4 className="font-medium text-sm" style={{ color: currentTheme.primary }}>Background</h4>
              <p className="text-xs" style={{ color: currentTheme.secondary }}>{currentTheme.background}</p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto rounded-lg mb-2" 
                style={{ backgroundColor: currentTheme.surface }}
              ></div>
              <h4 className="font-medium text-sm" style={{ color: currentTheme.primary }}>Surface</h4>
              <p className="text-xs" style={{ color: currentTheme.secondary }}>{currentTheme.surface}</p>
            </div>
          </div>

          <div className="rounded-lg p-4" style={{ backgroundColor: currentTheme.surface }}>
            <h4 className="font-medium mb-2" style={{ color: currentTheme.primary }}>Why This Combination Works:</h4>
            <ul className="text-sm space-y-1" style={{ color: currentTheme.secondary }}>
              {selectedTheme === 'google' && (
                <>
                  <li>• Google Material Design principles for familiar UX</li>
                  <li>• Blue (#1A73E8) builds trust and reliability</li>
                  <li>• Clean, professional appearance</li>
                  <li>• Excellent accessibility compliance</li>
                </>
              )}
              {selectedTheme === 'travel' && (
                <>
                  <li>• Deeper blue (#0588F0) represents sky and ocean</li>
                  <li>• Green accents evoke nature and positive experiences</li>
                  <li>• Creates excitement for travel and exploration</li>
                  <li>• Psychologically encourages booking and planning</li>
                </>
              )}
              {selectedTheme === 'premium' && (
                <>
                  <li>• Dark colors convey premium, sophisticated experience</li>
                  <li>• Purple accents suggest luxury and exclusivity</li>
                  <li>• Appeals to high-end travelers</li>
                  <li>• Creates sense of premium service quality</li>
                </>
              )}
              {selectedTheme === 'adventure' && (
                <>
                  <li>• Bright teal (#01C4FF) suggests energy and adventure</li>
                  <li>• Purple accents create excitement and creativity</li>
                  <li>• Appeals to younger, adventurous travelers</li>
                  <li>• Stands out from typical travel sites</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Travel-Specific Button Examples */}
        <div className="rounded-xl p-6 shadow-lg mb-8" style={{ backgroundColor: currentTheme.background, border: `1px solid ${currentTheme.border}` }}>
          <h2 className="text-xl font-semibold mb-6" style={{ color: currentTheme.primary }}>
            ✈️ Travel-Specific Button Examples (Using Your Colors)
          </h2>
          
          {/* High Priority Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4" style={{ color: currentTheme.primary }}>
              High Priority Actions (Hero Buttons)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {travelActions.filter(action => action.priority === 'high').map((action, index) => (
                <button
                  key={index}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
                  style={{ 
                    backgroundColor: action.variant === 'primary' ? currentTheme.primary : 
                                   action.variant === 'success' ? currentTheme.success :
                                   action.variant === 'error' ? currentTheme.error : currentTheme.secondary,
                    color: '#FFFFFF'
                  }}
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Medium Priority Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4" style={{ color: currentTheme.primary }}>
              Medium Priority Actions (Standard Buttons)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {travelActions.filter(action => action.priority === 'medium').map((action, index) => (
                <button
                  key={index}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 border-2 hover:opacity-90"
                  style={{ 
                    backgroundColor: currentTheme.background,
                    borderColor: action.variant === 'success' ? currentTheme.success :
                               action.variant === 'primary' ? currentTheme.primary :
                               currentTheme.secondary,
                    color: action.variant === 'success' ? currentTheme.success :
                          action.variant === 'primary' ? currentTheme.primary :
                          currentTheme.secondary
                  }}
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Low Priority Actions */}
          <div>
            <h3 className="text-lg font-medium mb-4" style={{ color: currentTheme.primary }}>
              Low Priority Actions (Subtle Buttons)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {travelActions.filter(action => action.priority === 'low').map((action, index) => (
                <button
                  key={index}
                  className="inline-flex items-center justify-center px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-opacity-10"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: action.variant === 'error' ? currentTheme.error :
                          action.variant === 'warning' ? currentTheme.warning :
                          currentTheme.secondary
                  }}
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Size Recommendations */}
        <div className="rounded-xl p-6 shadow-lg mb-8" style={{ backgroundColor: currentTheme.background, border: `1px solid ${currentTheme.border}` }}>
          <h2 className="text-xl font-semibold mb-6" style={{ color: currentTheme.primary }}>
            📏 Size Recommendations for Your Travel App
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3" style={{ color: currentTheme.primary }}>
                Hero Actions (XL) - Main CTAs
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center justify-center px-10 py-5 text-xl rounded-lg font-medium transition-all duration-200"
                  style={{ backgroundColor: currentTheme.primary, color: '#FFFFFF' }}
                >
                  <Plane className="w-5 h-5 mr-3" />
                  Start Planning Your Trip
                </button>
                <button
                  className="inline-flex items-center justify-center px-10 py-5 text-xl rounded-lg font-medium transition-all duration-200"
                  style={{ backgroundColor: currentTheme.success, color: '#FFFFFF' }}
                >
                  Book Now
                  <ArrowRight className="w-5 h-5 ml-3" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3" style={{ color: currentTheme.primary }}>
                Primary Actions (LG) - Important buttons
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center justify-center px-8 py-4 text-lg rounded-lg font-medium transition-all duration-200"
                  style={{ backgroundColor: currentTheme.primary, color: '#FFFFFF' }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Itinerary
                </button>
                <button
                  className="inline-flex items-center justify-center px-8 py-4 text-lg rounded-lg font-medium transition-all duration-200"
                  style={{ backgroundColor: currentTheme.success, color: '#FFFFFF' }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Booking
                </button>
                <button
                  className="inline-flex items-center justify-center px-8 py-4 text-lg rounded-lg font-medium transition-all duration-200 border-2"
                  style={{ 
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.primary,
                    color: currentTheme.primary
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Trip
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3" style={{ color: currentTheme.primary }}>
                Standard Actions (MD) - Most common
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center justify-center px-6 py-3 text-base rounded-lg font-medium transition-all duration-200"
                  style={{ backgroundColor: currentTheme.primary, color: '#FFFFFF' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Place
                </button>
                <button
                  className="inline-flex items-center justify-center px-6 py-3 text-base rounded-lg font-medium transition-all duration-200 border-2"
                  style={{ 
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.secondary,
                    color: currentTheme.secondary
                  }}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </button>
                <button
                  className="inline-flex items-center justify-center px-6 py-3 text-base rounded-lg font-medium transition-all duration-200 border-2"
                  style={{ 
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.accent,
                    color: currentTheme.accent
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
                <button
                  className="inline-flex items-center justify-center px-6 py-3 text-base rounded-lg font-medium transition-all duration-200"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: currentTheme.secondary
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3" style={{ color: currentTheme.primary }}>
                Compact Actions (SM) - Space-saving
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200"
                  style={{ backgroundColor: currentTheme.primary, color: '#FFFFFF' }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Like
                </button>
                <button
                  className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 border-2"
                  style={{ 
                    backgroundColor: currentTheme.background,
                    borderColor: currentTheme.warning,
                    color: currentTheme.warning
                  }}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Rate
                </button>
                <button
                  className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: currentTheme.secondary
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: currentTheme.error
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CSS Implementation Guide */}
        <div className="rounded-xl p-6 shadow-lg mb-8" style={{ backgroundColor: currentTheme.surface }}>
          <h2 className="text-xl font-semibold mb-6" style={{ color: currentTheme.primary }}>
            💻 CSS Implementation Guide
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: currentTheme.primary }}>
                Recommended Theme: {currentTheme.name}
              </h3>
              <pre className="text-sm overflow-x-auto p-4 rounded-lg" style={{ 
                backgroundColor: '#1a1a1a', 
                color: '#00ff00',
                fontFamily: 'monospace'
              }}>
{`:root {
  /* Your existing colors optimized for travel app */
  --travel-primary: ${currentTheme.primary};
  --travel-secondary: ${currentTheme.secondary};
  --travel-accent: ${currentTheme.accent};
  --travel-success: ${currentTheme.success};
  --travel-warning: ${currentTheme.warning};
  --travel-error: ${currentTheme.error};
  --travel-background: ${currentTheme.background};
  --travel-surface: ${currentTheme.surface};
  --travel-border: ${currentTheme.border};
}

/* Primary actions (most important) */
.travel-btn-primary {
  background-color: var(--travel-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.travel-btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Success actions (positive outcomes) */
.travel-btn-success {
  background-color: var(--travel-success);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
}

/* Secondary actions (supporting) */
.travel-btn-secondary {
  background-color: var(--travel-background);
  color: var(--travel-secondary);
  border: 2px solid var(--travel-secondary);
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
}

/* Destructive actions (use sparingly) */
.travel-btn-error {
  background-color: var(--travel-error);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="mb-4" style={{ color: currentTheme.secondary }}>
            Based on your existing design system and travel industry best practices
          </p>
          <div className="flex justify-center space-x-4">
            <button
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
              style={{ backgroundColor: currentTheme.primary, color: '#FFFFFF' }}
              onClick={() => window.open('/button-test', '_blank')}
            >
              Test All Buttons
            </button>
            <button
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 border-2"
              style={{ 
                backgroundColor: currentTheme.background,
                borderColor: currentTheme.primary,
                color: currentTheme.primary
              }}
              onClick={() => window.open('/', '_blank')}
            >
              Back to App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomColorRecommendationPage;
