import { orderBy } from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import { buildMinistryPayload } from '@/config/ministriesOptions';
import { resolveMinistryAvatarStoragePath } from '@/utils/storagePathUtils';
import { deleteMinistryAvatar } from '@/services/storageService';
import {
  cleanupMinistryAvatarStoragePath,
  resolvePreviousMinistryAvatarPath,
  shouldCleanupPreviousMinistryAvatar,
} from '@/services/ministriesStorageLifecycle';
import {
  useCollection,
  addDocument,
  updateDocument,
  deleteDocument,
} from '@/hooks/useFirestore';

export function useMinistries() {
  return useCollection(COLLECTIONS.MINISTRIES, {
    constraints: [orderBy('ministryName', 'asc')],
  });
}

export async function getMinistry(ministryId) {
  const { getDocument } = await import('@/hooks/useFirestore');
  return getDocument(COLLECTIONS.MINISTRIES, ministryId);
}

export async function createMinistry(formData, createdBy = '') {
  const timestamp = new Date().toISOString();
  const payload = buildMinistryPayload(formData, { createdBy });

  if (!payload.ministryName) {
    throw new Error('Ministry name is required.');
  }

  const ministry = await addDocument(COLLECTIONS.MINISTRIES, {
    ...payload,
    totalMembers: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: String(createdBy || '').trim(),
  });

  return { ministry, storageWarnings: [] };
}

export async function updateMinistry(ministryId, formData, initialData = null) {
  const payload = buildMinistryPayload(formData, { initialData });
  const previousAvatarPath = resolvePreviousMinistryAvatarPath(formData, initialData);
  const nextAvatarPath = String(payload.avatarPath || '').trim();

  if (!payload.ministryName) {
    throw new Error('Ministry name is required.');
  }

  const ministry = await updateDocument(COLLECTIONS.MINISTRIES, ministryId, {
    ...payload,
    updatedAt: new Date().toISOString(),
  });

  const storageWarnings = [];

  if (shouldCleanupPreviousMinistryAvatar(previousAvatarPath, nextAvatarPath)) {
    const warning = await cleanupMinistryAvatarStoragePath(
      previousAvatarPath,
      deleteMinistryAvatar,
    );
    if (warning) storageWarnings.push(warning);
  }

  return { ministry, storageWarnings };
}

export async function deleteMinistry(ministryId) {
  const existingMinistry = await getMinistry(ministryId);
  if (!existingMinistry) {
    throw new Error('Ministry not found.');
  }

  const avatarPath = resolveMinistryAvatarStoragePath(existingMinistry);

  await deleteDocument(COLLECTIONS.MINISTRIES, ministryId);

  const storageWarnings = [];
  const warning = await cleanupMinistryAvatarStoragePath(avatarPath, deleteMinistryAvatar);
  if (warning) storageWarnings.push(warning);

  return { ministryId, storageWarnings };
}
