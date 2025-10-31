// src/utils/vehicleService.js
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getStorage,
} from "firebase/storage";
import { db, storage, auth } from "../firebase/firebase";

export const uploadVehicleImages = async (images, vehicleId) => {
  try {
    const FILE_MAX_SIZE = 2 * 1024 * 1024;
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    const files = Array.isArray(images) ? images : [images];

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!allowedTypes.includes(file.type)) {
        alert(`File type invalid: ${file.name}`);
        return;
      }
      if (file.size > FILE_MAX_SIZE) {
        alert(`File too large: ${file.name}`);
        return;
      }
      formData.append("images", file);
    }

    const token = await auth.currentUser.getIdToken();

    const res = await fetch(
      `http://localhost:3000/upload-vehicle-images/${vehicleId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Upload Failed");
    const storage = getStorage();
    const urls = await Promise.all(
      data.imageUrls.map(async (path) => {
        const url = await getDownloadURL(ref(storage, path));
        return url;
      })
    );
    return urls;
  } catch (error) {
    alert("Something wrong when uploading. Please try again");
  }
};

export const addVehicle = async (vehicleData, images, hostId) => {
  try {
    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User must be authenticated to add a vehicle");
    }
    // Generate a temporary ID for image upload
    const tempId = `temp_${Date.now()}`;

    const token = await auth.currentUser.getIdToken();

    // Upload images first
    const imageUrls = await uploadVehicleImages(images, tempId);

    // Get owner name from user profile or email
    const ownerName =
      currentUser.displayName ||
      currentUser.email?.split("@")[0] ||
      "Unknown Host";

    // Prepare vehicle document
    const payload = {
      ...vehicleData,
      hostId,
      owner: ownerName,
      imageUrls,
      status: "available",
      availability: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phone_number: currentUser.phone,
    };

    const res = await fetch(`http://localhost:3000/add-vehicle/${hostId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      const errorMsg =
        data.error || data.message || "Creating new vehicle failed";
      return alert(errorMsg);
    }
    return data.id;
  } catch (error) {
    console.error("Error adding vehicle:", error);
    throw error;
  }
};

/**
 * Update an existing vehicle
 * @param {string} vehicleId - Vehicle document ID
 * @param {Object} updates - Updated vehicle data
 * @param {Array} newImages - Optional new images to upload
 * @param {Array} existingImages - Optional existing image URLs to keep
 */
export const updateVehicle = async (
  vehicleId,
  updates,
  newImages = [],
  existingImages = []
) => {
  try {
    let imageUrls = [...existingImages];

    // Upload new images if provided
    if (newImages.length > 0) {
      const newImageUrls = await uploadVehicleImages(newImages, vehicleId);
      imageUrls = [...imageUrls, ...newImageUrls];
    }

    // Prepare update data
    const updateData = {
      ...updates,
      ...(imageUrls.length > 0 && { images: imageUrls }),
      updatedAt: new Date().toISOString(),
    };

    // Remove any undefined fields
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    // Update document
    const vehicleRef = doc(db, "vehicles", vehicleId);
    await updateDoc(vehicleRef, cleanUpdateData);

    return vehicleId;
  } catch (error) {
    console.error("Error updating vehicle:", error);
    throw error;
  }
};

export const deleteVehicle = async (vehicleId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User must be authenticated");

    const token = await currentUser.getIdToken();

    const res = await fetch(
      `http://localhost:3000/delete-vehicle/${vehicleId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete vehicle");
    console.log("✅ Vehicle deleted successfully");
    return data;
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    throw error;
  }
};

/**
 * Get all vehicles for a specific host
 * @param {string} hostId - Host user ID
 * @returns {Promise<Array>} Array of vehicle documents
 */
export const getHostVehicles = async (userId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User must be authenticated");
    const token = await currentUser.getIdToken();

    const res = await fetch(
      `http://localhost:3000/get-host-vehicles/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch data");
    return data;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
};

/**
 * Transform form data to Firebase vehicle structure
 * @param {Object} formData - Form data from AddCar or AddMotorcycle
 * @param {string} vehicleType - 'car' or 'motorcycle'
 * @returns {Object} Formatted vehicle data for Firebase
 */
export const formatVehicleData = (formData, vehicleType) => {
  const isCar = vehicleType === "car";

  // Add pickup point data to the vehicle
  const baseData = {
    type: vehicleType,
    title: `${formData.brand} ${formData.model} ${formData.year}`,
    description: formData.description,
    pricePerDay: parseFloat(formData.price || formData.pricePerDay),
    location: formData.location,
    features: formData.features || {},
    specifications: {
      brand: formData.brand,
      model: formData.model,
      year: parseInt(formData.year),
      type: formData.type,
      transmission: formData.transmission,
      plateNumber: formData.plateNumber.toUpperCase(),
      ...(isCar
        ? {
            fuelType: formData.fuelType,
            seats: parseInt(formData.seats),
          }
        : {
            engineSize: parseInt(formData.engineSize),
          }),
    },
  };

  // Add pickup point information if available
  if (formData.pickupPoint) {
    baseData.pickupPoint = formData.pickupPoint;
  }

  if (formData.pickupCoordinates) {
    baseData.pickupCoordinates = formData.pickupCoordinates;
  }

  if (formData.pickupInstructions) {
    baseData.pickupInstructions = formData.pickupInstructions;
  }

  return baseData;
};
