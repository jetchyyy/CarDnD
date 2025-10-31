// pages/HostDashboard/components/OverviewTab.jsx
import { Calendar, Car, Bike } from 'lucide-react';

const OverviewTab = ({ bookings, loading, getStatusColor }) => {
  const recentBookings = bookings.slice(0, 5);

  if (loading) {
    return <p className="text-gray-500 text-center py-10">Loading bookings...</p>;
  }

  if (recentBookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">No bookings yet</p>
        <p className="text-gray-400 text-sm">Your recent bookings will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
      {recentBookings.map((booking) => (
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
            <div className="space-y-1">
              <p className="font-bold text-gray-900">₱{booking.hostEarnings?.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                (₱{booking.totalPrice?.toLocaleString()} - ₱{booking.serviceFee?.amount?.toLocaleString()} fee)
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(
                booking.status
              )}`}
            >
              {booking.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewTab;