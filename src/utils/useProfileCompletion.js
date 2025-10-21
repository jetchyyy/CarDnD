import { useMemo } from 'react';
import { useAuth } from '../context/Authcontext';

/**
 * Custom hook to check if user profile is complete
 * @returns {Object} { isComplete, missingFields, needsPhone, needsLocation }
 */
export const useProfileCompletion = () => {
  const { user } = useAuth();

  const profileStatus = useMemo(() => {
    if (!user) {
      return {
        isComplete: true, // Don't show modal if not logged in
        missingFields: [],
        needsPhone: false,
        needsLocation: false
      };
    }

    const missingFields = [];
    const needsPhone = !user.phone || user.phone.trim() === '';
    const needsLocation = !user.location || user.location.trim() === '';

    if (needsPhone) missingFields.push('phone');
    if (needsLocation) missingFields.push('location');

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      needsPhone,
      needsLocation
    };
  }, [user]);

  return profileStatus;
};