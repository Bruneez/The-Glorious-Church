import { resolveMerchandiseImageStoragePath } from '../utils/storagePathUtils.js';

export function collectMerchandiseImagePaths(product = {}) {
  const images = Array.isArray(product.images) ? product.images : [];
  const paths = images
    .map((image) => resolveMerchandiseImageStoragePath(image) || String(image?.storagePath || '').trim())
    .filter(Boolean);

  return [...new Set(paths)];
}

export async function cleanupMerchandiseImageStoragePaths(paths = [], deleteFn) {
  if (!Array.isArray(paths) || typeof deleteFn !== 'function') return [];

  const warnings = [];

  for (const path of paths) {
    const normalizedPath = String(path || '').trim();
    if (!normalizedPath) continue;

    try {
      await deleteFn(normalizedPath);
    } catch (error) {
      if (error?.code === 'storage/object-not-found') continue;
      warnings.push(
        'A merchandise image could not be removed from storage. Please contact an administrator if this persists.',
      );
    }
  }

  return warnings;
}
