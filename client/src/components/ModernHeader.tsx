import React from "react";
import { Link, useLocation } from 'react-router-dom';
import {
  Navbar,
  MobileNav,
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  IconButton,
} from "@material-tailwind/react";
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
    <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
      <MenuHandler>
        <Button
          variant="text"
          className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto text-gray-700 hover:text-blue-600"
          placeholder=""
        >
          <Avatar
            variant="circular"
            size="sm"
            alt={user?.first_name || "User"}
            className="border border-gray-300 p-0.5 bg-gradient-to-br from-blue-500 to-purple-600"
            placeholder=""
          >
            <span className="text-white text-sm font-bold">
              {user?.first_name?.[0] || user?.email?.[0] || 'U'}
            </span>
          </Avatar>
          <ChevronDownIcon
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      </MenuHandler>
      <MenuList className="p-1 bg-white shadow-xl border border-gray-200">
        {profileMenuItems.map(({ label, icon }, key) => {
          const isLastItem = key === profileMenuItems.length - 1;
          return (
            <MenuItem
              key={label}
              onClick={isLastItem ? handleSignOut : closeMenu}
              className={`flex items-center gap-2 rounded text-gray-700 hover:text-blue-600 ${
                isLastItem
                  ? "hover:bg-red-50 focus:bg-red-50 active:bg-red-50"
                  : "hover:bg-blue-50 focus:bg-blue-50 active:bg-blue-50"
              }`}
            >
              {React.createElement(icon, {
                className: `h-4 w-4 ${isLastItem ? "text-red-500" : "text-gray-600"}`,
                strokeWidth: 2,
              })}
              <Typography
                as="span"
                variant="small"
                className="font-medium"
                color={isLastItem ? "red" : "inherit"}
              >
                {label}
              </Typography>
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}

// nav list menu
const navListMenuItems = [
  {
    title: "Flight Booking",
    description: "Search and book flights to your destination.",
    href: "/flights",
  },
  {
    title: "Hotel Booking",
    description: "Find and reserve hotels for your stay.",
    href: "/hotels",
  },
  {
    title: "Travel Packages",
    description: "Complete travel packages with flights and hotels.",
    href: "/packages",
  },
];

function NavListMenu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const renderItems = navListMenuItems.map(({ title, description, href }) => (
    <Link to={href} key={title}>
      <MenuItem className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-3">
        <Typography variant="h6" className="mb-1 text-gray-900 font-semibold">
          {title}
        </Typography>
        <Typography variant="small" className="font-normal text-gray-600">
          {description}
        </Typography>
      </MenuItem>
    </Link>
  ));

  return (
    <React.Fragment>
      <Menu allowHover open={isMenuOpen} handler={setIsMenuOpen}>
        <MenuHandler>
          <Typography as="div" variant="small" className="font-normal">
            <MenuItem className="hidden items-center gap-2 font-medium text-gray-700 hover:text-blue-600 lg:flex lg:rounded-full hover:bg-blue-50 px-4 py-2">
              <Square3Stack3DIcon className="h-[18px] w-[18px] text-gray-600" />{" "}
              Services{" "}
              <ChevronDownIcon
                strokeWidth={2}
                className={`h-3 w-3 transition-transform ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
            </MenuItem>
          </Typography>
        </MenuHandler>
                 <MenuList className="hidden w-[24rem] overflow-visible lg:block bg-white shadow-2xl border border-gray-200 rounded-xl p-4 z-50">
           <ul className="flex w-full flex-col gap-2">
             {renderItems}
           </ul>
         </MenuList>
      </Menu>
      <MenuItem className="flex items-center gap-2 font-medium text-gray-700 lg:hidden hover:bg-blue-50 rounded-lg px-4 py-2">
        <Square3Stack3DIcon className="h-[18px] w-[18px] text-gray-600" />{" "}
        Services{" "}
      </MenuItem>
      <ul className="ml-6 flex w-full flex-col gap-2 lg:hidden bg-gray-50 rounded-lg p-2">
        {renderItems}
      </ul>
    </React.Fragment>
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
      {navListItems.map(({ label, icon, href }, key) => {
        const isActive = location.pathname === href;
        return (
          <Typography
            key={label}
            as={Link}
            to={href}
            variant="small"
            className={`font-medium ${
              isActive 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <MenuItem className={`flex items-center gap-2 lg:rounded-full ${
              isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-blue-50'
            }`}>
              {React.createElement(icon, { 
                className: `h-[18px] w-[18px] ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }` 
              })}{" "}
              <span className={`font-semibold ${
                isActive ? 'text-blue-600' : 'text-gray-700'
              }`}> {label}</span>
            </MenuItem>
          </Typography>
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
    <div className="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Navbar className="p-3 lg:rounded-full lg:pl-6 relative bg-white/95 backdrop-blur-sm">
        <div className="relative mx-auto flex items-center justify-between text-gray-900">
          <Typography
            as={Link}
            to="/"
            className="mr-4 ml-2 cursor-pointer py-1.5 font-medium flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SafarBot
              </span>
              <span className="text-xs text-gray-500 font-medium tracking-wider">
                TRAVEL INTELLIGENCE
              </span>
            </div>
          </Typography>
          
          <div className="hidden lg:block">
            <NavList />
          </div>

          <div className="flex items-center gap-3">
            {/* Search Button */}
            <IconButton
              size="sm"
              variant="text"
              className="rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </IconButton>

            {/* Theme Toggle */}
            <IconButton
              size="sm"
              variant="text"
              onClick={toggleDarkMode}
              className="rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </IconButton>

            {/* Notifications */}
            <IconButton
              size="sm"
              variant="text"
              className="rounded-full relative text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            </IconButton>

            <IconButton
              size="sm"
              variant="text"
              onClick={toggleIsNavOpen}
              className="ml-auto mr-2 lg:hidden text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Bars2Icon className="h-6 w-6" />
            </IconButton>

            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button 
                    size="sm" 
                    variant="text"
                    className="text-gray-700 hover:text-blue-600 font-semibold transition-colors"
                    crossOrigin=""
                  >
                    <span>Sign In</span>
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    size="sm" 
                    variant="gradient" 
                    color="blue"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200"
                    placeholder=""
                  >
                    <span className="font-semibold">Sign Up</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <Button 
                    size="sm" 
                    variant="text"
                    className="text-gray-700 hover:text-blue-600 font-semibold transition-colors"
                    placeholder=""
                  >
                    <span>Dashboard</span>
                  </Button>
                </Link>
                <ProfileMenu />
              </div>
            )}
          </div>
        </div>
                 <MobileNav open={isNavOpen} className="overflow-scroll bg-white border-t border-gray-100">
           <NavList />
         </MobileNav>
       </Navbar>
     </div>
   </div>
   );
 };

export default ModernHeader;
