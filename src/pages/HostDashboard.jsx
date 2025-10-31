// pages/HostDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';
import { DollarSign, Calendar, Car, TrendingUp } from 'lucide-react';
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { getHostBookings } from '../utils/bookingService';
import { createOrGetChat } from '../utils/chatService';
import { deleteVehicle, getHostVehicles } from '../utils/vehicleService';

// Import components
import StatsCard from "../pages/hostdashboard/StatsCard";
import VerificationAlert from '../pages/hostdashboard/VerificationAlert';
import DashboardHeader from '../pages/hostdashboard/DashboardHeader';
import DashboardTabs from '../pages/hostdashboard/DashboardTab';
import OverviewTab from '../pages/hostdashboard/OverviewTab';
import VehiclesTab from '../pages/hostdashboard/VehiclesTab';
import BookingsTab from '../pages/hostdashboard/BookingsTab';
import CalendarTab from '../pages/hostdashboard/CalendarTab';
import AddVehicleModal from '../pages/hostdashboard/AddVehicleModal';

const HostDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [addType, setAddType] = useState('car');
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [messagingLoading, setMessagingLoading] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);

  const canAddVehicle = user?.idVerificationStatus === 'approved';
  const isPending = user?.idVerificationStatus === 'pending';
  const needsVerification = !user?.idVerificationStatus || user?.idVerificationStatus === 'idle' || user?.idVerificationStatus === 'rejected';

  // Fetch vehicles from Firestore
  useEffect(() => {
    const fetchVehicles = async () => {
      if (authLoading) return;

      if (!user) {
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const vehicles = await getHostVehicles(user.userId)
        setVehicles(vehicles)
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [user, authLoading, showAddVehicle, navigate]);

  // Fetch bookings from Firestore
  useEffect(() => {
    const fetchBookings = async () => {
      if (authLoading) return;

      if (!user) {
        setBookingsLoading(false);
        return;
      }

      try {
        setBookingsLoading(true);
        const hostBookings = await getHostBookings(user.userId);
        hostBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(hostBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookings();
  }, [user, authLoading]);

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show message if user is not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access the host dashboard.</p>
        </div>
      </div>
    );
  }

  const handleAddVehicleClick = () => {
    if (!canAddVehicle) {
      setShowVerificationAlert(true);
      setTimeout(() => setShowVerificationAlert(false), 5000);
      return;
    }
    setShowAddVehicle(true);
  };

  // Calculate stats using hostEarnings (after service fee deduction)
  const calculateStats = () => {
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    
    const totalEarnings = confirmedBookings.reduce((sum, b) => sum + (b.hostEarnings || 0), 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyEarnings = confirmedBookings
      .filter(b => {
        const bookingDate = new Date(b.createdAt);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      })
      .reduce((sum, b) => sum + (b.hostEarnings || 0), 0);

    return {
      totalEarnings,
      activeBookings: pendingBookings.length + confirmedBookings.length,
      totalVehicles: vehicles.length,
      monthlyEarnings
    };
  };

  const statsData = calculateStats();

  const stats = [
    {
      title: 'Total Estimated Payout',
      value: `₱${statsData.totalEarnings.toLocaleString()}`,
      change: 'After fees',
      icon: <DollarSign className="w-6 h-6" />,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Active Bookings',
      value: statsData.activeBookings.toString(),
      change: `${statsData.activeBookings} total`,
      icon: <Calendar className="w-6 h-6" />,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Vehicles',
      value: statsData.totalVehicles.toString(),
      change: 'Listed',
      icon: <Car className="w-6 h-6" />,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'This Month',
      value: `₱${statsData.monthlyEarnings.toLocaleString()}`,
      change: 'Estimated',
      icon: <TrendingUp className="w-6 h-6" />,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  // Delete vehicle handler
  const handleDelete = async (id,imageUrls) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(id,imageUrls)
        setVehicles(prev => prev.filter(v => v.id !== v.id));
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Failed to delete vehicle. Please try again.');
      }
    }
  };

  // Update booking status
  const handleBookingAction = async (bookingId, newStatus) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );
      
      alert(`Booking ${newStatus === 'confirmed' ? 'confirmed' : 'cancelled'} successfully!`);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking. Please try again.');
    }
  };

  // Handle messaging guest
  const handleMessageGuest = async (booking) => {
    try {
      setMessagingLoading(true);
      const chatId = await createOrGetChat(
        user.userId,
        booking.guestId,
        booking.id
      );
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error opening chat:', error);
      alert('Failed to open chat. Please try again.');
      setMessagingLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'active':
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'ongoing':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Verification Alert Banner */}
      <VerificationAlert 
        show={showVerificationAlert}
        onClose={() => setShowVerificationAlert(false)}
        isPending={isPending}
        needsVerification={needsVerification}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <DashboardHeader 
          canAddVehicle={canAddVehicle}
          isPending={isPending}
          onAddVehicleClick={handleAddVehicleClick}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-8">
          <DashboardTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab 
                bookings={bookings}
                loading={bookingsLoading}
                getStatusColor={getStatusColor}
              />
            )}

            {activeTab === 'vehicles' && (
              <VehiclesTab 
                vehicles={vehicles}
                loading={loading}
                canAddVehicle={canAddVehicle}
                handleAddVehicleClick={handleAddVehicleClick}
                handleDelete={handleDelete}
                getStatusColor={getStatusColor}
              />
            )}

            {activeTab === 'bookings' && (
              <BookingsTab 
                bookings={bookings}
                loading={bookingsLoading}
                messagingLoading={messagingLoading}
                handleBookingAction={handleBookingAction}
                handleMessageGuest={handleMessageGuest}
                getStatusColor={getStatusColor}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarTab 
                vehicles={vehicles}
                bookings={bookings}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <AddVehicleModal 
        show={showAddVehicle}
        onClose={() => setShowAddVehicle(false)}
        addType={addType}
        setAddType={setAddType}
      />
    </div>
  );
};

export default HostDashboard;