import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

interface AuthApiWrapperOptions {
  redirectTo?: string;
  preserveState?: boolean;
  showMessage?: boolean;
}

export const useAuthApiWrapper = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const withAuth = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options: AuthApiWrapperOptions = {}
  ): Promise<T> => {
    const {
      redirectTo = '/login',
      preserveState = true,
      showMessage = true
    } = options;

    // If still loading, wait a bit
    if (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Check if user is authenticated before making API call
    if (!isAuthenticated) {
      if (showMessage && import.meta.env.DEV) {
        console.debug('Authentication required before API call - redirecting to login');
      }

      // Preserve current state for redirect after login
      if (preserveState) {
        const currentPath = location.pathname + location.search;
        const state = {
          from: currentPath,
          message: 'Please log in to continue',
          timestamp: Date.now(),
          apiCall: apiCall.toString() // Store reference to the API call
        };
        
        // Store the intended destination and API call
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

    // User is authenticated, proceed with the API call
    try {
      return await apiCall();
    } catch (error: any) {
      // If API call fails with 401, handle it
      if (error.response?.status === 401) {
        if (import.meta.env.DEV) {
          console.debug('API call failed with 401 - redirecting to login');
        }
        
        if (preserveState) {
          const currentPath = location.pathname + location.search;
          const state = {
            from: currentPath,
            message: 'Session expired. Please log in again.',
            timestamp: Date.now(),
            apiCall: apiCall.toString()
          };
          
          sessionStorage.setItem('authRedirect', JSON.stringify(state));
          
          navigate(redirectTo, { 
            state: { 
              from: currentPath,
              message: 'Session expired. Please log in again.'
            } 
          });
        } else {
          navigate(redirectTo);
        }
      }
      
      throw error;
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  return {
    withAuth
  };
};
