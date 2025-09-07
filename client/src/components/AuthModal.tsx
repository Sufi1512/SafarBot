import React, { useState, useEffect } from 'react';
import LoginPopup from './LoginPopup';
import SignupPopup from './SignupPopup';
import ForgotPasswordPopup from './ForgotPasswordPopup';
import OTPVerificationModal from './OTPVerificationModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup' | 'forgot-password' | 'otp-verification';
  onLoginSuccess?: () => void;
  onSignupSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultMode = 'login',
  onLoginSuccess,
  onSignupSuccess 
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password' | 'otp-verification'>(defaultMode);
  const [signupEmail, setSignupEmail] = useState<string>('');

  // Update mode when defaultMode changes
  useEffect(() => {
    console.log('AuthModal: defaultMode changed to', defaultMode);
    setMode(defaultMode);
  }, [defaultMode]);

  // Debug when modal opens/closes
  useEffect(() => {
    console.log('AuthModal: isOpen changed to', isOpen, 'mode:', mode);
  }, [isOpen, mode]);

  const handleLoginSuccess = () => {
    onLoginSuccess?.();
    onClose();
  };

  const handleSignupSuccess = (email?: string) => {
    if (email) {
      setSignupEmail(email);
      setMode('otp-verification');
    } else {
      onSignupSuccess?.();
      onClose();
    }
  };

  const handleOTPVerificationSuccess = () => {
    // Switch to login mode after successful OTP verification
    setMode('login');
  };

  const switchToSignup = () => setMode('signup');
  const switchToLogin = () => setMode('login');
  const switchToForgotPassword = () => setMode('forgot-password');

  return (
    <>
      <LoginPopup
        isOpen={isOpen && mode === 'login'}
        onClose={onClose}
        onSwitchToSignup={switchToSignup}
        onSwitchToForgotPassword={switchToForgotPassword}
        onLoginSuccess={handleLoginSuccess}
      />
      <SignupPopup
        isOpen={isOpen && mode === 'signup'}
        onClose={onClose}
        onSwitchToLogin={switchToLogin}
        onSignupSuccess={handleSignupSuccess}
      />
      <OTPVerificationModal
        isOpen={isOpen && mode === 'otp-verification'}
        onClose={onClose}
        email={signupEmail}
        onVerificationSuccess={handleOTPVerificationSuccess}
        onBackToSignup={switchToSignup}
      />
      <ForgotPasswordPopup
        isOpen={isOpen && mode === 'forgot-password'}
        onClose={onClose}
        onSwitchToLogin={switchToLogin}
        onSwitchToSignup={switchToSignup}
      />
    </>
  );
};

export default AuthModal;
