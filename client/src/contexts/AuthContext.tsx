import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  preferences?: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
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
        const token = localStorage.getItem('userToken');
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');

        if (token && userEmail && userName) {
          // For demo purposes, create a user object from localStorage
          // In production, you would verify the token with the backend
          const [firstName, lastName] = userName.split(' ');
          setUser({
            id: 'demo-user-id',
            email: userEmail,
            firstName: firstName || '',
            lastName: lastName || '',
            phone: localStorage.getItem('userPhone') || undefined
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid session
        localStorage.removeItem('userToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userPhone');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await authAPI.login({ email, password });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, accept any email/password combination
      if (email && password) {
        const [firstName, lastName] = email.split('@')[0].split('.');
        
        const userData: User = {
          id: 'demo-user-id',
          email,
          firstName: firstName || 'Demo',
          lastName: lastName || 'User'
        };

        // Store in localStorage
        localStorage.setItem('userToken', 'demo-token');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', `${userData.firstName} ${userData.lastName}`);

        setUser(userData);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await authAPI.signup(userData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, create user from form data
      const newUser: User = {
        id: 'demo-user-id',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone
      };

      // Store in localStorage
      localStorage.setItem('userToken', 'demo-token');
      localStorage.setItem('userEmail', userData.email);
      localStorage.setItem('userName', `${userData.firstName} ${userData.lastName}`);
      localStorage.setItem('userPhone', userData.phone);

      setUser(newUser);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // TODO: Replace with actual API call
      // await authAPI.logout();
      
      // Clear localStorage
      localStorage.removeItem('userToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPhone');
      
      setUser(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state
      localStorage.removeItem('userToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPhone');
      setUser(null);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      // TODO: Replace with actual API call
      // const response = await authAPI.updateProfile(data);
      
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        
        // Update localStorage
        if (data.firstName || data.lastName) {
          const firstName = data.firstName || user.firstName;
          const lastName = data.lastName || user.lastName;
          localStorage.setItem('userName', `${firstName} ${lastName}`);
        }
        if (data.phone) {
          localStorage.setItem('userPhone', data.phone);
        }
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.message || 'Profile update failed');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 