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
  UserPlus,
  Loader2,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '../asset/images/logo.png';

interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface PasswordStrength {
  score: number;
  feedback: string;
  color: string;
}

const SignupPage: React.FC = () => {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState<SignupForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: '',
    color: 'text-gray-400'
  });

  // Get redirect information from location state or session storage
  const redirectInfo = location.state || JSON.parse(sessionStorage.getItem('authRedirect') || '{}');
  const redirectPath = redirectInfo.from || '/dashboard';
  const redirectMessage = redirectInfo.message || 'Welcome to SafarBot!';

  // If user is already authenticated, redirect them
  useEffect(() => {
    if (isAuthenticated) {
      // Clear any stored redirect info
      sessionStorage.removeItem('authRedirect');
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  // Password strength calculation
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    let feedback = '';
    
    if (password.length === 0) {
      return { score: 0, feedback: '', color: 'text-gray-400' };
    }
    
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score <= 2) {
      feedback = 'Weak password';
      return { score, feedback, color: 'text-red-500' };
    } else if (score <= 4) {
      feedback = 'Medium strength';
      return { score, feedback, color: 'text-yellow-500' };
    } else {
      feedback = 'Strong password';
      return { score, feedback, color: 'text-green-500' };
    }
  };

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
    
    // Calculate password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    // First name validation - edge cases
    const firstNameTrimmed = formData.firstName.trim();
    if (!firstNameTrimmed) {
      newErrors.firstName = 'Please enter your first name';
    } else if (firstNameTrimmed.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters long';
    } else if (firstNameTrimmed.length > 50) {
      newErrors.firstName = 'First name is too long (max 50 characters)';
    } else if (!/^[a-zA-Z\s'-]+$/.test(firstNameTrimmed)) {
      newErrors.firstName = 'First name contains invalid characters';
    }
    
    // Last name validation - edge cases
    const lastNameTrimmed = formData.lastName.trim();
    if (!lastNameTrimmed) {
      newErrors.lastName = 'Please enter your last name';
    } else if (lastNameTrimmed.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters long';
    } else if (lastNameTrimmed.length > 50) {
      newErrors.lastName = 'Last name is too long (max 50 characters)';
    } else if (!/^[a-zA-Z\s'-]+$/.test(lastNameTrimmed)) {
      newErrors.lastName = 'Last name contains invalid characters';
    }
    
    // Email validation - comprehensive edge cases
    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed) {
      newErrors.email = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (emailTrimmed.length > 254) {
      newErrors.email = 'Email address is too long';
    }
    
    // Password validation - edge cases
    if (!formData.password.trim()) {
      newErrors.password = 'Please enter your password';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    } else if (formData.password.length > 128) {
      newErrors.password = 'Password is too long (max 128 characters)';
    }
    
    // Confirm password validation - edge cases
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

      // Call the real signup API
      await signup({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword
      });
      
      setSuccess('Account created successfully! Please check your email for verification.');
      setTimeout(() => {
        // Clear any stored redirect info
        sessionStorage.removeItem('authRedirect');
        navigate(redirectPath, { replace: true });
      }, 2000);
      
    } catch (err: any) {
      console.error('Signup error:', err);
      setErrors({ general: err.message || 'Signup failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
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
      <div className="w-full max-w-lg">
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

        {/* Signup Card */}
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
                Create Account
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
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl flex items-center space-x-3"
              >
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300 font-medium">
                  {success}
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

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First name"
                      className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 placeholder:text-sm transition-all duration-200 ${
                        errors.firstName ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last name"
                      className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 placeholder:text-sm transition-all duration-200 ${
                        errors.lastName ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 placeholder:text-sm transition-all duration-200 ${
                      errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    placeholder="Create a password"
                    className={`w-full pl-10 pr-12 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 placeholder:text-sm transition-all duration-200 ${
                      errors.password ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <motion.div 
                    className="mt-2"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.score <= 2 ? 'bg-red-400' :
                            passwordStrength.score <= 4 ? 'bg-yellow-400' : 'bg-green-400'
                          }`}
                          style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                        />
                      </div>
                      <span className={`text-sm ${passwordStrength.color}`}>
                        {passwordStrength.feedback}
                      </span>
                    </div>
                  </motion.div>
                )}
                
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className={`w-full pl-10 pr-12 py-2.5 border-2 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 placeholder:text-sm transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && formData.password && (
                  <motion.div 
                    className="mt-2 flex items-center space-x-2"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-500 dark:text-red-400">Passwords do not match</span>
                      </>
                    )}
                  </motion.div>
                )}
                
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded mt-1"
                  required
                  disabled={isSubmitting}
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  I agree to the{' '}
                  <button type="button" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 underline">
                    Terms and Conditions
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 underline">
                    Privacy Policy
                  </button>
                </label>
              </div>

              {/* Submit Button */}
              <ModernButton
                type="submit"
                loading={isSubmitting}
                icon={isSubmitting ? Loader2 : UserPlus}
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                size="md"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </ModernButton>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </ModernCard>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
