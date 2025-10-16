// src/utils/bookingService.js
import { collection, addDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Create a new booking
 * @param {Object} bookingData - Booking information
 * @returns {Promise<string>} Booking ID
 */
export const createBooking = async (bookingData) => {
  try {
    const booking = {
      carId: bookingData.carId,
      guestId: bookingData.guestId,
      hostId: bookingData.hostId,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      totalPrice: bookingData.totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
      vehicleDetails: {
        title: bookingData.vehicleTitle,
        type: bookingData.vehicleType,
        image: bookingData.vehicleImage,
      },
      guestDetails: {
        name: bookingData.guestName,
        email: bookingData.guestEmail,
      }
    };

    const docRef = await addDoc(collection(db, 'bookings'), booking);
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Get all bookings for a guest
 * @param {string} guestId - Guest user ID
 * @returns {Promise<Array>} Array of bookings
 */
export const getGuestBookings = async (guestId) => {
  try {
    const q = query(collection(db, 'bookings'), where('guestId', '==', guestId));
    const snapshot = await getDocs(q);
    
    const bookings = [];
    snapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return bookings;
  } catch (error) {
    console.error('Error fetching guest bookings:', error);
    throw error;
  }
};

/**
 * Get all bookings for a host
 * @param {string} hostId - Host user ID
 * @returns {Promise<Array>} Array of bookings
 */
export const getHostBookings = async (hostId) => {
  try {
    const q = query(collection(db, 'bookings'), where('hostId', '==', hostId));
    const snapshot = await getDocs(q);
    
    const bookings = [];
    snapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return bookings;
  } catch (error) {
    console.error('Error fetching host bookings:', error);
    throw error;
  }
};

/**
 * Get a single booking by ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Booking data
 */
export const getBookingById = async (bookingId) => {
  try {
    const docRef = doc(db, 'bookings', bookingId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Booking not found');
    }
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

/**
 * Check if dates are available for a vehicle
 * @param {string} vehicleId - Vehicle ID
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Promise<boolean>} True if available
 */
export const checkAvailability = async (vehicleId, startDate, endDate) => {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('carId', '==', vehicleId),
      where('status', 'in', ['pending', 'confirmed'])
    );
    
    const snapshot = await getDocs(q);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (const doc of snapshot.docs) {
      const booking = doc.data();
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      
      // Check for date overlap
      if (
        (start >= bookingStart && start <= bookingEnd) ||
        (end >= bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      ) {
        return false; // Dates overlap, not available
      }
    }
    
    return true; // No overlaps, available
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
};
