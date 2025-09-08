import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

interface AuthGuardOptions {
  redirectTo?: string;
  preserveState?: boolean;
  showMessage?: boolean;
}

export const useAuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = useCallback(async (
    callback: () => Promise<any> | any,
    options: AuthGuardOptions = {}
  ) => {
    const {
      redirectTo = '/login',
      preserveState = true,
      showMessage = true
    } = options;

    // If still loading, wait a bit
    if (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      if (showMessage) {
        console.log('Authentication required - redirecting to login');
      }

      // Preserve current state for redirect after login
      if (preserveState) {
        const currentPath = location.pathname + location.search;
        const state = {
          from: currentPath,
          message: 'Please log in to continue',
          timestamp: Date.now()
        };
        
        // Store the intended destination
        sessionStorage.setItem('authRedirect', JSON.stringify(state));
        
        navigate(redirectTo, { 
          state: { 
            from: currentPath,
            message: 'Please log in to continue'
          } 
        });
      } else {
        navigate(redirectTo);
      }
      
      throw new Error('Authentication required');
    }

    // User is authenticated, proceed with the callback
    return await callback();
  }, [isAuthenticated, isLoading, navigate, location]);

  const checkAuth = useCallback(() => {
    if (isLoading) return false;
    return isAuthenticated;
  }, [isAuthenticated, isLoading]);

  return {
    requireAuth,
    checkAuth,
    isAuthenticated: checkAuth()
  };
};
