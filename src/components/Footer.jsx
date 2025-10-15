import { Car, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">CarDnD</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted platform for car and motorcycle rentals in Cebu. Safe, convenient, and affordable.
            </p>
            <div className="flex space-x-4">
              <button className="hover:text-blue-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="hover:text-blue-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </button>
              <button className="hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <button className="hover:text-blue-400 transition-colors">About Us</button>
              </li>
              <li>
                <button className="hover:text-blue-400 transition-colors">How it Works</button>
              </li>
              <li>
                <button className="hover:text-blue-400 transition-colors">Careers</button>
              </li>
              <li>
                <button className="hover:text-blue-400 transition-colors">Press</button>
              </li>
              <li>
                <button className="hover:text-blue-400 transition-colors">Blog</button>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <button className="hover:text-blue-400 transition-colors">Help Center</button>
              </li>
              <li>
                <button className="hover:text-blue-400 transition-colors">Safety</button>
              </li>
              <li>
                <button className="hover:text-blue-400 transition-colors">Cancellation Policy</button>
              </li>
              <li>
                <button className="hover:text-blue-400 transition-colors">Insurance</button>
              </li>
              <li>
                <button className="hover:text-blue-400 transition-colors">Contact Us</button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>123 IT Park, Cebu City, Philippines</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>+63 912 345 6789</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>support@cardnd.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} Cardnd. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <button className="hover:text-blue-400 transition-colors">Privacy Policy</button>
              <button className="hover:text-blue-400 transition-colors">Terms of Service</button>
              <button className="hover:text-blue-400 transition-colors">Cookie Policy</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;