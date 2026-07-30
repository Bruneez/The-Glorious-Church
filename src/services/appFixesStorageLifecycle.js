import { resolveAppFixAttachmentStoragePath } from '../utils/storagePathUtils.js';
import {
  generateStoragePath,
  resolveAttachmentContentType,
  validateAttachment,
} from './appFixesStorage.js';

export function resolvePreviousAppFixAttachmentPath(formData = {}, initialData = null) {
  return String(
    formData.previousAttachmentPath
    || resolveAppFixAttachmentStoragePath(initialData)
    || resolveAppFixAttachmentStoragePath(formData)
    || '',
  ).trim();
}

export function shouldCleanupPreviousAppFixAttachment(previousPath, nextPath) {
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

    return 'The attachment could not be removed from storage. Please contact an administrator if this persists.';
  }
}

export function prepareAttachmentUpload(requestId, file, { previousPath = '' } = {}) {
  const validationMessage = validateAttachment(file);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const contentType = resolveAttachmentContentType(file);
  if (!contentType) {
    throw new Error('Please upload a JPG, PNG, WEBP, PDF, MP4, WEBM, or MOV file.');
  }

  const fileStoragePath = generateStoragePath(requestId, file.name);
  const shouldCleanupPrevious = shouldCleanupPreviousAppFixAttachment(
    previousPath,
    fileStoragePath,
  );

  return {
    contentType,
    fileStoragePath,
    shouldCleanupPrevious,
    previousPath: String(previousPath || '').trim(),
  };
}
