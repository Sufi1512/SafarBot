// Common route redirects for non-existent endpoints
export const ROUTE_REDIRECTS: Record<string, string> = {
  // Authentication routes (handled by popups)
  '/login': '/',
  '/signup': '/',
  '/sign-in': '/',
  '/sign-up': '/',
  '/register': '/',
  '/auth': '/',
  
  // Common misspellings
  '/itineraries': '/dashboard',
  '/my-trips': '/dashboard',
  '/my-travels': '/dashboard',
  '/travel-planner': '/trip-planner',
  '/trip-planner-page': '/trip-planner',
  '/flight-booking': '/flights',
  '/hotel-booking': '/hotels',
  '/car-rental': '/packages',
  '/travel-packages': '/packages',
  
  // Old routes or deprecated paths
  '/old-dashboard': '/dashboard',
  '/legacy': '/',
  '/v1': '/',
  '/api': '/',
  
  // Common user expectations
  '/account': '/profile',
  '/settings': '/settings',
  '/profile-settings': '/settings',
  '/user-profile': '/profile',
  '/my-profile': '/profile',
  
  // Travel-related common searches
  '/destinations': '/search',
  '/places': '/search',
  '/travel-guide': '/search',
  '/travel-tips': '/search',
  '/travel-advice': '/search',
  
  // Booking related
  '/book': '/',
  '/booking': '/',
  '/reservations': '/',
  '/my-bookings': '/dashboard',
  
  // Support and help
  '/help': '/',
  '/support': '/',
  '/contact': '/',
  '/about': '/',
  '/faq': '/',
  
  // Social and sharing
  '/share': '/',
  '/social': '/',
  '/community': '/',
  
  // Mobile app related
  '/app': '/',
  '/mobile': '/',
  '/download': '/',
};

// Function to check if a route should be redirected
export const shouldRedirect = (pathname: string): string | null => {
  // Check exact matches first
  if (ROUTE_REDIRECTS[pathname]) {
    return ROUTE_REDIRECTS[pathname];
  }
  
  // Check for patterns
  if (pathname.startsWith('/login') || pathname.startsWith('/signin')) {
    return '/';
  }
  
  if (pathname.startsWith('/signup') || pathname.startsWith('/register')) {
    return '/';
  }
  
  if (pathname.startsWith('/auth/')) {
    return '/';
  }
  
  if (pathname.startsWith('/api/')) {
    return '/';
  }
  
  if (pathname.startsWith('/admin')) {
    return '/';
  }
  
  if (pathname.startsWith('/dashboard/')) {
    // Check if it's a valid dashboard sub-route
    const validDashboardRoutes = [
      '/dashboard/chats',
      '/dashboard/explore', 
      '/dashboard/saved',
      '/dashboard/trips',
      '/dashboard/updates',
      '/dashboard/inspiration',
      '/dashboard/create'
    ];
    
    if (!validDashboardRoutes.includes(pathname)) {
      return '/dashboard';
    }
  }
  
  return null;
};

// Function to get redirect reason for display
export const getRedirectReason = (fromPath: string, toPath: string): string => {
  if (fromPath === '/login' || fromPath === '/signup') {
    return 'Login and signup are handled through popup modals on the main page.';
  }
  
  if (fromPath.startsWith('/auth/')) {
    return 'Authentication routes have been moved to popup modals.';
  }
  
  if (fromPath.startsWith('/api/')) {
    return 'API endpoints are not accessible through the web interface.';
  }
  
  if (fromPath.startsWith('/admin')) {
    return 'Admin access is not available through this interface.';
  }
  
  if (fromPath.startsWith('/dashboard/') && toPath === '/dashboard') {
    return 'Redirected to main dashboard page.';
  }
  
  return `Redirected from ${fromPath} to ${toPath}.`;
};
