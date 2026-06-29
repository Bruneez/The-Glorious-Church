import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
} from 'firebase/auth';
import { auth } from '@/config/firebase';

export async function signIn(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export async function changePassword(user, newPassword) {
  await updatePassword(user, newPassword);
}

export function getAuthErrorMessage(error) {
  if (
    error?.code === 'auth/invalid-credential' ||
    error?.code === 'auth/user-not-found' ||
    error?.code === 'auth/wrong-password'
  ) {
    return 'Invalid email address or password configuration.';
  }
  if (error?.code === 'custom/not-staff') {
    return 'Access Denied. Your email is not registered in the staff database.';
  }
  return error?.message || 'Authentication failed.';
}
