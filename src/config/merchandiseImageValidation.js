export {
  validateMerchandiseImageFile,
  ACCEPTED_MERCHANDISE_IMAGE_ACCEPT,
  ACCEPTED_MERCHANDISE_IMAGE_TYPES,
  MAX_MERCHANDISE_IMAGE_BYTES,
  MERCHANDISE_IMAGE_UPLOAD_TIMEOUT_MS,
  resolveMerchandiseImageContentType,
} from './merchandiseOptions.js';

export const MERCHANDISE_STORAGE_ROOT = 'merchandise';

export const MERCHANDISE_INVALID_IMAGE_MESSAGE =
  'Please select a JPG, JPEG, PNG or WEBP image smaller than 5 MB.';

export function isValidMerchandiseImageStoragePath(path) {
  const normalized = String(path || '').trim().replace(/^\/+/, '');
  return new RegExp(`^${MERCHANDISE_STORAGE_ROOT}/[^/]+/[^/]+$`).test(normalized);
}

export function getMerchandiseStorageErrorMessage(error) {
  const code = String(error?.code || '');

  if (code === 'storage/unauthorized' || code === 'firestore/permission-denied') {
    return 'You do not have permission to upload merchandise images.';
  }

  if (code === 'storage/retry-limit-exceeded' || code === 'storage/timeout') {
    return 'The product image could not be uploaded. Please check your connection and try again.';
  }

  if (code === 'storage/canceled' || code === 'storage/quota-exceeded') {
    return 'The product image could not be uploaded. Please try again.';
  }

  if (code.startsWith('storage/') || code.startsWith('firestore/')) {
    return 'The product image could not be uploaded. Please try again.';
  }

  return '';
}

export function toMerchandiseImageUploadError(error) {
  const storageMessage = getMerchandiseStorageErrorMessage(error);
  const passthroughMessage =
    !storageMessage
    && error instanceof Error
    && !String(error?.code || '').startsWith('storage/')
    && !String(error?.code || '').startsWith('firestore/')
      ? error.message
      : '';

  const message =
    storageMessage
    || passthroughMessage
    || 'The product image could not be uploaded. Please try again.';

  const uploadError = new Error(message);
  uploadError.code = error?.code;
  return uploadError;
}
