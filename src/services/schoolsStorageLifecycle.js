import { resolveSchoolBadgeStoragePath } from '../utils/storagePathUtils.js';

export function resolvePreviousSchoolBadgePath(formData = {}, initialData = null) {
  return String(
    formData.previousBadgePath
    || resolveSchoolBadgeStoragePath(initialData)
    || resolveSchoolBadgeStoragePath(formData)
    || '',
  ).trim();
}

export function shouldCleanupPreviousSchoolBadge(previousPath, nextPath) {
  const previous = String(previousPath || '').trim();
  const next = String(nextPath || '').trim();

  return Boolean(previous && previous !== next);
}

export async function cleanupSchoolBadgeStoragePath(path, deleteFn) {
  const normalizedPath = String(path || '').trim();
  if (!normalizedPath || typeof deleteFn !== 'function') return null;

  try {
    await deleteFn(normalizedPath);
    return null;
  } catch (error) {
    if (error?.code === 'storage/object-not-found') {
      return null;
    }

    console.warn('Failed to delete school badge from storage:', error);

    return 'The school badge could not be removed from storage. Please contact an administrator if this persists.';
  }
}
