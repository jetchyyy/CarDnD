import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar } from 'lucide-react';

const SearchSection = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    location: '',
    pickupDate: '',
    returnDate: '',
    vehicleType: 'all'
  });

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

  return (
    <section className="relative text-white py-20 overflow-hidden" aria-label="Vehicle search" role="search">
      {/* Top Gradient - Match Hero bottom */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#171717] via-[#171717]/80 to-transparent pointer-events-none z-10"></div>
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF]/20 via-transparent to-[#007BFF]/10"></div>
        <div className="absolute inset-0 animate-pulse" style={{
          backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(0, 123, 255, 0.1) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 8s infinite linear'
        }}></div>
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-[#007BFF]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-[#007BFF]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">Find Your Perfect Ride</h2>
          <p className="text-lg text-[#E0E0E0]">Search from hundreds of available vehicles</p>
        </div>

        <form onSubmit={handleSearch} className="relative backdrop-blur-xl bg-[#2a2a2a]/80 rounded-3xl shadow-2xl p-8 border border-[#8C8C8C]/30 hover:border-[#007BFF]/60 transition-all duration-500 hover:shadow-[#007BFF]/20 animate-fade-in">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-3xl pointer-events-none"></div>
          
          {/* Accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#007BFF] to-transparent rounded-full animate-pulse"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="relative">
              <label className="block text-sm font-semibold text-white/90 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-[#007BFF] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cebu City"
                  value={searchData.location}
                  onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-[#007BFF] text-white placeholder-white/40 transition-all hover:bg-[#222222] hover:border-[#007BFF]/50"
                  aria-label="Enter location"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">Pickup Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-[#007BFF] pointer-events-none" />
                <input
                  type="date"
                  value={searchData.pickupDate}
                  onChange={(e) => setSearchData({ ...searchData, pickupDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-[#007BFF] text-white transition-all hover:bg-[#222222] hover:border-[#007BFF]/50"
                  aria-label="Select pickup date"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">Return Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-[#007BFF] pointer-events-none" />
                <input
                  type="date"
                  value={searchData.returnDate}
                  onChange={(e) => setSearchData({ ...searchData, returnDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-[#007BFF] text-white transition-all hover:bg-[#222222] hover:border-[#007BFF]/50"
                  aria-label="Select return date"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">Vehicle Type</label>
              <select
                value={searchData.vehicleType}
                onChange={(e) => setSearchData({ ...searchData, vehicleType: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg focus:ring-2 focus:ring-[#007BFF] focus:border-[#007BFF] text-white transition-all hover:bg-[#222222] hover:border-[#007BFF]/50 cursor-pointer"
                aria-label="Select vehicle type"
              >
                <option value="all" className="bg-[#171717] text-white">All Vehicles</option>
                <option value="car" className="bg-[#171717] text-white">Cars</option>
                <option value="motorcycle" className="bg-[#171717] text-white">Motorcycles</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#007BFF] to-[#0056b3] hover:from-[#0056b3] hover:to-[#003d82] text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#007BFF]/20 hover:shadow-2xl hover:shadow-[#007BFF]/40 hover:scale-[1.02] relative overflow-hidden group"
            aria-label="Search for vehicles"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <Search className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Search Vehicles</span>
          </button>
        </form>
      </div>
    </section>
  );
};

export default SearchSection;
