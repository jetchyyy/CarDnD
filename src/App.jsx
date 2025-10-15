import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/Authcontext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import CarList from './pages/CarList';
import VehicleDetails from './pages/VehicleDetails';
import BookingConfirmation from './pages/BookingConfirmation';
import BookingSuccess from './pages/BookingSuccess';
import HostDashboard from './pages/HostDashboard';
import AddCar from './pages/AddCar';
import AddMotorcycle from './pages/AddMotorcycle';
import Profile from './pages/Profile';
import ChatsList from './pages/ChatsList';
import Chat from './pages/Chat';
import MyBookings from './pages/MyBookings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/vehicles" element={<CarList />} />
              <Route path="/vehicles/:id" element={<VehicleDetails />} />
              <Route path="/booking/confirm/:id" element={<BookingConfirmation />} />
              <Route path="/booking-success" element={<BookingSuccess />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/chats" element={<ChatsList />} />
              <Route path="/chat/:chatId" element={<Chat />} />
              <Route path="/host/dashboard" element={<HostDashboard />} />
              <Route path="/host/add-car" element={<AddCar />} />
              <Route path="/host/add-motorcycle" element={<AddMotorcycle />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;