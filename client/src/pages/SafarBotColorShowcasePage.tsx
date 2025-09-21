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
  Navigation,
  CheckCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import UnifiedButton from '../components/ui/UnifiedButton';

/**
 * SafarBot Color Showcase Page
 * 
 * Displays the exact color combination you specified:
 * Primary: #01C4FF, Secondary: #838383, Accent: #A144AF
 * Success: #2B9A66, Warning: #FFC53D, Error: #DD4425
 * Background: #FFFFFF, Surface: #F9F9F9
 */
const SafarBotColorShowcasePage: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<'buttons' | 'cards' | 'forms' | 'navigation'>('buttons');

  // Your exact color palette
  const colorPalette = {
    primary: '#01C4FF',
    secondary: '#838383', 
    accent: '#A144AF',
    success: '#2B9A66',
    warning: '#FFC53D',
    error: '#DD4425',
    background: '#FFFFFF',
    surface: '#F9F9F9'
  };

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
    { label: 'Download Guide', icon: Download, variant: 'accent', priority: 'low' },
    { label: 'Upload Photos', icon: Upload, variant: 'warning', priority: 'low' },
    { label: 'View Map', icon: MapPin, variant: 'secondary', priority: 'medium' },
    { label: 'Take Photo', icon: Camera, variant: 'secondary', priority: 'low' },
    { label: 'Navigate', icon: Navigation, variant: 'primary', priority: 'medium' },
    { label: 'Explore', icon: Globe, variant: 'secondary', priority: 'medium' },
  ];

  const getButtonStyle = (variant: string, priority: string) => {
    const baseStyle = "inline-flex items-center justify-center font-medium transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    let colors = {};
    let size = "";
    
    switch (priority) {
      case 'high':
        size = "px-8 py-4 text-lg rounded-xl";
        break;
      case 'medium':
        size = "px-6 py-3 text-base rounded-lg";
        break;
      case 'low':
        size = "px-4 py-2 text-sm rounded-md";
        break;
    }

    switch (variant) {
      case 'primary':
        colors = {
          backgroundColor: colorPalette.primary,
          color: '#FFFFFF',
          focusRingColor: colorPalette.primary
        };
        break;
      case 'success':
        colors = {
          backgroundColor: colorPalette.success,
          color: '#FFFFFF',
          focusRingColor: colorPalette.success
        };
        break;
      case 'accent':
        colors = {
          backgroundColor: colorPalette.accent,
          color: '#FFFFFF',
          focusRingColor: colorPalette.accent
        };
        break;
      case 'warning':
        colors = {
          backgroundColor: colorPalette.warning,
          color: '#FFFFFF',
          focusRingColor: colorPalette.warning
        };
        break;
      case 'error':
        colors = {
          backgroundColor: colorPalette.error,
          color: '#FFFFFF',
          focusRingColor: colorPalette.error
        };
        break;
      case 'secondary':
        colors = {
          backgroundColor: 'transparent',
          color: colorPalette.secondary,
          border: `2px solid ${colorPalette.secondary}`,
          focusRingColor: colorPalette.secondary
        };
        break;
    }

    return { ...colors, className: `${baseStyle} ${size}` };
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colorPalette.background }}>
      {/* Header */}
      <div className="shadow-lg border-b" style={{ 
        backgroundColor: colorPalette.background, 
        borderColor: colorPalette.surface 
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: colorPalette.primary }}>
                🎨 SafarBot Color Showcase
              </h1>
              <p className="text-lg" style={{ color: colorPalette.secondary }}>
                Your exact color combination in action
              </p>
            </div>
            <div className="flex space-x-3">
              <UnifiedButton 
                variant="primary" 
                icon={ArrowRight} 
                onClick={() => window.open('/button-test', '_blank')}
              >
                Test All Buttons
              </UnifiedButton>
              <UnifiedButton 
                variant="outline" 
                icon={Globe}
                onClick={() => window.open('/', '_blank')}
              >
                Back to App
              </UnifiedButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Color Palette Display */}
        <div className="rounded-2xl p-8 shadow-xl mb-8" style={{ backgroundColor: colorPalette.background, border: `2px solid ${colorPalette.surface}` }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: colorPalette.primary }}>
            🎯 Your Exact Color Palette
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div 
                className="w-20 h-20 mx-auto rounded-2xl mb-3 shadow-lg" 
                style={{ backgroundColor: colorPalette.primary }}
              ></div>
              <h3 className="font-bold text-lg mb-1" style={{ color: colorPalette.primary }}>Primary</h3>
              <p className="text-sm font-mono" style={{ color: colorPalette.secondary }}>{colorPalette.primary}</p>
              <p className="text-xs mt-1" style={{ color: colorPalette.secondary }}>Bright Teal - Main actions</p>
            </div>
            <div className="text-center">
              <div 
                className="w-20 h-20 mx-auto rounded-2xl mb-3 shadow-lg" 
                style={{ backgroundColor: colorPalette.secondary }}
              ></div>
              <h3 className="font-bold text-lg mb-1" style={{ color: colorPalette.primary }}>Secondary</h3>
              <p className="text-sm font-mono" style={{ color: colorPalette.secondary }}>{colorPalette.secondary}</p>
              <p className="text-xs mt-1" style={{ color: colorPalette.secondary }}>Medium Gray - Support actions</p>
            </div>
            <div className="text-center">
              <div 
                className="w-20 h-20 mx-auto rounded-2xl mb-3 shadow-lg" 
                style={{ backgroundColor: colorPalette.accent }}
              ></div>
              <h3 className="font-bold text-lg mb-1" style={{ color: colorPalette.primary }}>Accent</h3>
              <p className="text-sm font-mono" style={{ color: colorPalette.secondary }}>{colorPalette.accent}</p>
              <p className="text-xs mt-1" style={{ color: colorPalette.secondary }}>Purple - Highlights</p>
            </div>
            <div className="text-center">
              <div 
                className="w-20 h-20 mx-auto rounded-2xl mb-3 shadow-lg" 
                style={{ backgroundColor: colorPalette.success }}
              ></div>
              <h3 className="font-bold text-lg mb-1" style={{ color: colorPalette.primary }}>Success</h3>
              <p className="text-sm font-mono" style={{ color: colorPalette.secondary }}>{colorPalette.success}</p>
              <p className="text-xs mt-1" style={{ color: colorPalette.secondary }}>Green - Positive actions</p>
            </div>
            <div className="text-center">
              <div 
                className="w-20 h-20 mx-auto rounded-2xl mb-3 shadow-lg" 
                style={{ backgroundColor: colorPalette.warning }}
              ></div>
              <h3 className="font-bold text-lg mb-1" style={{ color: colorPalette.primary }}>Warning</h3>
              <p className="text-sm font-mono" style={{ color: colorPalette.secondary }}>{colorPalette.warning}</p>
              <p className="text-xs mt-1" style={{ color: colorPalette.secondary }}>Orange - Cautions</p>
            </div>
            <div className="text-center">
              <div 
                className="w-20 h-20 mx-auto rounded-2xl mb-3 shadow-lg" 
                style={{ backgroundColor: colorPalette.error }}
              ></div>
              <h3 className="font-bold text-lg mb-1" style={{ color: colorPalette.primary }}>Error</h3>
              <p className="text-sm font-mono" style={{ color: colorPalette.secondary }}>{colorPalette.error}</p>
              <p className="text-xs mt-1" style={{ color: colorPalette.secondary }}>Red - Destructive</p>
            </div>
            <div className="text-center">
              <div 
                className="w-20 h-20 mx-auto rounded-2xl mb-3 shadow-lg border-2" 
                style={{ backgroundColor: colorPalette.background, borderColor: colorPalette.secondary }}
              ></div>
              <h3 className="font-bold text-lg mb-1" style={{ color: colorPalette.primary }}>Background</h3>
              <p className="text-sm font-mono" style={{ color: colorPalette.secondary }}>{colorPalette.background}</p>
              <p className="text-xs mt-1" style={{ color: colorPalette.secondary }}>Pure White</p>
            </div>
            <div className="text-center">
              <div 
                className="w-20 h-20 mx-auto rounded-2xl mb-3 shadow-lg" 
                style={{ backgroundColor: colorPalette.surface }}
              ></div>
              <h3 className="font-bold text-lg mb-1" style={{ color: colorPalette.primary }}>Surface</h3>
              <p className="text-sm font-mono" style={{ color: colorPalette.secondary }}>{colorPalette.surface}</p>
              <p className="text-xs mt-1" style={{ color: colorPalette.secondary }}>Light Gray</p>
            </div>
          </div>

          <div className="rounded-xl p-6" style={{ backgroundColor: colorPalette.surface }}>
            <h4 className="font-bold text-lg mb-3" style={{ color: colorPalette.primary }}>Why This Color Combination Works:</h4>
            <ul className="text-sm space-y-2" style={{ color: colorPalette.secondary }}>
              <li>• <strong style={{ color: colorPalette.primary }}>Bright Teal (#01C4FF)</strong> - Represents adventure, energy, and modern travel</li>
              <li>• <strong style={{ color: colorPalette.secondary }}>Medium Gray (#838383)</strong> - Professional, clean, and doesn't compete with primary</li>
              <li>• <strong style={{ color: colorPalette.accent }}>Purple (#A144AF)</strong> - Adds creativity and luxury feel</li>
              <li>• <strong style={{ color: colorPalette.success }}>Green (#2B9A66)</strong> - Nature, positive experiences, success</li>
              <li>• <strong style={{ color: colorPalette.warning }}>Orange (#FFC53D)</strong> - Warmth, energy, urgency</li>
              <li>• <strong style={{ color: colorPalette.error }}>Red (#DD4425)</strong> - Clear danger signals, important alerts</li>
            </ul>
          </div>
        </div>

        {/* Demo Selector */}
        <div className="rounded-xl p-6 shadow-lg mb-8" style={{ backgroundColor: colorPalette.surface }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: colorPalette.primary }}>
            🎮 Interactive Demo
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'buttons', label: 'Button Examples', icon: CheckCircle },
              { key: 'cards', label: 'Card Layouts', icon: Heart },
              { key: 'forms', label: 'Form Elements', icon: Edit },
              { key: 'navigation', label: 'Navigation', icon: Navigation }
            ].map((demo) => (
              <button
                key={demo.key}
                onClick={() => setSelectedDemo(demo.key as any)}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedDemo === demo.key ? 'shadow-lg' : 'shadow-sm'
                }`}
                style={{
                  backgroundColor: selectedDemo === demo.key ? colorPalette.primary : colorPalette.background,
                  color: selectedDemo === demo.key ? '#FFFFFF' : colorPalette.secondary,
                  border: selectedDemo === demo.key ? 'none' : `2px solid ${colorPalette.secondary}`
                }}
              >
                <demo.icon className="w-4 h-4 mr-2" />
                {demo.label}
              </button>
            ))}
          </div>
        </div>

        {/* Button Examples */}
        {selectedDemo === 'buttons' && (
          <div className="rounded-xl p-8 shadow-lg mb-8" style={{ backgroundColor: colorPalette.background, border: `2px solid ${colorPalette.surface}` }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colorPalette.primary }}>
              ✈️ Travel App Button Examples
            </h2>
            
            {/* High Priority Actions */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4" style={{ color: colorPalette.primary }}>
                High Priority Actions (Hero Buttons)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {travelActions.filter(action => action.priority === 'high').map((action, index) => (
                  <button
                    key={index}
                    {...getButtonStyle(action.variant, action.priority)}
                  >
                    <action.icon className="w-5 h-5 mr-2" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Medium Priority Actions */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4" style={{ color: colorPalette.primary }}>
                Medium Priority Actions (Standard Buttons)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {travelActions.filter(action => action.priority === 'medium').map((action, index) => (
                  <button
                    key={index}
                    {...getButtonStyle(action.variant, action.priority)}
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Low Priority Actions */}
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: colorPalette.primary }}>
                Low Priority Actions (Subtle Buttons)
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {travelActions.filter(action => action.priority === 'low').map((action, index) => (
                  <button
                    key={index}
                    {...getButtonStyle(action.variant, action.priority)}
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Card Examples */}
        {selectedDemo === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((card) => (
              <div 
                key={card}
                className="rounded-xl p-6 shadow-lg border-2 transition-all duration-200 hover:shadow-xl"
                style={{ 
                  backgroundColor: colorPalette.background,
                  borderColor: colorPalette.surface
                }}
              >
                <div className="flex items-center mb-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mr-3"
                    style={{ backgroundColor: colorPalette.primary }}
                  >
                    <Plane className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: colorPalette.primary }}>
                      Trip #{card}
                    </h3>
                    <p className="text-sm" style={{ color: colorPalette.secondary }}>
                      {card === 1 ? 'Paris Adventure' : card === 2 ? 'Tokyo Discovery' : 'London Explorer'}
                    </p>
                  </div>
                </div>
                <p className="text-sm mb-4" style={{ color: colorPalette.secondary }}>
                  {card === 1 ? '7 days in the City of Light' : card === 2 ? '5 days exploring modern Japan' : '4 days in historic London'}
                </p>
                <div className="flex space-x-2">
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ backgroundColor: colorPalette.primary }}
                  >
                    View Details
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium border-2"
                    style={{ 
                      backgroundColor: 'transparent',
                      borderColor: colorPalette.secondary,
                      color: colorPalette.secondary
                    }}
                  >
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form Examples */}
        {selectedDemo === 'forms' && (
          <div className="rounded-xl p-8 shadow-lg mb-8" style={{ backgroundColor: colorPalette.background, border: `2px solid ${colorPalette.surface}` }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colorPalette.primary }}>
              📝 Form Elements
            </h2>
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colorPalette.primary }}>
                  Destination
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: colorPalette.surface,
                    focusRingColor: colorPalette.primary
                  }}
                  placeholder="Where do you want to go?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colorPalette.primary }}>
                  Travel Dates
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: colorPalette.surface,
                    focusRingColor: colorPalette.primary
                  }}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  className="flex-1 px-6 py-3 rounded-lg font-medium text-white"
                  style={{ backgroundColor: colorPalette.primary }}
                >
                  Search Trips
                </button>
                <button
                  className="px-6 py-3 rounded-lg font-medium border-2"
                  style={{ 
                    backgroundColor: 'transparent',
                    borderColor: colorPalette.secondary,
                    color: colorPalette.secondary
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Examples */}
        {selectedDemo === 'navigation' && (
          <div className="rounded-xl p-8 shadow-lg mb-8" style={{ backgroundColor: colorPalette.background, border: `2px solid ${colorPalette.surface}` }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colorPalette.primary }}>
              🧭 Navigation Elements
            </h2>
            <div className="space-y-6">
              {/* Top Navigation */}
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: colorPalette.surface }}>
                <div className="flex items-center space-x-6">
                  <div className="font-bold text-xl" style={{ color: colorPalette.primary }}>SafarBot</div>
                  <nav className="flex space-x-4">
                    {['Home', 'Trips', 'Explore', 'About'].map((item) => (
                      <a
                        key={item}
                        href="#"
                        className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        style={{ 
                          color: item === 'Trips' ? '#FFFFFF' : colorPalette.secondary,
                          backgroundColor: item === 'Trips' ? colorPalette.primary : 'transparent'
                        }}
                      >
                        {item}
                      </a>
                    ))}
                  </nav>
                </div>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: colorPalette.accent }}
                >
                  Sign In
                </button>
              </div>

              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm">
                <a href="#" style={{ color: colorPalette.primary }}>Home</a>
                <span style={{ color: colorPalette.secondary }}>/</span>
                <a href="#" style={{ color: colorPalette.primary }}>Trips</a>
                <span style={{ color: colorPalette.secondary }}>/</span>
                <span style={{ color: colorPalette.secondary }}>Paris Adventure</span>
              </div>

              {/* Status Indicators */}
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colorPalette.success }}></div>
                  <span className="text-sm" style={{ color: colorPalette.secondary }}>Confirmed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colorPalette.warning }}></div>
                  <span className="text-sm" style={{ color: colorPalette.secondary }}>Pending</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colorPalette.error }}></div>
                  <span className="text-sm" style={{ color: colorPalette.secondary }}>Cancelled</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Implementation Guide */}
        <div className="rounded-xl p-8 shadow-lg mb-8" style={{ backgroundColor: '#1a1a1a' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: colorPalette.primary }}>
            💻 Implementation Guide
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold mb-2" style={{ color: colorPalette.primary }}>
                CSS Custom Properties
              </h3>
              <pre className="text-sm overflow-x-auto p-4 rounded-lg" style={{ 
                backgroundColor: '#2a2a2a', 
                color: '#00ff00',
                fontFamily: 'monospace'
              }}>
{`:root {
  --safarbot-primary: #01C4FF;
  --safarbot-secondary: #838383;
  --safarbot-accent: #A144AF;
  --safarbot-success: #2B9A66;
  --safarbot-warning: #FFC53D;
  --safarbot-error: #DD4425;
  --safarbot-background: #FFFFFF;
  --safarbot-surface: #F9F9F9;
}`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-sm font-bold mb-2" style={{ color: colorPalette.primary }}>
                Tailwind Classes
              </h3>
              <pre className="text-sm overflow-x-auto p-4 rounded-lg" style={{ 
                backgroundColor: '#2a2a2a', 
                color: '#00ff00',
                fontFamily: 'monospace'
              }}>
{`<!-- Primary Button -->
<button class="bg-primary-500 text-white px-6 py-3 rounded-lg">
  Plan Trip
</button>

<!-- Success Button -->
<button class="bg-success-500 text-white px-6 py-3 rounded-lg">
  Save Itinerary
</button>

<!-- Secondary Button -->
<button class="bg-transparent text-secondary-500 border-2 border-secondary-500 px-6 py-3 rounded-lg">
  Cancel
</button>

<!-- Accent Button -->
<button class="bg-accent-500 text-white px-6 py-3 rounded-lg">
  Premium
</button>`}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="mb-6" style={{ color: colorPalette.secondary }}>
            Your SafarBot color system is ready to use! 🚀
          </p>
          <div className="flex justify-center space-x-4">
            <button
              className="px-8 py-4 rounded-xl font-medium text-white shadow-lg"
              style={{ backgroundColor: colorPalette.primary }}
              onClick={() => window.open('/button-test', '_blank')}
            >
              Test All Buttons
            </button>
            <button
              className="px-8 py-4 rounded-xl font-medium border-2 shadow-lg"
              style={{ 
                backgroundColor: colorPalette.background,
                borderColor: colorPalette.accent,
                color: colorPalette.accent
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

export default SafarBotColorShowcasePage;
