import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  Users,
  Fuel,
  Settings,
  Gauge,
  Calendar,
  Shield,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { db, auth } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [bookingDates, setBookingDates] = useState({
    startDate: '',
    endDate: ''
  });

  // Fetch vehicle details
  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'vehicles', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setVehicle({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error('Vehicle not found');
          navigate('/cars');
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Vehicle not found</p>
        </div>
      </div>
    );
  }

  const isCar = vehicle.type === 'car';
  const images = vehicle.images || [];
  const specs = vehicle.specifications || {};
  const features = vehicle.features || {};

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const calculateDays = () => {
    if (!bookingDates.startDate || !bookingDates.endDate) return 0;
    const start = new Date(bookingDates.startDate);
    const end = new Date(bookingDates.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalPrice = calculateDays() * vehicle.pricePerDay;

  const handleBooking = () => {
    if (!bookingDates.startDate || !bookingDates.endDate) {
      alert('Please select start and end dates');
      return;
    }

    const start = new Date(bookingDates.startDate);
    const end = new Date(bookingDates.endDate);
    
    if (end <= start) {
      alert('End date must be after start date');
      return;
    }

    // Check if user is logged in
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate('/login', { state: { from: `/vehicles/${id}` } });
      return;
    }

    // Navigate to booking confirmation page
    navigate(`/booking/confirm/${id}`, { 
      state: { 
        vehicle, 
        bookingDates, 
        totalPrice 
      } 
    });
  };

  const featureIcons = {
    ac: '❄️',
    bluetooth: '📱',
    usbCharging: '🔌',
    backupCamera: '📷',
    gpsNavigation: '🗺️',
    leatherSeats: '💺',
    sunroof: '🌞',
    cruiseControl: '🚗',
    parkingSensors: '📡',
    keylessEntry: '🔑',
    underSeatStorage: '🧳',
    digitalDashboard: '📊',
    absBrakes: '🛑',
    discBrakes: '⚙️',
    helmetIncluded: '🪖',
    rainGear: '🌧️',
    gpsTracker: '📍'
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to listings
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {vehicle.title || `${specs.brand} ${specs.model}`}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 fill-current mr-1" />
                  <span className="font-semibold">{vehicle.rating || 4.5}</span>
                  <span className="ml-1">({vehicle.totalTrips || 0} trips)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-1" />
                  {vehicle.location}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">₱{vehicle.pricePerDay}</div>
              <div className="text-gray-600">per day</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="relative h-96">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[selectedImage]}
                      alt={`${vehicle.title} - Image ${selectedImage + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setShowImageModal(true)}
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                        >
                          <ChevronLeft className="w-6 h-6 text-gray-900" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                        >
                          <ChevronRight className="w-6 h-6 text-gray-900" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No images available</p>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 object-cover rounded-lg cursor-pointer ${
                        selectedImage === idx ? 'ring-2 ring-blue-600' : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Specifications */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex items-start">
                  <Settings className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Transmission</p>
                    <p className="font-semibold text-gray-900 capitalize">{specs.transmission}</p>
                  </div>
                </div>
                {isCar ? (
                  <>
                    <div className="flex items-start">
                      <Fuel className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Fuel Type</p>
                        <p className="font-semibold text-gray-900 capitalize">{specs.fuelType}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Users className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Seating</p>
                        <p className="font-semibold text-gray-900">{specs.seats} seats</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start">
                    <Gauge className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Engine Size</p>
                      <p className="font-semibold text-gray-900">{specs.engineSize}cc</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Year</p>
                    <p className="font-semibold text-gray-900">{specs.year}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Plate Number</p>
                    <p className="font-semibold text-gray-900">{specs.plateNumber}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold text-gray-900 capitalize">{specs.type}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            {Object.keys(features).filter(key => features[key]).length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Features & Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(features).map(([key, value]) => {
                    if (!value) return null;
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <div key={key} className="flex items-center">
                        <span className="text-2xl mr-2">{featureIcons[key] || '✓'}</span>
                        <span className="text-gray-700">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{vehicle.description}</p>
            </div>

            {/* Host Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hosted by</h2>
              <div className="flex items-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-4">
                  {vehicle.owner?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900">{vehicle.owner}</p>
                  <p className="text-gray-600">Joined {new Date(vehicle.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Book this vehicle</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={bookingDates.startDate}
                  onChange={(e) => setBookingDates(prev => ({ ...prev, startDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={bookingDates.endDate}
                  onChange={(e) => setBookingDates(prev => ({ ...prev, endDate: e.target.value }))}
                  min={bookingDates.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">₱{vehicle.pricePerDay} × {calculateDays()} days</span>
                  <span className="font-semibold text-gray-900">₱{totalPrice}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₱{totalPrice}</span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={!bookingDates.startDate || !bookingDates.endDate}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Continue to Booking
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={handlePrevImage}
            className="absolute left-4 text-white hover:text-gray-300"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>
          <button
            onClick={handleNextImage}
            className="absolute right-4 text-white hover:text-gray-300"
          >
            <ChevronRight className="w-12 h-12" />
          </button>
          <img
            src={images[selectedImage]}
            alt={`${vehicle.title} - Full size`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default VehicleDetails;