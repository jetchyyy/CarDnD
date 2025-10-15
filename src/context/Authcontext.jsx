import { createContext, useState, useContext, useEffect } from 'react';

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
    // Check if user is logged in (from Firebase or localStorage equivalent)
    const checkAuth = async () => {
      try {
        // Simulate checking auth state
        // Replace with actual Firebase auth state listener
        const storedUser = sessionStorage.getItem('carbnb_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Simulate login - replace with actual Firebase auth
      const mockUser = {
        uid: '123',
        email,
        displayName: 'John Doe',
        photoURL: null
      };
      
      setUser(mockUser);
      sessionStorage.setItem('carbnb_user', JSON.stringify(mockUser));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, fullName) => {
    try {
      // Simulate signup - replace with actual Firebase auth
      const mockUser = {
        uid: Date.now().toString(),
        email,
        displayName: fullName,
        photoURL: null
      };
      
      setUser(mockUser);
      sessionStorage.setItem('carbnb_user', JSON.stringify(mockUser));
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Replace with actual Firebase signOut
      setUser(null);
      sessionStorage.removeItem('carbnb_user');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const googleSignIn = async () => {
    try {
      // Replace with actual Firebase Google auth
      const mockUser = {
        uid: Date.now().toString(),
        email: 'user@gmail.com',
        displayName: 'Google User',
        photoURL: null
      };
      
      setUser(mockUser);
      sessionStorage.setItem('carbnb_user', JSON.stringify(mockUser));
      return { success: true };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    googleSignIn
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};