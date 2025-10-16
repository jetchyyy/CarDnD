import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/Authcontext';

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

// Protected Route Component for Admin
const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
        <Routes>
          {/* Main Routes with Navbar and Footer */}
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
          <Route path="/signup" element={<MainLayout><SignUp /></MainLayout>} />
          <Route path="/vehicles" element={<MainLayout><CarList /></MainLayout>} />
          <Route path="/vehicles/:id" element={<MainLayout><VehicleDetails /></MainLayout>} />
          <Route path="/booking/confirm/:id" element={<MainLayout><BookingConfirmation /></MainLayout>} />
          <Route path="/booking-success" element={<MainLayout><BookingSuccess /></MainLayout>} />
          <Route path="/my-bookings" element={<MainLayout><MyBookings /></MainLayout>} />
          <Route path="/chats" element={<MainLayout><ChatsList /></MainLayout>} />
          <Route path="/chat/:chatId" element={<MainLayout><Chat /></MainLayout>} />
          <Route path="/host/dashboard" element={<MainLayout><HostDashboard /></MainLayout>} />
          <Route path="/host/add-car" element={<MainLayout><AddCar /></MainLayout>} />
          <Route path="/host/add-motorcycle" element={<MainLayout><AddMotorcycle /></MainLayout>} />
          <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
          
          {/* Admin Routes without Navbar and Footer */}
          <Route path="/admin" element={<AdminLayout><AdminPanel /></AdminLayout>}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;