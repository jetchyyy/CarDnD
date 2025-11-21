// src/utils/bookingService.js
import {
  collection,
  addDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

/**
 * Upload payment proof images to Firebase Storage
 */

/**
 * Create a new booking and track service fee
 * @param {Object} bookingData - Booking information
 * @returns {Promise<string>} Booking ID
 */

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const uploadPayment = async (images, paymentId) => {
  try {
    const MAX_SIZE = 5 * 1024 * 1024;
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    const files = Array.isArray(images) ? images : [images];

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!allowedTypes.includes(file.type)) {
        alert(`File type not allowed: ${file.name}`);
        return;
      }
      if (file.size > MAX_SIZE) {
        alert(`File too large: ${file.name}`);
        return;
      }
      formData.append("images", file);
    }

    const token = await auth.currentUser.getIdToken();

    const res = await fetch(
      `http://localhost:3000/upload-payment/${paymentId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await res.json();

    if (res.ok) {
      // ✅ fixed
      return data.imageUrls;
    } else {
      alert(data.error);
    }
  } catch (error) {
    alert("Something went wrong while uploading. Please try again.");
  }
};
export const createBooking = async (bookingData) => {
  try {
    // Calculate service fee (5% of total price)
    const serviceFeePercentage = 0.05;
    const serviceFeeAmount = bookingData.totalPrice * serviceFeePercentage;
    const hostEarnings = bookingData.totalPrice - serviceFeeAmount; // What host receives

    const booking = {
      carId: bookingData.carId,
      guestId: bookingData.guestId,
      hostId: bookingData.hostId,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      totalPrice: bookingData.totalPrice, // Total paid by guest
      hostEarnings: hostEarnings, // Amount owed to host (after service fee)
      status: "confirmed",
      createdAt: new Date().toISOString(),
      paidOutAt: null, // Initialize as null - will be set when admin processes payout
      vehicleDetails: {
        title: bookingData.vehicleTitle,
        type: bookingData.vehicleType,
        imageUrls: bookingData.vehicleImage,
      },
      guestDetails: {
        name: bookingData.guestName,
        email: bookingData.guestEmail,
      },
      paymentReceipt: bookingData.paymentReceipt,
      serviceFee: {
        amount: serviceFeeAmount,
        percentage: serviceFeePercentage * 100,
      },
    };

    // Create service fee tracking record
    const serviceFeeRecord = {
      bookingId: null,
      guestId: bookingData.guestId,
      hostId: bookingData.hostId,
      carId: bookingData.carId,
      amount: serviceFeeAmount,
      percentage: serviceFeePercentage * 100,
      baseAmount: bookingData.totalPrice,
      hostEarnings: hostEarnings, // Track what host should receive
      status: "collected",
      collectedAt: new Date().toISOString(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      vehicleTitle: bookingData.vehicleTitle,
    };

    const token = await auth.currentUser.getIdToken();

    const res = await fetch(`${BASE_URL}/create-bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ booking, serviceFeeRecord }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to create booking");
    }
    return data.bookingId;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

/**
 * Get all bookings for a guest
 * @param {string} guestId - Guest user ID
 * @returns {Promise<Array>} Array of bookings
 */
export const getGuestBookings = async () => {
  try {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${BASE_URL}/get-guest-bookings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch geust booking");
    }
    return data;
  } catch (error) {
    console.error("Error fetching guest bookings:", error);
    throw error;
  }
};

/**
 * Get all bookings for a host
 * @param {string} hostId - Host user ID
 * @returns {Promise<Array>} Array of bookings
 */
export const getHostBookings = async () => {
  try {
    const token = await auth.currentUser.getIdToken();

    const res = await fetch(`${BASE_URL}/get-host-bookings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch host bookings");
    }

    return data;
  } catch (error) {
    console.error("Error fetching host bookings:", error);
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
    const docRef = doc(db, "bookings", bookingId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      throw new Error("Booking not found");
    }
  } catch (error) {
    console.error("Error fetching booking:", error);
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
      collection(db, "bookings"),
      where("carId", "==", vehicleId),
      where("status", "in", ["pending", "confirmed"])
    );

    const snapshot = await getDocs(q);
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (const docSnap of snapshot.docs) {
      const booking = docSnap.data();
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);

      // Check for date overlap
      if (
        (start >= bookingStart && start <= bookingEnd) ||
        (end >= bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      ) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error checking availability:", error);
    throw error;
  }
};

/**
 * Get unpaid earnings for a specific host
 * @param {string} hostId - Host user ID
 * @returns {Promise<Object>} Object with totalEarnings and bookingIds
 */
export const getHostUnpaidEarnings = async (hostId) => {
  try {
    const q = query(
      collection(db, "bookings"),
      where("hostId", "==", hostId),
      where("status", "==", "confirmed")
    );

    const snapshot = await getDocs(q);
    let totalEarnings = 0;
    const unpaidBookings = [];

    snapshot.forEach((doc) => {
      const booking = doc.data();
      // Only count if not yet paid out
      if (!booking.paidOutAt) {
        totalEarnings += booking.hostEarnings || 0;
        unpaidBookings.push({
          id: doc.id,
          ...booking,
        });
      }
    });

    return {
      totalEarnings,
      unpaidBookings,
      count: unpaidBookings.length,
    };
  } catch (error) {
    console.error("Error fetching host unpaid earnings:", error);
    throw error;
  }
};

/**
 * Get total service fees collected (for dashboard analytics)
 * @param {Date} startDate - Filter from date
 * @param {Date} endDate - Filter to date
 * @returns {Promise<number>} Total service fees
 */
export const getTotalServiceFees = async (startDate, endDate) => {
  try {
    const q = query(
      collection(db, "serviceFees"),
      where("collectedAt", ">=", startDate.toISOString()),
      where("collectedAt", "<=", endDate.toISOString()),
      where("status", "==", "collected")
    );

    const snapshot = await getDocs(q);
    let total = 0;

    snapshot.forEach((docSnap) => {
      total += docSnap.data().amount;
    });

    return total;
  } catch (error) {
    console.error("Error fetching total service fees:", error);
    throw error;
  }
};

/**
 * Get service fees for a specific month/year
 * @param {number} year - Year (e.g., 2025)
 * @param {number} month - Month (1-12)
 * @returns {Promise<Array>} Array of service fee records
 */
export const getMonthlyServiceFees = async (year, month) => {
  try {
    const q = query(
      collection(db, "serviceFees"),
      where("year", "==", year),
      where("month", "==", month)
    );

    const snapshot = await getDocs(q);
    const fees = [];

    snapshot.forEach((docSnap) => {
      fees.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    return fees;
  } catch (error) {
    console.error("Error fetching monthly service fees:", error);
    throw error;
  }
};

/**
 * Get monthly service fee total (aggregated)
 * @param {number} year - Year
 * @param {number} month - Month
 * @returns {Promise<number>} Total service fees for the month
 */
export const getMonthlyServiceFeeTotal = async (year, month) => {
  try {
    const fees = await getMonthlyServiceFees(year, month);
    return fees.reduce((sum, fee) => sum + fee.amount, 0);
  } catch (error) {
    console.error("Error calculating monthly service fee total:", error);
    throw error;
  }
};

/**
 * Get all service fees (admin dashboard)
 * @returns {Promise<Array>} All service fee records
 */
export const getAllServiceFees = async () => {
  try {
    const snapshot = await getDocs(collection(db, "serviceFees"));
    const fees = [];

    snapshot.forEach((docSnap) => {
      fees.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    return fees;
  } catch (error) {
    console.error("Error fetching all service fees:", error);
    throw error;
  }
};

/**
 * Get service fee summary by host
 * @param {string} hostId - Host user ID
 * @returns {Promise<number>} Total service fees from this host's bookings
 */
export const getServiceFeesByHost = async (hostId) => {
  try {
    const q = query(
      collection(db, "serviceFees"),
      where("hostId", "==", hostId)
    );

    const snapshot = await getDocs(q);
    let total = 0;

    snapshot.forEach((docSnap) => {
      total += docSnap.data().amount;
    });

    return total;
  } catch (error) {
    console.error("Error fetching service fees by host:", error);
    throw error;
  }
};
