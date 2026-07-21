import { resolveCreativeArtsLogoStoragePath } from '../utils/storagePathUtils.js';

export function resolvePreviousCreativeArtsLogoPath(formData = {}, initialData = null) {
  return String(
    formData.previousLogoPath
    || resolveCreativeArtsLogoStoragePath(initialData)
    || resolveCreativeArtsLogoStoragePath(formData)
    || '',
  ).trim();
}

export function shouldCleanupPreviousCreativeArtsLogo(previousPath, nextPath) {
  const previous = String(previousPath || '').trim();
  const next = String(nextPath || '').trim();

  return Boolean(previous && previous !== next);
}

export async function cleanupCreativeArtsLogoStoragePath(path, deleteFn) {
  const normalizedPath = String(path || '').trim();
  if (!normalizedPath || typeof deleteFn !== 'function') return null;

  try {
    await deleteFn(normalizedPath);
    return null;
  } catch (error) {
    if (error?.code === 'storage/object-not-found') {
      return null;
    }

    return 'The department logo could not be removed from storage. Please contact an administrator if this persists.';
  }
}
