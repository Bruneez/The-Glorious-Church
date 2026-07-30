import { resolveShepherdingCoverStoragePath } from '../utils/storagePathUtils.js';
import {
  generateStoragePath,
  resolveCoverContentType,
  validateImage,
} from './shepherdingToolsStorage.js';

export function resolvePreviousShepherdingCoverPath(formData = {}, initialData = null) {
  return String(
    formData.previousCoverPath
    || resolveShepherdingCoverStoragePath(initialData)
    || resolveShepherdingCoverStoragePath(formData)
    || '',
  ).trim();
}

export function shouldCleanupPreviousShepherdingCover(previousPath, nextPath) {
  const previous = String(previousPath || '').trim();
  const next = String(nextPath || '').trim();

  return Boolean(previous && previous !== next);
}

export async function cleanupUnusedUpload(path, deleteFn) {
  const normalizedPath = String(path || '').trim();
  if (!normalizedPath || typeof deleteFn !== 'function') return null;

  try {
    await deleteFn(normalizedPath);
    return null;
  } catch (error) {
    if (error?.code === 'storage/object-not-found') {
      return null;
    }

    return 'The cover image could not be removed from storage. Please contact an administrator if this persists.';
  }
}

export function replaceImage(resourceId, file, { previousPath = '' } = {}) {
  const validationMessage = validateImage(file);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const contentType = resolveCoverContentType(file);
  if (!contentType) {
    throw new Error('Please upload a JPG, PNG, or WEBP cover image.');
  }

  const coverImageStoragePath = generateStoragePath(resourceId, file.name);
  const shouldCleanupPrevious = shouldCleanupPreviousShepherdingCover(
    previousPath,
    coverImageStoragePath,
  );

  return {
    contentType,
    coverImageStoragePath,
    shouldCleanupPrevious,
    previousPath: String(previousPath || '').trim(),
  };
}
