import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Upload, Tag, Image, Folder, Share2, X } from 'lucide-react';
import ModernButton from '../components/ui/ModernButton';
import Card from '../components/ui/Card';
import ModernHeader from '../components/ModernHeader';

interface Photo {
  id: string;
  url: string;
  caption: string;
  location: string;
  date: string;
  tags: string[];
}

interface Album {
  title: string;
  description: string;
  photos: Photo[];
  coverPhoto: string;
  isPublic: boolean;
  tags: string[];
}

const CreateAlbumPage: React.FC = () => {
  const navigate = useNavigate();
  const [album, setAlbum] = useState<Album>({
    title: '',
    description: '',
    photos: [],
    coverPhoto: '',
    isPublic: true,
    tags: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: keyof Album, value: any) => {
    setAlbum(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !album.tags.includes(newTag.trim())) {
      setAlbum(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setAlbum(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos: Photo[] = Array.from(files).map((file, index) => ({
        id: `photo-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        caption: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        tags: []
      }));
      
      setAlbum(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos]
      }));
    }
  };

  const handlePhotoChange = (photoId: string, field: keyof Photo, value: any) => {
    setAlbum(prev => ({
      ...prev,
      photos: prev.photos.map(photo =>
        photo.id === photoId ? { ...photo, [field]: value } : photo
      )
    }));
  };

  const handleRemovePhoto = (photoId: string) => {
    setAlbum(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId),
      coverPhoto: prev.coverPhoto === photoId ? '' : prev.coverPhoto
    }));
  };

  const handleSetCoverPhoto = (photoId: string) => {
    setAlbum(prev => ({
      ...prev,
      coverPhoto: photoId
    }));
  };

  const handleSaveAlbum = async () => {
    setIsSaving(true);
    try {
      // TODO: Save album to backend
      console.log('Saving album:', album);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Album saved successfully!');
    } catch (error) {
      console.error('Error saving album:', error);
      alert('Failed to save album. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishAlbum = async () => {
    setIsSaving(true);
    try {
      // TODO: Publish album to backend
      console.log('Publishing album:', album);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Album published successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error publishing album:', error);
      alert('Failed to publish album. Please try again.');
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
                  {isPreview ? 'Preview Photo Album' : 'Create Photo Album'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Organize and share your travel photos
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ModernButton
                variant="bordered"
                onClick={() => setIsPreview(!isPreview)}
                icon={isPreview ? Folder : Eye}
              >
                {isPreview ? 'Edit' : 'Preview'}
              </ModernButton>
              <ModernButton
                variant="bordered"
                onClick={handleSaveAlbum}
                loading={isSaving}
                icon={Save}
              >
                Save Draft
              </ModernButton>
              <ModernButton
                onClick={handlePublishAlbum}
                loading={isSaving}
                icon={Share2}
              >
                Publish Album
              </ModernButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="p-6">
                {isPreview ? (
                  <div className="space-y-6">
                    {/* Album Header */}
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {album.title || 'Untitled Album'}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {album.description || 'No description provided'}
                      </p>
                      {album.tags.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2">
                          {album.tags.map((tag, index) => (
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

                    {/* Photos Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {album.photos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <img
                            src={photo.url}
                            alt={photo.caption || 'Travel photo'}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          {photo.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                              <p className="text-sm truncate">{photo.caption}</p>
                            </div>
                          )}
                          {album.coverPhoto === photo.id && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                              Cover
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Album Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Album Title
                        </label>
                        <input
                          type="text"
                          value={album.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Enter album title..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Visibility
                        </label>
                        <select
                          value={album.isPublic ? 'public' : 'private'}
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
                        value={album.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe your travel experience..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    {/* Photo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Photos
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          Upload your travel photos
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                        >
                          <Image className="w-4 h-4 mr-2" />
                          Choose Photos
                        </label>
                      </div>
                    </div>

                    {/* Photos List */}
                    {album.photos.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Photos ({album.photos.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {album.photos.map((photo) => (
                            <div key={photo.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex space-x-4">
                                <img
                                  src={photo.url}
                                  alt="Upload"
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={photo.caption}
                                    onChange={(e) => handlePhotoChange(photo.id, 'caption', e.target.value)}
                                    placeholder="Add caption..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
                                  />
                                  <input
                                    type="text"
                                    value={photo.location}
                                    onChange={(e) => handlePhotoChange(photo.id, 'location', e.target.value)}
                                    placeholder="Location..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
                                  />
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleSetCoverPhoto(photo.id)}
                                      className={`px-3 py-1 rounded text-xs ${
                                        album.coverPhoto === photo.id
                                          ? 'bg-blue-500 text-white'
                                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                      }`}
                                    >
                                      {album.coverPhoto === photo.id ? 'Cover Photo' : 'Set as Cover'}
                                    </button>
                                    <button
                                      onClick={() => handleRemovePhoto(photo.id)}
                                      className="p-1 text-red-500 hover:text-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                  
                  {album.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {album.tags.map((tag, index) => (
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

              {/* Album Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Album Stats
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Photos:</span>
                    <span className="font-medium">{album.photos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Visibility:</span>
                    <span className="font-medium">{album.isPublic ? 'Public' : 'Private'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tags:</span>
                    <span className="font-medium">{album.tags.length}</span>
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

export default CreateAlbumPage;
