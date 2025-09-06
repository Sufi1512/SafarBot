import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ModernHeader from './components/ModernHeader';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import FlightBookingPage from './pages/FlightBookingPage';
import HotelBookingPage from './pages/HotelBookingPage';
import BookingOptionsPage from './pages/BookingOptionsPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import UserDashboard from './pages/UserDashboard';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SearchPage from './pages/SearchPage';
import DatePickerDemo from './pages/DatePickerDemo';
import ResultsPage from './pages/ResultsPage';
import TripPlannerPage from './pages/TripPlannerPage';
import ItineraryPage from './pages/ItineraryPage';
import PackagesPage from './pages/PackagesPage';


// Component to conditionally render ModernHeader
const ConditionalHeader: React.FC = () => {
  const location = useLocation();
  
  // Hide ModernHeader on ResultsPage and ItineraryPage
  const hideHeader = location.pathname === '/results' || location.pathname === '/itinerary';
  
  return hideHeader ? null : <ModernHeader />;
};

// Component to conditionally render Footer
const ConditionalFooter: React.FC = () => {
  const location = useLocation();
  
  // Don't render Footer on dashboard page (it has its own footer)
  if (location.pathname === '/dashboard') {
    return null;
  }
  
  return <Footer />;
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen w-full bg-secondary-50 dark:bg-dark-bg text-secondary-900 dark:text-dark-text">
              <ConditionalHeader />
              <main className="mt-0 pt-0 w-full">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/flights" element={<FlightBookingPage />} />
                  <Route path="/hotels" element={<HotelBookingPage />} />
                  <Route path="/packages" element={<PackagesPage />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/datepicker-demo" element={<DatePickerDemo />} />
                  <Route path="/booking-options/:bookingToken" element={<BookingOptionsPage />} />
                  <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
                  <Route path="/results" element={<ResultsPage />} />
                  <Route path="/itinerary" element={<ItineraryPage />} />
                  <Route path="/trip-planner" element={<TripPlannerPage />} />
                </Routes>
              </main>
              <ConditionalFooter />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
