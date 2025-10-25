import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Mail, 
  AlertTriangle,
  Check,
  Loader2,
  X
} from 'lucide-react';
import Button from './ui/Button';
import ModernCard from './ui/ModernCard';
import GoogleSignIn from './GoogleSignIn';
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

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ 
  isOpen, 
  onClose, 
  onLoginSuccess 
}) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when popup opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({ email: '', password: '' });
      setErrors({});
      setSuccess(null);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Clear general error
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: undefined
      }));
    }
  };

  // Real-time validation
  useEffect(() => {
    const validateField = (name: string, value: string) => {
      switch (name) {
        case 'email':
          if (value && !value.includes('@')) {
            return 'Please enter a valid email address';
          }
          return undefined;
        case 'password':
          // No password length validation for login
          return undefined;
        default:
          return undefined;
      }
    };

    const newErrors: FormErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });

    setErrors(prev => ({
      ...prev,
      ...newErrors
    }));
  }, [formData]);

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Please enter your password';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});
      setSuccess(null);

      // Call the real login API
      await login(formData.email, formData.password);
      
      setSuccess('Login successful!');
      // Immediately redirect after successful login
      onLoginSuccess();
      onClose();
      
    } catch (err: any) {
      console.error('Login error:', err);
      setErrors({ general: err.message || 'Login failed. Please check your credentials and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLoginSuccess = (user: any) => {
    console.log('Google login successful:', user);
    onLoginSuccess();
  };

  const handleGoogleLoginError = (error: string) => {
    console.error('Google login error:', error);
    setErrors({ general: error });
  };

  const handleFacebookLogin = () => {
    // TODO: Implement Facebook OAuth
    console.log('Facebook login clicked');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <ModernCard variant="glass" padding="xl" shadow="glow" className="backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <img 
                    src={logoImage} 
                    alt="SafarBot Logo" 
                    className="w-20 h-20 object-contain"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Sign in to your account</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Error Display */}
              <AnimatePresence>
                {errors.general && (
                  <motion.div 
                    className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-red-700 text-sm">{errors.general}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Display */}
              <AnimatePresence>
                {success && (
                  <motion.div 
                    className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-700 text-sm">{success}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 placeholder:text-sm transition-all duration-200 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.email && (
                    <motion.p 
                      className="mt-1 text-sm text-red-500"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 placeholder:text-sm transition-all duration-200 ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p 
                      className="mt-1 text-sm text-red-500"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/forgot-password');
                    }}
                    className="text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  loading={isSubmitting}
                  icon={isSubmitting ? Loader2 : User}
                  className="w-full disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  size="md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              {/* Divider */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <GoogleSignIn
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                />
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleFacebookLogin}
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                >
                  <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="ml-2">Facebook</span>
                </Button>
              </div>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/signup');
                    }}
                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </ModernCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginPopup;
