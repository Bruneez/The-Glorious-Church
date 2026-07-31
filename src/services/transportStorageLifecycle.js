import { resolveTransportVehicleImageStoragePath } from '../utils/storagePathUtils.js';

export function resolvePreviousTransportVehicleImagePath(formData = {}, initialData = null) {
  return String(
    formData.previousImagePath
    || resolveTransportVehicleImageStoragePath(initialData)
    || resolveTransportVehicleImageStoragePath(formData)
    || '',
  ).trim();
}

export function shouldCleanupPreviousTransportVehicleImage(previousPath, nextPath) {
  const previous = String(previousPath || '').trim();
  const next = String(nextPath || '').trim();

  return Boolean(previous && previous !== next);
}

export async function cleanupTransportVehicleImageStoragePath(path, deleteFn) {
  const normalizedPath = String(path || '').trim();
  if (!normalizedPath || typeof deleteFn !== 'function') return null;

  try {
    await deleteFn(normalizedPath);
    return null;
  } catch (error) {
    if (error?.code === 'storage/object-not-found') {
      return null;
    }

    return 'The transport photo could not be removed from storage. Please contact an administrator if this persists.';
  }
}
