import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Upload, MapPin, Calendar, Tag, Image, FileText, Share2 } from 'lucide-react';
import ModernButton from '../components/ui/ModernButton';
import Card from '../components/ui/Card';
import ModernHeader from '../components/ModernHeader';

interface BlogPost {
  title: string;
  content: string;
  tags: string[];
  location: string;
  date: string;
  images: string[];
  isPublished: boolean;
}

const CreateBlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [blogPost, setBlogPost] = useState<BlogPost>({
    title: '',
    content: '',
    tags: [],
    location: '',
    date: new Date().toISOString().split('T')[0],
    images: [],
    isPublished: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: keyof BlogPost, value: any) => {
    setBlogPost(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !blogPost.tags.includes(newTag.trim())) {
      setBlogPost(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setBlogPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setBlogPost(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // TODO: Save as draft to backend
      console.log('Saving draft:', blogPost);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      // TODO: Publish to backend
      console.log('Publishing blog post:', blogPost);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Blog post published successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error publishing blog post:', error);
      alert('Failed to publish blog post. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    setIsPreview(!isPreview);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ModernHeader />
      
      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isPreview ? 'Preview Blog Post' : 'Create Travel Blog'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Share your travel experiences with the world
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ModernButton
                variant="outline"
                onClick={handlePreview}
                icon={isPreview ? FileText : Eye}
              >
                {isPreview ? 'Edit' : 'Preview'}
              </ModernButton>
              <ModernButton
                variant="outline"
                onClick={handleSaveDraft}
                loading={isSaving}
                icon={Save}
              >
                Save Draft
              </ModernButton>
              <ModernButton
                onClick={handlePublish}
                loading={isSaving}
                icon={Share2}
              >
                Publish
              </ModernButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                {isPreview ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        {blogPost.title || 'Untitled Blog Post'}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{blogPost.location || 'No location specified'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{blogPost.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    {blogPost.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {blogPost.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Blog image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {blogPost.content || 'Start writing your blog post...'}
                      </div>
                    </div>
                    
                    {blogPost.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {blogPost.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Blog Title
                      </label>
                      <input
                        type="text"
                        value={blogPost.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter your blog title..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content
                      </label>
                      <textarea
                        value={blogPost.content}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        placeholder="Write your travel story here..."
                        rows={15}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    {/* Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Images
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          Upload images from your travels
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                        >
                          <Image className="w-4 h-4 mr-2" />
                          Choose Images
                        </label>
                      </div>
                      
                      {blogPost.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mt-4">
                          {blogPost.images.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => {
                                  const newImages = blogPost.images.filter((_, i) => i !== index);
                                  handleInputChange('images', newImages);
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Post Details */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Post Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={blogPost.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Where did you travel?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={blogPost.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </Card>

              {/* Tags */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Tags
                </h3>
                
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <ModernButton
                      onClick={handleAddTag}
                      size="sm"
                      icon={Tag}
                    >
                      Add
                    </ModernButton>
                  </div>
                  
                  {blogPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {blogPost.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlogPage;
