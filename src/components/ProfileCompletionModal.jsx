import { useState, useEffect } from 'react';
import { Phone, MapPin, X, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/Authcontext';
import IDVerificationModal from './IDVerificationModal';

const ProfileCompletionModal = ({ isOpen, onClose, canClose = false }) => {
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    phone: '',
    location: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showIDModal, setShowIDModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || '',
        location: user.location || ''
      });

      if (user.phone && user.location && !user.idVerified) {
        setCurrentStep(2);
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+63|0)?9\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Philippine phone number (e.g., 09991234567)';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    } else if (formData.location.length < 3) {
      newErrors.location = 'Location must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const cleanPhone = formData.phone.replace(/\s/g, '');
      
      const userRef = doc(db, 'users', user.userId);
      const updates = {
        phone: cleanPhone,
        location: formData.location.trim(),
        updatedAt: new Date().toISOString()
      };

      await updateDoc(userRef, updates);
      const result = await updateProfile(updates);

      if (result.success) {
        setLoading(false);
        setCurrentStep(2);
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setServerError('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  const handleIDVerificationComplete = () => {
    setShowIDModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            {canClose && currentStep === 2 && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}

            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                  </div>
                  <span className="ml-2 text-sm font-medium hidden sm:inline">Basic Info</span>
                </div>
                <div className="w-12 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium hidden sm:inline">ID Verify</span>
                </div>
              </div>
            </div>

            {currentStep === 1 ? (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Complete Your Profile
                  </h2>
                  <p className="text-gray-600">
                    We need a few details to get you started
                  </p>
                </div>

                {serverError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{serverError}</p>
                  </div>
                )}

                <div className="space-y-5">
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

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center mt-6"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      'Continue to ID Verification'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Verify Your Identity
                  </h2>
                  <p className="text-gray-600">
                    {user?.idVerified 
                      ? 'Your ID has been verified successfully!' 
                      : 'Please verify your identity to continue'
                    }
                  </p>
                </div>

                {user?.idVerified ? (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      All Set!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Your profile is complete and verified
                    </p>
                    <button
                      onClick={onClose}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
                    >
                      Get Started
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>Why verify your ID?</strong>
                      </p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Build trust with other users</li>
                        <li>• Access all platform features</li>
                        <li>• Secure and encrypted process</li>
                      </ul>
                    </div>

                    <button
                      onClick={() => setShowIDModal(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Start Verification
                    </button>

                    {canClose && (
                      <button
                        onClick={onClose}
                        className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 text-sm"
                      >
                        Skip for now
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <IDVerificationModal
        isOpen={showIDModal}
        onClose={handleIDVerificationComplete}
        canClose={false}
      />
    </>
  );
};

export default ProfileCompletionModal;