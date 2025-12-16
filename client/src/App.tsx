import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ModernHeader from './components/ModernHeader';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import { GOOGLE_MAPS_API_KEY } from './config/googleMapsConfig';

// Lazy load all page components to prevent eager loading
const HomePage = lazy(() => import('./pages/HomePage'));
const FlightBookingPage = lazy(() => import('./pages/FlightBookingPage'));
const HotelBookingPage = lazy(() => import('./pages/HotelBookingPage'));
const BookingOptionsPage = lazy(() => import('./pages/BookingOptionsPage'));
const BookingConfirmationPage = lazy(() => import('./pages/BookingConfirmationPage'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const TripPlannerPage = lazy(() => import('./pages/TripPlannerPage'));
const ItineraryPage = lazy(() => import('./pages/ItineraryPage'));
const ItineraryGenerationPage = lazy(() => import('./pages/ItineraryGenerationPage'));
const EditItineraryPage = lazy(() => import('./pages/EditItineraryPage'));
const PackagesPage = lazy(() => import('./pages/PackagesPage'));
const CreateBlogPage = lazy(() => import('./pages/CreateBlogPage'));
const CreateAlbumPage = lazy(() => import('./pages/CreateAlbumPage'));
const CreateGuidePage = lazy(() => import('./pages/CreateGuidePage'));
const ChatPage = lazy(() => import('./pages/ChatPage').then(module => ({ default: module.ChatPage })));
const PublicItineraryPage = lazy(() => import('./pages/PublicItineraryPage'));
const ItineraryRedirectPage = lazy(() => import('./pages/ItineraryRedirectPage'));
const SavedItineraryViewPage = lazy(() => import('./pages/SavedItineraryViewPage'));
const MapTestPage = lazy(() => import('./pages/MapTestPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const CollaborationAcceptPage = lazy(() => import('./pages/CollaborationAcceptPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ServerErrorPage = lazy(() => import('./pages/ServerErrorPage'));
const OfflinePage = lazy(() => import('./pages/OfflinePage'));


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
  
  // Only show Footer on home page
  if (location.pathname === '/') {
    return <Footer />;
  }
  
  return null;
};

function App() {
  return (
    <ErrorBoundary>
      <APIProvider 
        apiKey={GOOGLE_MAPS_API_KEY} 
        libraries={['places']}
        onLoad={() => console.log('Maps API has loaded.')}
      >
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Router>
            <div className="min-h-screen w-full bg-secondary-50 dark:bg-dark-bg text-secondary-900 dark:text-dark-text">
              <ConditionalHeader />
              <main className="mt-0 pt-0 w-full">
                <Suspense fallback={<LoadingSpinner />}>
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
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/collaboration/accept/:invitationToken" element={<CollaborationAcceptPage />} />
                    <Route path="/chat" element={
                      <ProtectedRoute>
                        <ChatPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/map-test" element={<MapTestPage />} />
                    
                    {/* Error Pages */}
                    <Route path="/404" element={<NotFoundPage />} />
                    <Route path="/500" element={<ServerErrorPage />} />
                    <Route path="/offline" element={<OfflinePage />} />
                    
                    {/* 404 Catch-all route - must be last */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </main>
              <ConditionalFooter />
            </div>
            </Router>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
      </APIProvider>
    </ErrorBoundary>
  );
}

export default App;
