// utils/verificationHelper.js

/**
 * Check if user can perform actions that require ID verification
 */
export const canPerformAction = (user, action) => {
  if (!user) return false;
  
  const status = user.idVerificationStatus;
  
  // Define which actions require verification
  const requiresVerification = ['book', 'add_vehicle', 'message_host'];
  
  if (!requiresVerification.includes(action)) {
    return true; // Action doesn't require verification
  }
  
  // Only approved users can perform these actions
  return status === 'approved';
};

/**
 * Get verification status details
 */
export const getVerificationStatus = (user) => {
  if (!user) {
    return {
      status: 'not_logged_in',
      canBook: false,
      canAddVehicle: false,
      message: 'Please log in to continue',
      requiresAction: true
    };
  }
  
  const status = user.idVerificationStatus;
  
  switch (status) {
    case 'approved':
      return {
        status: 'approved',
        canBook: true,
        canAddVehicle: true,
        message: 'Your ID is verified',
        requiresAction: false
      
      };
      
    case 'pending':
      return {
        status: 'pending',
        canBook: false,
        canAddVehicle: false,
        message: 'Your ID verification is pending review (24-48 hours)',
        requiresAction: false
      };
      
    case 'rejected':
      return {
        status: 'rejected',
        canBook: false,
        canAddVehicle: false,
        message: 'Your ID verification was rejected. Please try again.',
        requiresAction: true,
        rejectionReason: user.idRejectionReason
      };
      
    default: // 'idle' or undefined
      return {
        status: 'not_verified',
        canBook: false,
        canAddVehicle: false,
        message: 'Please verify your ID to continue',
        requiresAction: true
      };
  }
};

/**
 * Get user-friendly status badge info
 */
export const getStatusBadge = (user) => {
  const verificationStatus = getVerificationStatus(user);
  
  const badges = {
    approved: {
      text: 'Verified',
      color: 'bg-green-100 text-green-800',
      icon: '✓'
    },
    pending: {
      text: 'Pending Review',
      color: 'bg-yellow-100 text-yellow-800',
      icon: '⏳'
    },
    rejected: {
      text: 'Rejected',
      color: 'bg-red-100 text-red-800',
      icon: '✗'
    },
    not_verified: {
      text: 'Not Verified',
      color: 'bg-gray-100 text-gray-800',
      icon: '!'
    },
    not_logged_in: {
      text: 'Guest',
      color: 'bg-gray-100 text-gray-800',
      icon: ''
    }
  };
  
  return badges[verificationStatus.status];
};

/**
 * Get action-specific error message
 */
export const getActionErrorMessage = (user, action) => {
  const verificationStatus = getVerificationStatus(user);
  
  if (verificationStatus.status === 'not_logged_in') {
    return 'Please log in to continue';
  }
  
  const actionMessages = {
    book: {
      pending: 'You cannot book vehicles while your ID verification is pending. This usually takes 24-48 hours.',
      not_verified: 'You need to verify your ID before booking vehicles.',
      rejected: 'Your ID verification was rejected. Please submit a new ID to book vehicles.'
    },
    add_vehicle: {
      pending: 'You cannot list vehicles while your ID verification is pending. This usually takes 24-48 hours.',
      not_verified: 'You need to verify your ID before listing vehicles on our platform.',
      rejected: 'Your ID verification was rejected. Please submit a new ID to list vehicles.'
    },
    message_host: {
      pending: 'You cannot message hosts while your ID verification is pending.',
      not_verified: 'You need to verify your ID before messaging hosts.',
      rejected: 'Your ID verification was rejected. Please submit a new ID to message hosts.'
    }
  };
  
  return actionMessages[action]?.[verificationStatus.status] || verificationStatus.message;
};

/**
 * Check if user should see verification modal
 */
export const shouldShowVerificationModal = (user) => {
  if (!user) return false;
  
  const status = user.idVerificationStatus;
  return !status || status === 'idle' || status === 'rejected';
};

export default {
  canPerformAction,
  getVerificationStatus,
  getStatusBadge,
  getActionErrorMessage,
  shouldShowVerificationModal
};