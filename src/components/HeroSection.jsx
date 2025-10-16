import { useNavigate } from 'react-router-dom';
import { Car, ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  const heroFeaturedVehicles = [
    {
      id: 1,
      name: 'MERCEDES-BENZ',
      model: 'V-Class Cargo',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&h=300&fit=crop'
    },
    {
      id: 2,
      name: 'PORSCHE 911',
      model: 'TURBO S',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&h=300&fit=crop'
    }
  ];

  return (
    <section className="relative min-h-screen text-white overflow-hidden" aria-label="Hero section">
      {/* Background Image */}
      <div className="absolute inset-0 " aria-hidden="true">
        <img 
          src="../public/CarHero.jpg"
          alt="Luxury sports car showcasing CarDnD's premium vehicle rental fleet"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#171717] via-[#171717]/55 to-[#171717]/80"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <article className="space-y-8 animate-fade-in">
            <header className="space-y-4">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
                CAR <span className="text-[#007BFF]">DnD</span>
              </h1>
              <p className="text-lg md:text-xl text-[#E0E0E0] max-w-xl leading-relaxed">
                RENT WITH EASE, DRIVE WITH CONFIDENCE. <br />Discover top-rated cars and motorcycles from trusted owners near you in the Philippines.
              </p>
            </header>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => navigate('/vehicles')}
                className="group bg-[#007BFF] hover:bg-[#e6b800] text-[#171717] font-semibold px-8 py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl hover:scale-105"
                aria-label="Explore available cars"
              >
                EXPLORE CARS
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/host/dashboard')}
                className="bg-transparent border-2 border-[#E0E0E0] hover:border-[#007BFF] hover:bg-[#007BFF]/10 text-[#E0E0E0] hover:text-[#007BFF] font-semibold px-8 py-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl"
                aria-label="List your vehicle"
              >
                LIST YOUR VEHICLE
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#8C8C8C]/30">
              <div>
                <div className="text-3xl font-bold text-[#007BFF]">500+</div>
                <div className="text-sm text-[#8C8C8C] mt-1">Vehicles</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#007BFF]">2K+</div>
                <div className="text-sm text-[#8C8C8C] mt-1">Happy Guests</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#007BFF]">4.8★</div>
                <div className="text-sm text-[#8C8C8C] mt-1">Average Rating</div>
              </div>
            </div>
          </article>

          {/* Right Content - Featured Vehicle Cards */}
          <aside className="relative hidden lg:block" aria-label="Featured vehicles showcase">
            <div className="space-y-6">
              {heroFeaturedVehicles.map((vehicle, index) => (
                <div
                  key={vehicle.id}
                  className="group relative bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl hover:shadow-[#007BFF]/20 transition-all duration-500 hover:scale-105 cursor-pointer border border-[#8C8C8C]/20 hover:border-[#007BFF]/50"
                  style={{
                    animation: `slideInRight 0.8s ease-out ${index * 0.2}s both`
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-transparent to-transparent opacity-60"></div>
                  </div>
                  <div className="p-6 relative">
                    <div className="absolute top-0 right-6 -translate-y-1/2">
                      <div className="bg-[#007BFF] text-[#171717] rounded-full p-3 shadow-lg">
                        <Car className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{vehicle.name}</h3>
                    <p className="text-[#8C8C8C] text-sm uppercase tracking-wide">{vehicle.model}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[#E0E0E0] text-sm">Available Now</span>
                      <ArrowRight className="w-5 h-5 text-[#007BFF] group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#007BFF]/10 rounded-full blur-3xl" aria-hidden="true"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#007BFF]/5 rounded-full blur-3xl" aria-hidden="true"></div>
          </aside>
        </div>
      </div>

      {/* Bottom Gradient Fade - Match background */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#171717] via-[#171717]/80 to-transparent pointer-events-none" aria-hidden="true"></div>
    </section>
  );
};

export default HeroSection;
