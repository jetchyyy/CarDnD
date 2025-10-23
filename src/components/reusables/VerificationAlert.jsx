import { AlertCircle, Lock, Clock, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../context/Authcontext';
import { getVerificationStatus, getActionErrorMessage } from '../utils/verificationHelper';

/**
 * Reusable component to show verification alerts
 * @param {string} action - The action being attempted ('book', 'add_vehicle', 'message_host')
 * @param {boolean} show - Whether to show the alert
 * @param {function} onClose - Callback when alert is closed
 * @param {function} onVerifyClick - Optional callback when "Verify ID" button is clicked
 */
const VerificationAlert = ({ action = 'book', show = false, onClose, onVerifyClick }) => {
  const { user } = useAuth();
  
  if (!show) return null;
  
  const verificationStatus = getVerificationStatus(user);
  const errorMessage = getActionErrorMessage(user, action);
  
  // Determine icon and color based on status
  const getStatusDisplay = () => {
    switch (verificationStatus.status) {
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-900',
          iconColor: 'text-yellow-600',
          title: 'ID Verification Pending'
        };
      case 'rejected':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          textColor: 'text-red-900',
          iconColor: 'text-red-600',
          title: 'ID Verification Rejected'
        };
      default:
        return {
          icon: <Lock className="w-5 h-5" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-500',
          textColor: 'text-amber-900',
          iconColor: 'text-amber-600',
          title: 'ID Verification Required'
        };
    }
  };
  
  const display = getStatusDisplay();
  
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-slide-down">
      <div className={`${display.bgColor} border-l-4 ${display.borderColor} rounded-lg shadow-lg p-4`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${display.iconColor}`}>
            {display.icon}
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-semibold ${display.textColor}`}>
              {display.title}
            </h3>
            <p className={`mt-1 text-sm ${display.textColor} opacity-90`}>
              {errorMessage}
            </p>
            {verificationStatus.requiresAction && (
              <button
                onClick={() => {
                  onClose?.();
                  onVerifyClick?.();
                }}
                className={`mt-2 text-sm font-medium ${display.textColor} hover:underline`}
              >
                Verify ID Now →
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className={`ml-3 flex-shrink-0 ${display.iconColor} hover:opacity-75`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Inline version for use within cards or smaller components
 */
export const InlineVerificationAlert = ({ action = 'book', className = '' }) => {
  const { user } = useAuth();
  
  const verificationStatus = getVerificationStatus(user);
  const errorMessage = getActionErrorMessage(user, action);
  
  if (verificationStatus.status === 'approved') return null;
  
  const isPending = verificationStatus.status === 'pending';
  
  return (
    <div className={`bg-amber-50 border border-amber-300 rounded-lg p-3 ${className}`}>
      <div className="flex items-start">
        <Lock className="w-4 h-4 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-900">
            {isPending ? 'ID Verification Pending' : 'ID Verification Required'}
          </p>
          <p className="text-xs text-amber-700 mt-1">
            {errorMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Badge version for profile/status displays
 */
export const VerificationBadge = () => {
  const { user } = useAuth();
  const verificationStatus = getVerificationStatus(user);
  
  const getBadgeStyle = () => {
    switch (verificationStatus.status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  const getIcon = () => {
    switch (verificationStatus.status) {
      case 'approved':
        return <CheckCircle className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'rejected':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Lock className="w-3 h-3" />;
    }
  };
  
  const getText = () => {
    switch (verificationStatus.status) {
      case 'approved':
        return 'Verified';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Verified';
    }
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getBadgeStyle()}`}>
      {getIcon()}
      {getText()}
    </span>
  );
};

// Add animation styles
const styles = `
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translate(-50%, -20px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
  .animate-slide-down {
    animation: slide-down 0.3s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default VerificationAlert;