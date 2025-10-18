import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  DollarSign,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  Plus,
  X,
  Bike,
  Check,
  XCircle,
  MessageSquare
} from 'lucide-react';
import AddCar from './AddCar';
import AddMotorcycle from './AddMotorcycle';
import BookingCalendar from '../components/BookingCalendar';
import { db, auth } from '../firebase/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { deleteVehicleImages } from '../utils/vehicleService';
import { getHostBookings } from '../utils/bookingService';
import { createOrGetChat } from '../utils/chatService';

const HostDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [addType, setAddType] = useState('car');
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [messagingLoading, setMessagingLoading] = useState(false);

  // Fetch vehicles from Firestore
  useEffect(() => {
    const fetchVehicles = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'vehicles'), where('hostId', '==', user.uid));
        const snapshot = await getDocs(q);
        const fetchedVehicles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVehicles(fetchedVehicles);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [showAddVehicle]);

  // Fetch bookings from Firestore
  useEffect(() => {
    const fetchBookings = async () => {
      const user = auth.currentUser;
      if (!user) {
        setBookingsLoading(false);
        return;
      }

      try {
        const hostBookings = await getHostBookings(user.uid);
        hostBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(hostBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Calculate stats from real data
  const calculateStats = () => {
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const totalEarnings = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyEarnings = confirmedBookings
      .filter(b => {
        const bookingDate = new Date(b.createdAt);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      })
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

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
      title: 'Total Earnings',
      value: `₱${statsData.totalEarnings.toLocaleString()}`,
      change: '+12.5%',
      icon: <DollarSign className="w-6 h-6" />,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Active Bookings',
      value: statsData.activeBookings.toString(),
      change: '+3',
      icon: <Calendar className="w-6 h-6" />,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Vehicles',
      value: statsData.totalVehicles.toString(),
      change: 'Active',
      icon: <Car className="w-6 h-6" />,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'This Month',
      value: `₱${statsData.monthlyEarnings.toLocaleString()}`,
      change: '+8.2%',
      icon: <TrendingUp className="w-6 h-6" />,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  // Delete vehicle handler
  const handleDelete = async (id, imageUrls) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        if (imageUrls && imageUrls.length > 0) {
          await deleteVehicleImages(imageUrls);
        }
        await deleteDoc(doc(db, 'vehicles', id));
        setVehicles(prev => prev.filter(v => v.id !== id));
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
        auth.currentUser.uid,
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

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your vehicles and bookings</p>
          </div>
          <button
            onClick={() => setShowAddVehicle(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Vehicle</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} ${stat.iconColor} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6 overflow-x-auto">
              {['overview', 'vehicles', 'bookings', 'calendar'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                {bookingsLoading ? (
                  <p className="text-gray-500 text-center py-10">Loading bookings...</p>
                ) : recentBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No bookings yet</p>
                    <p className="text-gray-400 text-sm">Your recent bookings will appear here</p>
                  </div>
                ) : (
                  recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {booking.vehicleDetails?.type === 'motorcycle' ? (
                            <Bike className="w-6 h-6 text-blue-600" />
                          ) : (
                            <Car className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {booking.vehicleDetails?.title || 'Vehicle'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.guestDetails?.name} • {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₱{booking.totalPrice?.toLocaleString()}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Vehicles */}
            {activeTab === 'vehicles' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Vehicles</h2>

                {loading ? (
                  <p className="text-gray-500 text-center py-10">Loading vehicles...</p>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No vehicles listed yet</p>
                    <p className="text-gray-400 text-sm mb-6">Start earning by adding your first vehicle</p>
                    <button
                      onClick={() => setShowAddVehicle(true)}
                      className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Your First Vehicle</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map((v) => (
                      <div
                        key={v.id}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="relative h-48">
                          <img
                            src={v.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                            alt={v.title || `${v.specifications?.brand} ${v.specifications?.model}`}
                            className="w-full h-full object-cover"
                          />
                          <span
                            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              v.status || 'available'
                            )}`}
                          >
                            {v.status === 'available' ? 'Available' : v.status}
                          </span>
                          <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full">
                            <span className="text-xs font-semibold text-gray-700 capitalize flex items-center">
                              {v.type === 'car' ? (
                                <Car className="w-3 h-3 mr-1" />
                              ) : (
                                <Bike className="w-3 h-3 mr-1" />
                              )}
                              {v.type}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {v.title || `${v.specifications?.brand} ${v.specifications?.model}`}
                          </h3>
                          <p className="text-sm text-gray-500 mb-3">{v.location}</p>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                            <div>
                              <p className="text-gray-600">Price/day</p>
                              <p className="font-semibold text-gray-900">
                                ₱{v.pricePerDay}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Year</p>
                              <p className="font-semibold text-gray-900">
                                {v.specifications?.year}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Transmission</p>
                              <p className="font-semibold text-gray-900 capitalize">
                                {v.specifications?.transmission}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">
                                {v.type === 'car' ? 'Seats' : 'Engine'}
                              </p>
                              <p className="font-semibold text-gray-900">
                                {v.type === 'car' 
                                  ? v.specifications?.seats 
                                  : `${v.specifications?.engineSize}cc`}
                              </p>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <button className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </button>
                            <button
                              className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(v.id, v.images)}
                              className="flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bookings Table */}
            {activeTab === 'bookings' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">All Bookings</h2>
                  <div className="flex gap-2">
                    <span className="text-sm text-gray-600">
                      Total: <span className="font-semibold">{bookings.length}</span>
                    </span>
                  </div>
                </div>

                {bookingsLoading ? (
                  <p className="text-gray-500 text-center py-10">Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No bookings yet</p>
                    <p className="text-gray-400 text-sm">Bookings for your vehicles will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vehicle
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Guest
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dates
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <img 
                                  src={booking.vehicleDetails?.image || 'https://via.placeholder.com/50'}
                                  alt={booking.vehicleDetails?.title}
                                  className="w-12 h-12 rounded-lg object-cover mr-3"
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {booking.vehicleDetails?.title || 'Vehicle'}
                                  </p>
                                  <p className="text-xs text-gray-500 capitalize">
                                    {booking.vehicleDetails?.type}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-gray-900">{booking.guestDetails?.name}</p>
                                <p className="text-xs text-gray-500">{booking.guestDetails?.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              <div>
                                <p>{new Date(booking.startDate).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-500">
                                  to {new Date(booking.endDate).toLocaleDateString()}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                              ₱{booking.totalPrice?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              {booking.status === 'pending' && (
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => handleBookingAction(booking.id, 'confirmed')}
                                    className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                                    title="Confirm booking"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                                    title="Cancel booking"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                              {booking.status === 'confirmed' && (
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => handleMessageGuest(booking)}
                                    disabled={messagingLoading}
                                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
                                    title="Message guest"
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                              {booking.status === 'cancelled' && (
                                <div className="flex justify-center">
                                  <span className="text-xs text-gray-500">Cancelled</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Vehicle Booking Calendars</h2>
                {loading ? (
                  <p className="text-gray-500 text-center py-10">Loading vehicles...</p>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No vehicles to display</p>
                    <p className="text-gray-400 text-sm mb-6">Add a vehicle to see its booking calendar</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {vehicles.map((vehicle) => (
                      <BookingCalendar 
                        key={vehicle.id} 
                        vehicle={vehicle} 
                        bookings={bookings}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start overflow-auto py-10 z-50">
          <div className="relative bg-white w-full max-w-5xl rounded-xl shadow-lg">
            <button
              onClick={() => setShowAddVehicle(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex justify-center space-x-4 border-b p-4">
              <button
                className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                  addType === 'car'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setAddType('car')}
              >
                <Car className="w-5 h-5" />
                <span>Add Car</span>
              </button>
              <button
                className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                  addType === 'motorcycle'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setAddType('motorcycle')}
              >
                <Bike className="w-5 h-5" />
                <span>Add Motorcycle</span>
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {addType === 'car' ? <AddCar /> : <AddMotorcycle />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostDashboard;