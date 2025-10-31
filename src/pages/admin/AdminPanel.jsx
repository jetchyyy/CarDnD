import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/Authcontext';
import { Menu, X, LogOut, LayoutDashboard, Users, Car, Calendar, CreditCard, Settings, FileText, AlertCircle } from 'lucide-react';

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Listings', path: '/admin/listings', icon: Car },
    { label: 'Bookings', path: '/admin/bookings', icon: Calendar },
    { label: 'Payouts', path: '/admin/payouts', icon: CreditCard },
    { label: 'Reports', path: '/admin/reports', icon: AlertCircle },
    { label: 'Transactions', path: '/admin/transactions', icon: CreditCard },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
     { label: 'ID Verification', path: '/admin/id-verification', icon: FileText },
    { label: 'Refunds', path: '/admin/refunds', icon: FileText },

  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 fixed h-screen overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin Dashboard</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 transition ${
                  isActive(item.path)
                    ? 'bg-blue-600 border-l-4 border-blue-400'
                    : 'hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-3 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300`}>
        {/* Top Bar */}
        <div className="bg-white shadow p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.email}</span>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 overflow-auto h-[calc(100vh-80px)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}