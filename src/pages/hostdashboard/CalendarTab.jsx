// pages/HostDashboard/components/CalendarTab.jsx
import { Calendar } from 'lucide-react';
import BookingCalendar from '../../components/BookingCalendar';

const CalendarTab = ({ vehicles, bookings, loading }) => {
  if (loading) {
    return <p className="text-gray-500 text-center py-10">Loading vehicles...</p>;
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">No vehicles to display</p>
        <p className="text-gray-400 text-sm mb-6">Add a vehicle to see its booking calendar</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Vehicle Booking Calendars</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {vehicles.map((vehicle) => (
          <BookingCalendar 
            key={vehicle.id} 
            vehicle={vehicle} 
            bookings={bookings}
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarTab;