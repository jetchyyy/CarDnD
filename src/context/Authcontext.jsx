import { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { logoutSession, loginSession } from '../utils/session';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set loading to true initially
    setLoading(true);
    
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user document from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser(userData);
          } else {
            // If user document doesn't exist, create a basic one
            const newUser = createUserDocument(
              firebaseUser.uid,
              firebaseUser.email,
              firebaseUser.displayName || 'User',
              firebaseUser.photoURL,
              'guest'
            );
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser(newUser);
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Session check interval - only check if user exists
    const interval = setInterval(async () => {
      // Only run session check if there's an authenticated user
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await logoutSession();
        } catch (error) {
          console.error('Session check error:', error);
        }
      }
    }, 6000);

    // Cleanup subscription and checking of auth
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Helper function to create user document structure
  const createUserDocument = (uid, email, name, photoUrl = null, role = 'guest') => {
    return {
      userId: uid,
      name,
      email,
      role, // 'host' or 'guest'
      photoUrl,
      createdAt: new Date().toISOString()
    };
  };

  const login = async (email, password) => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        setUser(userDoc.data());
      }
      
      // Set session with 7 days expiry
      loginSession();
      
      return { success: true };
    } catch (error) {
      // Only log unexpected errors
      if (error.code !== 'auth/wrong-password' && 
          error.code !== 'auth/user-not-found' && 
          error.code !== 'auth/invalid-email' &&
          error.code !== 'auth/invalid-credential') {
        console.error('Unexpected login error:', error);
      }
      return { success: false, error: error.code || error.message, errorCode: error.code };
    }
  };

  const signup = async (email, password, fullName, role = 'guest') => {
    try {
      // Set persistence before creating user
      await setPersistence(auth, browserLocalPersistence);
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile with display name
      await updateFirebaseProfile(userCredential.user, {
        displayName: fullName
      });
      
      // Create user document in Firestore
      const newUser = createUserDocument(
        userCredential.user.uid,
        email,
        fullName,
        null,
        role
      );
      
      // Wait for the document to be created
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      
      // Set user state immediately and wait a bit for it to propagate
      setUser(newUser);
      
      // Set session with 7 days expiry
      loginSession();
      
      // Wait for the auth state to fully update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { success: true, user: newUser };
    } catch (error) {
      // Only log unexpected errors, not common user errors
      if (error.code !== 'auth/email-already-in-use' && 
          error.code !== 'auth/weak-password' && 
          error.code !== 'auth/invalid-email') {
        console.error('Unexpected signup error:', error);
      }
      
      // Return the Firebase error code for better error handling
      return { 
        success: false, 
        error: error.code || error.message,
        errorCode: error.code 
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem("Session");
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const googleSignIn = async (role = 'guest') => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document for first-time Google sign-in
        const newUser = createUserDocument(
          result.user.uid,
          result.user.email,
          result.user.displayName,
          result.user.photoURL,
          role
        );
        await setDoc(doc(db, 'users', result.user.uid), newUser);
        setUser(newUser);
      } else {
        setUser(userDoc.data());
      }
      
      // Set session with 7 days expiry
      loginSession();
      
      return { success: true };
    } catch (error) {
      // Only log unexpected errors
      if (error.code !== 'auth/popup-closed-by-user' && 
          error.code !== 'auth/cancelled-popup-request' &&
          error.code !== 'auth/popup-blocked') {
        console.error('Unexpected Google sign-in error:', error);
      }
      return { 
        success: false, 
        error: error.code || error.message,
        errorCode: error.code 
      };
    }
  };

  const switchRole = async (newRole) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };
      
      // Update role in Firestore
      await updateDoc(doc(db, 'users', user.userId), { 
        role: newRole 
      });
      
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Switch role error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };
      
      // Update user document in Firestore
      await updateDoc(doc(db, 'users', user.userId), updates);
      
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    googleSignIn,
    switchRole,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};