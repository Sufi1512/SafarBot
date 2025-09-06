import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useErrorHandler = () => {
  const navigate = useNavigate();

  const handleError = useCallback((error: any, context?: string) => {
    console.error(`Error in ${context || 'unknown context'}:`, error);
    
    // Handle different types of errors
    if (error?.response?.status === 404) {
      // API endpoint not found
      navigate('/404');
    } else if (error?.response?.status === 401) {
      // Unauthorized - redirect to home with auth modal
      navigate('/', { state: { showAuth: true } });
    } else if (error?.response?.status === 403) {
      // Forbidden - redirect to home
      navigate('/');
    } else if (error?.response?.status >= 500) {
      // Server error - show error page
      navigate('/500');
    } else if (error?.message?.includes('Network Error')) {
      // Network error - show offline message
      navigate('/offline');
    } else {
      // Generic error - redirect to 404
      navigate('/404');
    }
  }, [navigate]);

  const handleNotFound = useCallback(() => {
    navigate('/404');
  }, [navigate]);

  const handleUnauthorized = useCallback(() => {
    navigate('/', { state: { showAuth: true } });
  }, [navigate]);

  const handleServerError = useCallback(() => {
    navigate('/500');
  }, [navigate]);

  return {
    handleError,
    handleNotFound,
    handleUnauthorized,
    handleServerError
  };
};
