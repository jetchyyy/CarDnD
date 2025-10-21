import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Calendar } from 'lucide-react';
import CarCard from '../components/CarCard';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const CarList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    vehicleType: searchParams.get('type') || 'all',
    priceRange: [0, 10000],
    transmission: 'all',
    seats: 'all',
    sortBy: 'recommended',
    location: searchParams.get('location') || '',
    pickupDate: searchParams.get('pickup') || '',
    returnDate: searchParams.get('return') || ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch vehicles and bookings from Firestore
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch vehicles
        const vehiclesQuery = query(collection(db, 'vehicles'), orderBy('createdAt', 'desc'));
        const vehiclesSnapshot = await getDocs(vehiclesQuery);
        const fetchedVehicles = vehiclesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVehicles(fetchedVehicles);

        // Fetch bookings for availability checking
        const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
        const fetchedBookings = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(fetchedBookings);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Update URL params for location and dates
    const newParams = new URLSearchParams(searchParams);
    if (key === 'location') {
      if (value) {
        newParams.set('location', value);
      } else {
        newParams.delete('location');
      }
    } else if (key === 'pickupDate') {
      if (value) {
        newParams.set('pickup', value);
      } else {
        newParams.delete('pickup');
      }
    } else if (key === 'returnDate') {
      if (value) {
        newParams.set('return', value);
      } else {
        newParams.delete('return');
      }
    } else if (key === 'vehicleType') {
      if (value !== 'all') {
        newParams.set('type', value);
      } else {
        newParams.delete('type');
      }
    }
    setSearchParams(newParams);
  };

  // Check if a vehicle is available for the selected dates
  const isVehicleAvailable = (vehicleId, pickupDate, returnDate) => {
    if (!pickupDate || !returnDate) return true; // No dates selected, show all

    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);

    // Find all confirmed bookings for this vehicle
    const vehicleBookings = bookings.filter(
      booking => booking.carId === vehicleId && booking.status === 'confirmed'
    );

    // Check if any booking conflicts with the requested dates
    for (const booking of vehicleBookings) {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);

      // Check for overlap:
      // Booking overlaps if it starts before return date AND ends after pickup date
      const hasOverlap = bookingStart <= returnD && bookingEnd >= pickup;
      
      if (hasOverlap) {
        return false; // Vehicle is not available
      }
    }

    return true; // Vehicle is available
  };

  // Filter and sort vehicles
  const getFilteredVehicles = () => {
    let filtered = [...vehicles];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(v => 
        v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.specifications?.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.specifications?.model?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Location filter (case-insensitive partial match)
    if (filters.location) {
      filtered = filtered.filter(v => 
        v.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Date availability filter
    if (filters.pickupDate && filters.returnDate) {
      filtered = filtered.filter(v => 
        isVehicleAvailable(v.id, filters.pickupDate, filters.returnDate)
      );
    }

    // Vehicle type filter
    if (filters.vehicleType !== 'all') {
      filtered = filtered.filter(v => v.type === filters.vehicleType);
    }

    // Price filter
    filtered = filtered.filter(v => 
      v.pricePerDay >= filters.priceRange[0] && 
      v.pricePerDay <= filters.priceRange[1]
    );

    // Transmission filter
    if (filters.transmission !== 'all') {
      filtered = filtered.filter(v => 
        v.specifications?.transmission?.toLowerCase() === filters.transmission.toLowerCase()
      );
    }

    // Seats filter
    if (filters.seats !== 'all') {
      const seatCount = parseInt(filters.seats);
      filtered = filtered.filter(v => {
        // Only apply seat filter to cars, exclude motorcycles when seat filter is active
        if (v.type === 'car') {
          return v.specifications?.seats >= seatCount;
        }
        return false; // Exclude motorcycles when seat filter is applied
      });
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // Keep original order (most recent first)
        break;
    }

    return filtered;
  };

  const filteredVehicles = getFilteredVehicles();

  const resetFilters = () => {
    setFilters({
      vehicleType: 'all',
      priceRange: [0, 10000],
      transmission: 'all',
      seats: 'all',
      sortBy: 'recommended',
      location: '',
      pickupDate: '',
      returnDate: ''
    });
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Available Vehicles</h1>
              <p className="text-gray-600">Find your perfect ride</p>
            </div>
            
            <div className="flex gap-3">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by vehicle name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.location || filters.pickupDate || filters.returnDate) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.location && (
                <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{filters.location}</span>
                  <button
                    onClick={() => handleFilterChange('location', '')}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </div>
              )}
              {filters.pickupDate && filters.returnDate && (
                <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{filters.pickupDate} to {filters.returnDate}</span>
                  <button
                    onClick={() => {
                      handleFilterChange('pickupDate', '');
                      handleFilterChange('returnDate', '');
                    }}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>
              
              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cebu City, Talisay"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Date Filters */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={filters.pickupDate}
                  onChange={(e) => handleFilterChange('pickupDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Date
                </label>
                <input
                  type="date"
                  value={filters.returnDate}
                  onChange={(e) => handleFilterChange('returnDate', e.target.value)}
                  min={filters.pickupDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              {/* Vehicle Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <select
                  value={filters.vehicleType}
                  onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="all">All Types</option>
                  <option value="car">Cars</option>
                  <option value="motorcycle">Motorcycles</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (per day)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0]}
                    onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 10000])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>

              {/* Transmission */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transmission
                </label>
                <select
                  value={filters.transmission}
                  onChange={(e) => handleFilterChange('transmission', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="all">All</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              {/* Seats */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seats
                </label>
                <select
                  value={filters.seats}
                  onChange={(e) => handleFilterChange('seats', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="all">All</option>
                  <option value="2">2 seats</option>
                  <option value="5">5 seats</option>
                  <option value="7">7+ seats</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              <button
                onClick={resetFilters}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Vehicle Grid */}
          <main className="flex-1">
            <div className="mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{filteredVehicles.length} vehicles</span> available
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading vehicles...</p>
                </div>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg mb-2">No vehicles found</p>
                <p className="text-gray-400">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVehicles.map(vehicle => (
                  <CarCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CarList;