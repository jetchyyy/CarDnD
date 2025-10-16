import { Link } from 'react-router-dom';
import { Car, MapPin, ArrowRight } from 'lucide-react';

const FeaturedVehicles = () => {
  const featuredVehicles = [
    {
      id: 1,
      name: 'Tesla Model 3',
      type: 'car',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
      price: 89,
      rating: 4.9,
      trips: 124,
      location: 'Cebu City'
    },
    {
      id: 2,
      name: 'Honda Civic',
      type: 'car',
      image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800',
      price: 45,
      rating: 4.8,
      trips: 89,
      location: 'Mandaue City'
    },
    {
      id: 3,
      name: 'Yamaha NMAX',
      type: 'motorcycle',
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
      price: 25,
      rating: 4.7,
      trips: 156,
      location: 'Cebu City'
    },
    {
      id: 4,
      name: 'Honda Click 150i',
      type: 'motorcycle',
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800',
      price: 20,
      rating: 4.6,
      trips: 98,
      location: 'Lapu-Lapu City'
    }
  ];

  return (
    <section className="relative text-white py-20 overflow-hidden" aria-labelledby="featured-vehicles-heading">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-40 right-20 w-36 h-36 bg-[#007BFF]/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-40 left-20 w-44 h-44 bg-[#007BFF]/10 rounded-full blur-3xl animate-float-delayed"></div>
      <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-[#007BFF]/5 rounded-full blur-xl animate-pulse"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h2 id="featured-vehicles-heading" className="text-4xl md:text-5xl font-bold text-white mb-2">Featured Vehicles</h2>
            <p className="text-[#E0E0E0] text-lg">Discover our most popular cars and motorcycles for rent</p>
          </div>
          <Link 
            to="/vehicles"
            className="hidden md:flex items-center gap-2 text-white hover:text-[#007BFF] font-semibold transition-colors group"
          >
            View All
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredVehicles.map((vehicle, index) => (
            <Link 
              key={vehicle.id} 
              to={`/vehicles/${vehicle.id}`}
              className="group backdrop-blur-xl bg-[#2a2a2a]/80 hover:bg-[#2f2f2f]/80 rounded-2xl shadow-md overflow-hidden hover:shadow-2xl hover:shadow-[#007BFF]/20 transition-all duration-500 cursor-pointer border border-[#8C8C8C]/30 hover:border-[#007BFF] hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
              <div className="relative h-48 overflow-hidden bg-[#1a1a1a]">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-3 right-3 bg-[#171717]/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-white flex items-center gap-1.5 shadow-lg group-hover:bg-[#007BFF] group-hover:text-[#171717] transition-colors">
                  {vehicle.type === 'car' ? <Car className="w-4 h-4" /> : <span>🏍️</span>}
                  <span className="capitalize">{vehicle.type}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-[#007BFF] transition-colors">{vehicle.name}</h3>
                <div className="flex items-center text-sm text-[#E0E0E0] mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  {vehicle.location}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-[#007BFF] mr-1">★</span>
                    <span className="font-semibold text-white">{vehicle.rating}</span>
                    <span className="text-[#E0E0E0] text-sm ml-1">({vehicle.trips} trips)</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#8C8C8C]/30 group-hover:border-[#007BFF] transition-colors">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white group-hover:text-[#007BFF] transition-colors">₱{vehicle.price}</span>
                    <span className="text-[#E0E0E0] text-sm">/day</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center md:hidden">
          <Link 
            to="/vehicles"
            className="inline-flex items-center gap-2 bg-[#007BFF] hover:bg-[#0056b3] text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
          >
            View All Vehicles
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedVehicles;
