import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Menu, X, User, LogOut, Settings, LayoutDashboard, PlusCircle, Calendar, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/Authcontext';
import { listenToUserChats, getUnreadMessageCount } from '../utils/chatService';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth(); // Added loading from useAuth
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Listen to user's chats for unread messages
  useEffect(() => {
    if (!user || loading) {
      setUnreadCount(0);
      return;
    }

    let unsubscribe;
    const userId = user.userId;
    
    if (!userId) {
      return;
    }
    
    try {
      unsubscribe = listenToUserChats(userId, (chats) => {
        const count = getUnreadMessageCount(userId, chats);
        
        // Send browser notification if unread count increased
        if (count > previousUnreadCount && 'Notification' in window && Notification.permission === 'granted') {
          const newMessages = count - previousUnreadCount;
          new Notification('New Message', {
            body: `You have ${newMessages} new message${newMessages > 1 ? 's' : ''}`,
            icon: '/favicon.ico',
            tag: 'new-message',
          });
        }
        
        setUnreadCount(count);
        setPreviousUnreadCount(count);
      });
    } catch (error) {
      console.error('Error listening to chats:', error);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, loading, previousUnreadCount]);

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
            {!loading && user && (
              <Link 
                to="/chats" 
                className="relative text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              // Loading skeleton for user section
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
              </div>
            ) : user ? (
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

                    <Link 
                      to="/my-bookings" 
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3"
                    >
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">My Bookings</span>
                    </Link>

                    <Link 
                      to="/chats" 
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3 relative"
                    >
                      <MessageCircle className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Messages</span>
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                    
                    {user.role === 'host' && (
                      <>
                        <hr className="my-2" />
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
              {loading ? (
                // Loading skeleton for mobile menu
                <div className="flex flex-col space-y-3">
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : user ? (
                <>
                  <Link 
                    to="/profile" 
                    onClick={toggleMenu}
                    className="text-gray-700 hover:text-blue-600 font-medium text-left flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>

                  <Link 
                    to="/my-bookings" 
                    onClick={toggleMenu}
                    className="text-gray-700 hover:text-blue-600 font-medium text-left flex items-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>My Bookings</span>
                  </Link>

                  <Link 
                    to="/chats" 
                    onClick={toggleMenu}
                    className="text-gray-700 hover:text-blue-600 font-medium text-left flex items-center space-x-2 relative"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  
                  {user.role === 'host' && (
                    <>
                      <hr className="my-2" />
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