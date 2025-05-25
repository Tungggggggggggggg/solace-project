import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from 'firebase/auth';
import { auth } from './firebase';
import { FacebookAuthProvider } from 'firebase/auth';

// Đăng nhập với Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

// Đăng nhập với Facebook
export const signInWithFacebook = async () => {
  const provider = new FacebookAuthProvider();
  return signInWithPopup(auth, provider);
};

// Đăng ký với email/password
export const signUpWithEmail = (email: string, password: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Đăng nhập với email/password
export const signInWithEmail = (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Đăng xuất
export const logout = (): Promise<void> => {
  return signOut(auth);
};
