import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Edit, Save, Calendar, Star, Car, Loader, Camera, X } from 'lucide-react';
import { auth } from '../firebase/firebase';
import { db, storage } from '../firebase/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const Profile = () => {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const fileInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    joinedDate: '',
    photoUrl: ''
  });
  
  const [tempData, setTempData] = useState({ ...profileData });
  const [bookingHistory, setBookingHistory] = useState([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    rating: 0,
    vehicles: 0
  });
  const [saving, setSaving] = useState(false);
  const [vehicleCount, setVehicleCount] = useState(0);

  // Fetch user profile from Firestore
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const profileInfo = {
            fullName: userData.name || '',
            email: userData.email || currentUser.email || '',
            phone: userData.phone || '',
            location: userData.location || '',
            bio: userData.bio || '',
            photoUrl: userData.photoUrl || '',
            joinedDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'
          };
          setProfileData(profileInfo);
          setTempData(profileInfo);

          // Set stats
          setStats({
            totalTrips: userData.totalTrips || 0,
            rating: userData.rating || 0,
            vehicles: userData.vehicles || 0
          });
        } else {
          // Create default profile if doesn't exist
          const newProfile = {
            fullName: currentUser.displayName || '',
            email: currentUser.email || '',
            phone: '',
            location: '',
            bio: '',
            photoUrl: '',
            joinedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
          };
          setProfileData(newProfile);
          setTempData(newProfile);

          // Initialize in Firestore
          await updateDoc(doc(db, 'users', currentUser.uid), {
            name: currentUser.displayName || '',
            email: currentUser.email || '',
            createdAt: new Date().toISOString()
          }).catch(() => {
            // Document might not exist yet
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    const fetchVehicleCount = async () => {
      try {
        // Check if user is a host by querying vehicles collection
        const q = query(
          collection(db, 'vehicles'),
          where('hostId', '==', currentUser.uid)
        );
        const snapshot = await getDocs(q);
        setVehicleCount(snapshot.size);
      } catch (error) {
        console.error('Error fetching vehicle count:', error);
      }
    };

    const fetchBookings = async () => {
      try {
        const q = query(
          collection(db, 'bookings'),
          where('guestId', '==', currentUser.uid)
        );
        const snapshot = await getDocs(q);
        
        const bookings = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            vehicleName: data.vehicleDetails?.title || 'Vehicle',
            type: data.vehicleDetails?.type || 'car',
            date: `${new Date(data.startDate).toLocaleDateString()} to ${new Date(data.endDate).toLocaleDateString()}`,
            amount: `₱${data.totalPrice?.toLocaleString() || '0'}`,
            status: data.status.charAt(0).toUpperCase() + data.status.slice(1)
          };
        });
        
        // Sort by most recent first
        bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookingHistory(bookings.slice(0, 10)); // Show last 10 bookings
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchBookings();
    fetchVehicleCount();
  }, [currentUser, navigate]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      // Delete old photo if exists
      if (profileData.photoUrl) {
        try {
          const oldPhotoRef = ref(storage, `profilePhotos/${currentUser.uid}/old`);
          await deleteObject(oldPhotoRef).catch(() => {
            // File might not exist
          });
        } catch (error) {
          console.error('Error deleting old photo:', error);
        }
      }

      // Upload new photo
      const photoRef = ref(storage, `profilePhotos/${currentUser.uid}/${Date.now()}`);
      await uploadBytes(photoRef, file);
      const photoUrl = await getDownloadURL(photoRef);

      // Update Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        photoUrl: photoUrl,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setProfileData(prev => ({ ...prev, photoUrl }));
      setTempData(prev => ({ ...prev, photoUrl }));
      alert('Profile photo updated successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!profileData.photoUrl) return;
    
    if (!window.confirm('Are you sure you want to remove your profile photo?')) {
      return;
    }

    try {
      // Delete from storage
      const photoRef = ref(storage, `profilePhotos/${currentUser.uid}/${profileData.photoUrl.split('/').pop().split('?')[0]}`);
      await deleteObject(photoRef).catch(() => {
        // File might not exist
      });

      // Update Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        photoUrl: '',
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setProfileData(prev => ({ ...prev, photoUrl: '' }));
      setTempData(prev => ({ ...prev, photoUrl: '' }));
      alert('Profile photo removed successfully!');
    } catch (error) {
      console.error('Error removing photo:', error);
      alert('Failed to remove photo. Please try again.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTempData({ ...profileData });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: tempData.fullName,
        phone: tempData.phone,
        location: tempData.location,
        bio: tempData.bio,
        updatedAt: new Date().toISOString()
      });
      
      setProfileData({ ...tempData });
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempData({ ...profileData });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempData(prev => ({ ...prev, [name]: value }));
  };

  const statsDisplay = [
    { label: 'Total Trips', value: stats.totalTrips, icon: <Car className="w-5 h-5" /> },
    { label: 'Rating', value: stats.rating || '0', icon: <Star className="w-5 h-5" /> },
    { label: 'Vehicles', value: vehicleCount, icon: <Car className="w-5 h-5" /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  {profileData.photoUrl ? (
                    <img 
                      src={profileData.photoUrl} 
                      alt={profileData.fullName}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                      {profileData.fullName.charAt(0) || 'U'}
                    </div>
                  )}
                  
                  <button
                    onClick={handlePhotoClick}
                    disabled={uploadingPhoto}
                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-full transition-colors shadow-lg"
                    title="Change photo"
                  >
                    {uploadingPhoto ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {profileData.photoUrl && (
                  <button
                    onClick={handleRemovePhoto}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {/* Profile Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3 text-gray-700">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="font-semibold truncate">{profileData.fullName || 'User'}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-sm truncate">{profileData.email}</span>
                </div>
                {profileData.phone && (
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">{profileData.phone}</span>
                  </div>
                )}
                {profileData.location && (
                  <div className="flex items-center space-x-3 text-gray-700">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">{profileData.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">Joined {profileData.joinedDate}</span>
                </div>
              </div>

              {/* Bio */}
              {profileData.bio && (
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <p className="text-sm text-gray-600 italic">"{profileData.bio}"</p>
                </div>
              )}

              {/* Stats */}
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {statsDisplay.map((stat, index) => (
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
                      disabled={saving}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>{saving ? 'Saving...' : 'Save'}</span>
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
                    value={profileData.fullName}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Full name cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
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
                    placeholder="Add your phone number"
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
                    placeholder="Add your location"
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
                    placeholder="Tell us about yourself"
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
              {bookingHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No bookings yet</p>
                  <p className="text-gray-400 text-sm">Your bookings will appear here</p>
                </div>
              ) : (
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
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;