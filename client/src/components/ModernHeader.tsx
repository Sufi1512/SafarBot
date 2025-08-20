import React from "react";
import { Link, useLocation } from 'react-router-dom';
import {
  UserCircleIcon,
  CodeBracketSquareIcon,
  Square3Stack3DIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  InboxArrowDownIcon,
  LifebuoyIcon,
  PowerIcon,
  RocketLaunchIcon,
  Bars2Icon,
  SparklesIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ModernButton from './ui/ModernButton';

// profile menu component
const profileMenuItems = [
  {
    label: "My Profile",
    icon: UserCircleIcon,
  },
  {
    label: "Settings",
    icon: Cog6ToothIcon,
  },
  {
    label: "Inbox",
    icon: InboxArrowDownIcon,
  },
  {
    label: "Help",
    icon: LifebuoyIcon,
  },
  {
    label: "Sign Out",
    icon: PowerIcon,
  },
];

function ProfileMenu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, logout } = useAuth();

  const closeMenu = () => setIsMenuOpen(false);

  const handleSignOut = () => {
    logout();
    closeMenu();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 rounded-full py-2 px-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:shadow-md"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
          <span className="text-white text-sm font-bold">
            {user?.first_name?.[0] || user?.email?.[0] || 'U'}
          </span>
        </div>
        <ChevronDownIcon
          strokeWidth={2.5}
          className={`h-3 w-3 transition-transform duration-200 ${
            isMenuOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      
      {isMenuOpen && (
        <>
          <div className="absolute right-0 top-full mt-3 w-56 bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200/50 rounded-2xl p-3 z-50">
            {profileMenuItems.map(({ label, icon }, index) => {
              const isLastItem = index === profileMenuItems.length - 1;
              return (
                <button
                  key={label}
                  onClick={isLastItem ? handleSignOut : closeMenu}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-gray-700 hover:text-blue-600 transition-all duration-200 ${
                    isLastItem
                      ? "hover:bg-red-50 hover:shadow-md"
                      : "hover:bg-blue-50 hover:shadow-md"
                  }`}
                >
                  {React.createElement(icon, {
                    className: `h-4 w-4 ${isLastItem ? "text-red-500" : "text-gray-600"}`,
                    strokeWidth: 2,
                  })}
                  <span className={`font-medium ${isLastItem ? "text-red-500" : ""}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsMenuOpen(false)}
          />
        </>
      )}
    </div>
  );
}

// nav list menu
const navListMenuItems = [
  {
    title: "Flight Booking",
    description: "Search and book flights to your destination.",
    href: "/flights",
    icon: RocketLaunchIcon,
  },
  {
    title: "Hotel Booking",
    description: "Find and reserve hotels for your stay.",
    href: "/hotels",
    icon: CodeBracketSquareIcon,
  },
  {
    title: "Travel Packages",
    description: "Complete travel packages with flights and hotels.",
    href: "/packages",
    icon: Square3Stack3DIcon,
  },
];

function NavListMenu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const renderItems = navListMenuItems.map(({ title, description, href, icon }) => (
    <Link to={href} key={title}>
      <div className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl p-4 transition-all duration-200 hover:shadow-md">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            {React.createElement(icon, {
              className: "h-5 w-5 text-white",
              strokeWidth: 2,
            })}
          </div>
          <div>
            <h6 className="mb-1 text-gray-900 font-semibold text-base">
              {title}
            </h6>
            <p className="font-normal text-gray-600 text-sm">
              {description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  ));

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsMenuOpen(true)}
        onMouseLeave={() => setIsMenuOpen(false)}
        className="hidden items-center gap-2 font-medium text-gray-700 hover:text-blue-600 lg:flex lg:rounded-full hover:bg-blue-50 px-5 py-3 transition-all duration-200 hover:shadow-md"
      >
        <Square3Stack3DIcon className="h-[18px] w-[18px] text-gray-600" />
        Services
        <ChevronDownIcon
          strokeWidth={2}
          className={`h-3 w-3 transition-transform duration-200 ${
            isMenuOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      
      {isMenuOpen && (
        <div 
          className="absolute top-full left-0 w-96 bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200/50 rounded-2xl p-4 z-50"
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          <ul className="flex w-full flex-col gap-2">
            {renderItems}
          </ul>
        </div>
      )}
      
      <div className="lg:hidden">
        <button className="flex items-center gap-2 font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl px-4 py-3 transition-all duration-200">
          <Square3Stack3DIcon className="h-[18px] w-[18px] text-gray-600" />
          Services
        </button>
        <ul className="ml-6 flex w-full flex-col gap-2 bg-gray-50/80 rounded-xl p-3 mt-2">
          {renderItems}
        </ul>
      </div>
    </div>
  );
}

// nav list component
const navListItems = [
  {
    label: "Home",
    icon: SparklesIcon,
    href: "/",
  },
  {
    label: "Flights",
    icon: RocketLaunchIcon,
    href: "/flights",
  },
  {
    label: "Hotels",
    icon: CodeBracketSquareIcon,
    href: "/hotels",
  },
];

function NavList() {
  const location = useLocation();

  return (
    <ul className="mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center">
      <NavListMenu />
      {navListItems.map(({ label, icon, href }) => {
        const isActive = location.pathname === href;
        return (
          <Link
            key={label}
            to={href}
            className={`font-medium px-5 py-3 rounded-full transition-all duration-200 ${
              isActive 
                ? 'text-blue-600 bg-blue-50 shadow-md' 
                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-2">
              {React.createElement(icon, { 
                className: `h-[18px] w-[18px] ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }` 
              })}
              <span className={`font-semibold ${
                isActive ? 'text-blue-600' : 'text-gray-700'
              }`}> {label}</span>
            </div>
          </Link>
        );
      })}
    </ul>
  );
}

const ModernHeader: React.FC = () => {
  const [isNavOpen, setIsNavOpen] = React.useState(false);
  const { isAuthenticated } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const toggleIsNavOpen = () => setIsNavOpen((cur) => !cur);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setIsNavOpen(false),
    );
  }, []);

  return (
    <div className="w-full bg-transparent sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="p-4 rounded-full bg-white/95 backdrop-blur-xl shadow-2xl border border-white/30 relative">
          <div className="relative flex items-center justify-between text-gray-900">
            <Link
              to="/"
              className="mr-4 ml-2 cursor-pointer py-1.5 font-medium flex items-center gap-3 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-200">
                  SafarBot
                </span>
                <span className="text-xs text-gray-500 font-medium tracking-wider group-hover:text-gray-600 transition-colors">
                  TRAVEL INTELLIGENCE
                </span>
              </div>
            </Link>
            
            <div className="hidden lg:block">
              <NavList />
            </div>

            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button className="p-3 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:shadow-md">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-3 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:shadow-md"
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>

              {/* Notifications */}
              <button className="p-3 rounded-full relative text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:shadow-md">
                <BellIcon className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              </button>

              <button
                onClick={toggleIsNavOpen}
                className="p-3 ml-auto mr-2 lg:hidden text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:shadow-md rounded-full"
              >
                <Bars2Icon className="h-6 w-6" />
              </button>

              {!isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link to="/login">
                    <ModernButton 
                      size="sm" 
                      variant="ghost"
                      className="text-gray-700 hover:text-blue-600 font-semibold rounded-full px-5 py-3 hover:bg-blue-50 hover:shadow-md transition-all duration-200"
                    >
                      Sign In
                    </ModernButton>
                  </Link>
                  <Link to="/signup">
                    <ModernButton 
                      size="sm" 
                      variant="gradient"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 rounded-full px-6 py-3"
                    >
                      Sign Up
                    </ModernButton>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/dashboard">
                    <ModernButton 
                      size="sm" 
                      variant="ghost"
                      className="text-gray-700 hover:text-blue-600 font-semibold rounded-full px-5 py-3 hover:bg-blue-50 hover:shadow-md transition-all duration-200"
                    >
                      Dashboard
                    </ModernButton>
                  </Link>
                  <ProfileMenu />
                </div>
              )}
            </div>
          </div>
          
          {isNavOpen && (
            <div className="lg:hidden overflow-scroll bg-white/95 backdrop-blur-xl border-t border-gray-100/50 mt-4 pt-4 rounded-2xl">
              <NavList />
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default ModernHeader;
