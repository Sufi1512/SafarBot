import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AuthModal from '../components/AuthModal';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';

const OTPTestPage: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot-password' | 'otp-verification'>('signup');

  const handleAuthSuccess = () => {
    console.log('Authentication successful!');
    setIsAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <ModernCard variant="glass" padding="xl" shadow="glow" className="backdrop-blur-xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              OTP Integration Test
            </h1>
            <p className="text-gray-600 mb-8">
              Test the complete OTP verification flow for user registration
            </p>

            <div className="space-y-4">
              <ModernButton
                onClick={() => {
                  setAuthMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                size="lg"
              >
                Test Signup with OTP Verification
              </ModernButton>

              <ModernButton
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                size="lg"
              >
                Test Login
              </ModernButton>

              <ModernButton
                onClick={() => {
                  setAuthMode('forgot-password');
                  setIsAuthModalOpen(true);
                }}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                size="lg"
              >
                Test Forgot Password
              </ModernButton>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Test Flow:
              </h3>
              <ol className="text-left text-blue-800 space-y-1">
                <li>1. Click "Test Signup with OTP Verification"</li>
                <li>2. Fill in the signup form with a valid email</li>
                <li>3. Submit the form (OTP will be sent automatically)</li>
                <li>4. Enter the 6-digit OTP code</li>
                <li>5. Verify the email and complete registration</li>
              </ol>
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Features Included:
              </h3>
              <ul className="text-left text-green-800 space-y-1">
                <li>✅ 6-digit OTP input with auto-focus</li>
                <li>✅ Paste support for OTP codes</li>
                <li>✅ Resend OTP with cooldown timer</li>
                <li>✅ Rate limiting and attempt tracking</li>
                <li>✅ Beautiful UI with animations</li>
                <li>✅ Error handling and validation</li>
                <li>✅ Email verification status</li>
              </ul>
            </div>
          </div>
        </ModernCard>
      </motion.div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
        onLoginSuccess={handleAuthSuccess}
        onSignupSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default OTPTestPage;
