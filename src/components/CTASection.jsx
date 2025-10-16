import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="relative text-white py-24 overflow-hidden" aria-labelledby="cta-heading">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Additional Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-28 h-28 bg-[#007BFF]/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-[#007BFF]/10 rounded-full blur-2xl animate-pulse"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <article className="max-w-3xl mx-auto">
          <h2 id="cta-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Ready to Earn with Your Vehicle?
          </h2>
          <p className="text-lg md:text-xl text-[#E0E0E0] mb-10 leading-relaxed">
            List your car or motorcycle and start earning passive income today. Join 500+ hosts already making money on CarDnD in the Philippines.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/host/dashboard"
              className="group inline-flex items-center justify-center bg-[#007BFF] hover:bg-[#e6b800] text-[#171717] font-semibold px-8 py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 gap-2"
            >
              Become a Host
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/vehicles"
              className="group inline-flex items-center justify-center bg-transparent border-2 border-[#E0E0E0] hover:border-[#007BFF] hover:bg-[#007BFF]/10 text-[#E0E0E0] hover:text-[#007BFF] font-semibold px-8 py-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl gap-2"
            >
              Browse Vehicles
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <footer className="mt-16 pt-12 border-t border-[#8C8C8C]/30">
            <p className="text-[#8C8C8C] text-sm mb-8 uppercase tracking-wider font-semibold">Trusted By</p>
            <nav aria-label="Trust statistics" className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              <div className="text-[#E0E0E0] font-semibold hover:text-[#007BFF] transition-colors">500+ Vehicle Owners</div>
              <div className="w-1 h-1 bg-[#8C8C8C] rounded-full hidden sm:block" aria-hidden="true"></div>
              <div className="text-[#E0E0E0] font-semibold hover:text-[#007BFF] transition-colors">2000+ Happy Guests</div>
              <div className="w-1 h-1 bg-[#8C8C8C] rounded-full hidden sm:block" aria-hidden="true"></div>
              <div className="text-[#E0E0E0] font-semibold hover:text-[#007BFF] transition-colors">5000+ Successful Rentals</div>
            </nav>
          </footer>
        </article>
      </div>

      {/* Decorative Elements with Enhanced Animation */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#007BFF]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float" aria-hidden="true"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#007BFF]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-float-delayed" aria-hidden="true"></div>
    </section>
  );
};

export default CTASection;
