import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  CreditCard, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { auth } from '../firebase/firebase';
import { createBooking, checkAvailability } from '../utils/bookingService';

const BookingConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  const { vehicle, bookingDates, totalPrice } = location.state || {};

  useEffect(() => {
    // Check if user is logged in
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate('/login', { state: { from: `/vehicles/${id}` } });
      return;
    }

    // Check if booking data exists
    if (!vehicle || !bookingDates) {
      navigate(`/vehicles/${id}`);
      return;
    }

    // Check availability
    const verifyAvailability = async () => {
      setIsChecking(true);
      try {
        const isAvailable = await checkAvailability(
          vehicle.id,
          bookingDates.startDate,
          bookingDates.endDate
        );

        if (!isAvailable) {
          setError('Sorry, this vehicle is no longer available for the selected dates.');
        }
      } catch (err) {
        console.error('Error checking availability:', err);
        setError('Unable to verify availability. Please try again.');
      } finally {
        setIsChecking(false);
      }
    };

    verifyAvailability();
  }, [id, vehicle, bookingDates, navigate]);

  const calculateDays = () => {
    const start = new Date(bookingDates.startDate);
    const end = new Date(bookingDates.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleConfirmBooking = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check availability one more time before booking
      const isAvailable = await checkAvailability(
        vehicle.id,
        bookingDates.startDate,
        bookingDates.endDate
      );

      if (!isAvailable) {
        setError('Sorry, this vehicle is no longer available for the selected dates.');
        setLoading(false);
        return;
      }

      const bookingData = {
        carId: vehicle.id,
        guestId: currentUser.uid,
        hostId: vehicle.hostId,
        startDate: bookingDates.startDate,
        endDate: bookingDates.endDate,
        totalPrice: totalPrice,
        vehicleTitle: vehicle.title,
        vehicleType: vehicle.type,
        vehicleImage: vehicle.images?.[0] || '',
        guestName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Guest',
        guestEmail: currentUser.email,
      };

      const bookingId = await createBooking(bookingData);
      
      // Navigate to success page
      navigate('/booking-success', { 
        state: { 
          bookingId,
          vehicle,
          bookingDates,
          totalPrice
        } 
      });
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle || !bookingDates) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  const days = calculateDays();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Confirm Your Booking</h1>
          <p className="text-gray-600">Review your booking details before confirming</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {isChecking ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Checking availability...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Vehicle Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Vehicle Details</h2>
                <div className="flex gap-4">
                  <img
                    src={vehicle.images?.[0] || 'https://via.placeholder.com/200'}
                    alt={vehicle.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{vehicle.title}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{vehicle.location}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="capitalize">Type: {vehicle.type}</p>
                      <p className="capitalize">Transmission: {vehicle.specifications?.transmission}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Dates */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Dates</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Check-in</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(bookingDates.startDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Check-out</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(bookingDates.endDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Total duration</p>
                  <p className="font-semibold text-gray-900">{days} {days === 1 ? 'day' : 'days'}</p>
                </div>
              </div>

              {/* Host Information */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Hosted by</h2>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {vehicle.owner?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{vehicle.owner}</p>
                    <p className="text-sm text-gray-600">Vehicle host</p>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cancellation Policy</h2>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p>Free cancellation up to 24 hours before the trip starts</p>
                  </div>
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p>50% refund if cancelled within 24 hours of trip start</p>
                  </div>
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p>No refund if cancelled after trip has started</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary - Sticky */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Price Summary</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>₱{vehicle.pricePerDay} × {days} {days === 1 ? 'day' : 'days'}</span>
                    <span>₱{vehicle.pricePerDay * days}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Service fee</span>
                    <span>₱0</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>₱{totalPrice}</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmBooking}
                  disabled={loading || error}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 mb-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Confirm Booking</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate(-1)}
                  disabled={loading}
                  className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
                >
                  Go Back
                </button>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <CreditCard className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600">
                      Your payment information will be collected securely after booking confirmation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingConfirmation;
