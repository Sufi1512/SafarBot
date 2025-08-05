import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import FlightBookingPage from './pages/FlightBookingPage';
import HotelBookingPage from './pages/HotelBookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import BookingOptionsPage from './pages/BookingOptionsPage';
import ChatWidget from './components/ChatWidget';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/flights" element={<FlightBookingPage />} />
          <Route path="/hotels" element={<HotelBookingPage />} />
          <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
          <Route path="/booking-options/:bookingToken" element={<BookingOptionsPage />} />
        </Routes>
        <ChatWidget />
      </div>
    </Router>
  );
}

export default App;
