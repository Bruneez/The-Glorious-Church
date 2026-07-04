import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { app, auth } from '@/config/firebase';
import { COLLECTIONS } from '@/config/collections';
import { addDocument } from '@/hooks/useFirestore';
import { getAuthErrorMessage } from '@/services/authService';

export function getCreateStaffUserErrorMessage(error) {
  if (error?.code?.startsWith('auth/')) {
    return getAuthErrorMessage(error);
  }

  const message = error?.message || '';
  if (message) {
    return message;
  }

  return 'Failed to create staff user. Please try again.';
}

export async function createStaffUser(staffData) {
  const fullName = String(staffData?.name || staffData?.fullName || '').trim();
  const email = String(staffData?.email || '').trim().toLowerCase();
  const password = String(staffData?.password || '');
  const role = String(staffData?.role || '').trim();
  const phone = String(staffData?.phone || '').trim();
  const photo = String(staffData?.photo || '').trim();
  const status = staffData?.status === 'Inactive' ? 'Inactive' : 'Active';

  if (!fullName) {
    throw new Error('Staff member name is required.');
  }

  if (!email || !email.includes('@')) {
    throw new Error('A valid email address is required.');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  if (!role) {
    throw new Error('A valid staff role is required.');
  }

  const createdBy = auth.currentUser?.uid;
  if (!createdBy) {
    throw new Error('You must be signed in to create staff users.');
  }

  let secondaryApp;

  try {
    secondaryApp = initializeApp(app.options, `StaffProvisioner-${Date.now()}`);
    const secondaryAuth = getAuth(secondaryApp);
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = credential.user.uid;

    const staffDoc = await addDocument(COLLECTIONS.STAFF, {
      uid,
      fullName,
      name: fullName,
      email,
      role,
      status,
      phone,
      photo,
      createdAt: serverTimestamp(),
      createdBy,
    });

    return { uid, staffDocId: staffDoc.id };
  } finally {
    if (secondaryApp) {
      await deleteApp(secondaryApp).catch(() => {});
    }
  }
}
