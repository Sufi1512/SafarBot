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
  Check
} from 'lucide-react';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';
import logoImage from '../asset/images/logo.png';

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
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

      await login(formData.email, formData.password);
      setSuccess('Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (err.message) {
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (err.message.includes('404') || err.message.includes('Not Found')) {
          errorMessage = 'User not found. Please check your email address.';
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

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log('Google login clicked');
  };

  const handleFacebookLogin = () => {
    // TODO: Implement Facebook OAuth
    console.log('Facebook login clicked');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop')`,
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
              <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
              <p className="text-white/80 mt-2">Sign in to your SafarBot account</p>
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
                    placeholder="Enter your password"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-white/30 rounded bg-white/10"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-white/80">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-300 hover:text-primary-200 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <ModernButton
                type="submit"
                loading={isLoading}
                icon={User}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                size="lg"
              >
                Sign In
              </ModernButton>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white/60">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <ModernButton
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full border-white/30 text-white hover:bg-white/10 backdrop-blur-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google</span>
              </ModernButton>
              <ModernButton
                variant="outline"
                onClick={handleFacebookLogin}
                className="w-full border-white/30 text-white hover:bg-white/10 backdrop-blur-md"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-2">Facebook</span>
              </ModernButton>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-white/70">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-primary-300 hover:text-primary-200 transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </ModernCard>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage; 