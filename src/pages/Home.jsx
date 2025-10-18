import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Car, Shield, DollarSign, Clock, MapPin, Calendar, Star } from 'lucide-react';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const Home = () => {
  const navigate = useNavigate();
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [searchData, setSearchData] = useState({
    location: '',
    pickupDate: '',
    returnDate: '',
    vehicleType: 'all'
  });

  // Fetch vehicles and their reviews to display by highest rating
  useEffect(() => {
    const fetchFeaturedVehicles = async () => {
      setLoadingVehicles(true);
      try {
        const vehiclesRef = collection(db, 'vehicles');
        const vehiclesSnapshot = await getDocs(vehiclesRef);
        const vehiclesData = vehiclesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch reviews for each vehicle
        const vehiclesWithRatings = await Promise.all(
          vehiclesData.map(async (vehicle) => {
            try {
              const reviewsRef = collection(db, 'reviews');
              const q = query(reviewsRef, where('carId', '==', vehicle.id));
              const reviewsSnapshot = await getDocs(q);
              const reviews = reviewsSnapshot.docs.map(doc => doc.data());
              
              // Calculate average rating
              let averageRating = 0;
              if (reviews.length > 0) {
                averageRating = (
                  reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
                ).toFixed(1);
              }

              return {
                ...vehicle,
                rating: parseFloat(averageRating),
                reviewCount: reviews.length
              };
            } catch (error) {
              console.error(`Error fetching reviews for vehicle ${vehicle.id}:`, error);
              return {
                ...vehicle,
                rating: 0,
                reviewCount: 0
              };
            }
          })
        );

        // Sort by rating (highest first) and limit to 4
        const topRated = vehiclesWithRatings
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);

        setFeaturedVehicles(topRated);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchFeaturedVehicles();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build query params from search data
    const params = new URLSearchParams();
    if (searchData.location) params.append('location', searchData.location);
    if (searchData.pickupDate) params.append('pickup', searchData.pickupDate);
    if (searchData.returnDate) params.append('return', searchData.returnDate);
    if (searchData.vehicleType !== 'all') params.append('type', searchData.vehicleType);
    
    // Navigate to vehicles page with search params
    navigate(`/vehicles?${params.toString()}`);
  };

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Verified Owners',
      description: 'All vehicle owners are verified and insured for your safety'
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Best Prices',
      description: 'Competitive rates with no hidden fees or charges'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support whenever you need help'
    }
  ];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.round(rating)
            ? 'text-yellow-500 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Find Your Perfect Ride</h1>
            <p className="text-xl text-blue-100">Rent cars and motorcycles from trusted owners in Cebu</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cebu City"
                    value={searchData.location}
                    onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={searchData.pickupDate}
                    onChange={(e) => setSearchData({ ...searchData, pickupDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Return Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={searchData.returnDate}
                    onChange={(e) => setSearchData({ ...searchData, returnDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <select
                  value={searchData.vehicleType}
                  onChange={(e) => setSearchData({ ...searchData, vehicleType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="all">All Vehicles</option>
                  <option value="car">Cars</option>
                  <option value="motorcycle">Motorcycles</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search Vehicles
            </button>
          </form>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose CarDnD?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="inline-block p-4 bg-blue-100 rounded-full text-blue-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Vehicles */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Vehicles</h2>
          
          {loadingVehicles ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : featuredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredVehicles.map((vehicle) => (
                <Link 
                  key={vehicle.id} 
                  to={`/vehicles/${vehicle.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <div className="relative h-48">
                    <img
                      src={vehicle.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                      alt={vehicle.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-900 flex items-center gap-1">
                      {vehicle.type === 'car' ? <Car className="w-4 h-4" /> : <span>🏍️</span>}
                      <span className="capitalize">{vehicle.type}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{vehicle.title || `${vehicle.specifications?.brand} ${vehicle.specifications?.model}`}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {vehicle.location}
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {renderStars(vehicle.rating)}
                        </div>
                        <span className="font-medium text-gray-900">{vehicle.rating}</span>
                        <span className="text-gray-500 text-sm">({vehicle.reviewCount})</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">₱{vehicle.pricePerDay}</span>
                        <span className="text-gray-600 text-sm">/day</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No vehicles available at the moment</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Earn with Your Vehicle?</h2>
          <p className="text-xl text-blue-100 mb-8">List your car or motorcycle and start earning passive income today</p>
          <Link 
            to="/host/dashboard"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition duration-200"
          >
            Become a Host
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;