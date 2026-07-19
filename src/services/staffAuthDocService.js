import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import { db } from '@/config/firebase';
import {
  buildStaffAuthDocPayload,
  getStaffAuthUid,
  isStaffDocAtAuthUid,
} from '@/services/staffAuthDocHelpers';

export { buildStaffAuthDocPayload, getStaffAuthUid, isStaffDocAtAuthUid };

export async function migrateLegacyStaffDocToAuthUid(legacyDocSnapshot, authUid) {
  const legacyId = legacyDocSnapshot.id;
  const normalizedAuthUid = String(authUid || '').trim();

  if (!legacyId || !normalizedAuthUid) {
    throw new Error('Legacy staff document ID and auth UID are required.');
  }

  if (legacyId === normalizedAuthUid) {
    return normalizedAuthUid;
  }

  const legacyData = legacyDocSnapshot.data() || {};
  const targetRef = doc(db, COLLECTIONS.STAFF, normalizedAuthUid);
  const legacyRef = doc(db, COLLECTIONS.STAFF, legacyId);

  const [notificationSnapshot, taskSnapshot] = await Promise.all([
    getDocs(query(collection(db, COLLECTIONS.NOTIFICATIONS), where('userId', '==', legacyId))),
    getDocs(query(collection(db, COLLECTIONS.TASKS), where('assignedUserId', '==', legacyId))),
  ]);

  const batch = writeBatch(db);

  batch.set(
    targetRef,
    {
      ...buildStaffAuthDocPayload(legacyData, normalizedAuthUid),
      legacyStaffDocId: legacyId,
      migratedAt: serverTimestamp(),
    },
    { merge: true },
  );

  batch.delete(legacyRef);

  notificationSnapshot.docs.forEach((notificationDoc) => {
    batch.update(notificationDoc.ref, { userId: normalizedAuthUid });
  });

  taskSnapshot.docs.forEach((taskDoc) => {
    batch.update(taskDoc.ref, { assignedUserId: normalizedAuthUid });
  });

  await batch.commit();

  return normalizedAuthUid;
}

export async function getStaffDocByAuthUid(authUid) {
  const normalizedAuthUid = String(authUid || '').trim();
  if (!normalizedAuthUid) return null;

  const staffRef = doc(db, COLLECTIONS.STAFF, normalizedAuthUid);
  const snapshot = await getDoc(staffRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    staffDocId: snapshot.id,
    staffProfile: {
      id: snapshot.id,
      ...snapshot.data(),
    },
  };
}
