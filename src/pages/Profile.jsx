import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Edit, Save, Calendar, Star, Car, Loader, Camera, CreditCard, CheckCircle } from 'lucide-react';
import { auth } from '../firebase/firebase';
import { db, storage } from '../firebase/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import PayoutMethods from '../components/PayoutMethods';

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
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [payoutsLoading, setPayoutsLoading] = useState(true);
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

          setStats({
            totalTrips: userData.totalTrips || 0,
            rating: userData.rating || 0,
            vehicles: userData.vehicles || 0
          });
        } else {
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
        
        bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookingHistory(bookings.slice(0, 10));
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPayouts = async () => {
      try {
        const q = query(
          collection(db, 'payoutTransactions'),
          where('hostId', '==', currentUser.uid),
          where('status', '==', 'completed')
        );
        const snapshot = await getDocs(q);

        const payouts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        payouts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPayoutHistory(payouts);
      } catch (error) {
        console.error('Error fetching payouts:', error);
      } finally {
        setPayoutsLoading(false);
      }
    };

    fetchProfile();
    fetchBookings();
    fetchVehicleCount();
    fetchPayouts();
  }, [currentUser, navigate]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

      const photoRef = ref(storage, `profilePhotos/${currentUser.uid}/${Date.now()}`);
      await uploadBytes(photoRef, file);
      const photoUrl = await getDownloadURL(photoRef);

      await updateDoc(doc(db, 'users', currentUser.uid), {
        photoUrl: photoUrl,
        updatedAt: new Date().toISOString()
      });

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
      const photoRef = ref(storage, `profilePhotos/${currentUser.uid}/${profileData.photoUrl.split('/').pop().split('?')[0]}`);
      await deleteObject(photoRef).catch(() => {
        // File might not exist
      });

      await updateDoc(doc(db, 'users', currentUser.uid), {
        photoUrl: '',
        updatedAt: new Date().toISOString()
      });

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

              {profileData.bio && (
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <p className="text-sm text-gray-600 italic">"{profileData.bio}"</p>
                </div>
              )}

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
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Profile */}
            <div className="bg-white rounded-xl shadow-md p-6">
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

            {/* Payout Methods */}
            <PayoutMethods />

            {/* Payout History */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payout History</h2>

              {payoutsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : payoutHistory.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No payouts yet</p>
                  <p className="text-gray-400 text-sm">Your payouts will appear here once processed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600 mb-1">Total Payouts</p>
                      <p className="text-2xl font-bold text-green-700">
                        ₱{payoutHistory.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Number of Payouts</p>
                      <p className="text-2xl font-bold text-blue-700">{payoutHistory.length}</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-sm text-gray-600 mb-1">Average Payout</p>
                      <p className="text-2xl font-bold text-purple-700">
                        ₱{Math.round(payoutHistory.reduce((sum, p) => sum + (p.amount || 0), 0) / payoutHistory.length).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Payouts List */}
                  <div className="border-t border-gray-200 pt-6 space-y-3">
                    {payoutHistory.map((payout, index) => (
                      <div
                        key={payout.id}
                        className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">Payout #{payoutHistory.length - index}</h3>
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Completed
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                              <div>
                                <p className="text-xs text-gray-600 mb-1">GCash Account</p>
                                <p className="text-sm font-medium text-gray-900">{payout.accountName}</p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-600 mb-1">Reference Number</p>
                                <p className="text-sm font-mono font-medium text-gray-900">{payout.referenceNumber}</p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-600 mb-1">Date Processed</p>
                                <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  {new Date(payout.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-600 mb-1">Time Processed</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {new Date(payout.createdAt).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>

                            {payout.notes && (
                              <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                                <p className="text-xs text-gray-600 mb-1">Notes</p>
                                <p className="text-sm text-gray-700">{payout.notes}</p>
                              </div>
                            )}

                            {payout.bookingIds && payout.bookingIds.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs text-gray-600 mb-2">Bookings Included ({payout.bookingIds.length})</p>
                                <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded break-all">
                                  {payout.bookingIds.join(', ')}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right ml-4 flex-shrink-0">
                          <p className="text-3xl font-bold text-green-600">
                            ₱{(payout.amount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  {bookingHistory.map(bookings => (
                    <div
                      key={bookings.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Car className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{bookings.vehicleName}</h3>
                          <p className="text-sm text-gray-600">{bookings.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{bookings.amount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          bookings.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                          bookings.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          bookings.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {bookings.status}
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