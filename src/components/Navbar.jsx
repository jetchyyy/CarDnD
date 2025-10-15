import { useState } from 'react';
import { Car, Menu, X, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Replace with actual auth state

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">CarDnD</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Browse Vehicles
            </button>
            <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Become a Host
            </button>
            <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              How it Works
            </button>
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">John Doe</span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Profile</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3">
                      <LayoutDashboard className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">My Bookings</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3">
                      <Settings className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Settings</span>
                    </button>
                    <hr className="my-2" />
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3 text-red-600">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Sign In
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors">
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 mt-2">
            <div className="flex flex-col space-y-3 pt-4">
              <button className="text-gray-700 hover:text-blue-600 font-medium text-left">
                Browse Vehicles
              </button>
              <button className="text-gray-700 hover:text-blue-600 font-medium text-left">
                Become a Host
              </button>
              <button className="text-gray-700 hover:text-blue-600 font-medium text-left">
                How it Works
              </button>
              <hr className="my-2" />
              {isLoggedIn ? (
                <>
                  <button className="text-gray-700 hover:text-blue-600 font-medium text-left flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button className="text-gray-700 hover:text-blue-600 font-medium text-left flex items-center space-x-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>My Bookings</span>
                  </button>
                  <button className="text-red-600 hover:text-red-700 font-medium text-left flex items-center space-x-2">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="text-gray-700 hover:text-blue-600 font-medium text-left">
                    Sign In
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg w-full">
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;