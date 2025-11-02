import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-[#023E8A] via-[#0077B6] to-[#023E8A] text-gray-100 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-5 right-20 w-64 h-64 bg-[#00B4D8] rounded-full blur-3xl"></div>
        <div className="absolute bottom-5 left-20 w-64 h-64 bg-[#FFD60A] rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Main Content - Single Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Section - Spans 4 columns */}
          <div className="md:col-span-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-lg">
                <img src="/ParentaIcon.png" alt="Parenta Logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-2xl font-bold text-white">Parenta</span>
            </div>
            <p className="text-blue-100 text-sm mb-4 leading-relaxed max-w-xs">
              Premium vehicle rentals in Cebu. Safe, convenient, affordable.
            </p>
            <div className="flex space-x-2">
              <a 
                href="#" 
                className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-[#FFD60A] hover:text-[#023E8A] transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-[#FFD60A] hover:text-[#023E8A] transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-[#FFD60A] hover:text-[#023E8A] transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links - Spans 5 columns */}
          <div className="md:col-span-5 grid grid-cols-2 gap-6">
            {/* Company Links */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-blue-100 text-sm hover:text-[#FFD60A] transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="text-blue-100 text-sm hover:text-[#FFD60A] transition-colors">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-blue-100 text-sm hover:text-[#FFD60A] transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/help" className="text-blue-100 text-sm hover:text-[#FFD60A] transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/safety" className="text-blue-100 text-sm hover:text-[#FFD60A] transition-colors">
                    Safety
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-blue-100 text-sm hover:text-[#FFD60A] transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Info - Spans 3 columns */}
          <div className="md:col-span-3">
            <h3 className="text-white font-semibold text-sm mb-3">Get in Touch</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-[#FFD60A] flex-shrink-0" />
                <a href="tel:+639123456789" className="text-blue-100 text-sm hover:text-[#FFD60A] transition-colors">
                  +63 912 345 6789
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-[#FFD60A] flex-shrink-0" />
                <a href="mailto:support@parenta.com" className="text-blue-100 text-sm hover:text-[#FFD60A] transition-colors">
                  support@parenta.com
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#FFD60A] flex-shrink-0 mt-0.5" />
                <span className="text-blue-100 text-sm">Cebu City, PH</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Compact */}
        <div className="border-t border-white/10 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
            <p className="text-blue-100">
              © {currentYear} Parenta. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/privacy" className="text-blue-100 hover:text-[#FFD60A] transition-colors">
                Privacy
              </Link>
              <Link to="/terms-of-service" className="text-blue-100 hover:text-[#FFD60A] transition-colors">
                Terms
              </Link>
              <Link to="/cookies" className="text-blue-100 hover:text-[#FFD60A] transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;