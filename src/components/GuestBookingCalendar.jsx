import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { getDisabledDates } from '../utils/availabilityService';

const GuestBookingCalendar = ({ vehicle, bookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [disabledDates, setDisabledDates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter confirmed bookings for this vehicle only
  const vehicleBookings = bookings.filter(b => b.carId === vehicle.id && b.status === 'confirmed');

  // Load disabled dates on mount
  useEffect(() => {
    loadDisabledDates();
  }, [vehicle.id]);

  const loadDisabledDates = async () => {
    try {
      setLoading(true);
      const dates = await getDisabledDates(vehicle.id);
      setDisabledDates(dates);
    } catch (error) {
      console.error('Error loading disabled dates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0-6, where 0 is Sunday)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Check if a date is booked
  const isDateBooked = (day) => {
    return vehicleBookings.some(booking => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const current = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      current.setHours(0, 0, 0, 0);
      
      return current >= start && current <= end;
    });
  };

  // Check if a date is disabled by host
  const isDateDisabled = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return disabledDates.includes(dateStr);
  };

  // Check if a date is in the past
  const isDateInPast = (day) => {
    const current = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    current.setHours(0, 0, 0, 0);
    return current < today;
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getUnavailableDatesCount = () => {
    const unavailableDates = new Set();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count booked dates
    vehicleBookings.forEach(booking => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d >= today) {
          unavailableDates.add(d.toDateString());
        }
      }
    });

    // Count disabled dates (future only)
    disabledDates.forEach(dateStr => {
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      if (date >= today) {
        unavailableDates.add(date.toDateString());
      }
    });

    return unavailableDates.size;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading calendar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      {/* Vehicle Info */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {vehicle.title || `${vehicle.specifications?.brand} ${vehicle.specifications?.model}`}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">₱{vehicle.pricePerDay}/day</p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-red-600">{getUnavailableDatesCount()}</span> days unavailable
          </p>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h4 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
          {monthName}
        </h4>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="h-10 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-600">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {days.map((day, index) => {
          const booked = day ? isDateBooked(day) : false;
          const disabled = day ? isDateDisabled(day) : false;
          const isPast = day ? isDateInPast(day) : false;
          
          return (
            <div
              key={index}
              className={`h-14 rounded-lg border flex items-center justify-center transition-all text-sm font-medium ${
                day === null
                  ? 'bg-gray-50 border-transparent'
                  : disabled
                  ? 'bg-gray-800 border-gray-700 text-white cursor-not-allowed relative'
                  : booked
                  ? 'bg-red-100 border-red-300 text-red-700 cursor-not-allowed'
                  : isPast
                  ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100 cursor-pointer'
              }`}
              title={
                day && disabled 
                  ? 'Blocked by host' 
                  : day && booked 
                  ? 'Booked' 
                  : day && isPast 
                  ? 'Past date' 
                  : day 
                  ? 'Available' 
                  : ''
              }
            >
              {day && disabled ? (
                <div className="relative">
                  <span>{day}</span>
                </div>
              ) : (
                day
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border border-green-300 rounded"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-gray-600">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-800 rounded flex items-center justify-center">
            <X className="w-3 h-3 text-white" />
          </div>
          <span className="text-gray-600">Not Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
          <span className="text-gray-600">Past Date</span>
        </div>
      </div>
    </div>
  );
};

export default GuestBookingCalendar;