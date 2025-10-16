import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, Car, Bike, MapPin, DollarSign } from 'lucide-react';
import { auth } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { createOrGetChat } from '../utils/chatService';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagingLoading, setMessagingLoading] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const q = query(
          collection(db, 'bookings'),
          where('guestId', '==', currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const fetchedBookings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Sort by created date, newest first
        fetchedBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(fetchedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser, navigate]);

  const handleMessageHost = async (booking) => {
    try {
      setMessagingLoading(true);
      const chatId = await createOrGetChat(
        booking.hostId,
        currentUser.uid,
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
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getBookingStatus = (booking) => {
    const now = new Date();
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);

    if (booking.status === 'cancelled') return 'cancelled';
    if (now > endDate) return 'completed';
    if (now >= startDate && now <= endDate) return 'ongoing';
    return booking.status || 'pending';
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your vehicle reservations</p>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your bookings...</p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No bookings yet</p>
            <p className="text-gray-400 text-sm mb-6">Start booking vehicles to see them here</p>
            <button
              onClick={() => navigate('/vehicles')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Browse Vehicles
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const status = getBookingStatus(booking);
              const startDate = new Date(booking.startDate);
              const endDate = new Date(booking.endDate);
              const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Vehicle Image */}
                    <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={booking.vehicleDetails?.image || 'https://via.placeholder.com/200'}
                        alt={booking.vehicleDetails?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {booking.vehicleDetails?.type === 'motorcycle' ? (
                                <Bike className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Car className="w-5 h-5 text-blue-600" />
                              )}
                              <h3 className="text-xl font-bold text-gray-900">
                                {booking.vehicleDetails?.title || 'Vehicle'}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 text-sm">
                              <MapPin className="w-4 h-4" />
                              {booking.vehicleDetails?.location}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-gray-600 text-sm">Check-in</p>
                            <p className="font-semibold text-gray-900">{startDate.toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Check-out</p>
                            <p className="font-semibold text-gray-900">{endDate.toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Duration</p>
                            <p className="font-semibold text-gray-900">{days} day{days !== 1 ? 's' : ''}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Host</p>
                            <p className="font-semibold text-gray-900">{booking.hostDetails?.name || 'Host'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-gray-600 text-sm">Total Price</p>
                            <p className="text-2xl font-bold text-gray-900">₱{booking.totalPrice?.toLocaleString()}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleMessageHost(booking)}
                          disabled={messagingLoading || booking.status === 'cancelled'}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                        >
                          <MessageSquare className="w-5 h-5" />
                          Message Host
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
