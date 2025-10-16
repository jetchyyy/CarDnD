// src/pages/AddCar.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle, Loader2 } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import { auth } from '../firebase/firebase';
import { addVehicle, formatVehicleData } from '../utils/vehicleService';

const AddCar = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: '',
    type: 'sedan',
    transmission: 'automatic',
    fuelType: 'gasoline',
    seats: '5',
    plateNumber: '',
    price: '',
    location: '',
    description: '',
    features: {}
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const featuresList = [
    { key: 'ac', label: 'Air Conditioning' },
    { key: 'bluetooth', label: 'Bluetooth' },
    { key: 'usbCharging', label: 'USB Charging' },
    { key: 'backupCamera', label: 'Backup Camera' },
    { key: 'gpsNavigation', label: 'GPS Navigation' },
    { key: 'leatherSeats', label: 'Leather Seats' },
    { key: 'sunroof', label: 'Sunroof' },
    { key: 'cruiseControl', label: 'Cruise Control' },
    { key: 'parkingSensors', label: 'Parking Sensors' },
    { key: 'keylessEntry', label: 'Keyless Entry' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFeatureToggle = (featureKey) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: !prev.features[featureKey]
      }
    }));
  };

  const handleImagesChange = (newImages) => {
    setImages(newImages);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.brand) newErrors.brand = 'Brand is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.plateNumber) newErrors.plateNumber = 'Plate number is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (images.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check if user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setErrors({ submit: 'You must be logged in to add a vehicle' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the vehicle data
      const vehicleData = formatVehicleData(formData, 'car');
      
      // Add vehicle to Firebase
      const vehicleId = await addVehicle(vehicleData, images, currentUser.uid);
      
      console.log('Vehicle added successfully with ID:', vehicleId);
      
      // Show success message
      alert('Car listed successfully!');
      
      // Navigate to host dashboard
      navigate('/host/dashboard');
    } catch (error) {
      console.error('Error submitting vehicle:', error);
      setErrors({ submit: error.message || 'Failed to add vehicle. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Car</h1>
          <p className="text-gray-600">Share your car and start earning money today</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g., Tesla"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 border ${errors.brand ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100`}
                  />
                  {errors.brand && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.brand}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="e.g., Model 3"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 border ${errors.model ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100`}
                  />
                  {errors.model && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.model}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="2024"
                    min="1990"
                    max="2025"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 border ${errors.year ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100`}
                  />
                  {errors.year && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.year}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plate Number *
                  </label>
                  <input
                    type="text"
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={handleInputChange}
                    placeholder="ABC 1234"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 border ${errors.plateNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 uppercase disabled:bg-gray-100`}
                  />
                  {errors.plateNumber && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.plateNumber}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Cebu City"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100`}
                  />
                  {errors.location && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.location}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Specifications */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="pickup">Pickup</option>
                    <option value="van">Van</option>
                    <option value="coupe">Coupe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmission
                  </label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                  >
                    <option value="gasoline">Gasoline</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seating Capacity
                  </label>
                  <select
                    name="seats"
                    value={formData.seats}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                  >
                    <option value="2">2 seats</option>
                    <option value="4">4 seats</option>
                    <option value="5">5 seats</option>
                    <option value="7">7 seats</option>
                    <option value="8">8+ seats</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {featuresList.map(feature => (
                  <label key={feature.key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features[feature.key] || false}
                      onChange={() => handleFeatureToggle(feature.key)}
                      disabled={isSubmitting}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <span className="text-gray-700">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description and Pricing */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Description & Pricing</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Describe your car, its condition, and any special features..."
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100`}
                  />
                  {errors.description && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Rate (₱) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="1500"
                    min="0"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100`}
                  />
                  {errors.price && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.price}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Photos *</h2>
              <ImageUploader onImagesChange={handleImagesChange} maxImages={5} disabled={isSubmitting} />
              {errors.images && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.images}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Listing Car...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>List My Car</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/host/dashboard')}
                disabled={isSubmitting}
                className="px-8 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCar;
