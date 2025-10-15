import { useState } from 'react';
import { User, Mail, Phone, MapPin, Edit, Save, Calendar, Star, Car } from 'lucide-react';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: 'Juan Cruz',
    email: 'juan.cruz@email.com',
    phone: '+63 912 345 6789',
    location: 'Cebu City, Philippines',
    bio: 'Car enthusiast and host. Love sharing my vehicles with responsible renters.',
    joinedDate: 'January 2023'
  });

  const [tempData, setTempData] = useState({ ...profileData });

  const stats = [
    { label: 'Total Trips', value: '48', icon: <Car className="w-5 h-5" /> },
    { label: 'Rating', value: '4.9', icon: <Star className="w-5 h-5" /> },
    { label: 'Vehicles', value: '3', icon: <Car className="w-5 h-5" /> }
  ];

  const bookingHistory = [
    {
      id: 1,
      vehicleName: 'Tesla Model 3',
      type: 'car',
      date: 'Oct 10-13, 2025',
      amount: '₱267',
      status: 'Completed'
    },
    {
      id: 2,
      vehicleName: 'Honda Civic',
      type: 'car',
      date: 'Sep 22-25, 2025',
      amount: '₱135',
      status: 'Completed'
    },
    {
      id: 3,
      vehicleName: 'Yamaha NMAX',
      type: 'motorcycle',
      date: 'Sep 15-17, 2025',
      amount: '₱50',
      status: 'Completed'
    }
  ];

  const handleEdit = () => {
    setIsEditing(true);
    setTempData({ ...profileData });
  };

  const handleSave = () => {
    setProfileData({ ...tempData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempData({ ...profileData });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                  {profileData.fullName.charAt(0)}
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Change Photo
                </button>
              </div>

              {/* Profile Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3 text-gray-700">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="font-semibold">{profileData.fullName}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">{profileData.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">{profileData.phone}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">{profileData.location}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">Joined {profileData.joinedDate}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {stats.map((stat, index) => (
                    <div key={index}>
                      <div className="flex justify-center mb-2 text-blue-600">
                        {stat.icon}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-600">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Profile Details and History */}
          <div className="lg:col-span-2">
            {/* Edit Profile */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={isEditing ? tempData.fullName : profileData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={isEditing ? tempData.email : profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={isEditing ? tempData.phone : profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={isEditing ? tempData.location : profileData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={isEditing ? tempData.bio : profileData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows="4"
                    className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Booking History */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking History</h2>
              <div className="space-y-4">
                {bookingHistory.map(booking => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Car className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{booking.vehicleName}</h3>
                        <p className="text-sm text-gray-600">{booking.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{booking.amount}</p>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;