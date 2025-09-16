import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/cachedApi';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_email_verified: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
    confirm_password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: {
    token: string;
    new_password: string;
    confirm_password: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (token) {
          // Try to get user profile with stored token
          try {
            const userProfile = await authAPI.getProfile();
            setUser(userProfile);
          } catch (error) {
            // If token is invalid, try to refresh
            if (refreshToken) {
              try {
                const refreshResponse = await authAPI.refreshToken(refreshToken);
                localStorage.setItem('accessToken', refreshResponse.access_token);
                localStorage.setItem('refreshToken', refreshResponse.refresh_token);
                setUser(refreshResponse.user);
              } catch (refreshError) {
                // Clear invalid tokens
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setUser(null);
              }
            } else {
              // Clear invalid token
              localStorage.removeItem('accessToken');
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid session
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.login({ email, password });
      
      // Store tokens
      localStorage.setItem('accessToken', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      
      setUser(response.user);
      
      // Preload dashboard data after successful login
      try {
        const { dashboardAPI, savedItineraryAPI } = await import('../services/api');
        
        // Call dashboard APIs in parallel to preload data
        await Promise.allSettled([
          dashboardAPI.getDashboardData(),
          savedItineraryAPI.getItineraries({ limit: 20 }),
          savedItineraryAPI.getItineraryStats()
        ]);
        
        console.log('Dashboard data preloaded successfully');
      } catch (preloadError) {
        console.warn('Failed to preload dashboard data:', preloadError);
        // Don't throw error - login was successful, just preloading failed
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
    confirm_password: string;
  }) => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.signup(userData);
      
      // For signup, we don't automatically log in the user
      // They need to verify their email first
      console.log('Signup successful:', response.message);
      
      // You might want to show a success message and redirect to login
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API if user is authenticated
      if (user) {
        await authAPI.logout();
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      // Continue with local logout even if API fails
    } finally {
      // Clear local storage and state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const updateProfile = async (data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  }) => {
    try {
      const updatedUser = await authAPI.updateProfile(data);
      setUser(updatedUser);
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.message || 'Profile update failed');
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authAPI.forgotPassword(email);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw new Error(error.message || 'Password reset request failed');
    }
  };

  const resetPassword = async (data: {
    token: string;
    new_password: string;
    confirm_password: string;
  }) => {
    try {
      await authAPI.resetPassword(data);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Password reset failed');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 