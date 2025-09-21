import React, { useState } from 'react';
import { Save, Edit, Trash2, Download, Upload, Heart, Share2, Settings, Plus, ArrowRight } from 'lucide-react';
import UnifiedButton from './UnifiedButton';

/**
 * Button Showcase Component
 * 
 * This component demonstrates all available button variants, sizes, and configurations.
 * Use this as a reference for implementing buttons throughout your application.
 */
const ButtonShowcase: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          🎨 Unified Button Component Showcase
        </h1>
        
        {/* Color Variants */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            🎨 Color Variants
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <UnifiedButton variant="primary">Primary</UnifiedButton>
            <UnifiedButton variant="secondary">Secondary</UnifiedButton>
            <UnifiedButton variant="success">Success</UnifiedButton>
            <UnifiedButton variant="warning">Warning</UnifiedButton>
            <UnifiedButton variant="error">Error</UnifiedButton>
            <UnifiedButton variant="info">Info</UnifiedButton>
            <UnifiedButton variant="purple">Purple</UnifiedButton>
            <UnifiedButton variant="dark">Dark</UnifiedButton>
            <UnifiedButton variant="outline">Outline</UnifiedButton>
            <UnifiedButton variant="ghost">Ghost</UnifiedButton>
          </div>
        </section>

        {/* Sizes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            📏 Button Sizes
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <UnifiedButton variant="primary" size="xs">Extra Small</UnifiedButton>
            <UnifiedButton variant="primary" size="sm">Small</UnifiedButton>
            <UnifiedButton variant="primary" size="md">Medium</UnifiedButton>
            <UnifiedButton variant="primary" size="lg">Large</UnifiedButton>
            <UnifiedButton variant="primary" size="xl">Extra Large</UnifiedButton>
          </div>
        </section>

        {/* Icons */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            🔧 Icons & Actions
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
          </div>
        </section>

        {/* States */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            🔄 Button States
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <UnifiedButton variant="primary">Normal</UnifiedButton>
            <UnifiedButton variant="primary" loading>Loading</UnifiedButton>
            <UnifiedButton variant="primary" disabled>Disabled</UnifiedButton>
            <UnifiedButton variant="primary" loading={loading} onClick={handleLoadingDemo}>
              {loading ? 'Processing...' : 'Demo Loading'}
            </UnifiedButton>
          </div>
        </section>

        {/* Full Width */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            📐 Full Width Buttons
          </h2>
          <div className="space-y-4">
            <UnifiedButton variant="primary" fullWidth>Full Width Primary</UnifiedButton>
            <UnifiedButton variant="success" fullWidth icon={Save}>Full Width with Icon</UnifiedButton>
          </div>
        </section>

        {/* Rounded Variants */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            🔄 Rounded Variants
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <UnifiedButton variant="primary" rounded="sm">Small Rounded</UnifiedButton>
            <UnifiedButton variant="primary" rounded="md">Medium Rounded</UnifiedButton>
            <UnifiedButton variant="primary" rounded="lg">Large Rounded</UnifiedButton>
            <UnifiedButton variant="primary" rounded="xl">Extra Large Rounded</UnifiedButton>
            <UnifiedButton variant="primary" rounded="full">Fully Rounded</UnifiedButton>
          </div>
        </section>

        {/* Shadow Variants */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            🌟 Shadow Variants
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <UnifiedButton variant="primary" shadow="none">No Shadow</UnifiedButton>
            <UnifiedButton variant="primary" shadow="sm">Small Shadow</UnifiedButton>
            <UnifiedButton variant="primary" shadow="md">Medium Shadow</UnifiedButton>
            <UnifiedButton variant="primary" shadow="lg">Large Shadow</UnifiedButton>
            <UnifiedButton variant="primary" shadow="xl">Extra Large Shadow</UnifiedButton>
          </div>
        </section>

        {/* Real-world Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            🚀 Real-world Examples
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
        </section>

        {/* Usage Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            💻 Code Examples
          </h2>
          <div className="bg-gray-900 text-green-400 p-6 rounded-xl font-mono text-sm overflow-x-auto">
            <pre>{`// Basic Usage
<UnifiedButton variant="primary" size="md">
  Click Me
</UnifiedButton>

// With Icon
<UnifiedButton variant="success" icon={Save}>
  Save Changes
</UnifiedButton>

// Loading State
<UnifiedButton variant="primary" loading>
  Processing...
</UnifiedButton>

// Full Width
<UnifiedButton variant="primary" fullWidth>
  Submit Form
</UnifiedButton>

// Custom Styling
<UnifiedButton 
  variant="outline" 
  size="lg" 
  rounded="full"
  shadow="xl"
  icon={ArrowRight}
  iconPosition="right"
>
  Continue
</UnifiedButton>`}</pre>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ButtonShowcase;
