import { db } from "../firebase/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

// Add or update payout method
export const addPayoutMethod = async (userId, payoutData) => {
  try {
    const payoutMethodsRef = collection(db, "payoutMethods");

    // If this is the first payout method or marked as primary, update others to non-primary
    if (payoutData.isPrimary) {
      const batch = writeBatch(db);

      // Get all existing payout methods for this user
      const q = query(payoutMethodsRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);

      // Update all to isPrimary: false
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { isPrimary: false });
      });

      // Add new payout method
      const newPayoutRef = doc(collection(db, "payoutMethods"));
      batch.set(newPayoutRef, {
        userId,
        type: "gcash",
        accountName: payoutData.accountName,
        mobileNumber: payoutData.mobileNumber,
        isPrimary: true,
        verified: false,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await batch.commit();
      return newPayoutRef.id;
    } else {
      // Just add the new payout method
      const newPayoutRef = doc(collection(db, "payoutMethods"));
      await setDoc(newPayoutRef, {
        userId,
        type: "gcash",
        accountName: payoutData.accountName,
        mobileNumber: payoutData.mobileNumber,
        isPrimary: false,
        verified: false,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return newPayoutRef.id;
    }
  } catch (error) {
    console.error("Error adding payout method:", error);
    throw error;
  }
};

// Get all payout methods for a user
export const getUserPayoutMethods = async (userId) => {
  try {
    const q = query(
      collection(db, "payoutMethods"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching payout methods:", error);
    throw error;
  }
};

// Get primary payout method for a user
export const getPrimaryPayoutMethod = async (userId) => {
  try {
    const q = query(
      collection(db, "payoutMethods"),
      where("userId", "==", userId),
      where("isPrimary", "==", true)
    );
    const snapshot = await getDocs(q);

    if (snapshot.docs.length > 0) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching primary payout method:", error);
    throw error;
  }
};

// Update payout method
export const updatePayoutMethod = async (methodId, updates) => {
  try {
    const methodRef = doc(db, "payoutMethods", methodId);
    await updateDoc(methodRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating payout method:", error);
    throw error;
  }
};

// Set as primary payout method
export const setPrimaryPayoutMethod = async (userId, methodId) => {
  try {
    const batch = writeBatch(db);

    // Get all payout methods for this user
    const q = query(
      collection(db, "payoutMethods"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);

    // Update all to isPrimary: false
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isPrimary: false });
    });

    // Set the selected one as primary
    const methodRef = doc(db, "payoutMethods", methodId);
    batch.update(methodRef, {
      isPrimary: true,
      updatedAt: new Date().toISOString(),
    });

    await batch.commit();
  } catch (error) {
    console.error("Error setting primary payout method:", error);
    throw error;
  }
};

// Delete payout method
export const deletePayoutMethod = async (methodId) => {
  try {
    await deleteDoc(doc(db, "payoutMethods", methodId));
  } catch (error) {
    console.error("Error deleting payout method:", error);
    throw error;
  }
};

// Verify payout method (admin only)
export const verifyPayoutMethod = async (methodId) => {
  try {
    const methodRef = doc(db, "payoutMethods", methodId);
    await updateDoc(methodRef, {
      verified: true,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error verifying payout method:", error);
    throw error;
  }
};
