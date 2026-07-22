export {
  validateMerchandiseImageFile,
  ACCEPTED_MERCHANDISE_IMAGE_ACCEPT,
  ACCEPTED_MERCHANDISE_IMAGE_TYPES,
  MAX_MERCHANDISE_IMAGE_BYTES,
  MERCHANDISE_IMAGE_UPLOAD_TIMEOUT_MS,
} from './merchandiseOptions.js';

export function getMerchandiseStorageErrorMessage(error) {
  const code = error?.code || '';
  const message = String(error?.message || '').toLowerCase();

  if (code === 'storage/unauthorized' || message.includes('permission')) {
    return 'You do not have permission to upload merchandise images.';
  }

  if (code === 'storage/canceled' || message.includes('timeout')) {
    return 'Image upload timed out. Please try again.';
  }

  return 'Unable to upload the merchandise image. Please try again.';
}
