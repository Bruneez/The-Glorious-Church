import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { COLLECTIONS } from '@/config/collections';
import { normalizeRole, ROLES } from '@/config/roles';
import {
  getStaffAuthUid,
  getStaffDocByAuthUid,
  isStaffDocAtAuthUid,
  migrateLegacyStaffDocToAuthUid,
} from '@/services/staffAuthDocService';

export async function resolveStaffProfile(user) {
  if (!user?.uid) {
    return null;
  }

  const authUidDoc = await getStaffDocByAuthUid(user.uid);
  if (authUidDoc) {
    return {
      staffDocId: authUidDoc.staffDocId,
      staffProfile: authUidDoc.staffProfile,
      role: normalizeRole(authUidDoc.staffProfile.role),
    };
  }

  if (!user.email) {
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
  const storedAuthUid = getStaffAuthUid(data);
  const migrationAuthUid = storedAuthUid || user.uid;

  if (!isStaffDocAtAuthUid(staffDoc.id, { ...data, uid: migrationAuthUid })) {
    try {
      await migrateLegacyStaffDocToAuthUid(staffDoc, migrationAuthUid);
    } catch (error) {
      console.error('Failed to migrate legacy staff document to auth UID path:', error);
      throw error;
    }

    const migratedDoc = await getStaffDocByAuthUid(migrationAuthUid);
    if (migratedDoc) {
      return {
        staffDocId: migratedDoc.staffDocId,
        staffProfile: migratedDoc.staffProfile,
        role: normalizeRole(migratedDoc.staffProfile.role),
      };
    }
  }

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

export async function excludeStaffFromTasksModule(staffDocId, { role } = {}) {
  if (normalizeRole(role) !== ROLES.ADMIN) {
    throw new Error('Only administrators can remove users from the Tasks module.');
  }

  const normalizedStaffDocId = String(staffDocId || '').trim();
  if (!normalizedStaffDocId) {
    throw new Error('Staff member ID is required.');
  }

  await updateStaffProfile(normalizedStaffDocId, { taskModuleEnabled: false });
}

export async function restoreStaffToTasksModule(staffDocId, { role } = {}) {
  if (normalizeRole(role) !== ROLES.ADMIN) {
    throw new Error('Only administrators can restore users to the Tasks module.');
  }

  const normalizedStaffDocId = String(staffDocId || '').trim();
  if (!normalizedStaffDocId) {
    throw new Error('Staff member ID is required.');
  }

  await updateStaffProfile(normalizedStaffDocId, { taskModuleEnabled: true });
}
