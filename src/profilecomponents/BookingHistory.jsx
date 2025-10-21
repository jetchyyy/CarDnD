import { Car } from 'lucide-react';

const BookingHistory = ({ bookingHistory }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking History</h2>
      {bookingHistory.length === 0 ? (
        <div className="text-center py-12">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No bookings yet</p>
          <p className="text-gray-400 text-sm">Your bookings will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookingHistory.map(booking => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{booking.vehicleName}</h3>
                  <p className="text-sm text-gray-600">{booking.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{booking.amount}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                  booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;