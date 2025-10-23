import { useMemo } from 'react';
import { useAuth } from '../context/Authcontext';

export const useProfileCompletion = () => {
  const { user } = useAuth();

  const profileStatus = useMemo(() => {
    if (!user) {
      return {
        isComplete: true,
        missingFields: [],
        needsPhone: false,
        needsLocation: false,
        needsIDVerification: false
      };
    }

    const missingFields = [];
    const needsPhone = !user.phone || user.phone.trim() === '';
    const needsLocation = !user.location || user.location.trim() === '';

    const idVerificationStatus = user.idVerificationStatus;
    const isIDVerified = 
      idVerificationStatus === 'approved' || 
      !!user.idVerifiedAt; // Treat presence of timestamp as verified

    // Only require ID verification if not yet approved
    const needsIDVerification = !isIDVerified && idVerificationStatus !== 'pending';

    if (needsPhone) missingFields.push('phone');
    if (needsLocation) missingFields.push('location');
    if (needsIDVerification) missingFields.push('idVerification');

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      needsPhone,
      needsLocation,
      needsIDVerification,
      idVerificationStatus
    };
  }, [user]);

  return profileStatus;
};
