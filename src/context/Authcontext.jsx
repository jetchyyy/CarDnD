import { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { logoutSession } from '../utils/Session';

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
    
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    
      if (firebaseUser) {
        try {
          // Fetch user document from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data());
            setLoading(false)
            
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

    const interval = setInterval(async()=>{
      await logoutSession()
     
    },6000)
    // Cleanup subscription and checking of auth
    return () => {
      unsubscribe();
      clearInterval(interval)

    }

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
      await setPersistence(auth,browserLocalPersistence)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        setUser(userDoc.data());
      }
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, fullName, role = 'guest') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      const newUser = createUserDocument(
        userCredential.user.uid,
        email,
        fullName,
        null,
        role
      );
      
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem("Session")
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const googleSignIn = async (role = 'guest') => {
    try {
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
      
      return { success: true };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message };
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