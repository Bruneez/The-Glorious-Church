export const TRANSPORT_STORAGE_ROOT = 'transport';

export function isValidTransportVehicleImageStoragePath(path) {
  const normalized = String(path || '').trim().replace(/^\/+/, '');
  return new RegExp(`^${TRANSPORT_STORAGE_ROOT}/[^/]+/[^/]+$`).test(normalized);
}

export function getTransportStorageErrorMessage(error) {
  const code = String(error?.code || '');

  if (code === 'storage/retry-limit-exceeded' || code === 'storage/timeout') {
    return 'Transport photo upload timed out. Please check your connection and try again.';
  }

  if (code === 'storage/unauthorized' || code === 'firestore/permission-denied') {
    return 'You do not have permission to upload transport photos. Please contact an administrator.';
  }

  if (code === 'storage/quota-exceeded') {
    return 'Storage quota exceeded. Please contact an administrator.';
  }

  if (code === 'storage/canceled') {
    return 'Transport photo upload was canceled. Please try again.';
  }

  if (code.startsWith('storage/') || code.startsWith('firestore/')) {
    return 'Failed to upload transport photo. Please try again.';
  }

  return '';
}

export function getTransportSubmitErrorMessage(error) {
  return (
    getTransportStorageErrorMessage(error)
    || error?.message
    || 'The transport record could not be saved. Please check the information and try again.'
  );
}

export function toTransportImageUploadError(error) {
  const message =
    getTransportStorageErrorMessage(error)
    || error?.message
    || 'Failed to upload transport photo. Please try again.';

  const uploadError = new Error(message);
  uploadError.code = error?.code;
  return uploadError;
}

export function normalizeTransportImageUploadResult(uploadResult) {
  if (!uploadResult) {
    throw new Error('The transport photo upload returned no result. Please try again.');
  }

  const vehicleImageUrl = String(uploadResult.vehicleImageUrl || '').trim();
  const vehicleImageStoragePath = String(uploadResult.vehicleImageStoragePath || '').trim();

  if (!vehicleImageUrl) {
    throw new Error('The transport photo upload did not return a valid image URL.');
  }

  if (!vehicleImageStoragePath) {
    throw new Error('The transport photo upload did not return a storage path.');
  }

  if (!isValidTransportVehicleImageStoragePath(vehicleImageStoragePath)) {
    throw new Error(
      'The transport photo upload returned a storage path that does not match Firebase Storage rules.',
    );
  }

  return { vehicleImageUrl, vehicleImageStoragePath };
}
