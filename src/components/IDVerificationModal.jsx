import { useState, useEffect, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Camera, FileText, Video, ImagePlus, Clock } from 'lucide-react';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/firebase';
import { useAuth } from '../context/Authcontext';

const IDVerificationModal = ({ isOpen, onClose, canClose = false }) => {
  const { user, updateProfile } = useAuth();
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState('');
  const [backPreview, setBackPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [selectedIDType, setSelectedIDType] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [currentSide, setCurrentSide] = useState(null);
  const [stream, setStream] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const idTypes = [
    { value: 'national_id', label: 'National ID (PhilSys)' },
    { value: 'drivers_license', label: "Driver's License" },
    { value: 'passport', label: 'Passport' },
    { value: 'umid', label: 'UMID' },
    { value: 'sss_id', label: 'SSS ID' },
    { value: 'postal_id', label: 'Postal ID' },
    { value: 'voters_id', label: "Voter's ID" },
    { value: 'prc_id', label: 'PRC ID' },
    { value: 'philhealth_id', label: 'PhilHealth ID' },
  ];

  useEffect(() => {
    if (user?.idVerificationStatus === 'approved') {
      setVerificationStatus('success');
    } else if (user?.idVerificationStatus === 'pending') {
      setVerificationStatus('pending');
    } else if (user?.idVerificationStatus === 'rejected') {
      setVerificationStatus('rejected');
    }
  }, [user]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (side) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      
      setStream(mediaStream);
      setCurrentSide(side);
      setShowCamera(true);
      setError('');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions or use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setCurrentSide(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], `id-${currentSide}-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const reader = new FileReader();
      
      reader.onloadend = () => {
        if (currentSide === 'front') {
          setFrontImage(file);
          setFrontPreview(reader.result);
        } else {
          setBackImage(file);
          setBackPreview(reader.result);
        }
      };
      
      reader.readAsDataURL(file);
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  const handleImageChange = (e, side) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === 'front') {
        setFrontImage(file);
        setFrontPreview(reader.result);
      } else {
        setBackImage(file);
        setBackPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (side) => {
    if (side === 'front') {
      setFrontImage(null);
      setFrontPreview('');
    } else {
      setBackImage(null);
      setBackPreview('');
    }
  };

  const uploadIDImages = async (userId, frontImg, backImg) => {
    const timestamp = Date.now();
    
    const frontRef = ref(storage, `id-verification/${userId}/front-${timestamp}.jpg`);
    await uploadBytes(frontRef, frontImg);
    const frontURL = await getDownloadURL(frontRef);
    
    let backURL = null;
    if (backImg) {
      const backRef = ref(storage, `id-verification/${userId}/back-${timestamp}.jpg`);
      await uploadBytes(backRef, backImg);
      backURL = await getDownloadURL(backRef);
    }
    
    return { frontURL, backURL };
  };

  const verifyID = async () => {
    if (!selectedIDType) {
      setError('Please select your ID type');
      return;
    }

    if (!frontImage) {
      setError('Please upload the front side of your ID');
      return;
    }

    setLoading(true);
    setError('');
    setVerificationStatus('verifying');

    try {
      console.log('Uploading images...');
      const { frontURL, backURL } = await uploadIDImages(user.userId, frontImage, backImage);

      const verificationRef = doc(db, 'idVerifications', user.userId);
      await setDoc(verificationRef, {
        userId: user.userId,
        idType: selectedIDType,
        frontImageURL: frontURL,
        backImageURL: backURL,
        status: 'pending',
        submittedAt: serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null
      });

      const userRef = doc(db, 'users', user.userId);
      await updateDoc(userRef, {
        idVerificationStatus: 'pending',
        idVerificationSubmittedAt: serverTimestamp(),
        idType: selectedIDType,
        updatedAt: serverTimestamp()
      });

      await updateProfile({
        idVerificationStatus: 'pending',
        idType: selectedIDType
      });

      setSuccess('ID submitted successfully! We will review it within 24-48 hours.');
      setVerificationStatus('pending');

      // Allow user to close after 2 seconds when status is pending
      setTimeout(() => {
        // User can now close the modal
      }, 2000);

    } catch (err) {
      console.error('ID verification error:', err);
      setError(err.message || 'Failed to submit ID. Please try again.');
      setVerificationStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Determine if the close button should be shown
  // Show close button if: explicitly allowed (canClose) OR status is pending/success
  const showCloseButton = canClose || verificationStatus === 'pending' || verificationStatus === 'success';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 transform transition-all">
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}

          {showCamera ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Capture {currentSide === 'front' ? 'Front' : 'Back'} Side
                </h3>
                <button
                  onClick={stopCamera}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  Position your ID within the frame. Make sure it's well-lit and all text is readable.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={stopCamera}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capture Photo
                </button>
              </div>
            </div>
          ) : (
            <>
              {verificationStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Verification Complete!
                  </h3>
                  <p className="text-gray-600">
                    Your ID has been successfully verified. You can now book vehicles and list your own.
                  </p>
                </div>
              ) : verificationStatus === 'pending' ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                    <Clock className="w-10 h-10 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Under Review
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Your ID is being reviewed by our team
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    This usually takes 24-48 hours. You'll be notified once the review is complete.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800 font-medium">
                      ⚠️ While your ID is under review, you cannot book vehicles or add your own vehicles to the platform.
                    </p>
                  </div>
                </div>
              ) : verificationStatus === 'rejected' ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Verification Rejected
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {user?.idRejectionReason || 'Your ID verification was rejected. Please try again with a clearer image.'}
                  </p>
                  <button
                    onClick={() => setVerificationStatus('idle')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-green-700 text-sm">{success}</p>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
                      <p className="text-gray-600 text-sm">
                        Please upload a valid government-issued ID to continue
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select ID Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedIDType}
                        onChange={(e) => {
                          setSelectedIDType(e.target.value);
                          setError('');
                        }}
                        disabled={loading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 disabled:bg-gray-100"
                      >
                        <option value="">Choose your ID type...</option>
                        {idTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 font-medium mb-2">Tips for best results:</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Ensure the ID is well-lit and in focus</li>
                        <li>• Capture the entire ID within the frame</li>
                        <li>• Avoid glare or shadows on the ID</li>
                        <li>• Make sure all text is clearly readable</li>
                      </ul>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Front Side of ID <span className="text-red-500">*</span>
                      </label>
                      {!frontPreview ? (
                        <div className="space-y-3">
                          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <ImagePlus className="w-10 h-10 text-gray-400 mb-3" />
                              <p className="text-sm text-gray-600 mb-1">Click to upload front side</p>
                              <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleImageChange(e, 'front')}
                              disabled={loading}
                            />
                          </label>
                          <button
                            onClick={() => startCamera('front')}
                            disabled={loading}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition flex items-center justify-center"
                          >
                            <Video className="w-5 h-5 mr-2" />
                            Use Camera
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={frontPreview}
                            alt="Front ID"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage('front')}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            disabled={loading}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Back Side of ID <span className="text-gray-400">(Optional)</span>
                      </label>
                      {!backPreview ? (
                        <div className="space-y-3">
                          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <ImagePlus className="w-10 h-10 text-gray-400 mb-3" />
                              <p className="text-sm text-gray-600 mb-1">Click to upload back side</p>
                              <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleImageChange(e, 'back')}
                              disabled={loading}
                            />
                          </label>
                          <button
                            onClick={() => startCamera('back')}
                            disabled={loading}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition flex items-center justify-center"
                          >
                            <Video className="w-5 h-5 mr-2" />
                            Use Camera
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={backPreview}
                            alt="Back ID"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage('back')}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            disabled={loading}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={verifyID}
                      disabled={loading || !frontImage || !selectedIDType}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        'Submit for Verification'
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      Your ID will be reviewed by our team within 24-48 hours. We only store verification status, not your ID images permanently.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IDVerificationModal;