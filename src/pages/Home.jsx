import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Car, Shield, DollarSign, Clock, MapPin, Calendar, Star, Award, Users } from 'lucide-react';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Helmet } from 'react-helmet';

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
      title: 'Insurance Covered',
      description: 'Every rental includes comprehensive insurance coverage up to ₱1M',
      stat: '100%',
      statLabel: 'Protected',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Transparent Pricing',
      description: 'See the exact cost upfront. No surprise fees, no hidden charges',
      stat: '₱0',
      statLabel: 'Hidden Fees',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Instant Booking',
      description: 'Reserve your ride in under 2 minutes. Keys in hand within hours',
      stat: '<2min',
      statLabel: 'To Book',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Premium Vehicles',
      description: 'Only well-maintained vehicles from top brands. Regular inspections guaranteed',
      stat: '4.8★',
      statLabel: 'Avg Rating',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Verified Community',
      description: 'Every host and renter is ID-verified with reviews from real people',
      stat: '1500+',
      statLabel: 'Active Users',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: <Car className="w-8 h-8" />,
      title: 'Flexible Returns',
      description: 'Free cancellation up to 24hrs before pickup. Extend rentals anytime',
      stat: '24/7',
      statLabel: 'Support',
      color: 'from-indigo-500 to-blue-500'
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
    <div className="min-h-screen bg-white">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Parenta - Premium Vehicle Rental in Cebu | Cars & Motorcycles</title>
        <meta name="description" content="Rent cars and motorcycles in Cebu from verified owners. Affordable rates, 24/7 support, and instant booking. Join Parenta's trusted vehicle sharing community." />
        <meta name="keywords" content="car rental cebu, motorcycle rental cebu, vehicle rental philippines, rent a car cebu, parenta" />
        <meta property="og:title" content="Parenta - Premium Vehicle Rental in Cebu" />
        <meta property="og:description" content="Rent cars and motorcycles in Cebu from verified owners. Affordable rates, 24/7 support, and instant booking." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://parenta.com" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0077B6] via-[#00B4D8] to-[#023E8A] text-white overflow-hidden pt-20">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#023E8A]/20 via-transparent to-[#00B4D8]/20 animate-pulse"></div>
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFD60A] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00B4D8]/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pb-32">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-2xl">
              Find Your Perfect <span className="text-[#FFD60A] drop-shadow-lg">Ride</span>
            </h1>
            <p className="text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              Discover premium cars and motorcycles from trusted owners across Cebu
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto transform hover:scale-[1.01] transition-transform duration-300 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-3" htmlFor="location">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-[#0077B6]" />
                  <input
                    id="location"
                    type="text"
                    placeholder="e.g. Cebu City, Talisay"
                    value={searchData.location}
                    onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077B6] focus:border-transparent text-gray-900 transition-all"
                    aria-label="Search location"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3" htmlFor="pickup-date">Pickup Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-[#0077B6]" />
                  <input
                    id="pickup-date"
                    type="date"
                    value={searchData.pickupDate}
                    onChange={(e) => setSearchData({ ...searchData, pickupDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077B6] focus:border-transparent text-gray-900 transition-all"
                    aria-label="Select pickup date"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3" htmlFor="return-date">Return Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-[#0077B6]" />
                  <input
                    id="return-date"
                    type="date"
                    value={searchData.returnDate}
                    onChange={(e) => setSearchData({ ...searchData, returnDate: e.target.value })}
                    min={searchData.pickupDate || new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077B6] focus:border-transparent text-gray-900 transition-all"
                    aria-label="Select return date"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3" htmlFor="vehicle-type">Vehicle Type</label>
                <select
                  id="vehicle-type"
                  value={searchData.vehicleType}
                  onChange={(e) => setSearchData({ ...searchData, vehicleType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077B6] focus:border-transparent text-gray-900 transition-all"
                  aria-label="Select vehicle type"
                >
                  <option value="all">All Vehicles</option>
                  <option value="car">Cars</option>
                  <option value="motorcycle">Motorcycles</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="mt-8 w-full bg-gradient-to-r from-[#0077B6] to-[#00B4D8] hover:from-[#023E8A] hover:to-[#0077B6] text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              aria-label="Search for vehicles"
            >
              <Search className="w-6 h-6" />
              <span className="text-lg">Search Vehicles</span>
            </button>
          </form>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#F8F9FA" fillOpacity="1" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-gradient-to-br from-[#F8F9FA] via-white to-[#F8F9FA] py-24 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-20 w-64 h-64 bg-[#0077B6] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#00B4D8] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#FFD60A] rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-[#00B4D8] rounded-full animate-bounce opacity-40" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-[#0077B6] rounded-full animate-bounce opacity-50" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-gradient-to-r from-[#0077B6]/10 to-[#00B4D8]/10 text-[#0077B6] text-sm font-bold rounded-full border border-[#0077B6]/20">
                Why Rent with Parenta?
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-[#023E8A] via-[#0077B6] to-[#00B4D8] bg-clip-text text-transparent mb-6 leading-tight">
              Real Benefits.<br/>No Fluff.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We cut through the noise to give you what actually matters: safe vehicles, fair prices, and zero headaches.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <article 
                key={index} 
                className="group relative p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 hover:border-transparent overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                
                {/* Card content */}
                <div className="relative z-10">
                  {/* Icon with animated gradient background */}
                  <div className={`inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-2xl text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {feature.icon}
                  </div>
                  
                  {/* Stat badge */}
                  <div className="absolute top-6 right-6 px-3 py-1.5 bg-gradient-to-r from-[#FFD60A] to-[#ffd60a]/80 rounded-full shadow-md">
                    <div className="text-xs font-bold text-[#023E8A]">{feature.stat}</div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#0077B6] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  
                  {/* Bottom stat indicator */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                    <span className="text-sm font-semibold text-gray-500">{feature.statLabel}</span>
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color} animate-pulse`}></div>
                  </div>
                </div>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>
              </article>
            ))}
          </div>
          
          {/* Trust line */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-gray-200/50">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
              </div>
              <p className="text-sm font-semibold text-gray-700">
                Trusted by <span className="text-[#0077B6]">1,500+</span> happy renters in Cebu
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="relative bg-gradient-to-br from-white via-[#F8F9FA]/50 to-white py-20 overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-10 w-96 h-96 bg-gradient-to-br from-[#0077B6] to-[#00B4D8] rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-[#FFD60A] rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#023E8A] to-[#0077B6] bg-clip-text text-transparent mb-4">
              Top-Rated Vehicles
            </h2>
            <p className="text-xl text-gray-600">Handpicked vehicles loved by our community</p>
          </div>
          
          {loadingVehicles ? (
            <div className="flex justify-center items-center py-16" role="status" aria-label="Loading vehicles">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-[#0077B6] absolute top-0 left-0"></div>
              </div>
            </div>
          ) : featuredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredVehicles.map((vehicle) => (
                <div 
                  key={vehicle.id}
                  className="group h-[480px]"
                  style={{ perspective: '1000px' }}
                >
                  <div 
                    className="relative w-full h-full transition-transform duration-700 ease-in-out"
                    style={{ 
                      transformStyle: 'preserve-3d',
                      transform: 'rotateY(0deg)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'rotateY(180deg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'rotateY(0deg)';
                    }}
                  >
                    {/* Front of Card */}
                    <div 
                      className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <Link 
                        to={`/vehicles/${vehicle.id}`}
                        className="block h-full"
                        aria-label={`View details for ${vehicle.title || `${vehicle.specifications?.brand} ${vehicle.specifications?.model}`}`}
                      >
                        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                          <img
                            src={vehicle.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                            alt={`${vehicle.title || `${vehicle.specifications?.brand} ${vehicle.specifications?.model}`} - Vehicle for rent`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                          />
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-gray-900 flex items-center gap-2 shadow-lg">
                            {vehicle.type === 'car' ? <Car className="w-4 h-4 text-[#0077B6]" /> : <span className="text-lg">🏍️</span>}
                            <span className="capitalize">{vehicle.type}</span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-1">{vehicle.title || `${vehicle.specifications?.brand} ${vehicle.specifications?.model}`}</h3>
                          <div className="flex items-center text-sm text-gray-600 mb-4">
                            <MapPin className="w-4 h-4 mr-2 text-[#0077B6]" />
                            <span>{vehicle.location}</span>
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {renderStars(vehicle.rating)}
                              </div>
                              <span className="font-bold text-gray-900">{vehicle.rating}</span>
                              <span className="text-gray-500 text-sm">({vehicle.reviewCount})</span>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-gray-200">
                            <div className="flex items-baseline justify-between">
                              <div>
                                <span className="text-3xl font-extrabold bg-gradient-to-r from-[#0077B6] to-[#00B4D8] bg-clip-text text-transparent">₱{vehicle.pricePerDay}</span>
                                <span className="text-gray-600 text-sm ml-2">/day</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>

                    {/* Back of Card */}
                    <div 
                      className="absolute inset-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 overflow-hidden border border-gray-200/50"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="mb-3 pb-3 border-b border-gray-200">
                          <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{vehicle.title || `${vehicle.specifications?.brand} ${vehicle.specifications?.model}`}</h3>
                          <div className="flex items-center text-xs text-gray-600">
                            <MapPin className="w-3 h-3 mr-1 text-[#0077B6]" />
                            <span>{vehicle.location}</span>
                          </div>
                        </div>

                        {/* Specifications - Compact Grid Layout */}
                        <div className="flex-1 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-0.5 w-6 bg-gradient-to-r from-[#0077B6] to-[#00B4D8] rounded-full"></div>
                            <h4 className="font-bold text-xs text-gray-900">Specifications</h4>
                          </div>
                          
                          <div className="space-y-1.5">
                            {/* Brand & Model - Full Width */}
                            {vehicle.specifications?.brand && (
                              <div className="flex justify-between items-center text-xs p-1.5 rounded-lg bg-gradient-to-r from-[#F8F9FA] to-white">
                                <span className="text-gray-600 font-medium">Brand</span>
                                <span className="font-bold text-gray-900">{vehicle.specifications.brand}</span>
                              </div>
                            )}
                            
                            {vehicle.specifications?.model && (
                              <div className="flex justify-between items-center text-xs p-1.5 rounded-lg bg-white">
                                <span className="text-gray-600 font-medium">Model</span>
                                <span className="font-bold text-gray-900">{vehicle.specifications.model}</span>
                              </div>
                            )}
                            
                            {/* Year & Seats - Two Columns */}
                            <div className="grid grid-cols-2 gap-1.5">
                              {vehicle.specifications?.year && (
                                <div className="flex justify-between items-center text-xs p-1.5 rounded-lg bg-gradient-to-r from-[#F8F9FA] to-white">
                                  <span className="text-gray-600 font-medium">Year</span>
                                  <span className="font-bold text-gray-900">{vehicle.specifications.year}</span>
                                </div>
                              )}
                              
                              {vehicle.specifications?.seats && (
                                <div className="flex justify-between items-center text-xs p-1.5 rounded-lg bg-gradient-to-r from-[#F8F9FA] to-white">
                                  <span className="text-gray-600 font-medium">Seats</span>
                                  <span className="font-bold text-gray-900">{vehicle.specifications.seats}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Transmission - Full Width */}
                            {vehicle.specifications?.transmission && (
                              <div className="flex justify-between items-center text-xs p-1.5 rounded-lg bg-white">
                                <span className="text-gray-600 font-medium">Transmission</span>
                                <span className="font-bold text-gray-900 capitalize">{vehicle.specifications.transmission}</span>
                              </div>
                            )}
                            
                            {/* Fuel Type - Full Width */}
                            {vehicle.specifications?.fuelType && (
                              <div className="flex justify-between items-center text-xs p-1.5 rounded-lg bg-gradient-to-r from-[#F8F9FA] to-white">
                                <span className="text-gray-600 font-medium">Fuel Type</span>
                                <span className="font-bold text-gray-900 capitalize">{vehicle.specifications.fuelType}</span>
                              </div>
                            )}
                          </div>

                          {/* Features */}
                          {vehicle.features && vehicle.features.length > 0 && (
                            <div className="pt-2">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-0.5 w-6 bg-gradient-to-r from-[#0077B6] to-[#00B4D8] rounded-full"></div>
                                <h4 className="font-bold text-xs text-gray-900">Features</h4>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {vehicle.features.slice(0, 3).map((feature, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-gradient-to-r from-[#0077B6] to-[#00B4D8] text-white rounded-full text-[10px] font-semibold shadow-sm">
                                    {feature}
                                  </span>
                                ))}
                                {vehicle.features.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-[10px] font-semibold">
                                    +{vehicle.features.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Rating & Price - Compact */}
                        <div className="pt-3 border-t border-gray-200 bg-gradient-to-br from-[#F8F9FA] to-white rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <div className="flex gap-0.5">
                                {renderStars(vehicle.rating)}
                              </div>
                              <span className="font-bold text-gray-900 text-sm">{vehicle.rating}</span>
                              <span className="text-gray-500 text-xs">({vehicle.reviewCount})</span>
                            </div>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-extrabold bg-gradient-to-r from-[#0077B6] to-[#00B4D8] bg-clip-text text-transparent">₱{vehicle.pricePerDay}</span>
                            <span className="text-gray-600 text-xs font-semibold">/day</span>
                          </div>
                        </div>

                        {/* View Details Button - Compact */}
                        <Link 
                          to={`/vehicles/${vehicle.id}`}
                          className="mt-3 w-full bg-gradient-to-r from-[#0077B6] to-[#00B4D8] hover:from-[#023E8A] hover:to-[#0077B6] text-white font-bold py-2.5 rounded-xl transition-all duration-300 text-center block shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm"
                        >
                          View Full Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No vehicles available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-[#023E8A] via-[#0077B6] to-[#00B4D8] text-white py-20 overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#00B4D8]/20 via-transparent to-[#023E8A]/20 animate-pulse" style={{ animationDuration: '3s' }}></div>
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-[#FFD60A] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#00B4D8]/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-lg">Ready to Earn with Your Vehicle?</h2>
          <p className="text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            Join thousands of hosts earning passive income by sharing their cars and motorcycles
          </p>
          <Link 
            to="/host/dashboard"
            className="inline-flex items-center gap-3 bg-[#FFD60A] text-[#023E8A] font-bold px-10 py-5 rounded-xl hover:bg-[#ffd60a]/90 transition-all duration-300 shadow-2xl hover:shadow-[#FFD60A]/50 transform hover:scale-105 text-lg"
            aria-label="Become a host on Parenta"
          >
            <span>Become a Host</span>
            <span className="text-2xl">→</span>
          </Link>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,69.3C960,64,1056,64,1152,69.3C1248,75,1344,85,1392,90.7L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="relative bg-white py-16 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8F9FA]/30 via-white to-[#F8F9FA]/30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-[#F8F9FA] shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-[#0077B6] to-[#00B4D8] bg-clip-text text-transparent mb-2">1000+</div>
              <div className="text-gray-600 font-medium">Happy Renters</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-[#F8F9FA] shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-[#0077B6] to-[#00B4D8] bg-clip-text text-transparent mb-2">500+</div>
              <div className="text-gray-600 font-medium">Verified Hosts</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-[#F8F9FA] shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-[#0077B6] to-[#00B4D8] bg-clip-text text-transparent mb-2">300+</div>
              <div className="text-gray-600 font-medium">Quality Vehicles</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-[#F8F9FA] shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-[#0077B6] to-[#00B4D8] bg-clip-text text-transparent mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Customer Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;