import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, BarChart3, Clock, Database } from 'lucide-react';
import { cacheService } from '../services/cachedApi';

interface CacheStats {
  memoryCacheSize: number;
  sessionStorageSize: number;
  localStorageSize: number;
  totalSize: number;
}

const CacheManager: React.FC = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const updateStats = () => {
    setStats(cacheService.getCacheStats());
  };

  useEffect(() => {
    updateStats();
  }, []);

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear all cached data? This will reload data from the server.')) {
      cacheService.clearCache();
      updateStats();
      // Optionally reload the page to refresh all data
      window.location.reload();
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      // Clear cache and reload
      cacheService.clearCache();
      updateStats();
      // Reload the page to fetch fresh data
      window.location.reload();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatSize = (size: number) => {
    if (size === 0) return '0';
    if (size < 1000) return `${size}`;
    if (size < 1000000) return `${(size / 1000).toFixed(1)}K`;
    return `${(size / 1000000).toFixed(1)}M`;
  };

  if (!stats) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5" />
          Cache Management
        </h3>
        <div className="flex gap-2">
          <button
            onClick={updateStats}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Refresh stats"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
            title="Refresh all data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleClearCache}
            className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            title="Clear all cache"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatSize(stats.memoryCacheSize)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Memory</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatSize(stats.sessionStorageSize)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Session</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatSize(stats.localStorageSize)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Local</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {formatSize(stats.totalSize)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        <Clock className="w-3 h-3 inline mr-1" />
        Cache helps reduce API calls and improve performance
      </div>
    </div>
  );
};

export default CacheManager;
