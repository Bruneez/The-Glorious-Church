import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
} from 'firebase/auth';
import { auth } from '@/config/firebase';

export async function signIn(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function signUp(email, password) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
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
  if (error?.code === 'auth/email-already-in-use') {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (error?.code === 'auth/weak-password') {
    return 'Password must be at least 6 characters long.';
  }
  if (error?.code === 'auth/operation-not-allowed') {
    return 'Registration is disabled. Enable Email/Password sign-in in the Firebase console.';
  }
  if (error?.code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  return error?.message || 'Authentication failed.';
}
