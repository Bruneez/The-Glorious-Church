import { resolveTravelDestinationImageStoragePath } from '../utils/storagePathUtils.js';

export function resolvePreviousTravelDestinationImagePath(formData = {}, initialData = null) {
  return String(
    formData.previousImagePath
    || resolveTravelDestinationImageStoragePath(initialData)
    || resolveTravelDestinationImageStoragePath(formData)
    || '',
  ).trim();
}

export function shouldCleanupPreviousTravelDestinationImage(previousPath, nextPath) {
  const previous = String(previousPath || '').trim();
  const next = String(nextPath || '').trim();

  return Boolean(previous && previous !== next);
}

export async function cleanupTravelDestinationImageStoragePath(path, deleteFn) {
  const normalizedPath = String(path || '').trim();
  if (!normalizedPath || typeof deleteFn !== 'function') return null;

  try {
    await deleteFn(normalizedPath);
    return null;
  } catch (error) {
    if (error?.code === 'storage/object-not-found') {
      return null;
    }

    return 'The destination image could not be removed from storage. Please contact an administrator if this persists.';
  }
}
