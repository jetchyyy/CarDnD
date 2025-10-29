import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, Car, Bike, MapPin, Star, XCircle } from 'lucide-react';
import { auth, db } from '../firebase/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc } from 'firebase/firestore';
import { createOrGetChat } from '../utils/chatService';
import ReviewModal from '../components/ReviewModal';
import CancellationModal from '../components/reusables/CancellationModal';
import GuestRefundDetails from '../components/GuestRefundDetails';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagingLoading, setMessagingLoading] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [reviewedBookings, setReviewedBookings] = useState(new Set());
  const currentUser = auth.currentUser;

  const fetchHostDetails = async (hostId) => {
    if (!hostId) return { id: '', name: 'Unknown Host', email: '' };

    try {
      const hostRef = doc(db, 'users', hostId);
      const hostSnap = await getDoc(hostRef);

      if (hostSnap.exists()) {
        const hostData = hostSnap.data();
        return {
          id: hostId,
          name: hostData.name || 'Host',
          email: hostData.email || '',
          photoUrl: hostData.photoUrl || null,
          location: hostData.location || '',
          phone: hostData.phone || '',
        };
      } else {
        console.warn(`Host document not found for ID: ${hostId}`);
        return { id: hostId, name: 'Host Not Found', email: '' };
      }
    } catch (error) {
      console.error('Error fetching host details:', error);
      return { id: hostId, name: 'Host', email: '' };
    }
  };

  const fetchVehicleDetails = async (vehicleId) => {
    try {
      const vehicleRef = doc(db, 'vehicles', vehicleId);
      const vehicleSnap = await getDoc(vehicleRef);
      
      if (vehicleSnap.exists()) {
        const vehicleData = vehicleSnap.data();
        return {
          id: vehicleId,
          title: vehicleData.title || 'Vehicle',
          type: vehicleData.type || 'car',
          image: vehicleData.images?.[0] || vehicleData.image || 'https://via.placeholder.com/200',
          location: vehicleData.location || 'Unknown location',
          pricePerDay: vehicleData.pricePerDay || 0,
          owner: vehicleData.owner || 'Owner',
          hostId: vehicleData.hostId || ''
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      return null;
    }
  };

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
        
        const bookingPromises = snapshot.docs.map(async (docSnap) => {
          const bookingData = docSnap.data();
          
          let vehicleDetails = bookingData.vehicleDetails || {};
          if (bookingData.carId) {
            const fullVehicleDetails = await fetchVehicleDetails(bookingData.carId);
            if (fullVehicleDetails) {
              vehicleDetails = {
                ...vehicleDetails,
                ...fullVehicleDetails
              };
            }
          }

          const actualHostId = vehicleDetails.hostId || bookingData.hostId;

          let hostDetails = bookingData.hostDetails;
          if (!hostDetails || !hostDetails.name) {
            hostDetails = await fetchHostDetails(actualHostId);
          }

          if (vehicleDetails.owner && (!hostDetails.name || hostDetails.name === 'Host')) {
            hostDetails = {
              ...hostDetails,
              name: vehicleDetails.owner
            };
          }

          return {
            id: docSnap.id,
            ...bookingData,
            hostDetails,
            vehicleDetails
          };
        });

        const fetchedBookings = await Promise.all(bookingPromises);
        
        fetchedBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(fetchedBookings);

        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('guestId', '==', currentUser.uid)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewedBookingIds = new Set(
          reviewsSnapshot.docs.map(doc => doc.data().bookingId)
        );
        setReviewedBookings(reviewedBookingIds);
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
      const actualHostId = booking.vehicleDetails?.hostId || booking.hostId;
      const chatId = await createOrGetChat(
        actualHostId,
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

  const handleCancelBooking = async (reason, refundInfo) => {
    try {
      const bookingRef = doc(db, 'bookings', selectedBookingForCancel.id);
      
      // Create cancellation record
      const cancellationData = {
        bookingId: selectedBookingForCancel.id,
        guestId: currentUser.uid,
        hostId: selectedBookingForCancel.vehicleDetails?.hostId || selectedBookingForCancel.hostId,
        vehicleId: selectedBookingForCancel.carId,
        originalAmount: selectedBookingForCancel.totalPrice,
        refundAmount: refundInfo.refundAmount,
        refundPercentage: refundInfo.refundPercentage,
        reason: reason,
        cancelledAt: new Date().toISOString(),
        cancelledBy: 'guest',
        refundStatus: refundInfo.refundAmount > 0 ? 'pending' : 'not_applicable',
        hoursBeforeBooking: refundInfo.hoursUntilBooking,
        bookingDetails: {
          vehicleTitle: selectedBookingForCancel.vehicleDetails?.title,
          startDate: selectedBookingForCancel.startDate,
          endDate: selectedBookingForCancel.endDate,
          guestName: currentUser.displayName || currentUser.email,
          hostName: selectedBookingForCancel.hostDetails?.name
        }
      };

      // Add cancellation record
      await addDoc(collection(db, 'cancellations'), cancellationData);

      // Update booking status
      await updateDoc(bookingRef, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancellationReason: reason,
        refundAmount: refundInfo.refundAmount,
        refundPercentage: refundInfo.refundPercentage,
        refundStatus: refundInfo.refundAmount > 0 ? 'pending' : 'not_applicable'
      });

      alert(`Booking cancelled successfully!\n\nRefund: ₱${refundInfo.refundAmount.toLocaleString()} (${refundInfo.refundPercentage}%)\n\n${refundInfo.refundAmount > 0 ? 'Your refund will be processed by admin within 3-5 business days.' : 'No refund applicable based on cancellation policy.'}`);
      
      // Refresh bookings
      setBookings(prevBookings =>
        prevBookings.map(b =>
          b.id === selectedBookingForCancel.id
            ? { ...b, status: 'cancelled', refundAmount: refundInfo.refundAmount, refundStatus: refundInfo.refundAmount > 0 ? 'pending' : 'not_applicable' }
            : b
        )
      );
      
      setSelectedBookingForCancel(null);
    } catch (error) {
      console.error('Error canceling booking:', error);
      throw error;
    }
  };

  const handleReviewSuccess = () => {
    if (selectedBookingForReview) {
      setReviewedBookings(prev => new Set([...prev, selectedBookingForReview.id]));
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'ongoing':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getBookingStatus = (booking) => {
    const now = new Date();
    const endDate = new Date(booking.endDate);

    if (booking.status === 'cancelled') return 'cancelled';
    if (now > endDate) return 'completed';
    if (booking.status === 'confirmed') {
      const startDate = new Date(booking.startDate);
      if (now >= startDate && now <= endDate) return 'ongoing';
    }
    return booking.status || 'pending';
  };

  const canCancelBooking = (booking) => {
    const status = getBookingStatus(booking);
    if (status === 'cancelled' || status === 'completed') return false;
    
    const now = new Date();
    const startDate = new Date(booking.startDate);
    return now < startDate; // Can cancel if booking hasn't started yet
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your vehicle reservations</p>
        </div>

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
              const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;
              const isCompleted = status === 'completed';
              const hasReviewed = reviewedBookings.has(booking.id);
              const isCancellable = canCancelBooking(booking);

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={booking.vehicleDetails?.image || 'https://via.placeholder.com/200'}
                        alt={booking.vehicleDetails?.title || 'Vehicle'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
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
                            {booking.vehicleDetails?.location && (
                              <div className="flex items-center gap-1 text-gray-600 text-sm">
                                <MapPin className="w-4 h-4" />
                                {booking.vehicleDetails.location}
                              </div>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(status)} whitespace-nowrap ml-2`}>
                            {status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-gray-600 text-sm">Check-in</p>
                            <p className="font-semibold text-gray-900">
                              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Check-out</p>
                            <p className="font-semibold text-gray-900">
                              {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Duration</p>
                            <p className="font-semibold text-gray-900">{days} day{days !== 1 ? 's' : ''}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Host</p>
                            <p className="font-semibold text-gray-900 truncate">
                              {booking.hostDetails?.name || 'Host'}
                            </p>
                          </div>
                        </div>

                        {/* Show refund details if processed */}
                        {booking.status === 'cancelled' && booking.refundStatus === 'processed' && (
                          <div className="mb-4">
                            <GuestRefundDetails 
                              bookingId={booking.id} 
                              guestId={currentUser.uid} 
                            />
                          </div>
                        )}

                        {/* Show pending refund status */}
                        {booking.status === 'cancelled' && booking.refundStatus === 'pending' && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-yellow-800">
                              <strong>Refund Pending:</strong> Your refund of ₱{booking.refundAmount?.toLocaleString() || 0} ({booking.refundPercentage || 0}%) is being processed by admin.
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                              This typically takes 3-5 business days. You will be notified once the refund is sent.
                            </p>
                          </div>  
                        )}

                        {/* Show no refund message */}
                        {booking.status === 'cancelled' && booking.refundStatus === 'not_applicable' && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-gray-700">
                              <strong>Cancelled:</strong> No refund applicable based on cancellation policy.
                            </p>
                          </div>  
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200 gap-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-gray-600 text-sm">Total Price</p>
                            <p className="text-2xl font-bold text-gray-900">₱{booking.totalPrice?.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                          {isCompleted && !hasReviewed && (
                            <button
                              onClick={() => setSelectedBookingForReview(booking)}
                              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                            >
                              <Star className="w-4 h-4" />
                              Leave Review
                            </button>
                          )}
                          
                          {isCompleted && hasReviewed && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                              <Star className="w-4 h-4 text-green-600 fill-green-600" />
                              <span className="text-sm font-medium text-green-700">Review submitted</span>
                            </div>
                          )}

                          {isCancellable && (
                            <button
                              onClick={() => setSelectedBookingForCancel(booking)}
                              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel
                            </button>
                          )}

                          <button
                            onClick={() => handleMessageHost(booking)}
                            disabled={messagingLoading}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedBookingForReview && (
        <ReviewModal
          booking={selectedBookingForReview}
          onClose={() => setSelectedBookingForReview(null)}
          onSuccess={handleReviewSuccess}
        />
      )}

      {selectedBookingForCancel && (
        <CancellationModal
          booking={selectedBookingForCancel}
          onClose={() => setSelectedBookingForCancel(null)}
          onConfirm={handleCancelBooking}
        />
      )}
    </div>
  );
};

export default MyBookings;