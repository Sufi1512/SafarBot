import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Search, Plus, User } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  showCreateButton?: boolean;
  onSearch?: (query: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  showSearch = false,
  showCreateButton = false,
  searchValue = '',
  onSearchChange
}) => {
  const { user } = useAuth();

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Title and subtitle */}
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Right side - Search, notifications, and actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center text-[10px]">
              3
            </span>
          </button>

          {/* Create button */}
          {showCreateButton && (
            <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors">
              <Plus className="h-3.5 w-3.5" />
              <span>Create New</span>
            </button>
          )}

          {/* User profile */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-gray-900 dark:text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;


