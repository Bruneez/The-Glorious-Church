import { resolveMinistryAvatarStoragePath } from '../utils/storagePathUtils.js';

export function resolvePreviousMinistryAvatarPath(formData = {}, initialData = null) {
  return String(
    formData.previousAvatarPath
    || resolveMinistryAvatarStoragePath(initialData)
    || resolveMinistryAvatarStoragePath(formData)
    || '',
  ).trim();
}

export function shouldCleanupPreviousMinistryAvatar(previousPath, nextPath) {
  const previous = String(previousPath || '').trim();
  const next = String(nextPath || '').trim();

  return Boolean(previous && previous !== next);
}

export async function cleanupMinistryAvatarStoragePath(path, deleteFn) {
  const normalizedPath = String(path || '').trim();
  if (!normalizedPath || typeof deleteFn !== 'function') return null;

  try {
    await deleteFn(normalizedPath);
    return null;
  } catch (error) {
    if (error?.code === 'storage/object-not-found') {
      return null;
    }

    return 'The ministry avatar could not be removed from storage. Please contact an administrator if this persists.';
  }
}
