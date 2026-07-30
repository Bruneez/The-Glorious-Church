import {
  resolveShepherdingCoverContentType,
  validateShepherdingCoverFile,
} from '../config/shepherdingToolsResourceOptions.js';

export function generateStoragePath(resourceId, fileName = 'cover') {
  const timestamp = Date.now();
  const safeName = String(fileName || 'cover').replace(/[^\w.-]+/g, '_');
  const normalizedResourceId = String(resourceId || '').trim();

  if (!normalizedResourceId) {
    throw new Error('Resource ID is required to generate a storage path.');
  }

  return `shepherding-tools/${normalizedResourceId}/${timestamp}_${safeName}`;
}

export function validateImage(file) {
  return validateShepherdingCoverFile(file);
}

export function resolveCoverContentType(file) {
  return resolveShepherdingCoverContentType(file);
}
