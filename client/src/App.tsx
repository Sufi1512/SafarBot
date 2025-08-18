import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ModernHeader from './components/ModernHeader';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import FlightBookingPage from './pages/FlightBookingPage';
import HotelBookingPage from './pages/HotelBookingPage';
import BookingOptionsPage from './pages/BookingOptionsPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResultsPage from './pages/ResultsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-secondary-50 dark:bg-dark-bg text-secondary-900 dark:text-dark-text">
            <ModernHeader />
            <main className="pt-16 lg:pt-20">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/flights" element={<FlightBookingPage />} />
                <Route path="/hotels" element={<HotelBookingPage />} />
                <Route path="/booking-options/:bookingToken" element={<BookingOptionsPage />} />
                <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/results" element={<ResultsPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
