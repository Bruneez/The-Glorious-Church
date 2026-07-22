import { resolveMachanehMoviePosterStoragePath } from '../utils/storagePathUtils.js';

export function resolvePreviousMachanehMoviePosterPath(formData = {}, initialData = null) {
  return String(
    formData.previousPosterPath
    || resolveMachanehMoviePosterStoragePath(initialData)
    || resolveMachanehMoviePosterStoragePath(formData)
    || '',
  ).trim();
}

export function shouldCleanupPreviousMachanehMoviePoster(previousPath, nextPath) {
  const previous = String(previousPath || '').trim();
  const next = String(nextPath || '').trim();

  return Boolean(previous && previous !== next);
}

export async function cleanupMachanehMoviePosterStoragePath(path, deleteFn) {
  const normalizedPath = String(path || '').trim();
  if (!normalizedPath || typeof deleteFn !== 'function') return null;

  try {
    await deleteFn(normalizedPath);
    return null;
  } catch (error) {
    if (error?.code === 'storage/object-not-found') {
      return null;
    }

    return 'The movie poster could not be removed from storage. Please contact an administrator if this persists.';
  }
}
