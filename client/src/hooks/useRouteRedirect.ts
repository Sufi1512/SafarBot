import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { shouldRedirect, getRedirectReason } from '../utils/routeRedirects';

export const useRouteRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectPath = shouldRedirect(location.pathname);
    
    if (redirectPath) {
      const reason = getRedirectReason(location.pathname, redirectPath);
      console.log(`Route redirect: ${reason}`);
      
      // Navigate to the redirect path
      navigate(redirectPath, { 
        replace: true,
        state: { 
          redirectedFrom: location.pathname,
          redirectReason: reason 
        }
      });
    }
  }, [location.pathname, navigate]);

  return {
    currentPath: location.pathname,
    redirectPath: shouldRedirect(location.pathname)
  };
};
