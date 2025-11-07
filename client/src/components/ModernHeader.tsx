import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import ModernButton from './ui/ModernButton';
import AuthModal from './AuthModal';
import ConfirmModal from './ui/ConfirmModal';
import logoImage from '../asset/images/logo.png';
import { cn } from '../utils/cn';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  PowerIcon,
} from '@heroicons/react/24/outline';
import { IconType } from 'react-icons';
import {
  RiHomeSmileLine,
  RiFlightTakeoffLine,
  RiHotelLine,
  RiSuitcaseLine,
  RiDashboardLine,
} from 'react-icons/ri';

interface NavItem {
  name: string;
  href: string;
  icon: IconType;
  iconBg: string;
  iconColor: string;
  iconRing: string;
}

const ModernHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { showSuccess } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showNotifications && !target.closest('[data-notifications]')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  const handleOpenAuthModal = (mode: 'login' | 'signup') => {
    console.log('Opening auth modal:', mode);
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleAuthSuccess = () => {
    // Handle successful authentication
    console.log('Authentication successful');
    showSuccess(
      'Welcome back! 🎉',
      `You've successfully logged in to your account.`
    );
    // Close modal after successful login - no automatic redirect
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (hasNewNotifications) {
      setHasNewNotifications(false);
    }
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      showSuccess(
        'Logged out successfully! 👋',
        'You have been logged out of your account.'
      );
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const baseNavItems: NavItem[] = [
    {
      name: 'Home',
      href: '/',
      icon: RiHomeSmileLine,
      iconBg: 'bg-blue-100/80 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-300',
      iconRing: 'ring-blue-200 dark:ring-blue-500/40',
    },
    {
      name: 'Flights',
      href: '/flights',
      icon: RiFlightTakeoffLine,
      iconBg: 'bg-sky-100/80 dark:bg-sky-900/30',
      iconColor: 'text-sky-600 dark:text-sky-300',
      iconRing: 'ring-sky-200 dark:ring-sky-500/40',
    },
    {
      name: 'Hotels',
      href: '/hotels',
      icon: RiHotelLine,
      iconBg: 'bg-amber-100/80 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-300',
      iconRing: 'ring-amber-200 dark:ring-amber-500/40',
    },
    {
      name: 'Packages',
      href: '/packages',
      icon: RiSuitcaseLine,
      iconBg: 'bg-emerald-100/80 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-300',
      iconRing: 'ring-emerald-200 dark:ring-emerald-500/40',
    },
  ];

  const navItems: NavItem[] = baseNavItems;

  const authenticatedNavItems: NavItem[] = [
    ...baseNavItems,
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: RiDashboardLine,
      iconBg: 'bg-violet-100/80 dark:bg-violet-900/30',
      iconColor: 'text-violet-600 dark:text-violet-300',
      iconRing: 'ring-violet-200 dark:ring-violet-500/40',
    },
  ];

  const profileMenuItems = [
    { name: 'Dashboard', icon: UserCircleIcon, href: '/dashboard' },
    { name: 'Profile', icon: UserCircleIcon, href: '/profile' },
    { name: 'Settings', icon: Cog6ToothIcon, href: '/settings' },
    { name: 'Sign Out', icon: PowerIcon, action: handleLogoutClick },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50'
            : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="relative">
                <img 
                  src={logoImage} 
                  alt="SafarBot Logo" 
                  className="w-50 h-36 object-contain"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {(isAuthenticated ? authenticatedNavItems : navItems).map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'relative group flex items-center gap-3 px-4 py-2 rounded-xl font-medium transition-all duration-200',
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200',
                        item.iconBg,
                        item.iconRing,
                        isActive
                          ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 shadow-sm'
                          : 'group-hover:shadow-sm group-hover:ring-2 group-hover:ring-offset-2 group-hover:ring-offset-white dark:group-hover:ring-offset-gray-900'
                      )}
                    >
                      <item.icon className={cn('w-4 h-4', item.iconColor)} />
                    </span>
                    <span className="text-sm">{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-blue-50 dark:bg-blue-900/30 rounded-xl -z-10"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              
            {/* Search Button */}
              <button className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

            {/* Theme Toggle */}
              <button
              onClick={toggleDarkMode}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>

            {/* Notifications */}
              <div className="relative" data-notifications>
                <button 
                  onClick={handleNotificationClick}
                  className={`relative p-2 rounded-xl transition-all duration-200 ${
                    showNotifications 
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <BellIcon className="w-5 h-5" />
                  {hasNewNotifications && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-4 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Welcome to SafarBot! 🎉
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Start planning your next adventure with AI-powered travel recommendations.
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              Just now
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              New features available
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Check out our latest travel planning tools and collaboration features.
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              2 hours ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                      <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>

              {/* Auth Buttons / Profile Menu */}
            {!isAuthenticated ? (
                <div className="flex items-center space-x-3 ml-4">
                <ModernButton 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    console.log('Sign In button clicked');
                    handleOpenAuthModal('login');
                  }}
                >
                  Sign In
                </ModernButton>
                <ModernButton 
                  variant="solid" 
                  size="sm"
                  onClick={() => {
                    console.log('Sign Up button clicked');
                    handleOpenAuthModal('signup');
                  }}
                >
                  Sign Up
                </ModernButton>
              </div>
            ) : (
                <div className="relative ml-4">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                      </span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2"
                      >
                        {profileMenuItems.map((item) => (
                          <button
                            key={item.name}
                            onClick={() => {
                              if (item.action) {
                                item.action();
                              } else if (item.href) {
                                navigate(item.href);
                              }
                              setIsProfileMenuOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                              item.name === 'Sign Out' ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <item.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{item.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
              </div>
            )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 space-y-2">
                {(isAuthenticated ? authenticatedNavItems : navItems).map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200',
                        isActive
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200',
                          item.iconBg,
                          item.iconRing,
                          isActive
                            ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 shadow-sm'
                            : ''
                        )}
                      >
                        <item.icon className={cn('w-5 h-5', item.iconColor)} />
                      </span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                {!isAuthenticated && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                                          <ModernButton 
                        variant="ghost" 
                        size="sm"
                        fullWidth
                        onClick={() => {
                          console.log('Mobile Sign In button clicked');
                          handleOpenAuthModal('login');
                        }}
                      >
                        Sign In
                      </ModernButton>
                      <ModernButton 
                        variant="solid" 
                        size="sm"
                        fullWidth
                        onClick={() => {
                          console.log('Mobile Sign Up button clicked');
                          handleOpenAuthModal('signup');
                        }}
                      >
                        Sign Up
                      </ModernButton>
     </div>
                )}
   </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Click outside to close menus */}
      {(isMobileMenuOpen || isProfileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsProfileMenuOpen(false);
          }}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        defaultMode={authMode}
        onLoginSuccess={handleAuthSuccess}
        onSignupSuccess={handleAuthSuccess}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out? You'll need to log in again to access your account."
        confirmText="Sign Out"
        cancelText="Cancel"
        type="warning"
      />
    </>
   );
 };

export default ModernHeader;