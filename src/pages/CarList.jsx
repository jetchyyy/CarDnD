import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, Calendar } from 'lucide-react';
import CarCard from '../components/CarCard';

const CarList = () => {
  const [filters, setFilters] = useState({
    vehicleType: 'all',
    priceRange: [0, 200],
    transmission: 'all',
    seats: 'all',
    sortBy: 'recommended'
  });

  const [showFilters, setShowFilters] = useState(false);

  // Sample vehicle data
  const vehicles = [
    {
      id: 1,
      name: 'Tesla Model 3',
      type: 'car',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
      price: 89,
      rating: 4.9,
      totalTrips: 124,
      location: 'Cebu City',
      transmission: 'Automatic',
      fuelType: 'Electric',
      seats: 5,
      owner: 'Juan Cruz'
    },
    {
      id: 2,
      name: 'Honda Civic',
      type: 'car',
      image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800',
      price: 45,
      rating: 4.8,
      totalTrips: 89,
      location: 'Mandaue City',
      transmission: 'Automatic',
      fuelType: 'Gasoline',
      seats: 5,
      owner: 'Maria Santos'
    },
    {
      id: 3,
      name: 'Yamaha NMAX',
      type: 'motorcycle',
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
      price: 25,
      rating: 4.7,
      totalTrips: 156,
      location: 'Cebu City',
      transmission: 'Automatic',
      fuelType: 'Gasoline',
      seats: 2,
      owner: 'Pedro Reyes'
    },
    {
      id: 4,
      name: 'Honda Click 150i',
      type: 'motorcycle',
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
      price: 20,
      rating: 4.6,
      totalTrips: 98,
      location: 'Lapu-Lapu City',
      transmission: 'Automatic',
      fuelType: 'Gasoline',
      seats: 2,
      owner: 'Anna Garcia'
    },
    {
      id: 5,
      name: 'Toyota Fortuner',
      type: 'car',
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
      price: 120,
      rating: 4.9,
      totalTrips: 67,
      location: 'Cebu City',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      seats: 7,
      owner: 'Carlos Tan'
    },
    {
      id: 6,
      name: 'Mitsubishi Montero',
      type: 'car',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
      price: 110,
      rating: 4.7,
      totalTrips: 54,
      location: 'Mandaue City',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      seats: 7,
      owner: 'Luis Fernando'
    }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Available Vehicles</h1>
              <p className="text-gray-600">Find your perfect ride in Cebu</p>
            </div>
            
            <div className="flex gap-3">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by vehicle name..."
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>
              
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
                    onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
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
                onClick={() => setFilters({
                  vehicleType: 'all',
                  priceRange: [0, 200],
                  transmission: 'all',
                  seats: 'all',
                  sortBy: 'recommended'
                })}
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
                <span className="font-semibold text-gray-900">{vehicles.length} vehicles</span> available
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {vehicles.map(vehicle => (
                <CarCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                  1
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                  2
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                  3
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
                  Next
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CarList;