import React, { useRef, useEffect } from 'react';
import { User, ChevronDown, Settings, LogOut, HelpCircle, Shield, CreditCard, Bell, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isOpen, onClose, onLogout }) => {
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute top-16 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700" ref={dropdownRef}>
        {/* User Profile Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.first_name} {user?.last_name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                View profile
                <ChevronDown className="h-4 w-4 ml-1" />
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {/* First Group */}
          <div className="px-2 py-1">
            <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
              <HelpCircle className="h-4 w-4 mr-3" />
              Take our travel quiz
            </button>
            <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
              <Settings className="h-4 w-4 mr-3" />
              Account settings
            </button>
            <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
              <Bell className="h-4 w-4 mr-3" />
              Up Next
            </button>
            <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
              <CreditCard className="h-4 w-4 mr-3" />
              Receipts
            </button>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

          {/* Second Group */}
          <div className="px-2 py-1">
            <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
              <Star className="h-4 w-4 mr-3" />
              Give feedback
            </button>
            <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
              <Shield className="h-4 w-4 mr-3" />
              Privacy policy
            </button>
            <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
              <Settings className="h-4 w-4 mr-3" />
              Terms of service
            </button>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

          {/* Log Out */}
          <div className="px-2 py-1">
            <button 
              onClick={onLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDropdown;


