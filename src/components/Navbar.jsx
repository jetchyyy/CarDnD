import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Menu, X, User, LogOut, Settings, LayoutDashboard, PlusCircle } from 'lucide-react';
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
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center cursor-pointer">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">CarDnD</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/vehicles" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Browse Vehicles
            </Link>
            <button 
              onClick={handleBecomeHost}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
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
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 transition-colors"
                >
                  {user.photoUrl ? (
                    <img 
                      src={user.photoUrl} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="text-gray-700 font-medium">{user.name}</span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                    <Link 
                      to="/profile" 
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3"
                    >
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Profile</span>
                    </Link>
                    
                    {user.role === 'host' && (
                      <>
                        <Link 
                          to="/host/dashboard" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">Host Dashboard</span>
                        </Link>
                        <Link 
                          to="/host/add-car" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3"
                        >
                          <PlusCircle className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">Add Vehicle</span>
                        </Link>
                      </>
                    )}
                    
                    <hr className="my-2" />
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3 text-red-600"
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
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
  to="/signup"
  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
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
              <Link 
                to="/vehicles" 
                onClick={toggleMenu}
                className="text-gray-700 hover:text-blue-600 font-medium text-left"
              >
                Browse Vehicles
              </Link>
              <button 
                onClick={() => {
                  handleBecomeHost();
                  toggleMenu();
                }}
                className="text-gray-700 hover:text-blue-600 font-medium text-left"
              >
                Become a Host
              </button>
              <hr className="my-2" />
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    onClick={toggleMenu}
                    className="text-gray-700 hover:text-blue-600 font-medium text-left flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  
                  {user.role === 'host' && (
                    <>
                      <Link 
                        to="/host/dashboard" 
                        onClick={toggleMenu}
                        className="text-gray-700 hover:text-blue-600 font-medium text-left flex items-center space-x-2"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Host Dashboard</span>
                      </Link>
                      <Link 
                        to="/host/add-car" 
                        onClick={toggleMenu}
                        className="text-gray-700 hover:text-blue-600 font-medium text-left flex items-center space-x-2"
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
                    className="text-red-600 hover:text-red-700 font-medium text-left flex items-center space-x-2"
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
                    className="text-gray-700 hover:text-blue-600 font-medium text-left"
                  >
                    Sign In
                  </Link>
              <Link 
  to="/signup"
  onClick={toggleMenu}
  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg w-full text-center"
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