import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { COLLECTIONS } from '@/config/collections';
import { normalizeRole } from '@/config/roles';

export async function resolveStaffProfile(user) {
  if (!user?.email) {
    return null;
  }

  const staffQuery = query(
    collection(db, COLLECTIONS.STAFF),
    where('email', '==', user.email),
  );
  const snapshot = await getDocs(staffQuery);

  if (snapshot.empty) {
    return null;
  }

  const staffDoc = snapshot.docs[0];
  const data = staffDoc.data();

  return {
    staffDocId: staffDoc.id,
    staffProfile: {
      id: staffDoc.id,
      ...data,
    },
    role: normalizeRole(data.role),
  };
}

export async function updateStaffProfile(staffDocId, updates) {
  const staffRef = doc(db, COLLECTIONS.STAFF, staffDocId);
  await updateDoc(staffRef, updates);
}

export async function getStaffProfile(staffDocId) {
  const staffRef = doc(db, COLLECTIONS.STAFF, staffDocId);
  const snapshot = await getDoc(staffRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}
