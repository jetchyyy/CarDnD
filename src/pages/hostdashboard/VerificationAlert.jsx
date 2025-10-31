// pages/HostDashboard/components/VerificationAlert.jsx
import { useNavigate } from 'react-router-dom';
import { Lock, X } from 'lucide-react';

const VerificationAlert = ({ show, onClose, isPending, needsVerification }) => {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg shadow-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold text-amber-900">
              {isPending ? 'ID Verification Pending' : 'ID Verification Required'}
            </h3>
            <p className="mt-1 text-sm text-amber-700">
              {isPending 
                ? 'Your ID is currently being reviewed. You can add vehicles once your verification is approved (usually within 24-48 hours).'
                : 'You need to verify your ID before you can list vehicles on our platform.'}
            </p>
            {needsVerification && (
              <button
                onClick={() => {
                  onClose();
                  navigate('/profile');
                }}
                className="mt-2 text-sm font-medium text-amber-800 hover:text-amber-900 underline"
              >
                Verify ID Now
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 text-amber-400 hover:text-amber-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationAlert;