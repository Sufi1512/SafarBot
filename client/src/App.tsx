import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ModernHeader from './components/ModernHeader';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
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
import ItineraryGenerationPage from './pages/ItineraryGenerationPage';
import EditItineraryPage from './pages/EditItineraryPage';
import PackagesPage from './pages/PackagesPage';
import CreateBlogPage from './pages/CreateBlogPage';
import CreateAlbumPage from './pages/CreateAlbumPage';
import CreateGuidePage from './pages/CreateGuidePage';
import PublicItineraryPage from './pages/PublicItineraryPage';
import ItineraryRedirectPage from './pages/ItineraryRedirectPage';
import SavedItineraryViewPage from './pages/SavedItineraryViewPage';
import LoginPage from './pages/LoginPage';
import CollaborationAcceptPage from './pages/CollaborationAcceptPage';
import OTPTestPage from './pages/OTPTestPage';
import NotFoundPage from './pages/NotFoundPage';
import ServerErrorPage from './pages/ServerErrorPage';
import OfflinePage from './pages/OfflinePage';


// Component to conditionally render ModernHeader
const ConditionalHeader: React.FC = () => {
  const location = useLocation();
  
  // Hide ModernHeader on ResultsPage, ItineraryPage, ItineraryGenerationPage, EditItineraryPage, Create pages, Public Itinerary, OTP Test, and Error pages
  const hideHeader = location.pathname === '/results' || 
                     location.pathname === '/itinerary' || 
                     location.pathname.startsWith('/itinerary/') ||
                     location.pathname.startsWith('/saved-itinerary/') ||
                     location.pathname === '/itinerary-generation' || 
                     location.pathname === '/edit-itinerary' ||
                     location.pathname === '/create-blog' ||
                     location.pathname === '/create-album' ||
                     location.pathname === '/create-guide' ||
                     location.pathname.startsWith('/public/itinerary/') ||
                     location.pathname === '/otp-test' ||
                     location.pathname === '/404' ||
                     location.pathname === '/500' ||
                     location.pathname === '/offline' ||
                     location.pathname === '/not-found';
  
  return hideHeader ? null : <ModernHeader />;
};

// Component to conditionally render Footer
const ConditionalFooter: React.FC = () => {
  const location = useLocation();
  
  // Don't render Footer on dashboard page, create pages, OTP test, and error pages (they have their own footer)
  if (location.pathname === '/dashboard' || 
      location.pathname === '/create-blog' ||
      location.pathname === '/create-album' ||
      location.pathname === '/create-guide' ||
      location.pathname === '/otp-test' ||
      location.pathname === '/404' ||
      location.pathname === '/500' ||
      location.pathname === '/offline' ||
      location.pathname === '/not-found') {
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
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/datepicker-demo" element={<DatePickerDemo />} />
                  <Route path="/booking-options/:bookingToken" element={<BookingOptionsPage />} />
                  <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
                  <Route path="/results" element={<ResultsPage />} />
                  <Route path="/itinerary" element={<ItineraryPage />} />
                  <Route path="/saved-itinerary/:id" element={
                    <ProtectedRoute>
                      <SavedItineraryViewPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/itinerary/:id" element={<ItineraryRedirectPage />} />
                  <Route path="/itinerary-generation" element={<ItineraryGenerationPage />} />
                  <Route path="/edit-itinerary" element={<EditItineraryPage />} />
                  <Route path="/trip-planner" element={<TripPlannerPage />} />
                  <Route path="/create-blog" element={
                    <ProtectedRoute>
                      <CreateBlogPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/create-album" element={
                    <ProtectedRoute>
                      <CreateAlbumPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/create-guide" element={
                    <ProtectedRoute>
                      <CreateGuidePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/public/itinerary/:shareToken" element={<PublicItineraryPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/collaboration/accept/:invitationToken" element={<CollaborationAcceptPage />} />
                  <Route path="/otp-test" element={<OTPTestPage />} />
                  
                  {/* Error Pages */}
                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="/500" element={<ServerErrorPage />} />
                  <Route path="/offline" element={<OfflinePage />} />
                  
                  {/* 404 Catch-all route - must be last */}
                  <Route path="*" element={<NotFoundPage />} />
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
