// Complete AddCar.jsx with live search as user types
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle, Loader2, MapPin, Search } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import { auth } from '../firebase/firebase';
import { addVehicle, formatVehicleData } from '../utils/vehicleService';
import SuccessModal from '../components/reusables/SuccessModal';

const AddCar = ({ onSuccess }) => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  
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
    pickupPoint: '',
    pickupInstructions: '',
    pickupCoordinates: null,
    description: '',
    features: {}
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

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

  // Load Leaflet CSS and JS
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const map = window.L.map(mapRef.current).setView([10.3157, 123.8854], 13);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    map.on('click', (e) => {
      updateMarkerPosition(e.latlng.lat, e.latlng.lng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

  }, [mapLoaded]);

  const updateMarkerPosition = (lat, lng) => {
    if (!mapInstanceRef.current) return;

    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    const marker = window.L.marker([lat, lng], {
      draggable: true
    }).addTo(mapInstanceRef.current);

    markerRef.current = marker;

    setFormData(prev => ({
      ...prev,
      pickupCoordinates: { lat, lng }
    }));

    marker.on('dragend', (e) => {
      const position = e.target.getLatLng();
      setFormData(prev => ({
        ...prev,
        pickupCoordinates: { lat: position.lat, lng: position.lng }
      }));
      reverseGeocode(position.lat, position.lng);
    });
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        setFormData(prev => ({
          ...prev,
          pickupPoint: data.display_name
        }));
        setSearchQuery(data.display_name);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Live search as user types
  const handleSearchQueryChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Clear errors
    if (errors.pickupPoint) {
      setErrors(prev => ({ ...prev, pickupPoint: '' }));
    }

    // If query is empty, hide dropdown
    if (!value.trim()) {
      setShowDropdown(false);
      setSearchResults([]);
      return;
    }

    // Set new timeout for search (500ms delay)
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 500);
  };

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setSearchResults(data);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (result) => {
    const { lat, lon, display_name } = result;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 17);
    }

    updateMarkerPosition(latitude, longitude);

    setFormData(prev => ({
      ...prev,
      pickupPoint: display_name,
      pickupCoordinates: { lat: latitude, lng: longitude }
    }));

    setSearchQuery(display_name);
    setShowDropdown(false);
    setSearchResults([]);
    
    if (errors.pickupPoint) {
      setErrors(prev => ({ ...prev, pickupPoint: '' }));
    }
  };

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
  console.log('Images received:', newImages);
    
  const files = newImages
    .map((img) => img.file)  
    .filter(Boolean);     
  setImages(files);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.brand) newErrors.brand = 'Brand is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.plateNumber) newErrors.plateNumber = 'Plate number is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.pickupPoint) newErrors.pickupPoint = 'Pickup point is required';
    if (!formData.pickupCoordinates) newErrors.pickupPoint = 'Please select a location on the map';
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

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setErrors({ submit: 'You must be logged in to add a vehicle' });
      return;
    }

    setIsSubmitting(true);

    try {
      const vehicleData = formatVehicleData(formData, 'car');
      const vehicleId = await addVehicle(vehicleData, images, currentUser.uid);
      
      console.log('Vehicle added successfully with ID:', vehicleId);
      
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        
        if (onSuccess) {
          onSuccess();
        }
        
        navigate('/host/dashboard');
      }, 2000);
      
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Car</h1>
          <p className="text-gray-600">Share your car and start earning money today</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
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

            {/* Pickup Point Section with OpenStreetMap */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Pickup Point
              </h2>
              <div className="space-y-6">
                {/* Search Box with Live Results */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Location
                  </label>
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={handleSearchQueryChange}
                          onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                          placeholder="Start typing to search for a location..."
                          disabled={isSubmitting}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                        />
                        {isSearching && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Dropdown Results */}
                    {showDropdown && searchResults.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {searchResults.map((result, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectLocation(result)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none"
                          >
                            <div className="flex items-start">
                              <MapPin className="w-4 h-4 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {result.display_name.split(',').slice(0, 2).join(',')}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {result.display_name}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Type to search or click on the map to set the pickup point
                  </p>
                </div>

                {/* Pickup Address Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Address *
                  </label>
                  <input
                    type="text"
                    name="pickupPoint"
                    value={formData.pickupPoint}
                    onChange={handleInputChange}
                    placeholder="Address will appear here after selecting location"
                    disabled={isSubmitting}
                    className={`w-full px-4 py-2.5 border ${errors.pickupPoint ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100`}
                  />
                  {errors.pickupPoint && (
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.pickupPoint}
                    </div>
                  )}
                </div>

                {/* Map */}
                <div className="relative z-0">
                  <div 
                    ref={mapRef}
                    className="w-full h-96 rounded-lg border-2 border-gray-300 overflow-hidden relative z-0"
                  >
                    {!mapLoaded && (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <span className="ml-2 text-gray-600">Loading map...</span>
                      </div>
                    )}
                  </div>
                  {formData.pickupCoordinates && (
                    <div className="mt-2 text-sm text-gray-600">
                      Coordinates: {formData.pickupCoordinates.lat.toFixed(6)}, {formData.pickupCoordinates.lng.toFixed(6)}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Instructions (Optional)
                  </label>
                  <textarea
                    name="pickupInstructions"
                    value={formData.pickupInstructions}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="e.g., Park at Level 3, Section B. Call me when you arrive and I'll meet you there. Landmark: Near the food court entrance."
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Add helpful details like landmarks, parking instructions, or how to contact you upon arrival
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle Specifications */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Body Type</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seating Capacity</label>
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
                    Description and Requirements *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Describe your car, its condition, and any special features. Also, include your requirements that renters must bring to rent your car (e.g., valid driver's license, two valid IDs, and a security deposit)."
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Rate (₱) *</label>
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
                onClick={() => {
                  if (onSuccess) {
                    onSuccess();
                  } else {
                    navigate('/host/dashboard');
                  }
                }}
                disabled={isSubmitting}
                className="px-8 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}  
        title="Car Listed Successfully!"  
        message="Your car has been listed successfully. You can now manage your listing from your host dashboard."  
      />
    </div>
  );
};

export default AddCar;