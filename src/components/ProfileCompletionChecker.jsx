import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProfileCompletionModal from './ProfileCompletionModal';
import { useProfileCompletion } from '../utils/useProfileCompletion';
import { useAuth } from '../context/Authcontext';

/**
 * Component that checks if user profile is complete and shows modal if not
 * Should be placed in App.jsx after AuthProvider
 */
const ProfileCompletionChecker = ({ children }) => {
  const { user, loading } = useAuth();
  const { isComplete } = useProfileCompletion();
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();

  // Routes where we should NOT show the profile completion modal
  const excludedRoutes = ['/login', '/signup', '/admin'];

  useEffect(() => {
    // Don't show modal if:
    // 1. Auth is still loading
    // 2. No user is logged in
    // 3. Profile is already complete
    // 4. User is on excluded routes
    if (loading || !user || isComplete) {
      setShowModal(false);
      return;
    }

    // Check if current path is in excluded routes
    const isExcluded = excludedRoutes.some(route => 
      location.pathname.startsWith(route)
    );

    if (!isExcluded) {
      // Small delay to ensure smooth transition after login/signup
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user, isComplete, loading, location.pathname]);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      {children}
      <ProfileCompletionModal 
        isOpen={showModal} 
        onClose={handleCloseModal}
        canClose={false} // User must complete the form (can't close modal)
      />
    </>
  );
};

export default ProfileCompletionChecker;