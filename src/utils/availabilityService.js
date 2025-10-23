// utils/availabilityService.js
import { db } from '../firebase/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Get disabled dates for a vehicle
 */
export const getDisabledDates = async (vehicleId) => {
  try {
    const vehicleRef = doc(db, 'vehicles', vehicleId);
    const vehicleDoc = await getDoc(vehicleRef);
    
    if (vehicleDoc.exists()) {
      return vehicleDoc.data().disabledDates || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching disabled dates:', error);
    throw error;
  }
};

/**
 * Toggle a date's disabled status
 */
export const toggleDisabledDate = async (vehicleId, dateStr) => {
  try {
    const vehicleRef = doc(db, 'vehicles', vehicleId);
    const vehicleDoc = await getDoc(vehicleRef);
    
    if (!vehicleDoc.exists()) {
      throw new Error('Vehicle not found');
    }

    const currentDisabledDates = vehicleDoc.data().disabledDates || [];
    
    if (currentDisabledDates.includes(dateStr)) {
      // Remove date from disabled list
      await updateDoc(vehicleRef, {
        disabledDates: arrayRemove(dateStr)
      });
      return { success: true, action: 'enabled', date: dateStr };
    } else {
      // Add date to disabled list
      await updateDoc(vehicleRef, {
        disabledDates: arrayUnion(dateStr)
      });
      return { success: true, action: 'disabled', date: dateStr };
    }
  } catch (error) {
    console.error('Error toggling disabled date:', error);
    throw error;
  }
};

/**
 * Add multiple disabled dates at once
 */
export const addDisabledDates = async (vehicleId, dateArray) => {
  try {
    const vehicleRef = doc(db, 'vehicles', vehicleId);
    
    for (const date of dateArray) {
      await updateDoc(vehicleRef, {
        disabledDates: arrayUnion(date)
      });
    }
    
    return { success: true, count: dateArray.length };
  } catch (error) {
    console.error('Error adding disabled dates:', error);
    throw error;
  }
};

/**
 * Remove multiple disabled dates at once
 */
export const removeDisabledDates = async (vehicleId, dateArray) => {
  try {
    const vehicleRef = doc(db, 'vehicles', vehicleId);
    
    for (const date of dateArray) {
      await updateDoc(vehicleRef, {
        disabledDates: arrayRemove(date)
      });
    }
    
    return { success: true, count: dateArray.length };
  } catch (error) {
    console.error('Error removing disabled dates:', error);
    throw error;
  }
};

/**
 * Get confirmed bookings for a vehicle
 */
export const getConfirmedBookings = async (vehicleId) => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('carId', '==', vehicleId),
      where('status', '==', 'confirmed')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching confirmed bookings:', error);
    throw error;
  }
};

/**
 * Check if date range is available for booking (including disabled dates)
 */
export const checkAvailabilityWithDisabledDates = async (vehicleId, startDate, endDate) => {
  try {
    // Get disabled dates and confirmed bookings
    const [disabledDates, confirmedBookings] = await Promise.all([
      getDisabledDates(vehicleId),
      getConfirmedBookings(vehicleId)
    ]);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Check if dates are valid
    if (start < today) {
      return { 
        available: false, 
        reason: 'past_date',
        message: 'Start date cannot be in the past' 
      };
    }

    if (end < start) {
      return { 
        available: false, 
        reason: 'invalid_range',
        message: 'End date must be after start date' 
      };
    }

    if (end.getTime() === start.getTime()) {
      return { 
        available: false, 
        reason: 'same_day',
        message: 'Booking must be at least 1 day' 
      };
    }

    // Check each date in the range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      // Check if date is disabled by host
      if (disabledDates.includes(dateStr)) {
        return { 
          available: false, 
          reason: 'host_disabled',
          message: `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} is blocked by the host`,
          blockedDate: dateStr
        };
      }

      // Check if date overlaps with confirmed booking
      const isBooked = confirmedBookings.some(booking => {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);
        bookingStart.setHours(0, 0, 0, 0);
        bookingEnd.setHours(0, 0, 0, 0);
        
        const currentDate = new Date(d);
        currentDate.setHours(0, 0, 0, 0);
        
        return currentDate >= bookingStart && currentDate <= bookingEnd;
      });

      if (isBooked) {
        return { 
          available: false, 
          reason: 'already_booked',
          message: 'Selected dates overlap with an existing booking',
          bookedDate: dateStr
        };
      }
    }

    return { 
      available: true, 
      message: 'Dates are available for booking' 
    };
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
};

/**
 * Get all unavailable dates for a vehicle (disabled + booked)
 */
export const getUnavailableDates = async (vehicleId) => {
  try {
    const [disabledDates, confirmedBookings] = await Promise.all([
      getDisabledDates(vehicleId),
      getConfirmedBookings(vehicleId)
    ]);

    // Get all booked dates
    const bookedDates = [];
    confirmedBookings.forEach(booking => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        bookedDates.push(d.toISOString().split('T')[0]);
      }
    });

    return {
      disabledDates,
      bookedDates,
      allUnavailable: [...new Set([...disabledDates, ...bookedDates])]
    };
  } catch (error) {
    console.error('Error fetching unavailable dates:', error);
    throw error;
  }
};

/**
 * Get availability error message
 */
export const getAvailabilityErrorMessage = (availabilityResult) => {
  if (availabilityResult.available) {
    return '';
  }

  switch (availabilityResult.reason) {
    case 'past_date':
      return 'Cannot book dates in the past. Please select future dates.';
    case 'invalid_range':
      return 'Invalid date range. End date must be after start date.';
    case 'same_day':
      return 'Minimum booking duration is 1 day.';
    case 'host_disabled':
      return availabilityResult.message || 'Some dates in your selection have been blocked by the host.';
    case 'already_booked':
      return 'These dates are already booked. Please select different dates.';
    default:
      return availabilityResult.message || 'Selected dates are not available.';
  }
};