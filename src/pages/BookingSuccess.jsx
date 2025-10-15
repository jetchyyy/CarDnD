import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Home, FileText } from 'lucide-react';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId, vehicle, bookingDates, totalPrice } = location.state || {};

  if (!bookingId) {
    navigate('/');
    return null;
  }

  const calculateDays = () => {
    const start = new Date(bookingDates.startDate);
    const end = new Date(bookingDates.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">
            Your booking has been successfully confirmed. We've sent a confirmation email to your inbox.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="bg-blue-600 text-white px-6 py-4">
            <p className="text-sm opacity-90">Booking Reference</p>
            <p className="text-xl font-bold">#{bookingId.slice(0, 8).toUpperCase()}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Vehicle Info */}
            <div className="flex gap-4">
              <img
                src={vehicle.images?.[0] || 'https://via.placeholder.com/120'}
                alt={vehicle.title}
                className="w-32 h-32 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{vehicle.title}</h2>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{vehicle.location}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="capitalize">Type: {vehicle.type}</p>
                  <p>Hosted by: {vehicle.owner}</p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Pick-up Date</p>
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
                    <p className="text-sm text-gray-600">Return Date</p>
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
              <div className="mt-4">
                <p className="text-sm text-gray-600">Total Duration</p>
                <p className="font-semibold text-gray-900">
                  {calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-bold text-gray-900 mb-3">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Rental ({calculateDays()} {calculateDays() === 1 ? 'day' : 'days'})</span>
                  <span>₱{totalPrice}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>Total Paid</span>
                  <span>₱{totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">What's Next?</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3 flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900">Check your email</p>
                <p className="text-sm text-gray-600">
                  We've sent you a confirmation email with all booking details and contact information.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3 flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900">Contact the host</p>
                <p className="text-sm text-gray-600">
                  The host will reach out to you to arrange pick-up details and answer any questions.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3 flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900">Prepare for your trip</p>
                <p className="text-sm text-gray-600">
                  Bring a valid driver's license and any required documents on the pick-up date.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/bookings')}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>View My Bookings</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Need help with your booking?</p>
          <p>
            Contact us at{' '}
            <a href="mailto:support@carrental.com" className="text-blue-600 hover:text-blue-700">
              support@carrental.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;