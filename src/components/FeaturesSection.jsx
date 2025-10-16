import { Shield, DollarSign, Clock } from 'lucide-react';

const FeaturesSection = () => {
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

  return (
    <section className="relative text-white py-20 overflow-hidden">
      {/* Enhanced Background Pattern with Animation */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Decorative Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#007BFF]/10 rounded-full blur-2xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#007BFF]/10 rounded-full blur-2xl animate-float-delayed"></div>
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-[#007BFF]/5 rounded-full blur-xl animate-pulse"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h2 id="features-heading" className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose CarDnD?</h2>
          <p className="text-lg text-[#E0E0E0] max-w-2xl mx-auto leading-relaxed">
            Experience the future of vehicle rental with our trusted platform in the Philippines
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group text-center p-8 backdrop-blur-xl bg-[#2a2a2a]/80 hover:bg-[#2f2f2f]/80 rounded-2xl shadow-md hover:shadow-2xl hover:shadow-[#007BFF]/20 transition-all duration-500 border border-[#8C8C8C]/30 hover:border-[#007BFF] hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative inline-block p-5 bg-[#171717] rounded-full text-white group-hover:bg-[#007BFF] group-hover:text-[#171717] mb-6 transition-all duration-500 shadow-md group-hover:shadow-lg group-hover:shadow-[#007BFF]/50 group-hover:scale-110 group-hover:rotate-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 transition-colors group-hover:text-[#007BFF]">{feature.title}</h3>
              <p className="text-[#E0E0E0] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
