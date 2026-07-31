import {
  resolveProjectAttachmentStoragePath,
  resolveProjectCoverStoragePath,
} from '../utils/storagePathUtils.js';
import {
  generateProjectAttachmentStoragePath,
  generateProjectCoverStoragePath,
  resolveAttachmentContentType,
  resolveCoverContentType,
  validateAttachment,
  validateCoverImage,
} from './projectStorage.js';

export function resolvePreviousProjectCoverPath(formData = {}, initialData = null) {
  return String(
    formData.previousCoverPath
    || resolveProjectCoverStoragePath(initialData)
    || resolveProjectCoverStoragePath(formData)
    || '',
  ).trim();
}

export function shouldCleanupPreviousProjectCover(previousPath, nextPath) {
  const previous = String(previousPath || '').trim();
  const next = String(nextPath || '').trim();
  return Boolean(previous && previous !== next);
}

import { retryAsync } from '../utils/retryAsync.js';

export async function cleanupUnusedUpload(path, deleteFn) {
  const normalizedPath = String(path || '').trim();
  if (!normalizedPath || typeof deleteFn !== 'function') return null;

  try {
    await retryAsync(async () => {
      await deleteFn(normalizedPath);
    }, { retries: 1, delayMs: 300 });
    return null;
  } catch (error) {
    if (error?.code === 'storage/object-not-found') {
      return null;
    }

    return 'The file could not be removed from storage. Please contact an administrator if this persists.';
  }
}

export async function cleanupOrphanProjectUpload(storagePath, deleteFn) {
  return cleanupUnusedUpload(storagePath, deleteFn);
}

export function prepareProjectCoverUpload(projectId, file, { previousPath = '' } = {}) {
  const validationMessage = validateCoverImage(file);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const contentType = resolveCoverContentType(file);
  if (!contentType) {
    throw new Error('Please upload a JPG, PNG, or WEBP cover image.');
  }

  const coverStoragePath = generateProjectCoverStoragePath(projectId, file.name);
  const shouldCleanupPrevious = shouldCleanupPreviousProjectCover(previousPath, coverStoragePath);

  return {
    contentType,
    coverStoragePath,
    shouldCleanupPrevious,
    previousPath: String(previousPath || '').trim(),
  };
}

export function prepareProjectAttachmentUpload(projectId, file) {
  const validationMessage = validateAttachment(file);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const contentType = resolveAttachmentContentType(file);
  if (!contentType) {
    throw new Error('Please upload a JPG, PNG, WEBP, or PDF file.');
  }

  return {
    contentType,
    fileStoragePath: generateProjectAttachmentStoragePath(projectId, file.name),
  };
}

export function resolvePreviousProjectAttachmentPath(attachment = {}) {
  return resolveProjectAttachmentStoragePath(attachment);
}
