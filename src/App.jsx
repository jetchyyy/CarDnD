import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/Authcontext';
import ProfileCompletionChecker from './components/ProfileCompletionChecker';

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

// Admin Pages
import AdminPanel from './pages/admin/AdminPanel';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminListings from './pages/admin/AdminListings';
import AdminBookings from './pages/admin/AdminBookings';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPayouts from './pages/admin/AdminPayouts';
import AdminIDVerification from './pages/admin/AdminIDVerification';
import AdminReports from './pages/admin/AdminReports';

// Protected Route Component for regular authenticated users
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Protected Route Component for Admin
const ProtectedAdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
          <button
            onClick={() => (window.location.href = '/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Main Layout with Navbar and Footer
const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

// Admin Layout without Navbar and Footer
const AdminLayout = ({ children }) => {
  return (
    <ProtectedAdminRoute>
      {children}
    </ProtectedAdminRoute>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ProfileCompletionChecker>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
            <Route path="/signup" element={<MainLayout><SignUp /></MainLayout>} />
            <Route path="/vehicles" element={<MainLayout><CarList /></MainLayout>} />
            <Route path="/vehicles/:id" element={<MainLayout><VehicleDetails /></MainLayout>} />
            
            {/* Protected Routes - Require Authentication */}
            <Route 
              path="/booking/confirm/:id" 
              element={
                <ProtectedRoute>
                  <MainLayout><BookingConfirmation /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/booking-success" 
              element={
                <ProtectedRoute>
                  <MainLayout><BookingSuccess /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-bookings" 
              element={
                <ProtectedRoute>
                  <MainLayout><MyBookings /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chats" 
              element={
                <ProtectedRoute>
                  <MainLayout><ChatsList /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat/:chatId" 
              element={
                <ProtectedRoute>
                  <MainLayout><Chat /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages/:chatId" 
              element={
                <ProtectedRoute>
                  <MainLayout><Chat /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/host/dashboard" 
              element={
                <ProtectedRoute>
                  <MainLayout><HostDashboard /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/host/add-car" 
              element={
                <ProtectedRoute>
                  <MainLayout><AddCar /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/host/add-motorcycle" 
              element={
                <ProtectedRoute>
                  <MainLayout><AddMotorcycle /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <MainLayout><Profile /></MainLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes - Require Admin Role */}
            <Route path="/admin" element={<AdminLayout><AdminPanel /></AdminLayout>}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="listings" element={<AdminListings />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path='reports' element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="payouts" element={<AdminPayouts />} />
              <Route path="id-verification" element={<AdminIDVerification />} />
            </Route>
          </Routes>
        </ProfileCompletionChecker>
      </Router>
    </AuthProvider>
  );
}

export default App;