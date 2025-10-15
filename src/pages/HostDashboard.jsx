import { useState } from 'react';
import { Car, DollarSign, Calendar, TrendingUp, Edit, Trash2, Eye, Plus } from 'lucide-react';

const HostDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      title: 'Total Earnings',
      value: '₱45,230',
      change: '+12.5%',
      icon: <DollarSign className="w-6 h-6" />,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Active Bookings',
      value: '8',
      change: '+3',
      icon: <Calendar className="w-6 h-6" />,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Total Vehicles',
      value: '3',
      change: 'Active',
      icon: <Car className="w-6 h-6" />,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'This Month',
      value: '₱12,450',
      change: '+8.2%',
      icon: <TrendingUp className="w-6 h-6" />,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  const myVehicles = [
    {
      id: 1,
      name: 'Tesla Model 3',
      type: 'car',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400',
      price: 89,
      status: 'Active',
      bookings: 24,
      rating: 4.9,
      earnings: '₱18,450'
    },
    {
      id: 2,
      name: 'Honda Civic',
      type: 'car',
      image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400',
      price: 45,
      status: 'Active',
      bookings: 18,
      rating: 4.8,
      earnings: '₱15,230'
    },
    {
      id: 3,
      name: 'Yamaha NMAX',
      type: 'motorcycle',
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400',
      price: 25,
      status: 'Active',
      bookings: 32,
      rating: 4.7,
      earnings: '₱11,550'
    }
  ];

  const recentBookings = [
    {
      id: 1,
      vehicleName: 'Tesla Model 3',
      customerName: 'John Doe',
      startDate: '2025-10-20',
      endDate: '2025-10-23',
      status: 'Confirmed',
      amount: '₱267'
    },
    {
      id: 2,
      vehicleName: 'Honda Civic',
      customerName: 'Maria Santos',
      startDate: '2025-10-18',
      endDate: '2025-10-20',
      status: 'Ongoing',
      amount: '₱90'
    },
    {
      id: 3,
      vehicleName: 'Yamaha NMAX',
      customerName: 'Pedro Garcia',
      startDate: '2025-10-22',
      endDate: '2025-10-24',
      status: 'Pending',
      amount: '₱50'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Ongoing':
        return 'bg-blue-100 text-blue-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your vehicles and bookings</p>
          </div>
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
            <span>Add Vehicle</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} ${stat.iconColor} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('vehicles')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'vehicles'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Vehicles
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'bookings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Bookings
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    {recentBookings.slice(0, 3).map(booking => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Car className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{booking.vehicleName}</p>
                            <p className="text-sm text-gray-600">
                              {booking.customerName} • {booking.startDate} to {booking.endDate}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{booking.amount}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* My Vehicles Tab */}
            {activeTab === 'vehicles' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Vehicles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myVehicles.map(vehicle => (
                    <div key={vehicle.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48">
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          className="w-full h-full object-cover"
                        />
                        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{vehicle.name}</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-gray-600">Price/day</p>
                            <p className="font-semibold text-gray-900">₱{vehicle.price}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Rating</p>
                            <p className="font-semibold text-gray-900">⭐ {vehicle.rating}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Bookings</p>
                            <p className="font-semibold text-gray-900">{vehicle.bookings}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Earnings</p>
                            <p className="font-semibold text-gray-900">{vehicle.earnings}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <button className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">All Bookings</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vehicle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dates
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentBookings.map(booking => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{booking.vehicleName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900">{booking.customerName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {booking.startDate} - {booking.endDate}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold text-gray-900">{booking.amount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button className="text-blue-600 hover:text-blue-700 font-medium">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;