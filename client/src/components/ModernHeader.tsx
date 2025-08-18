import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  User, 
  LogOut,
  Settings,
  Bell,
  Search as SearchIcon,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ModernButton from './ui/ModernButton';

const ModernHeader: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: Sparkles },
    { name: 'Flights', href: '/flights' },
    { name: 'Hotels', href: '/hotels' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-dark-card/80 backdrop-blur-2xl border-b border-white/20 dark:border-secondary-700/30 shadow-2xl' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Gradient overlay for extra modern effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-secondary-500/5 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <Link to="/" className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-primary-500/25 transition-all duration-300">
                  <span className="text-white font-bold text-2xl">S</span>
                </div>
                {/* Animated glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-secondary-900 dark:text-dark-text bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  SafarBot
                </span>
                <span className="text-xs text-secondary-500 dark:text-secondary-400 font-medium tracking-wider">
                  TRAVEL INTELLIGENCE
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navigation.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={item.href}
                  className={`relative px-8 py-4 text-sm font-bold rounded-2xl transition-all duration-300 group ${
                    isActive(item.href)
                      ? 'text-white bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/25'
                      : 'text-secondary-600 dark:text-secondary-300 hover:text-primary-500 hover:bg-white/50 dark:hover:bg-secondary-800/50 backdrop-blur-sm'
                  }`}
                >
                  {isActive(item.href) && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl"
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.name}
                  </span>
                  
                  {/* Hover effect */}
                  {!isActive(item.href) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/10 to-secondary-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 text-secondary-600 dark:text-secondary-400 hover:text-primary-500 hover:bg-white/50 dark:hover:bg-secondary-800/50 rounded-2xl transition-all duration-300 backdrop-blur-sm group"
            >
              <SearchIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-4 text-secondary-600 dark:text-secondary-400 hover:text-primary-500 hover:bg-white/50 dark:hover:bg-secondary-800/50 rounded-2xl transition-all duration-300 backdrop-blur-sm group"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              ) : (
                <Moon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              )}
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 text-secondary-600 dark:text-secondary-400 hover:text-primary-500 hover:bg-white/50 dark:hover:bg-secondary-800/50 rounded-2xl transition-all duration-300 backdrop-blur-sm relative group"
            >
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-error-500 to-error-600 rounded-full border-2 border-white dark:border-dark-card shadow-lg animate-pulse" />
            </motion.button>

            {/* User Menu */}
            {isAuthenticated ? (
              <motion.div
                className="relative"
                initial={false}
                animate={isMenuOpen ? "open" : "closed"}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-3 p-3 text-secondary-600 dark:text-secondary-400 hover:text-primary-500 hover:bg-white/50 dark:hover:bg-secondary-800/50 rounded-2xl transition-all duration-300 backdrop-blur-sm group"
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
                      <span className="text-white text-sm font-bold">
                        {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                  </div>
                </motion.button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-4 w-72 bg-white/90 dark:bg-dark-card/90 rounded-3xl shadow-2xl border border-white/20 dark:border-secondary-700/30 backdrop-blur-2xl"
                    >
                      <div className="p-6 border-b border-white/20 dark:border-secondary-700/30">
                        <p className="text-lg font-bold text-secondary-900 dark:text-dark-text">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                          {user?.email}
                        </p>
                      </div>
                      <div className="p-4 space-y-2">
                        <button className="w-full flex items-center space-x-4 px-4 py-4 text-sm text-secondary-700 dark:text-secondary-300 hover:text-primary-500 hover:bg-white/50 dark:hover:bg-secondary-800/50 rounded-2xl transition-all duration-200 group">
                          <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                          <span className="font-semibold">Profile</span>
                        </button>
                        <button className="w-full flex items-center space-x-4 px-4 py-4 text-sm text-secondary-700 dark:text-secondary-300 hover:text-primary-500 hover:bg-white/50 dark:hover:bg-secondary-800/50 rounded-2xl transition-all duration-200 group">
                          <Settings className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                          <span className="font-semibold">Settings</span>
                        </button>
                        <button 
                          onClick={logout}
                          className="w-full flex items-center space-x-4 px-4 py-4 text-sm text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-2xl transition-all duration-200 group"
                        >
                          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                          <span className="font-semibold">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="flex items-center space-x-4">
                <ModernButton 
                  variant="ghost" 
                  size="sm" 
                  className="px-8 py-3 rounded-2xl font-bold hover:bg-white/50 dark:hover:bg-secondary-800/50 backdrop-blur-sm"
                >
                  Sign In
                </ModernButton>
                <ModernButton 
                  variant="gradient" 
                  size="sm" 
                  className="px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary-500/25"
                >
                  Sign Up
                </ModernButton>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-4 text-secondary-600 dark:text-secondary-400 hover:text-primary-500 hover:bg-white/50 dark:hover:bg-secondary-800/50 rounded-2xl transition-all duration-300 backdrop-blur-sm"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-white/20 dark:border-secondary-700/30 bg-white/90 dark:bg-dark-card/90 backdrop-blur-2xl rounded-b-3xl overflow-hidden"
            >
              <div className="py-6 space-y-3 px-4">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-4 px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${
                        isActive(item.href)
                          ? 'text-white bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/25'
                          : 'text-secondary-700 dark:text-secondary-300 hover:text-primary-500 hover:bg-white/50 dark:hover:bg-secondary-800/50'
                      }`}
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span>{item.name}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default ModernHeader;
