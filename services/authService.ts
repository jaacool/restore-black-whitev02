import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';

export const signInWithGoogle = async (): Promise<User> => {
  if (!auth || !googleProvider || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please set up Firebase environment variables.');
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  if (!auth || !isFirebaseConfigured) {
    return;
  }
  
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth || !isFirebaseConfigured) {
    // Call callback with null immediately if Firebase is not configured
    callback(null);
    return () => {}; // Return empty unsubscribe function
  }
  
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = (): User | null => {
  if (!auth || !isFirebaseConfigured) {
    return null;
  }
  return auth.currentUser;
};
