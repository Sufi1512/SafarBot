import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  preserveState?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
  preserveState = true
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log('ProtectedRoute: User not authenticated - redirecting to login');

      if (preserveState) {
        const currentPath = location.pathname + location.search;
        const state = {
          from: currentPath,
          message: 'Please log in to access this page',
          timestamp: Date.now()
        };
        
        // Store the intended destination
        sessionStorage.setItem('authRedirect', JSON.stringify(state));
        
        navigate(redirectTo, { 
          state: { 
            from: currentPath,
            message: 'Please log in to access this page'
          } 
        });
      } else {
        navigate(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, navigate, location, redirectTo, preserveState]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // If not authenticated, don't render children (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
