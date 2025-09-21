import React, { useState } from 'react';
import { 
  Save, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Heart, 
  Share2, 
  Settings, 
  Plus, 
  ArrowRight, 
  Check,
  X,
  AlertCircle,
  Star,
  Search,
  Filter,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import UnifiedButton from '../components/ui/UnifiedButton';
import ModernButton from '../components/ui/ModernButton';
import Button from '../components/ui/Button';

/**
 * Button Test Page
 * 
 * Comprehensive testing page for all button components and variants.
 * Access via /button-test route.
 */
const ButtonTestPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>('primary');
  const [selectedSize, setSelectedSize] = useState<string>('md');

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const variants = [
    { key: 'primary', label: 'Primary', color: 'Blue' },
    { key: 'secondary', label: 'Secondary', color: 'Gray' },
    { key: 'success', label: 'Success', color: 'Green' },
    { key: 'warning', label: 'Warning', color: 'Orange' },
    { key: 'error', label: 'Error', color: 'Red' },
    { key: 'info', label: 'Info', color: 'Cyan' },
    { key: 'purple', label: 'Purple', color: 'Purple' },
    { key: 'dark', label: 'Dark', color: 'Dark Gray' },
    { key: 'outline', label: 'Outline', color: 'Border Only' },
    { key: 'ghost', label: 'Ghost', color: 'Transparent' },
  ];

  const sizes = [
    { key: 'xs', label: 'Extra Small' },
    { key: 'sm', label: 'Small' },
    { key: 'md', label: 'Medium' },
    { key: 'lg', label: 'Large' },
    { key: 'xl', label: 'Extra Large' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🧪 Button Test Suite
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Comprehensive testing for all button components and variants
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <UnifiedButton variant="primary" icon={ExternalLink} onClick={() => window.open('/', '_blank')}>
                Back to App
              </UnifiedButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Interactive Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🎛️ Interactive Controls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Variant
              </label>
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {variants.map((variant) => (
                  <option key={variant.key} value={variant.key}>
                    {variant.label} ({variant.color})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Size
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {sizes.map((size) => (
                  <option key={size.key} value={size.key}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <UnifiedButton
              variant={selectedVariant as any}
              size={selectedSize as any}
              icon={Star}
              onClick={handleLoadingDemo}
              loading={loading}
            >
              Test Button ({selectedVariant} - {selectedSize})
            </UnifiedButton>
          </div>
        </div>

        {/* Component Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* UnifiedButton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🚀 UnifiedButton
            </h3>
            <div className="space-y-3">
              <UnifiedButton variant="primary" size="sm" fullWidth>Primary</UnifiedButton>
              <UnifiedButton variant="success" size="sm" fullWidth icon={Check}>Success</UnifiedButton>
              <UnifiedButton variant="warning" size="sm" fullWidth icon={AlertCircle}>Warning</UnifiedButton>
              <UnifiedButton variant="error" size="sm" fullWidth icon={X}>Error</UnifiedButton>
              <UnifiedButton variant="outline" size="sm" fullWidth>Outline</UnifiedButton>
              <UnifiedButton variant="ghost" size="sm" fullWidth>Ghost</UnifiedButton>
            </div>
          </div>

          {/* ModernButton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🎨 ModernButton
            </h3>
            <div className="space-y-3">
              <ModernButton variant="solid" size="sm" fullWidth>Solid</ModernButton>
              <ModernButton variant="success" size="sm" fullWidth icon={Check}>Success</ModernButton>
              <ModernButton variant="warning" size="sm" fullWidth icon={AlertCircle}>Warning</ModernButton>
              <ModernButton variant="error" size="sm" fullWidth icon={X}>Error</ModernButton>
              <ModernButton variant="bordered" size="sm" fullWidth>Bordered</ModernButton>
              <ModernButton variant="ghost" size="sm" fullWidth>Ghost</ModernButton>
            </div>
          </div>

          {/* Legacy Button */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🔧 Legacy Button
            </h3>
            <div className="space-y-3">
              <Button variant="primary" size="sm" fullWidth>Primary</Button>
              <Button variant="success" size="sm" fullWidth>Success</Button>
              <Button variant="warning" size="sm" fullWidth>Warning</Button>
              <Button variant="error" size="sm" fullWidth>Error</Button>
              <Button variant="outline" size="sm" fullWidth>Outline</Button>
              <Button variant="ghost" size="sm" fullWidth>Ghost</Button>
            </div>
          </div>
        </div>

        {/* Color Variants Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            🎨 Color Variants
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {variants.map((variant) => (
              <UnifiedButton
                key={variant.key}
                variant={variant.key as any}
                size="md"
                className="justify-center"
              >
                {variant.label}
              </UnifiedButton>
            ))}
          </div>
        </div>

        {/* Size Variants */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            📏 Size Variants
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            {sizes.map((size) => (
              <UnifiedButton
                key={size.key}
                variant="primary"
                size={size.key as any}
              >
                {size.label}
              </UnifiedButton>
            ))}
          </div>
        </div>

        {/* Icon Combinations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            🔧 Icon Combinations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <UnifiedButton variant="success" icon={Save}>Save</UnifiedButton>
            <UnifiedButton variant="primary" icon={Edit}>Edit</UnifiedButton>
            <UnifiedButton variant="error" icon={Trash2}>Delete</UnifiedButton>
            <UnifiedButton variant="info" icon={Download}>Download</UnifiedButton>
            <UnifiedButton variant="warning" icon={Upload}>Upload</UnifiedButton>
            <UnifiedButton variant="purple" icon={Heart}>Like</UnifiedButton>
            <UnifiedButton variant="secondary" icon={Share2}>Share</UnifiedButton>
            <UnifiedButton variant="dark" icon={Settings}>Settings</UnifiedButton>
            <UnifiedButton variant="outline" icon={Plus} iconPosition="right">Add Item</UnifiedButton>
            <UnifiedButton variant="ghost" icon={ArrowRight} iconPosition="right">Continue</UnifiedButton>
            <UnifiedButton variant="success" icon={Check} iconPosition="right">Confirm</UnifiedButton>
            <UnifiedButton variant="error" icon={X} iconPosition="right">Cancel</UnifiedButton>
          </div>
        </div>

        {/* Button States */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            🔄 Button States
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <UnifiedButton variant="primary">Normal</UnifiedButton>
            <UnifiedButton variant="primary" loading>Loading</UnifiedButton>
            <UnifiedButton variant="primary" disabled>Disabled</UnifiedButton>
            <UnifiedButton variant="primary" loading={loading} onClick={handleLoadingDemo}>
              {loading ? 'Processing...' : 'Demo Loading'}
            </UnifiedButton>
          </div>
        </div>

        {/* Full Width Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            📐 Full Width Buttons
          </h2>
          <div className="space-y-4">
            <UnifiedButton variant="primary" fullWidth>Full Width Primary</UnifiedButton>
            <UnifiedButton variant="success" fullWidth icon={Save}>Full Width with Icon</UnifiedButton>
            <UnifiedButton variant="outline" fullWidth icon={ArrowRight} iconPosition="right">
              Full Width with Right Icon
            </UnifiedButton>
          </div>
        </div>

        {/* Rounded Variants */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            🔄 Rounded Variants
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <UnifiedButton variant="primary" rounded="sm">Small Rounded</UnifiedButton>
            <UnifiedButton variant="primary" rounded="md">Medium Rounded</UnifiedButton>
            <UnifiedButton variant="primary" rounded="lg">Large Rounded</UnifiedButton>
            <UnifiedButton variant="primary" rounded="xl">Extra Large Rounded</UnifiedButton>
            <UnifiedButton variant="primary" rounded="full">Fully Rounded</UnifiedButton>
          </div>
        </div>

        {/* Shadow Variants */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            🌟 Shadow Variants
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <UnifiedButton variant="primary" shadow="none">No Shadow</UnifiedButton>
            <UnifiedButton variant="primary" shadow="sm">Small Shadow</UnifiedButton>
            <UnifiedButton variant="primary" shadow="md">Medium Shadow</UnifiedButton>
            <UnifiedButton variant="primary" shadow="lg">Large Shadow</UnifiedButton>
            <UnifiedButton variant="primary" shadow="xl">Extra Large Shadow</UnifiedButton>
          </div>
        </div>

        {/* Real-world Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            🚀 Real-world Examples
          </h2>
          
          {/* Trip Planning Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Trip Planning Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <UnifiedButton variant="primary" size="lg" icon={Plus}>
                Create New Trip
              </UnifiedButton>
              <UnifiedButton variant="success" icon={Save}>
                Save Itinerary
              </UnifiedButton>
              <UnifiedButton variant="primary" icon={Edit}>
                Edit Trip
              </UnifiedButton>
              <UnifiedButton variant="secondary" icon={Share2}>
                Share Trip
              </UnifiedButton>
              <UnifiedButton variant="error" icon={Trash2}>
                Delete Trip
              </UnifiedButton>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Form Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <UnifiedButton variant="primary" type="submit" icon={Check}>
                Submit Form
              </UnifiedButton>
              <UnifiedButton variant="outline" icon={RefreshCw}>
                Reset Form
              </UnifiedButton>
              <UnifiedButton variant="secondary" icon={X}>
                Cancel
              </UnifiedButton>
              <UnifiedButton variant="ghost" icon={Save}>
                Save Draft
              </UnifiedButton>
            </div>
          </div>

          {/* Navigation Actions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Navigation Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <UnifiedButton variant="primary" icon={ArrowRight} iconPosition="right">
                Continue
              </UnifiedButton>
              <UnifiedButton variant="secondary" icon={Search}>
                Search
              </UnifiedButton>
              <UnifiedButton variant="outline" icon={Filter}>
                Filter
              </UnifiedButton>
              <UnifiedButton variant="ghost" icon={ExternalLink}>
                Open Link
              </UnifiedButton>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-6">
            💻 Code Examples
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Basic Usage</h3>
              <pre className="text-green-400 text-sm overflow-x-auto">
{`<UnifiedButton variant="primary" size="md">
  Click Me
</UnifiedButton>`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">With Icon</h3>
              <pre className="text-green-400 text-sm overflow-x-auto">
{`<UnifiedButton variant="success" icon={Save}>
  Save Changes
</UnifiedButton>`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Loading State</h3>
              <pre className="text-green-400 text-sm overflow-x-auto">
{`<UnifiedButton variant="primary" loading>
  Processing...
</UnifiedButton>`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Custom Styling</h3>
              <pre className="text-green-400 text-sm overflow-x-auto">
{`<UnifiedButton 
  variant="outline" 
  size="lg" 
  rounded="full"
  shadow="xl"
  icon={ArrowRight}
  iconPosition="right"
>
  Continue
</UnifiedButton>`}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Button Test Suite - Test all your button components in one place
          </p>
        </div>
      </div>
    </div>
  );
};

export default ButtonTestPage;
