import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageCircle, 
  Search, 
  Heart, 
  Briefcase, 
  Bell, 
  Compass, 
  Plus,
  User,
  LogOut,
  ChevronLeft,
  MoreHorizontal,
  Menu,
  UserCircle,
  Settings,
  Power,
  Home
} from 'lucide-react';

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  onLogout,
  isExpanded = true,
  onToggleExpanded
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const profileMenuItems = [
    { name: 'Dashboard', icon: UserCircle, href: '/dashboard' },
    { name: 'Profile', icon: User, href: '/profile' },
    { name: 'Settings', icon: Settings, href: '/settings' },
    { name: 'Sign Out', icon: Power, action: onLogout },
  ];


  const handleLogoutConfirm = () => {
    onLogout();
    setShowLogoutConfirm(false);
    setShowProfileDropdown(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const navigationItems: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tooltip?: string;
    notification?: number | string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'chats', label: 'Collaboration', icon: MessageCircle, tooltip: 'Collaborate on itineraries with chat' },
    { id: 'explore', label: 'Explore', icon: Search },
    { id: 'saved', label: 'Saved', icon: Heart },
    { id: 'trips', label: 'Trips', icon: Briefcase },
    { id: 'updates', label: 'Updates', icon: Bell },
    { id: 'inspiration', label: 'Inspiration', icon: Compass },
    { id: 'create', label: 'Create', icon: Plus },
  ];

  return (
    <div 
      className={`${isExpanded ? 'w-64' : 'w-16'} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white h-[calc(100vh-4rem)] flex flex-col fixed top-16 left-0 z-50 transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Sidebar clicked - preventing navigation');
      }}
    >
      {/* Header */}
      <div className="pt-2 pb-1 px-3">
        <div className="flex items-center justify-end">
          {onToggleExpanded && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Toggle button clicked');
                onToggleExpanded();
              }}
              className="w-8 h-8 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex-shrink-0 flex items-center justify-center pointer-events-auto"
              title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              type="button"
            >
              {isExpanded ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          // Map 'overview' to 'dashboard' for highlighting
          const isActive = activeTab === item.id || (item.id === 'dashboard' && activeTab === 'overview');
          
          return (
            <button
              key={item.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTabChange(item.id);
              }}
              className={`w-full flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} px-3 py-2 rounded-md text-left transition-all duration-200 relative group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={!isExpanded ? item.label : undefined}
              type="button"
            >
              <div className="flex items-center space-x-2">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`} />
                {isExpanded && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </div>
              {isExpanded && item.notification && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[16px] text-center font-medium">
                  {item.notification}
                </span>
              )}
              {!isExpanded && item.notification && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900"></div>
              )}
            </button>
          );
        })}
      </nav>


      {/* App Promotion */}
      {isExpanded && (
        <div className="px-3 pb-2">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-md p-2 text-white hover:from-green-700 hover:to-green-800 transition-all duration-200 cursor-pointer">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-5 h-5 bg-white bg-opacity-20 rounded flex items-center justify-center">
                <span className="text-xs">📱</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-xs truncate">SafarBot Mobile</h3>
                <p className="text-xs text-green-100 truncate">Personalized recommendations</p>
              </div>
            </div>
            <p className="text-xs text-green-100 font-medium">Learn more →</p>
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="px-3 py-2 relative">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowProfileDropdown(!showProfileDropdown);
          }}
          className={`w-full flex items-center ${isExpanded ? 'space-x-2' : 'justify-center'} p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 group`}
          title={!isExpanded ? `${user?.first_name} ${user?.last_name}` : undefined}
          type="button"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-white" />
          </div>
          {isExpanded && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
              <MoreHorizontal className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 flex-shrink-0" />
            </>
          )}
        </button>

        {/* Profile Dropdown */}
        {showProfileDropdown && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
            {profileMenuItems.map((item) => (
              <button
                key={item.name}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (item.action) {
                    item.action();
                  } else if (item.href) {
                    navigate(item.href);
                  }
                  setShowProfileDropdown(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                  item.name === 'Sign Out' ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Log out</h3>
                <p className="text-sm text-gray-600">Are you sure you want to log out?</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLogoutCancel();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLogoutConfirm();
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                type="button"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSidebar;
