import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Upload, Tag, FileText, Share2, Plus, X, Star, Clock, DollarSign, MapPin } from 'lucide-react';
import ModernButton from '../components/ui/ModernButton';
import Card from '../components/ui/Card';
import ModernHeader from '../components/ModernHeader';

interface GuideSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface TravelGuide {
  title: string;
  description: string;
  destination: string;
  country: string;
  duration: string;
  budget: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sections: GuideSection[];
  tags: string[];
  isPublic: boolean;
  coverImage: string;
}

const CreateGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [guide, setGuide] = useState<TravelGuide>({
    title: '',
    description: '',
    destination: '',
    country: '',
    duration: '',
    budget: '',
    difficulty: 'easy',
    sections: [],
    tags: [],
    isPublic: true,
    coverImage: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const handleInputChange = (field: keyof TravelGuide, value: any) => {
    setGuide(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !guide.tags.includes(newTag.trim())) {
      setGuide(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setGuide(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      const newSection: GuideSection = {
        id: `section-${Date.now()}`,
        title: newSectionTitle.trim(),
        content: '',
        order: guide.sections.length + 1
      };
      
      setGuide(prev => ({
        ...prev,
        sections: [...prev.sections, newSection]
      }));
      setNewSectionTitle('');
    }
  };

  const handleSectionChange = (sectionId: string, field: keyof GuideSection, value: any) => {
    setGuide(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    }));
  };

  const handleRemoveSection = (sectionId: string) => {
    setGuide(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    setGuide(prev => {
      const sections = [...prev.sections];
      const index = sections.findIndex(s => s.id === sectionId);
      
      if (direction === 'up' && index > 0) {
        [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
      } else if (direction === 'down' && index < sections.length - 1) {
        [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
      }
      
      return { ...prev, sections };
    });
  };

  const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setGuide(prev => ({
        ...prev,
        coverImage: imageUrl
      }));
    }
  };

  const handleSaveGuide = async () => {
    setIsSaving(true);
    try {
      // TODO: Save guide to backend
      console.log('Saving guide:', guide);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Guide saved successfully!');
    } catch (error) {
      console.error('Error saving guide:', error);
      alert('Failed to save guide. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishGuide = async () => {
    setIsSaving(true);
    try {
      // TODO: Publish guide to backend
      console.log('Publishing guide:', guide);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Guide published successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error publishing guide:', error);
      alert('Failed to publish guide. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ModernHeader />
      
      <div className="pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  {isPreview ? 'Preview Travel Guide' : 'Create Travel Guide'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Share your travel knowledge and experiences
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ModernButton
                variant="outline"
                onClick={() => setIsPreview(!isPreview)}
                icon={isPreview ? FileText : Eye}
              >
                {isPreview ? 'Edit' : 'Preview'}
              </ModernButton>
              <ModernButton
                variant="outline"
                onClick={handleSaveGuide}
                loading={isSaving}
                icon={Save}
              >
                Save Draft
              </ModernButton>
              <ModernButton
                onClick={handlePublishGuide}
                loading={isSaving}
                icon={Share2}
              >
                Publish Guide
              </ModernButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="p-6">
                {isPreview ? (
                  <div className="space-y-6">
                    {/* Guide Header */}
                    <div className="text-center">
                      {guide.coverImage && (
                        <img
                          src={guide.coverImage}
                          alt="Guide cover"
                          className="w-full h-64 object-cover rounded-lg mb-6"
                        />
                      )}
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {guide.title || 'Untitled Travel Guide'}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {guide.description || 'No description provided'}
                      </p>
                      
                      <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{guide.destination}, {guide.country}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{guide.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{guide.budget}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4" />
                          <span className="capitalize">{guide.difficulty}</span>
                        </div>
                      </div>
                      
                      {guide.tags.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2">
                          {guide.tags.map((tag, index) => (
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

                    {/* Guide Sections */}
                    <div className="space-y-6">
                      {guide.sections.map((section, index) => (
                        <div key={section.id} className="border-l-4 border-blue-500 pl-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                            {index + 1}. {section.title}
                          </h3>
                          <div className="prose max-w-none">
                            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                              {section.content || 'No content provided for this section.'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Guide Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Guide Title
                        </label>
                        <input
                          type="text"
                          value={guide.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Enter guide title..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Destination
                        </label>
                        <input
                          type="text"
                          value={guide.destination}
                          onChange={(e) => handleInputChange('destination', e.target.value)}
                          placeholder="e.g., Paris"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          value={guide.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          placeholder="e.g., France"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={guide.duration}
                          onChange={(e) => handleInputChange('duration', e.target.value)}
                          placeholder="e.g., 7 days"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Budget
                        </label>
                        <input
                          type="text"
                          value={guide.budget}
                          onChange={(e) => handleInputChange('budget', e.target.value)}
                          placeholder="e.g., $1000-1500"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Difficulty Level
                        </label>
                        <select
                          value={guide.difficulty}
                          onChange={(e) => handleInputChange('difficulty', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Visibility
                        </label>
                        <select
                          value={guide.isPublic ? 'public' : 'private'}
                          onChange={(e) => handleInputChange('isPublic', e.target.value === 'public')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={guide.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe what this guide covers..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    {/* Cover Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cover Image
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          Upload a cover image for your guide
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                          className="hidden"
                          id="cover-upload"
                        />
                        <label
                          htmlFor="cover-upload"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Cover Image
                        </label>
                      </div>
                    </div>

                    {/* Sections */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Guide Sections
                        </h3>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newSectionTitle}
                            onChange={(e) => setNewSectionTitle(e.target.value)}
                            placeholder="Section title..."
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
                          />
                          <ModernButton
                            onClick={handleAddSection}
                            size="sm"
                            icon={Plus}
                          >
                            Add Section
                          </ModernButton>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {guide.sections.map((section, index) => (
                          <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {index + 1}. {section.title}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleMoveSection(section.id, 'up')}
                                  disabled={index === 0}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                >
                                  ↑
                                </button>
                                <button
                                  onClick={() => handleMoveSection(section.id, 'down')}
                                  disabled={index === guide.sections.length - 1}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                >
                                  ↓
                                </button>
                                <button
                                  onClick={() => handleRemoveSection(section.id)}
                                  className="p-1 text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <textarea
                              value={section.content}
                              onChange={(e) => handleSectionChange(section.id, 'content', e.target.value)}
                              placeholder="Write the content for this section..."
                              rows={6}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
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
                  
                  {guide.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {guide.tags.map((tag, index) => (
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

              {/* Guide Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Guide Stats
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sections:</span>
                    <span className="font-medium">{guide.sections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                    <span className="font-medium capitalize">{guide.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Visibility:</span>
                    <span className="font-medium">{guide.isPublic ? 'Public' : 'Private'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tags:</span>
                    <span className="font-medium">{guide.tags.length}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGuidePage;
