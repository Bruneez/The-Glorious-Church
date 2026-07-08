import { orderBy } from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import { buildMinistryPayload } from '@/config/ministriesOptions';
import { deleteMinistryAvatar } from '@/services/storageService';
import {
  useCollection,
  addDocument,
  updateDocument,
  deleteDocument,
} from '@/hooks/useFirestore';

async function cleanupMinistryAvatar(avatarPath) {
  if (!avatarPath) return;

  try {
    await deleteMinistryAvatar(avatarPath);
  } catch (error) {
    console.warn('Failed to delete ministry avatar from storage:', error);
  }
}

export function useMinistries() {
  return useCollection(COLLECTIONS.MINISTRIES, {
    constraints: [orderBy('ministryName', 'asc')],
  });
}

export async function createMinistry(formData, createdBy = '') {
  const timestamp = new Date().toISOString();
  const payload = buildMinistryPayload(formData, { createdBy });

  if (!payload.ministryName) {
    throw new Error('Ministry name is required.');
  }

  return addDocument(COLLECTIONS.MINISTRIES, {
    ...payload,
    totalMembers: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: String(createdBy || '').trim(),
  });
}

export async function updateMinistry(ministryId, formData, initialData = null) {
  const payload = buildMinistryPayload(formData, { initialData });

  if (!payload.ministryName) {
    throw new Error('Ministry name is required.');
  }

  if (formData.removeAvatar) {
    await cleanupMinistryAvatar(initialData?.avatarPath);
  } else if (
    payload.avatarPath &&
    initialData?.avatarPath &&
    payload.avatarPath !== initialData.avatarPath
  ) {
    await cleanupMinistryAvatar(initialData.avatarPath);
  }

  return updateDocument(COLLECTIONS.MINISTRIES, ministryId, {
    ...payload,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteMinistry(ministryId) {
  return deleteDocument(COLLECTIONS.MINISTRIES, ministryId);
}
