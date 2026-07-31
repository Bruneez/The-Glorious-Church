export const TRAVEL_DESTINATIONS_STORAGE_ROOT = 'travel-destinations';

export function isValidTravelDestinationStoragePath(path) {
  const normalized = String(path || '').trim().replace(/^\/+/, '');
  return new RegExp(`^${TRAVEL_DESTINATIONS_STORAGE_ROOT}/[^/]+/[^/]+$`).test(normalized);
}

export function getTravelStorageErrorMessage(error) {
  const code = String(error?.code || '');

  if (code === 'storage/retry-limit-exceeded' || code === 'storage/timeout') {
    return 'Destination image upload timed out. Please check your connection and try again.';
  }

  if (code === 'storage/unauthorized' || code === 'firestore/permission-denied') {
    return 'You do not have permission to upload destination images. Please contact an administrator.';
  }

  if (code === 'storage/quota-exceeded') {
    return 'Storage quota exceeded. Please contact an administrator.';
  }

  if (code === 'storage/canceled') {
    return 'Destination image upload was canceled. Please try again.';
  }

  if (code.startsWith('storage/') || code.startsWith('firestore/')) {
    return 'Failed to upload destination image. Please try again.';
  }

  return '';
}

export function getTravellingSubmitErrorMessage(error) {
  return (
    getTravelStorageErrorMessage(error)
    || error?.message
    || 'The travel location could not be saved. Please check the information and try again.'
  );
}

export function toTravelImageUploadError(error) {
  const message =
    getTravelStorageErrorMessage(error)
    || error?.message
    || 'Failed to upload destination image. Please try again.';

  const uploadError = new Error(message);
  uploadError.code = error?.code;
  return uploadError;
}

export function normalizeTravelImageUploadResult(uploadResult) {
  if (!uploadResult) {
    throw new Error('The destination image upload returned no result. Please try again.');
  }

  const imageUrl = String(uploadResult.imageUrl || '').trim();
  const imageStoragePath = String(uploadResult.imageStoragePath || '').trim();

  if (!imageUrl) {
    throw new Error('The destination image upload did not return a valid image URL.');
  }

  if (!imageStoragePath) {
    throw new Error('The destination image upload did not return a storage path.');
  }

  if (!isValidTravelDestinationStoragePath(imageStoragePath)) {
    throw new Error(
      'The destination image upload returned a storage path that does not match Firebase Storage rules.',
    );
  }

  return { imageUrl, imageStoragePath };
}
