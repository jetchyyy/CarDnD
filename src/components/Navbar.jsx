import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Menu, X, User, LogOut, Settings, LayoutDashboard, PlusCircle, Calendar } from 'lucide-react';
import { useAuth } from '../context/Authcontext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
      setIsUserMenuOpen(false);
    }
  };

  const handleBecomeHost = () => {
    if (!user) {
      navigate('/login', { state: { returnTo: '/host/dashboard' } });
    } else {
      navigate('/host/dashboard');
    }
  };

  return (
    <nav className="bg-[#171717] shadow-xl sticky top-0 z-50 border-b border-[#8C8C8C]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center cursor-pointer group">
            <div className="flex items-center space-x-2">
              <div className="bg-[#007BFF] p-2 rounded-lg group-hover:scale-110 transition-transform">
                <Car className="w-6 h-6 text-[#FFFFFF]" />
              </div>
              <span className="text-2xl font-bold text-[#FFFFFF]">CarDnD</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/vehicles" className="text-[#E0E0E0] hover:text-[#007BFF] font-medium transition-colors">
              Browse Vehicles
            </Link>
            <button 
              onClick={handleBecomeHost}
              className="text-[#E0E0E0] hover:text-[#007BFF] font-medium transition-colors"
            >
              Become a Host
            </button>
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 bg-[#8C8C8C]/20 hover:bg-[#8C8C8C]/30 rounded-full px-4 py-2 transition-colors border border-[#8C8C8C]/30"
                >
                  {user.photoUrl ? (
                    <img 
                      src={user.photoUrl} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-[#007BFF]"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-[#007BFF] rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#FFFFFF]" />
                    </div>
                  )}
                  <span className="text-[#FFFFFF] font-medium">{user.name}</span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#171717] rounded-lg shadow-2xl py-2 border border-[#8C8C8C]/30">
                    <Link 
                      to="/profile" 
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-left px-4 py-2 hover:bg-[#007BFF]/10 flex items-center space-x-3 transition-colors"
                    >
                      <User className="w-4 h-4 text-[#007BFF]" />
                      <span className="text-[#E0E0E0]">Profile</span>
                    </Link>

                    <Link 
                      to="/my-bookings" 
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-left px-4 py-2 hover:bg-[#007BFF]/10 flex items-center space-x-3 transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-[#007BFF]" />
                      <span className="text-[#E0E0E0]">My Bookings</span>
                    </Link>
                    
                    {user.role === 'host' && (
                      <>
                        <Link 
                          to="/host/dashboard" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-4 py-2 hover:bg-[#007BFF]/10 flex items-center space-x-3 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#007BFF]" />
                          <span className="text-[#E0E0E0]">Host Dashboard</span>
                        </Link>
                        <Link 
                          to="/host/add-car" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-4 py-2 hover:bg-[#007BFF]/10 flex items-center space-x-3 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-[#007BFF]" />
                          <span className="text-[#E0E0E0]">Add Vehicle</span>
                        </Link>
                      </>
                    )}
                    
                    <hr className="my-2 border-[#8C8C8C]/30" />
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-[#EF4444]/10 flex items-center space-x-3 text-[#EF4444] transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-[#E0E0E0] hover:text-[#007BFF] font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup"
                  className="bg-[#007BFF] hover:bg-[#0056b3] text-[#FFFFFF] font-semibold px-6 py-2 rounded-lg transition-all hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-[#E0E0E0] hover:text-[#007BFF] focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-[#8C8C8C]/30 mt-2">
            <div className="flex flex-col space-y-3 pt-4">
              <Link 
                to="/vehicles" 
                onClick={toggleMenu}
                className="text-[#E0E0E0] hover:text-[#007BFF] font-medium text-left transition-colors"
              >
                Browse Vehicles
              </Link>
              <button 
                onClick={() => {
                  handleBecomeHost();
                  toggleMenu();
                }}
                className="text-[#E0E0E0] hover:text-[#007BFF] font-medium text-left transition-colors"
              >
                Become a Host
              </button>
              <hr className="my-2 border-[#8C8C8C]/30" />
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    onClick={toggleMenu}
                    className="text-[#E0E0E0] hover:text-[#007BFF] font-medium text-left flex items-center space-x-2 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>

                  <Link 
                    to="/my-bookings" 
                    onClick={toggleMenu}
                    className="text-[#E0E0E0] hover:text-[#007BFF] font-medium text-left flex items-center space-x-2 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>My Bookings</span>
                  </Link>
                  
                  {user.role === 'host' && (
                    <>
                      <Link 
                        to="/host/dashboard" 
                        onClick={toggleMenu}
                        className="text-[#E0E0E0] hover:text-[#007BFF] font-medium text-left flex items-center space-x-2 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Host Dashboard</span>
                      </Link>
                      <Link 
                        to="/host/add-car" 
                        onClick={toggleMenu}
                        className="text-[#E0E0E0] hover:text-[#007BFF] font-medium text-left flex items-center space-x-2 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Add Vehicle</span>
                      </Link>
                    </>
                  )}
                  
                  <button 
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="text-[#EF4444] hover:text-[#EF4444]/80 font-medium text-left flex items-center space-x-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={toggleMenu}
                    className="text-[#E0E0E0] hover:text-[#007BFF] font-medium text-left transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup"
                    onClick={toggleMenu}
                    className="bg-[#007BFF] hover:bg-[#0056b3] text-[#FFFFFF] font-semibold px-6 py-2 rounded-lg w-full text-center transition-all"
                  >
                    Sign Up
                  </Link>
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
