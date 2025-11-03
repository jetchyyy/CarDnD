// pages/HostDashboard/components/BookingsTab.jsx
import { Calendar, Check, XCircle, MessageSquare } from 'lucide-react';

const BookingsTab = ({ 
  bookings, 
  loading, 
  messagingLoading,
  handleBookingAction,
  handleMessageGuest,
  getStatusColor 
}) => {
  if (loading) {
    return <p className="text-gray-500 text-center py-10">Loading bookings...</p>;
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">No bookings yet</p>
        <p className="text-gray-400 text-sm">Bookings for your vehicles will appear here</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">All Bookings</h2>
        <div className="flex gap-2">
          <span className="text-sm text-gray-600">
            Total: <span className="font-semibold">{bookings.length}</span>
          </span>
        </div>
      </div>

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
                Your Earnings
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
                      src={booking.vehicleDetails?.imageUrls|| 'https://via.placeholder.com/50'}
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
                <td className="px-6 py-4 text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ₱{booking.hostEarnings?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    (₱{booking.totalPrice?.toLocaleString()} - {booking.serviceFee?.percentage}% fee)
                  </p>
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
    </div>
  );
};

export default BookingsTab;