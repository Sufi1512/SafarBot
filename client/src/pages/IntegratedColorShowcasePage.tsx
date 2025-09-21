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
  AlertTriangle,
  Palette,
  Eye,
  Code
} from 'lucide-react';
import UnifiedButton from '../components/ui/UnifiedButton';

/**
 * Integrated Color Showcase Page for SafarBot
 * 
 * Displays the comprehensive integrated color system with all your CSS variables
 */
const IntegratedColorShowcasePage: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<'palette' | 'buttons' | 'cards' | 'forms' | 'navigation' | 'code'>('palette');
  const [selectedCategory, setSelectedCategory] = useState<'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'>('primary');

  // Your integrated color system
  const colorSystem = {
    primary: {
      name: 'Primary Colors',
      description: 'Main brand colors for primary actions',
      colors: {
        50: { hex: '#F9FAFB', variable: '--color-blue-2', name: 'Lightest' },
        100: { hex: '#F3F4F6', variable: '--color-blue-4', name: 'Very Light' },
        200: { hex: '#E5E7EB', variable: '--color-blue-6', name: 'Light' },
        300: { hex: '#D1D5DB', variable: '--color-blue-10', name: 'Medium Light' },
        400: { hex: '#9CA3AF', variable: '--color-blue-16', name: 'Medium' },
        500: { hex: '#4F46E5', variable: '--color-blue-24', name: 'Main Primary' },
        600: { hex: '#4B5563', variable: '--color-blue-22', name: 'Medium Dark' },
        700: { hex: '#374151', variable: '--color-blue-26', name: 'Dark' },
        800: { hex: '#111827', variable: '--color-blue-30', name: 'Very Dark' },
        900: { hex: '#000000', variable: '--color-grayscale-19', name: 'Darkest' },
      }
    },
    secondary: {
      name: 'Secondary Colors',
      description: 'Supporting colors for secondary actions',
      colors: {
        50: { hex: '#F9FAFB', variable: '--color-blue-2', name: 'Lightest' },
        100: { hex: '#F3F4F6', variable: '--color-blue-4', name: 'Very Light' },
        200: { hex: '#E9E9E9', variable: '--color-grayscale-4', name: 'Light' },
        300: { hex: '#D9D9D9', variable: '--color-grayscale-6', name: 'Medium Light' },
        400: { hex: '#9CA3AF', variable: '--color-blue-16', name: 'Medium' },
        500: { hex: '#6B7280', variable: '--color-blue-18', name: 'Main Secondary' },
        600: { hex: '#6C6C6C', variable: '--color-grayscale-12', name: 'Medium Dark' },
        700: { hex: '#4B5563', variable: '--color-blue-22', name: 'Dark' },
        800: { hex: '#374151', variable: '--color-blue-26', name: 'Very Dark' },
        900: { hex: '#111827', variable: '--color-blue-30', name: 'Darkest' },
      }
    },
    accent: {
      name: 'Accent Colors',
      description: 'Highlight colors for special features',
      colors: {
        50: { hex: '#ABE2FB', variable: '--color-blue-8', name: 'Lightest' },
        100: { hex: '#96DBFA', variable: '--color-blue-12', name: 'Very Light' },
        200: { hex: '#57C5F7', variable: '--color-blue-14', name: 'Light' },
        300: { hex: '#0FCCCE', variable: '--color-teal-2', name: 'Medium Light' },
        400: { hex: '#04868B', variable: '--color-teal-4', name: 'Medium' },
        500: { hex: '#6366F1', variable: '--color-blue-20', name: 'Main Accent' },
        600: { hex: '#4F46E5', variable: '--color-blue-24', name: 'Medium Dark' },
        700: { hex: '#374151', variable: '--color-blue-26', name: 'Dark' },
        800: { hex: '#111827', variable: '--color-blue-30', name: 'Very Dark' },
        900: { hex: '#000000', variable: '--color-grayscale-19', name: 'Darkest' },
      }
    },
    success: {
      name: 'Success Colors',
      description: 'Positive action and confirmation colors',
      colors: {
        50: { hex: '#F9FAFB', variable: '--color-blue-2', name: 'Lightest' },
        100: { hex: '#F3F4F6', variable: '--color-blue-4', name: 'Very Light' },
        200: { hex: '#E5E7EB', variable: '--color-blue-6', name: 'Light' },
        300: { hex: '#D1D5DB', variable: '--color-blue-10', name: 'Medium Light' },
        400: { hex: '#9CA3AF', variable: '--color-blue-16', name: 'Medium' },
        500: { hex: '#0FCCCE', variable: '--color-teal-2', name: 'Main Success' },
        600: { hex: '#04868B', variable: '--color-teal-4', name: 'Medium Dark' },
        700: { hex: '#374151', variable: '--color-blue-26', name: 'Dark' },
        800: { hex: '#111827', variable: '--color-blue-30', name: 'Very Dark' },
        900: { hex: '#000000', variable: '--color-grayscale-19', name: 'Darkest' },
      }
    },
    warning: {
      name: 'Warning Colors',
      description: 'Caution and warning colors',
      colors: {
        50: { hex: '#F9FAFB', variable: '--color-blue-2', name: 'Lightest' },
        100: { hex: '#F3F4F6', variable: '--color-blue-4', name: 'Very Light' },
        200: { hex: '#E5E7EB', variable: '--color-blue-6', name: 'Light' },
        300: { hex: '#D1D5DB', variable: '--color-blue-10', name: 'Medium Light' },
        400: { hex: '#9CA3AF', variable: '--color-blue-16', name: 'Medium' },
        500: { hex: '#6B7280', variable: '--color-blue-18', name: 'Main Warning' },
        600: { hex: '#4B5563', variable: '--color-blue-22', name: 'Medium Dark' },
        700: { hex: '#374151', variable: '--color-blue-26', name: 'Dark' },
        800: { hex: '#111827', variable: '--color-blue-30', name: 'Very Dark' },
        900: { hex: '#000000', variable: '--color-grayscale-19', name: 'Darkest' },
      }
    },
    error: {
      name: 'Error Colors',
      description: 'Destructive action and error colors',
      colors: {
        50: { hex: '#F9FAFB', variable: '--color-blue-2', name: 'Lightest' },
        100: { hex: '#F3F4F6', variable: '--color-blue-4', name: 'Very Light' },
        200: { hex: '#E5E7EB', variable: '--color-blue-6', name: 'Light' },
        300: { hex: '#D1D5DB', variable: '--color-blue-10', name: 'Medium Light' },
        400: { hex: '#9CA3AF', variable: '--color-blue-16', name: 'Medium' },
        500: { hex: '#EF233C', variable: '--color-red-2', name: 'Main Error' },
        600: { hex: '#4B5563', variable: '--color-blue-22', name: 'Medium Dark' },
        700: { hex: '#374151', variable: '--color-blue-26', name: 'Dark' },
        800: { hex: '#111827', variable: '--color-blue-30', name: 'Very Dark' },
        900: { hex: '#000000', variable: '--color-grayscale-19', name: 'Darkest' },
      }
    }
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
  ];

  const currentCategory = colorSystem[selectedCategory];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="shadow-lg border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-primary-500">
                🎨 Integrated Color System Showcase
              </h1>
              <p className="text-lg text-secondary-500">
                Comprehensive color palette with CSS variables integration
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
        
        {/* Demo Selector */}
        <div className="rounded-xl p-6 shadow-lg mb-8 bg-surface-50">
          <h2 className="text-xl font-bold mb-4 text-primary-500">
            🎮 Interactive Demo Sections
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'palette', label: 'Color Palette', icon: Palette },
              { key: 'buttons', label: 'Button Examples', icon: CheckCircle },
              { key: 'cards', label: 'Card Layouts', icon: Heart },
              { key: 'forms', label: 'Form Elements', icon: Edit },
              { key: 'navigation', label: 'Navigation', icon: Navigation },
              { key: 'code', label: 'Code Examples', icon: Code }
            ].map((demo) => (
              <button
                key={demo.key}
                onClick={() => setSelectedDemo(demo.key as any)}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedDemo === demo.key ? 'shadow-lg' : 'shadow-sm'
                }`}
                style={{
                  backgroundColor: selectedDemo === demo.key ? '#4F46E5' : '#FFFFFF',
                  color: selectedDemo === demo.key ? '#FFFFFF' : '#6B7280',
                  border: selectedDemo === demo.key ? 'none' : '2px solid #E5E7EB'
                }}
              >
                <demo.icon className="w-4 h-4 mr-2" />
                {demo.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette Display */}
        {selectedDemo === 'palette' && (
          <div className="space-y-8">
            {/* Category Selector */}
            <div className="rounded-xl p-6 shadow-lg bg-surface-50">
              <h2 className="text-xl font-bold mb-4 text-primary-500">
                🎯 Color Categories
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(colorSystem).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as any)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedCategory === key
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-surface-300 hover:border-surface-400'
                    }`}
                  >
                    <h3 className="font-semibold text-sm mb-1 text-primary-500">
                      {category.name}
                    </h3>
                    <p className="text-xs text-secondary-500">
                      {category.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Swatches */}
            <div className="rounded-xl p-8 shadow-lg bg-background border border-surface-200">
              <h2 className="text-2xl font-bold mb-6 text-primary-500">
                {currentCategory.name}
              </h2>
              <p className="text-secondary-500 mb-8">{currentCategory.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(currentCategory.colors).map(([shade, color]) => (
                  <div key={shade} className="text-center">
                    <div 
                      className="w-20 h-20 mx-auto rounded-xl mb-3 shadow-lg border border-surface-200" 
                      style={{ backgroundColor: color.hex }}
                    ></div>
                    <h4 className="font-bold text-sm mb-1 text-primary-500">{shade}</h4>
                    <p className="text-xs font-mono text-secondary-500 mb-1">{color.hex}</p>
                    <p className="text-xs text-secondary-400 mb-1">{color.variable}</p>
                    <p className="text-xs text-secondary-400">{color.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Button Examples */}
        {selectedDemo === 'buttons' && (
          <div className="rounded-xl p-8 shadow-lg mb-8 bg-background border border-surface-200">
            <h2 className="text-2xl font-bold mb-6 text-primary-500">
              ✈️ Travel App Button Examples
            </h2>
            
            {/* High Priority Actions */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 text-primary-500">
                High Priority Actions (Hero Buttons)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {travelActions.filter(action => action.priority === 'high').map((action, index) => (
                  <UnifiedButton
                    key={index}
                    variant={action.variant as any}
                    size="lg"
                    icon={action.icon}
                    fullWidth
                  >
                    {action.label}
                  </UnifiedButton>
                ))}
              </div>
            </div>

            {/* Medium Priority Actions */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 text-primary-500">
                Medium Priority Actions (Standard Buttons)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {travelActions.filter(action => action.priority === 'medium').map((action, index) => (
                  <UnifiedButton
                    key={index}
                    variant={action.variant as any}
                    size="md"
                    icon={action.icon}
                    fullWidth
                  >
                    {action.label}
                  </UnifiedButton>
                ))}
              </div>
            </div>

            {/* Low Priority Actions */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-primary-500">
                Low Priority Actions (Subtle Buttons)
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {travelActions.filter(action => action.priority === 'low').map((action, index) => (
                  <UnifiedButton
                    key={index}
                    variant={action.variant as any}
                    size="sm"
                    icon={action.icon}
                    fullWidth
                  >
                    {action.label}
                  </UnifiedButton>
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
                className="rounded-xl p-6 shadow-lg border-2 transition-all duration-200 hover:shadow-xl bg-background border-surface-200"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-3 bg-primary-500">
                    <Plane className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary-500">
                      Trip #{card}
                    </h3>
                    <p className="text-sm text-secondary-500">
                      {card === 1 ? 'Paris Adventure' : card === 2 ? 'Tokyo Discovery' : 'London Explorer'}
                    </p>
                  </div>
                </div>
                <p className="text-sm mb-4 text-secondary-500">
                  {card === 1 ? '7 days in the City of Light' : card === 2 ? '5 days exploring modern Japan' : '4 days in historic London'}
                </p>
                <div className="flex space-x-2">
                  <UnifiedButton variant="primary" size="sm">
                    View Details
                  </UnifiedButton>
                  <UnifiedButton variant="outline" size="sm">
                    Share
                  </UnifiedButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form Examples */}
        {selectedDemo === 'forms' && (
          <div className="rounded-xl p-8 shadow-lg mb-8 bg-background border border-surface-200">
            <h2 className="text-2xl font-bold mb-6 text-primary-500">
              📝 Form Elements
            </h2>
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-primary-500">
                  Destination
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border-2 border-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Where do you want to go?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-primary-500">
                  Travel Dates
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-lg border-2 border-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex space-x-3">
                <UnifiedButton variant="primary" size="lg" fullWidth>
                  Search Trips
                </UnifiedButton>
                <UnifiedButton variant="outline" size="lg">
                  Clear
                </UnifiedButton>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Examples */}
        {selectedDemo === 'navigation' && (
          <div className="rounded-xl p-8 shadow-lg mb-8 bg-background border border-surface-200">
            <h2 className="text-2xl font-bold mb-6 text-primary-500">
              🧭 Navigation Elements
            </h2>
            <div className="space-y-6">
              {/* Top Navigation */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-surface-50">
                <div className="flex items-center space-x-6">
                  <div className="font-bold text-xl text-primary-500">SafarBot</div>
                  <nav className="flex space-x-4">
                    {['Home', 'Trips', 'Explore', 'About'].map((item) => (
                      <a
                        key={item}
                        href="#"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          item === 'Trips' 
                            ? 'text-white bg-primary-500' 
                            : 'text-secondary-500 hover:text-primary-500'
                        }`}
                      >
                        {item}
                      </a>
                    ))}
                  </nav>
                </div>
                <UnifiedButton variant="accent" size="sm">
                  Sign In
                </UnifiedButton>
              </div>

              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm">
                <a href="#" className="text-primary-500">Home</a>
                <span className="text-secondary-500">/</span>
                <a href="#" className="text-primary-500">Trips</a>
                <span className="text-secondary-500">/</span>
                <span className="text-secondary-500">Paris Adventure</span>
              </div>

              {/* Status Indicators */}
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-success-500"></div>
                  <span className="text-sm text-secondary-500">Confirmed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-warning-500"></div>
                  <span className="text-sm text-secondary-500">Pending</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-error-500"></div>
                  <span className="text-sm text-secondary-500">Cancelled</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code Examples */}
        {selectedDemo === 'code' && (
          <div className="rounded-xl p-8 shadow-lg mb-8 bg-gray-900">
            <h2 className="text-2xl font-bold mb-6 text-green-400">
              💻 Implementation Code Examples
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-3 text-blue-400">CSS Custom Properties</h3>
                <pre className="text-sm overflow-x-auto p-4 rounded-lg bg-gray-800 text-green-400">
{`:root {
  /* Primary Colors */
  --color-blue-2: #F9FAFB;
  --color-blue-4: #F3F4F6;
  --color-blue-6: #E5E7EB;
  --color-blue-10: #D1D5DB;
  --color-blue-16: #9CA3AF;
  --color-blue-24: #4F46E5;  /* Main Primary */
  --color-blue-22: #4B5563;
  --color-blue-26: #374151;
  --color-blue-30: #111827;
  --color-grayscale-19: #000000;

  /* Secondary Colors */
  --color-blue-18: #6B7280;  /* Main Secondary */
  --color-grayscale-4: #E9E9E9;
  --color-grayscale-6: #D9D9D9;
  --color-grayscale-12: #6C6C6C;

  /* Accent Colors */
  --color-blue-20: #6366F1;  /* Main Accent */
  --color-blue-8: #ABE2FB;
  --color-blue-12: #96DBFA;
  --color-blue-14: #57C5F7;
  --color-teal-2: #0FCCCE;
  --color-teal-4: #04868B;

  /* Success Colors */
  --color-teal-2: #0FCCCE;  /* Main Success */

  /* Warning Colors */
  --color-blue-18: #6B7280;  /* Main Warning */

  /* Error Colors */
  --color-red-2: #EF233C;  /* Main Error */

  /* Background Colors */
  --color-grayscale-2: #FFFFFF;  /* Pure White */
  --color-blue-4: #F3F4F6;  /* Light Gray Surface */
}`}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-3 text-blue-400">Tailwind Classes</h3>
                <pre className="text-sm overflow-x-auto p-4 rounded-lg bg-gray-800 text-green-400">
{`<!-- Primary Button -->
<button class="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg">
  Plan Trip
</button>

<!-- Success Button -->
<button class="bg-success-500 hover:bg-success-600 text-white px-6 py-3 rounded-lg">
  Save Itinerary
</button>

<!-- Secondary Button -->
<button class="bg-transparent text-secondary-500 border-2 border-secondary-500 px-6 py-3 rounded-lg">
  Cancel
</button>

<!-- Accent Button -->
<button class="bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-lg">
  Premium Feature
</button>

<!-- Error Button -->
<button class="bg-error-500 hover:bg-error-600 text-white px-6 py-3 rounded-lg">
  Delete Trip
</button>`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3 text-blue-400">React Component Usage</h3>
                <pre className="text-sm overflow-x-auto p-4 rounded-lg bg-gray-800 text-green-400">
{`import UnifiedButton from './components/ui/UnifiedButton';

// Primary actions (most important)
<UnifiedButton variant="primary" size="lg">
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

// Accent actions (highlights)
<UnifiedButton variant="accent" size="md" icon={Star}>
  Premium Feature
</UnifiedButton>

// Destructive actions (use sparingly)
<UnifiedButton variant="error" size="sm" icon={Trash2}>
  Delete Trip
</UnifiedButton>`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="mb-6 text-secondary-500">
            Your integrated color system is ready to use! 🚀
          </p>
          <div className="flex justify-center space-x-4">
            <UnifiedButton variant="primary" size="lg" onClick={() => window.open('/button-test', '_blank')}>
              Test All Buttons
            </UnifiedButton>
            <UnifiedButton variant="outline" size="lg" onClick={() => window.open('/', '_blank')}>
              Back to App
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedColorShowcasePage;
