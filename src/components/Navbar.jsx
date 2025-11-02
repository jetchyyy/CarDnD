import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Menu, X, User, LogOut, Settings, LayoutDashboard, PlusCircle, Calendar, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/Authcontext';
import { listenToUserChats, getUnreadMessageCount } from '../utils/chatService';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, logout } = useAuth(); // Added loading from useAuth
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center cursor-pointer group">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                scrolled 
                  ? 'bg-gradient-to-br from-[#0077B6] to-[#00B4D8] shadow-md' 
                  : 'bg-white shadow-lg'
              } group-hover:scale-110 group-hover:rotate-3`}>
                <img src="/ParentaIcon.png" alt="Parenta Logo" className="w-8 h-8 object-contain" />
              </div>
              <span className={`text-3xl font-extrabold tracking-tight transition-colors duration-300 ${
                scrolled 
                  ? 'text-[#0077B6]' 
                  : 'text-white drop-shadow-lg'
              }`}>
                Parenta
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/vehicles" 
              className={`font-semibold transition-all duration-300 hover:scale-105 ${
                scrolled 
                  ? 'text-gray-700 hover:text-[#0077B6]' 
                  : 'text-white hover:text-[#FFD60A] drop-shadow-md'
              }`}
            >
              Browse Vehicles
            </Link>
            <button 
              onClick={handleBecomeHost}
              className={`font-semibold transition-all duration-300 hover:scale-105 ${
                scrolled 
                  ? 'text-gray-700 hover:text-[#0077B6]' 
                  : 'text-white hover:text-[#FFD60A] drop-shadow-md'
              }`}
            >
              Become a Host
            </button>
            {!loading && user && (
              <Link 
                to="/chats" 
                className={`relative font-semibold transition-all duration-300 flex items-center gap-2 hover:scale-105 ${
                  scrolled 
                    ? 'text-gray-700 hover:text-[#0077B6]' 
                    : 'text-white hover:text-[#FFD60A] drop-shadow-md'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
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
              <div className={`flex items-center space-x-2 rounded-full px-4 py-2 ${
                scrolled ? 'bg-gray-100' : 'bg-white/20 backdrop-blur-sm'
              }`}>
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
              </div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className={`flex items-center space-x-3 rounded-full px-5 py-2.5 transition-all duration-300 transform hover:scale-105 ${
                    scrolled 
                      ? 'bg-gradient-to-r from-[#0077B6] to-[#00B4D8] hover:from-[#023E8A] hover:to-[#0077B6] text-white shadow-md' 
                      : 'bg-white/95 backdrop-blur-sm hover:bg-white text-gray-900 shadow-xl'
                  }`}
                >
                  {user.photoUrl ? (
                    <img 
                      src={user.photoUrl} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white/50"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      scrolled ? 'bg-white/20' : 'bg-[#0077B6]'
                    }`}>
                      <User className={`w-5 h-5 ${scrolled ? 'text-white' : 'text-white'}`} />
                    </div>
                  )}
                  <span className="font-semibold">{user.name}</span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-2 border border-gray-200/50 overflow-hidden">
                    <Link 
                      to="/profile" 
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-left px-5 py-3 hover:bg-gradient-to-r hover:from-[#0077B6]/10 hover:to-[#00B4D8]/10 flex items-center space-x-3 transition-all duration-200 group"
                    >
                      <User className="w-5 h-5 text-[#0077B6] group-hover:scale-110 transition-transform" />
                      <span className="text-gray-700 font-medium">Profile</span>
                    </Link>

                    <Link 
                      to="/my-bookings" 
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-left px-5 py-3 hover:bg-gradient-to-r hover:from-[#0077B6]/10 hover:to-[#00B4D8]/10 flex items-center space-x-3 transition-all duration-200 group"
                    >
                      <Calendar className="w-5 h-5 text-[#0077B6] group-hover:scale-110 transition-transform" />
                      <span className="text-gray-700 font-medium">My Bookings</span>
                    </Link>

                    <Link 
                      to="/chats" 
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full text-left px-5 py-3 hover:bg-gradient-to-r hover:from-[#0077B6]/10 hover:to-[#00B4D8]/10 flex items-center space-x-3 relative transition-all duration-200 group"
                    >
                      <MessageCircle className="w-5 h-5 text-[#0077B6] group-hover:scale-110 transition-transform" />
                      <span className="text-gray-700 font-medium">Messages</span>
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                    
                    {user.role === 'host' && (
                      <>
                        <hr className="my-2 border-gray-200/50" />
                        <Link 
                          to="/host/dashboard" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-5 py-3 hover:bg-gradient-to-r hover:from-[#0077B6]/10 hover:to-[#00B4D8]/10 flex items-center space-x-3 transition-all duration-200 group"
                        >
                          <LayoutDashboard className="w-5 h-5 text-[#0077B6] group-hover:scale-110 transition-transform" />
                          <span className="text-gray-700 font-medium">Host Dashboard</span>
                        </Link>
                        <Link 
                          to="/host/add-car" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-5 py-3 hover:bg-gradient-to-r hover:from-[#0077B6]/10 hover:to-[#00B4D8]/10 flex items-center space-x-3 transition-all duration-200 group"
                        >
                          <PlusCircle className="w-5 h-5 text-[#0077B6] group-hover:scale-110 transition-transform" />
                          <span className="text-gray-700 font-medium">Add Vehicle</span>
                        </Link>
                      </>
                    )}
                    
                    <hr className="my-2 border-gray-200/50" />
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-3 hover:bg-red-50 flex items-center space-x-3 text-red-600 transition-all duration-200 group"
                    >
                      <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    scrolled 
                      ? 'text-gray-700 hover:text-[#0077B6] hover:bg-gray-100' 
                      : 'text-white hover:text-[#FFD60A] hover:bg-white/10 backdrop-blur-sm drop-shadow-md'
                  }`}
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup"
                  className={`font-bold px-8 py-2.5 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 ${
                    scrolled 
                      ? 'bg-gradient-to-r from-[#0077B6] to-[#00B4D8] hover:from-[#023E8A] hover:to-[#0077B6] text-white' 
                      : 'bg-[#FFD60A] hover:bg-[#ffd60a]/90 text-[#023E8A] shadow-xl'
                  }`}
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
              className={`p-2 rounded-lg transition-all duration-300 ${
                scrolled 
                  ? 'text-gray-700 hover:text-[#0077B6] hover:bg-gray-100' 
                  : 'text-white hover:text-[#FFD60A] hover:bg-white/10 backdrop-blur-sm'
              }`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`md:hidden pb-6 border-t mt-2 transition-all duration-300 ${
            scrolled 
              ? 'border-gray-200/50 bg-white/50 backdrop-blur-lg' 
              : 'border-white/20 bg-white/10 backdrop-blur-md'
          }`}>
            <div className="flex flex-col space-y-3 pt-6">
              <Link 
                to="/vehicles" 
                onClick={toggleMenu}
                className={`font-semibold text-left px-4 py-2.5 rounded-lg transition-all duration-300 ${
                  scrolled 
                    ? 'text-gray-700 hover:text-[#0077B6] hover:bg-gray-100' 
                    : 'text-white hover:text-[#FFD60A] hover:bg-white/10'
                }`}
              >
                Browse Vehicles
              </Link>
              <button 
                onClick={() => {
                  handleBecomeHost();
                  toggleMenu();
                }}
                className={`font-semibold text-left px-4 py-2.5 rounded-lg transition-all duration-300 ${
                  scrolled 
                    ? 'text-gray-700 hover:text-[#0077B6] hover:bg-gray-100' 
                    : 'text-white hover:text-[#FFD60A] hover:bg-white/10'
                }`}
              >
                Become a Host
              </button>
              <hr className={`my-2 ${scrolled ? 'border-gray-200/50' : 'border-white/20'}`} />
              {loading ? (
                // Loading skeleton for mobile menu
                <div className="flex flex-col space-y-3 px-4">
                  <div className="h-10 bg-gray-200/50 rounded-lg animate-pulse"></div>
                  <div className="h-10 bg-gray-200/50 rounded-lg animate-pulse"></div>
                </div>
              ) : user ? (
                <>
                  <Link 
                    to="/profile" 
                    onClick={toggleMenu}
                    className={`font-semibold text-left flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                      scrolled 
                        ? 'text-gray-700 hover:text-[#0077B6] hover:bg-gray-100' 
                        : 'text-white hover:text-[#FFD60A] hover:bg-white/10'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>

                  <Link 
                    to="/my-bookings" 
                    onClick={toggleMenu}
                    className={`font-semibold text-left flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                      scrolled 
                        ? 'text-gray-700 hover:text-[#0077B6] hover:bg-gray-100' 
                        : 'text-white hover:text-[#FFD60A] hover:bg-white/10'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                    <span>My Bookings</span>
                  </Link>

                  <Link 
                    to="/chats" 
                    onClick={toggleMenu}
                    className={`font-semibold text-left flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-300 relative ${
                      scrolled 
                        ? 'text-gray-700 hover:text-[#0077B6] hover:bg-gray-100' 
                        : 'text-white hover:text-[#FFD60A] hover:bg-white/10'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  
                  {user.role === 'host' && (
                    <>
                      <hr className={`my-2 ${scrolled ? 'border-gray-200/50' : 'border-white/20'}`} />
                      <Link 
                        to="/host/dashboard" 
                        onClick={toggleMenu}
                        className={`font-semibold text-left flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                          scrolled 
                            ? 'text-gray-700 hover:text-[#0077B6] hover:bg-gray-100' 
                            : 'text-white hover:text-[#FFD60A] hover:bg-white/10'
                        }`}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Host Dashboard</span>
                      </Link>
                      <Link 
                        to="/host/add-car" 
                        onClick={toggleMenu}
                        className={`font-semibold text-left flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                          scrolled 
                            ? 'text-gray-700 hover:text-[#0077B6] hover:bg-gray-100' 
                            : 'text-white hover:text-[#FFD60A] hover:bg-white/10'
                        }`}
                      >
                        <PlusCircle className="w-5 h-5" />
                        <span>Add Vehicle</span>
                      </Link>
                    </>
                  )}
                  
                  <button 
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="text-red-600 hover:text-red-700 font-semibold text-left flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-red-50 transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={toggleMenu}
                    className={`font-semibold text-left px-4 py-2.5 rounded-lg transition-all duration-300 ${
                      scrolled 
                        ? 'text-gray-700 hover:text-[#0077B6] hover:bg-gray-100' 
                        : 'text-white hover:text-[#FFD60A] hover:bg-white/10'
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup"
                    onClick={toggleMenu}
                    className={`font-bold px-6 py-3 rounded-xl w-full text-center transition-all duration-300 shadow-lg ${
                      scrolled 
                        ? 'bg-gradient-to-r from-[#0077B6] to-[#00B4D8] hover:from-[#023E8A] hover:to-[#0077B6] text-white' 
                        : 'bg-[#FFD60A] hover:bg-[#ffd60a]/90 text-[#023E8A]'
                    }`}
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