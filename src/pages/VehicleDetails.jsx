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
      <div className="min-h-screen bg-[#171717] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007BFF] mx-auto mb-4"></div>
          <p className="text-[#E0E0E0]">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#171717] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#E0E0E0] text-lg">Vehicle not found</p>
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
    <div className="min-h-screen bg-[#171717] pb-12">
      {/* Header */}
      <div className="bg-[#FFFFFF] border-b border-[#8C8C8C]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[#8C8C8C] hover:text-[#007BFF] mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to listings
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-[#171717] mb-2">
                {vehicle.title || `${specs.brand} ${specs.model}`}
              </h1>
              <div className="flex items-center gap-4 text-[#8C8C8C]">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-[#007BFF] fill-current mr-1" />
                  <span className="font-semibold text-[#171717]">{vehicle.rating || 4.5}</span>
                  <span className="ml-1">({vehicle.totalTrips || 0} trips)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-1 text-[#007BFF]" />
                  {vehicle.location}
                </div>
              </div>
            </div>
            <div className="text-right bg-[#171717] px-6 py-3 rounded-lg border-2 border-[#007BFF]">
              <div className="text-3xl font-bold text-[#007BFF]">₱{vehicle.pricePerDay}</div>
              <div className="text-[#E0E0E0]">per day</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-[#FFFFFF] rounded-xl shadow-xl overflow-hidden mb-8 border border-[#8C8C8C]/30">
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
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#FFFFFF]/95 hover:bg-[#007BFF] p-2 rounded-full shadow-lg transition-all hover:scale-110"
                        >
                          <ChevronLeft className="w-6 h-6 text-[#171717]" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#FFFFFF]/95 hover:bg-[#007BFF] p-2 rounded-full shadow-lg transition-all hover:scale-110"
                        >
                          <ChevronRight className="w-6 h-6 text-[#171717]" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-[#8C8C8C]/20 flex items-center justify-center">
                    <p className="text-[#8C8C8C]">No images available</p>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto bg-[#FFFFFF]">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 object-cover rounded-lg cursor-pointer transition-all ${
                        selectedImage === idx ? 'ring-2 ring-[#007BFF] scale-105' : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Specifications */}
            <div className="bg-[#FFFFFF] rounded-xl shadow-xl p-6 mb-8 border border-[#8C8C8C]/30">
              <h2 className="text-2xl font-bold text-[#171717] mb-6">Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex items-start">
                  <Settings className="w-5 h-5 text-[#007BFF] mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-[#8C8C8C]">Transmission</p>
                    <p className="font-semibold text-[#171717] capitalize">{specs.transmission}</p>
                  </div>
                </div>
                {isCar ? (
                  <>
                    <div className="flex items-start">
                      <Fuel className="w-5 h-5 text-[#007BFF] mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-[#8C8C8C]">Fuel Type</p>
                        <p className="font-semibold text-[#171717] capitalize">{specs.fuelType}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Users className="w-5 h-5 text-[#007BFF] mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-[#8C8C8C]">Seating</p>
                        <p className="font-semibold text-[#171717]">{specs.seats} seats</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start">
                    <Gauge className="w-5 h-5 text-[#007BFF] mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-[#8C8C8C]">Engine Size</p>
                      <p className="font-semibold text-[#171717]">{specs.engineSize}cc</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-[#007BFF] mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-[#8C8C8C]">Year</p>
                    <p className="font-semibold text-[#171717]">{specs.year}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-[#007BFF] mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-[#8C8C8C]">Plate Number</p>
                    <p className="font-semibold text-[#171717]">{specs.plateNumber}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-[#007BFF] mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-[#8C8C8C]">Type</p>
                    <p className="font-semibold text-[#171717] capitalize">{specs.type}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            {Object.keys(features).filter(key => features[key]).length > 0 && (
              <div className="bg-[#FFFFFF] rounded-xl shadow-xl p-6 mb-8 border border-[#8C8C8C]/30">
                <h2 className="text-2xl font-bold text-[#171717] mb-6">Features & Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(features).map(([key, value]) => {
                    if (!value) return null;
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <div key={key} className="flex items-center bg-[#171717]/5 p-3 rounded-lg hover:bg-[#007BFF]/10 transition-colors">
                        <span className="text-2xl mr-2">{featureIcons[key] || '✓'}</span>
                        <span className="text-[#171717] font-medium">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-[#FFFFFF] rounded-xl shadow-xl p-6 mb-8 border border-[#8C8C8C]/30">
              <h2 className="text-2xl font-bold text-[#171717] mb-4">Description</h2>
              <p className="text-[#171717] leading-relaxed">{vehicle.description}</p>
            </div>

            {/* Host Info */}
            <div className="bg-[#FFFFFF] rounded-xl shadow-xl p-6 border border-[#8C8C8C]/30">
              <h2 className="text-2xl font-bold text-[#171717] mb-4">Hosted by</h2>
              <div className="flex items-center">
                <div className="w-16 h-16 bg-[#007BFF] rounded-full flex items-center justify-center text-[#171717] font-bold text-2xl mr-4 shadow-lg">
                  {vehicle.owner?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-lg text-[#171717]">{vehicle.owner}</p>
                  <p className="text-[#8C8C8C]">Joined {new Date(vehicle.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-[#FFFFFF] rounded-xl shadow-2xl p-6 sticky top-24 border-2 border-[#007BFF]">
              <h3 className="text-xl font-bold text-[#171717] mb-4">Book this vehicle</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#171717] mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={bookingDates.startDate}
                  onChange={(e) => setBookingDates(prev => ({ ...prev, startDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-[#8C8C8C] rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-transparent bg-[#FFFFFF] text-[#171717]"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#171717] mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={bookingDates.endDate}
                  onChange={(e) => setBookingDates(prev => ({ ...prev, endDate: e.target.value }))}
                  min={bookingDates.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-[#8C8C8C] rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-transparent bg-[#FFFFFF] text-[#171717]"
                />
              </div>

              <div className="border-t border-[#8C8C8C]/30 pt-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-[#8C8C8C]">₱{vehicle.pricePerDay} × {calculateDays()} days</span>
                  <span className="font-semibold text-[#171717]">₱{totalPrice}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-[#171717]">
                  <span>Total</span>
                  <span className="text-[#007BFF]">₱{totalPrice}</span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={!bookingDates.startDate || !bookingDates.endDate}
                className="w-full bg-[#007BFF] hover:bg-[#0056b3] disabled:bg-[#8C8C8C] text-[#171717] font-semibold py-3 rounded-lg transition-all hover:scale-[1.02] shadow-lg"
              >
                Continue to Booking
              </button>

              <p className="text-xs text-[#8C8C8C] text-center mt-4">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-[#FFFFFF] hover:text-[#007BFF] transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={handlePrevImage}
            className="absolute left-4 text-[#FFFFFF] hover:text-[#007BFF] transition-colors"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>
          <button
            onClick={handleNextImage}
            className="absolute right-4 text-[#FFFFFF] hover:text-[#007BFF] transition-colors"
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
