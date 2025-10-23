import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Loader2, CheckCircle } from 'lucide-react';
import { getDisabledDates, toggleDisabledDate } from '../utils/availabilityService';

const BookingCalendar = ({ vehicle, bookings, onRefresh }) => {
  const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [disabledDates, setDisabledDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingDate, setUpdatingDate] = useState(null);
  const [notification, setNotification] = useState(null);

  // Filter bookings for this vehicle
  const vehicleBookings = bookings.filter(b => b.carId === vehicle.id);

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
      showNotification('Failed to load disabled dates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0-6, where 0 is Sunday)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Check if a date has a booking
  const getBookingForDate = (day) => {
    return vehicleBookings.find(booking => {
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

  // Toggle date disabled status
  const handleDateClick = async (day) => {
    if (isDateInPast(day) || getBookingForDate(day)) return;
    
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    
    try {
      setUpdatingDate(dateStr);
      const result = await toggleDisabledDate(vehicle.id, dateStr);
      
      // Update local state
      if (result.action === 'disabled') {
        setDisabledDates(prev => [...prev, dateStr]);
        showNotification('Date blocked successfully');
      } else {
        setDisabledDates(prev => prev.filter(d => d !== dateStr));
        showNotification('Date unblocked successfully');
      }

      // Refresh parent component if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error toggling date:', error);
      showNotification('Failed to update date', 'error');
    } finally {
      setUpdatingDate(null);
    }
  };

  // Get booking status color
  const getStatusBgColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-400';
      case 'pending':
        return 'bg-yellow-400';
      case 'cancelled':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading calendar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 relative">
      {/* Notification */}
      {notification && (
        <div className={`absolute top-4 right-4 z-10 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {vehicle.title || `${vehicle.specifications?.brand} ${vehicle.specifications?.model}`}
        </h3>
        <p className="text-sm text-gray-600">₱{vehicle.pricePerDay}/day</p>
        <p className="text-xs text-gray-500 mt-2">Click on available dates to block/unblock them for bookings</p>
        <p className="text-xs text-blue-600 mt-1">
          {disabledDates.length} {disabledDates.length === 1 ? 'date' : 'dates'} currently blocked
        </p>
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
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const booking = day ? getBookingForDate(day) : null;
          const disabled = day ? isDateDisabled(day) : false;
          const isPast = day ? isDateInPast(day) : false;
          const dateStr = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0] : null;
          const isUpdating = dateStr === updatingDate;
          
          return (
            <div
              key={index}
              onClick={() => day && !booking && !isPast && handleDateClick(day)}
              className={`h-16 rounded-lg border transition-all relative ${
                day === null
                  ? 'bg-gray-50 border-transparent'
                  : disabled
                  ? 'bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-700'
                  : booking
                  ? `${getStatusBgColor(booking.status)} border-transparent cursor-not-allowed`
                  : isPast
                  ? 'bg-gray-100 border-gray-200'
                  : 'bg-white border-gray-200 hover:border-blue-400 cursor-pointer hover:bg-blue-50'
              }`}
            >
              {day && (
                <div className="h-full p-1 flex flex-col justify-between">
                  <span className={`text-xs font-semibold ${disabled ? 'text-white' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  {isUpdating ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    </div>
                  ) : booking ? (
                    <div className="text-xs">
                      <p className="text-white font-semibold truncate">
                        {booking.guestName?.split(' ')[0] || 'Guest'}
                      </p>
                      <p className="text-white text-opacity-90 text-[10px] capitalize">
                        {booking.status}
                      </p>
                    </div>
                  ) : disabled ? (
                    <div className="flex items-center justify-center">
                      <X className="w-4 h-4 text-white" />
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 rounded"></div>
          <span className="text-gray-600">Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span className="text-gray-600">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400 rounded"></div>
          <span className="text-gray-600">Cancelled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-800 rounded flex items-center justify-center">
            <X className="w-3 h-3 text-white" />
          </div>
          <span className="text-gray-600">Blocked by You</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
          <span className="text-gray-600">Past Date</span>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;