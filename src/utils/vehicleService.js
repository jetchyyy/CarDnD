// src/utils/vehicleService.js
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../firebase/firebase';

/**
 * Upload images to Firebase Storage
 * @param {Array} images - Array of image objects with file property
 * @param {string} vehicleId - Unique vehicle identifier
 * @returns {Promise<Array>} Array of image URLs
 */
export const uploadVehicleImages = async (images, vehicleId) => {
  const imageUrls = [];
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const timestamp = Date.now();
    const fileName = `${vehicleId}_${timestamp}_${i}.${image.file.name.split('.').pop()}`;
    const storageRef = ref(storage, `vehicles/${vehicleId}/${fileName}`);
    
    try {
      await uploadBytes(storageRef, image.file);
      const url = await getDownloadURL(storageRef);
      imageUrls.push(url);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image ${i + 1}`);
    }
  }
  
  return imageUrls;
};

/**
 * Delete images from Firebase Storage
 * @param {Array} imageUrls - Array of image URLs to delete
 */
export const deleteVehicleImages = async (imageUrls) => {
  for (const url of imageUrls) {
    try {
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
};

/**
 * Add a new vehicle to Firestore
 * @param {Object} vehicleData - Vehicle data object
 * @param {Array} images - Array of image files
 * @param {string} hostId - Host user ID
 * @returns {Promise<string>} Document ID of created vehicle
 */
export const addVehicle = async (vehicleData, images, hostId) => {
  try {
    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to add a vehicle');
    }

    // Generate a temporary ID for image upload
    const tempId = `temp_${Date.now()}`;
    
    // Upload images first
    const imageUrls = await uploadVehicleImages(images, tempId);
    
    // Get owner name from user profile or email
    const ownerName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Unknown Host';
    
    // Prepare vehicle document
    const vehicleDoc = {
      ...vehicleData,
      hostId,
      owner: ownerName,
      images: imageUrls,
      status: 'available',
      availability: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add document to Firestore
    const docRef = await addDoc(collection(db, 'vehicles'), vehicleDoc);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding vehicle:', error);
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
export const updateVehicle = async (vehicleId, updates, newImages = [], existingImages = []) => {
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
      updatedAt: new Date().toISOString()
    };
    
    // Update document
    const vehicleRef = doc(db, 'vehicles', vehicleId);
    await updateDoc(vehicleRef, updateData);
    
    return vehicleId;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

/**
 * Delete a vehicle and its images
 * @param {string} vehicleId - Vehicle document ID
 * @param {Array} imageUrls - Array of image URLs to delete
 */
export const deleteVehicle = async (vehicleId, imageUrls) => {
  try {
    // Delete images from storage
    await deleteVehicleImages(imageUrls);
    
    // Delete document from Firestore
    const vehicleRef = doc(db, 'vehicles', vehicleId);
    await deleteDoc(vehicleRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
};

/**
 * Get all vehicles for a specific host
 * @param {string} hostId - Host user ID
 * @returns {Promise<Array>} Array of vehicle documents
 */
export const getHostVehicles = async (hostId) => {
  try {
    const q = query(collection(db, 'vehicles'), where('hostId', '==', hostId));
    const querySnapshot = await getDocs(q);
    
    const vehicles = [];
    querySnapshot.forEach((doc) => {
      vehicles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return vehicles;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
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
  const isCar = vehicleType === 'car';
  
  return {
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
      ...(isCar ? {
        fuelType: formData.fuelType,
        seats: parseInt(formData.seats)
      } : {
        engineSize: parseInt(formData.engineSize)
      })
    }
  };
};