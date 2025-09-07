import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  AlertTriangle,
  Check,
  Loader2,
  X,
  CheckCircle,
  RotateCcw,
  Clock
} from 'lucide-react';
import ModernButton from './ui/ModernButton';
import ModernCard from './ui/ModernCard';
import { authAPI } from '../services/api';
import logoImage from '../asset/images/logo.png';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerificationSuccess: () => void;
  onBackToSignup: () => void;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({ 
  isOpen, 
  onClose, 
  email,
  onVerificationSuccess,
  onBackToSignup
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setError(null);
      setSuccess(null);
      setAttempts(0);
      setResendCooldown(120); // Start with 2-minute cooldown since OTP was already sent
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const pastedOtp = text.replace(/\D/g, '').slice(0, 6);
        if (pastedOtp.length === 6) {
          const newOtp = pastedOtp.split('');
          setOtp(newOtp);
          inputRefs.current[5]?.focus();
        }
      });
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);
      setSuccess(null);

      const response = await authAPI.verifyOTP({
        email,
        otp: otpString
      });

      if (response.is_verified) {
        setSuccess('Your email is verified! Click here to login:');
        // Don't auto-close, let user click login button
      } else {
        setError('Invalid OTP. Please try again.');
        setAttempts(prev => prev + 1);
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Verification failed. Please try again.');
      setAttempts(prev => prev + 1);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      setIsResending(true);
      setError(null);

      await authAPI.resendOTP(email);
      setSuccess('OTP sent successfully! Please check your email.');
      setResendCooldown(120); // 2 minutes cooldown
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isOtpComplete = otp.every(digit => digit !== '');
  const maxAttempts = 3;
  const isMaxAttemptsReached = attempts >= maxAttempts;

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
                <div className="flex items-center space-x-3">
                  <img 
                    src={logoImage} 
                    alt="SafarBot Logo" 
                    className="w-10 h-10 object-contain"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Verify Email</h2>
                    <p className="text-gray-600 text-sm">Enter the code sent to your email</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Email Display */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <span className="text-blue-700 font-medium">{email}</span>
                </div>
                <p className="text-blue-600 text-sm mt-1">
                  We've sent a 6-digit verification code to this email address.
                </p>
              </div>

              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-red-700 text-sm">{error}</span>
                    </div>
                    {isMaxAttemptsReached && (
                      <p className="text-red-600 text-xs mt-1">
                        Maximum attempts reached. Please request a new OTP.
                      </p>
                    )}
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
                    <div className="flex items-center space-x-2 mb-3">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-700 text-sm">{success}</span>
                    </div>
                    {success.includes('Click here to login') && (
                      <ModernButton
                        onClick={() => {
                          onVerificationSuccess();
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                        size="sm"
                      >
                        Login Now
                      </ModernButton>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* OTP Input Fields - Hide when verification is successful */}
              {!success?.includes('Click here to login') && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Enter Verification Code
                    </label>
                    <div className="flex justify-center space-x-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={el => inputRefs.current[index] = el}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 transition-all duration-200 ${
                            error ? 'border-red-300' : 'border-gray-300'
                          }`}
                          disabled={isVerifying || isMaxAttemptsReached}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Verify Button */}
                  <ModernButton
                    onClick={handleVerify}
                    loading={isVerifying}
                    icon={isVerifying ? Loader2 : CheckCircle}
                    className="w-full disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                    size="lg"
                    disabled={!isOtpComplete || isVerifying || isMaxAttemptsReached}
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Email'}
                  </ModernButton>
                </>
              )}

              {/* Resend OTP - Hide when verification is successful */}
              {!success?.includes('Click here to login') && (
                <div className="text-center">
                  {resendCooldown > 0 ? (
                    <div className="flex items-center justify-center space-x-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        Resend available in {formatTime(resendCooldown)}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={isResending}
                      className="flex items-center justify-center space-x-2 text-primary-600 hover:text-primary-500 transition-colors disabled:opacity-50"
                    >
                      {isResending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {isResending ? 'Sending...' : 'Resend OTP'}
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Back to Signup - Hide when verification is successful */}
              {!success?.includes('Click here to login') && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Wrong email?{' '}
                    <button
                      onClick={onBackToSignup}
                      className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      Go back to signup
                    </button>
                  </p>
                </div>
              )}
            </ModernCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OTPVerificationModal;
