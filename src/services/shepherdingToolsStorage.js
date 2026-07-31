import {
  resolveShepherdingCoverContentType,
  validateShepherdingCoverFile,
} from '../config/shepherdingToolsResourceOptions.js';

/** Matches Firebase rule: match /shepherding-tools/{resourceId}/{fileName} */
export const SHEPHERDING_TOOLS_STORAGE_ROOT = 'shepherding-tools';

export function isShepherdingCoverStoragePath(path) {
  const normalized = String(path || '').trim().replace(/^\/+/, '');
  return new RegExp(
    `^${SHEPHERDING_TOOLS_STORAGE_ROOT}/[^/]+/[^/]+$`,
  ).test(normalized);
}

export function generateStoragePath(resourceId, fileName = 'cover') {
  const timestamp = Date.now();
  const safeName = String(fileName || 'cover').replace(/[^\w.-]+/g, '_');
  const normalizedResourceId = String(resourceId || '').trim();

  if (!normalizedResourceId) {
    throw new Error('Resource ID is required to generate a storage path.');
  }

  const storagePath = `${SHEPHERDING_TOOLS_STORAGE_ROOT}/${normalizedResourceId}/${timestamp}_${safeName}`;

  if (!isShepherdingCoverStoragePath(storagePath)) {
    throw new Error('Generated cover storage path does not match the expected Firebase rule shape.');
  }

  return storagePath;
}

export function validateImage(file) {
  return validateShepherdingCoverFile(file);
}

export function resolveCoverContentType(file) {
  return resolveShepherdingCoverContentType(file);
}
