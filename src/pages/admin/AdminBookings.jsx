import { useEffect, useState } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Search, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, search, statusFilter]);

  const fetchBookings = async () => {
    try {
      const bookingsSnap = await getDocs(collection(db, 'bookings'));
      const bookingsData = bookingsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(bookingsData.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => (b.status || 'pending') === statusFilter);
    }

    if (search) {
      filtered = filtered.filter(b =>
        b.guestDetails?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.guestDetails?.email?.toLowerCase().includes(search.toLowerCase()) ||
        b.vehicleDetails?.title?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'completed',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      fetchBookings();
      alert('Booking marked as completed');
    } catch (error) {
      console.error('Error completing booking:', error);
      alert('Failed to complete booking');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      fetchBookings();
      alert('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  const getStatusBadge = (status) => {
    const defaultStatus = status || 'pending';
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    };
    return badges[defaultStatus] || badges.pending;
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div className="text-center py-12">Loading bookings...</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by guest, email, or vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={fetchBookings}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>
        <p className="text-gray-600 text-sm mt-3">Total: {filteredBookings.length} bookings</p>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Booking ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Guest</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Vehicle</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Dates</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Days</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-600">
                  No bookings found
                </td>
              </tr>
            ) : (
              filteredBookings.map(booking => {
                const badgeStyle = getStatusBadge(booking.status);
                const StatusIcon = badgeStyle.icon;
                const days = calculateDays(booking.startDate, booking.endDate);
                return (
                  <tr key={booking.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">{booking.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold">{booking.guestDetails?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{booking.guestDetails?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {booking.vehicleDetails?.image && (
                          <img 
                            src={booking.vehicleDetails.image} 
                            alt={booking.vehicleDetails.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="text-sm font-semibold">{booking.vehicleDetails?.title || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 capitalize">{booking.vehicleDetails?.type || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Start: {formatDate(booking.startDate)}</p>
                        <p className="text-xs text-gray-500">End: {formatDate(booking.endDate)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{days} days</td>
                    <td className="px-6 py-4 font-semibold">₱{booking.totalPrice || 0}</td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 ${badgeStyle.bg} ${badgeStyle.text} px-3 py-1 rounded-full text-xs font-semibold w-fit`}>
                        <StatusIcon size={16} />
                        {(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => { setSelectedBooking(booking); setShowDetails(true); }}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <>
                            <button
                              onClick={() => handleCompleteBooking(booking.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Booking ID */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Booking ID</p>
                <p className="font-mono font-semibold">{selectedBooking.id}</p>
              </div>

              {/* Vehicle Info */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Vehicle Information</h3>
                <div className="flex items-center space-x-4">
                  {selectedBooking.vehicleDetails?.image && (
                    <img 
                      src={selectedBooking.vehicleDetails.image} 
                      alt={selectedBooking.vehicleDetails.title}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-lg">{selectedBooking.vehicleDetails?.title || 'Unknown'}</p>
                    <p className="text-sm text-gray-500 capitalize">Type: {selectedBooking.vehicleDetails?.type || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Guest Info */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Guest Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-semibold">{selectedBooking.guestDetails?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold">{selectedBooking.guestDetails?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Booking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-semibold">{formatDate(selectedBooking.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-semibold">{formatDate(selectedBooking.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-semibold">{calculateDays(selectedBooking.startDate, selectedBooking.endDate)} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Price</p>
                    <p className="font-semibold text-lg text-blue-600">₱{selectedBooking.totalPrice || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold capitalize">{selectedBooking.status || 'pending'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-semibold">{formatDate(selectedBooking.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                  <>
                    <button
                      onClick={() => {
                        handleCompleteBooking(selectedBooking.id);
                        setShowDetails(false);
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      Mark as Completed
                    </button>
                    <button
                      onClick={() => {
                        handleCancelBooking(selectedBooking.id);
                        setShowDetails(false);
                      }}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      Cancel Booking
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Bookings Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-2xl font-bold">
              {bookings.filter(b => (b.status || 'pending') === 'pending').length}
            </p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-gray-600 text-sm">Confirmed</p>
            <p className="text-2xl font-bold">
              {bookings.filter(b => b.status === 'confirmed').length}
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-2xl font-bold">
              {bookings.filter(b => b.status === 'completed').length}
            </p>
          </div>
          <div className="border-l-4 border-red-500 pl-4 py-2">
            <p className="text-gray-600 text-sm">Cancelled</p>
            <p className="text-2xl font-bold">
              {bookings.filter(b => b.status === 'cancelled').length}
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold">
              ₱{bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.totalPrice || 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}