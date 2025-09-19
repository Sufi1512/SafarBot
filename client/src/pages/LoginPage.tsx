import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Mail, 
  AlertTriangle,
  Check,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '../asset/images/logo.png';

interface LoginForm {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get redirect information from location state or session storage
  const redirectInfo = location.state || JSON.parse(sessionStorage.getItem('authRedirect') || '{}');
  const redirectPath = redirectInfo.from || '/dashboard';
  const redirectMessage = redirectInfo.message || 'Welcome back!';

  // If user is already authenticated, redirect them
  useEffect(() => {
    if (isAuthenticated) {
      // Clear any stored redirect info
      sessionStorage.removeItem('authRedirect');
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await login(formData.email, formData.password);
      
      setShowSuccess(true);
      
      // Show success message briefly, then redirect
      setTimeout(() => {
        // Clear any stored redirect info
        sessionStorage.removeItem('authRedirect');
        navigate(redirectPath, { replace: true });
      }, 1500);
      
    } catch (error: any) {
      console.error('Login error:', error);
      setErrors({ general: error.message || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleGoBack = () => {
    // If there's a redirect path, go back to it, otherwise go to home
    if (redirectPath && redirectPath !== '/dashboard') {
      navigate(redirectPath);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleGoBack}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </motion.button>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ModernCard className="p-8 shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-2 flex items-center justify-center"
              >
                <img src={logoImage} alt="SafarBot" className="w-24 h-24 object-contain" />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {redirectMessage}
              </p>
              
              {redirectPath && redirectPath !== '/dashboard' && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  You'll be redirected to: {redirectPath}
                </p>
              )}
            </div>

            {/* Success Message */}
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl flex items-center space-x-3"
              >
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300 font-medium">
                  Login successful! Redirecting...
                </span>
              </motion.div>
            )}

            {/* Error Message */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex items-center space-x-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300 font-medium">
                  {errors.general}
                </span>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-2.5 border-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 placeholder:text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                      errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-600'
                    }`}
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-12 py-2.5 border-2 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 placeholder:text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                      errors.password ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-600'
                    }`}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Login Button */}
              <ModernButton
                type="submit"
                variant="solid"
                size="md"
                className="w-full text-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </ModernButton>
            </form>

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Sign up here
                </button>
              </p>
              
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          </ModernCard>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
