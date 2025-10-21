import { useState, useEffect } from 'react';
import { Phone, MapPin, X, AlertCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/Authcontext';

const ProfileCompletionModal = ({ isOpen, onClose, canClose = false }) => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    location: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || '',
        location: user.location || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+63|0)?9\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Philippine phone number (e.g., 09991234567)';
    }

    // Location validation
    if (!formData.location) {
      newErrors.location = 'Location is required';
    } else if (formData.location.length < 3) {
      newErrors.location = 'Location must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      // Format phone number (remove spaces and ensure proper format)
      const cleanPhone = formData.phone.replace(/\s/g, '');
      
      // Update Firestore
      const userRef = doc(db, 'users', user.userId);
      const updates = {
        phone: cleanPhone,
        location: formData.location.trim(),
        updatedAt: new Date().toISOString()
      };

      await updateDoc(userRef, updates);

      // Update local user state
      const result = await updateProfile(updates);

      if (result.success) {
        setLoading(false);
        onClose();
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setServerError('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
          {/* Close button - only show if canClose is true */}
          {canClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h2>
            <p className="text-gray-600">
              {canClose 
                ? 'Please add your contact information to continue'
                : 'We need a few more details to get you started'
              }
            </p>
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{serverError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 disabled:bg-gray-100`}
                  placeholder="09991234567"
                />
              </div>
              {errors.phone && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.phone}
                </div>
              )}
            </div>

            {/* Location Field */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 disabled:bg-gray-100`}
                  placeholder="e.g., Cebu City, Talisay, Mandaue"
                />
              </div>
              {errors.location && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.location}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter your city or municipality in Cebu
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center mt-6"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Continue'
              )}
            </button>

            {!canClose && (
              <p className="text-xs text-gray-500 text-center mt-3">
                This information helps us connect you with nearby listings and users
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;