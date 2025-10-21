import { useRef, useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Star, Car, Loader, Camera } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/firebase';

const ProfileCard = ({ currentUser, profileData, setProfileData, setTempData, stats, vehicleCount }) => {
  const fileInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
          await deleteObject(oldPhotoRef).catch(() => {});
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
      await deleteObject(photoRef).catch(() => {});

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

  const statsDisplay = [
    { label: 'Total Trips', value: stats.totalTrips, icon: <Car className="w-5 h-5" /> },
    { label: 'Rating', value: stats.rating || '0', icon: <Star className="w-5 h-5" /> },
    { label: 'Vehicles', value: vehicleCount, icon: <Car className="w-5 h-5" /> }
  ];

  return (
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
  );
};

export default ProfileCard;