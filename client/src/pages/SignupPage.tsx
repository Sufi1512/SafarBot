import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Mail, 
  AlertTriangle,
  Check,
  UserPlus
} from 'lucide-react';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';
import logoImage from '../asset/images/logo.png';

interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState<SignupForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) {
      return 'Please enter your first name';
    }
    if (!formData.lastName.trim()) {
      return 'Please enter your last name';
    }
    if (!formData.email.trim()) {
      return 'Please enter your email address';
    }
    if (!formData.email.includes('@')) {
      return 'Please enter a valid email address';
    }
    if (!formData.password.trim()) {
      return 'Please enter your password';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      await signup(formData.firstName, formData.lastName, formData.email, formData.password);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (err: any) {
      console.error('Signup error:', err);
      let errorMessage = 'Signup failed. Please try again.';
      
      if (err.message) {
        if (err.message.includes('409') || err.message.includes('Conflict')) {
          errorMessage = 'An account with this email already exists.';
        } else if (err.message.includes('400') || err.message.includes('Bad Request')) {
          errorMessage = 'Please check your input and try again.';
        } else if (err.message.includes('500') || err.message.includes('Internal Server Error')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.message.includes('Network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-200/20 rounded-full blur-3xl"
          animate={{ 
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ModernCard variant="glass" padding="xl" shadow="glow" className="backdrop-blur-xl">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4">
                <img 
                  src={logoImage} 
                  alt="SafarBot Logo" 
                  className="w-48 h-48 object-contain"
                />
              </div>
              <h2 className="text-3xl font-bold text-white">Create Account</h2>
              <p className="text-white/80 mt-2">Join SafarBot and start your journey</p>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div 
                className="mb-6 bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-xl p-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-200">{error}</span>
                </div>
              </motion.div>
            )}

            {/* Success Display */}
            {success && (
              <motion.div 
                className="mb-6 bg-green-500/20 backdrop-blur-md border border-green-400/30 rounded-xl p-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-200">{success}</span>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-white/90 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First name"
                      className="w-full pl-10 pr-4 py-3 border border-white/20 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/10 backdrop-blur-md text-white placeholder-white/50 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-white/90 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last name"
                      className="w-full pl-10 pr-4 py-3 border border-white/20 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/10 backdrop-blur-md text-white placeholder-white/50 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-white/20 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/10 backdrop-blur-md text-white placeholder-white/50 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-12 py-3 border border-white/20 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/10 backdrop-blur-md text-white placeholder-white/50 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-12 py-3 border border-white/20 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/10 backdrop-blur-md text-white placeholder-white/50 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-white/30 rounded bg-white/10 mt-1"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-white/80">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-300 hover:text-primary-200 underline">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-300 hover:text-primary-200 underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <ModernButton
                type="submit"
                loading={isLoading}
                icon={UserPlus}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                size="lg"
              >
                Create Account
              </ModernButton>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white/60">Already have an account?</span>
                </div>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full px-4 py-3 border border-white/30 text-white rounded-2xl hover:bg-white/10 backdrop-blur-md transition-all duration-200"
              >
                <User className="w-5 h-5 mr-2" />
                Sign In to Existing Account
              </Link>
            </div>
          </ModernCard>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage; 