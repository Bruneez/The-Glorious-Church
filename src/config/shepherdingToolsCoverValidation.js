import { isShepherdingCoverStoragePath } from '../services/shepherdingToolsStorage.js';

export function getShepherdingCoverStorageErrorMessage(error) {
  const code = String(error?.code || '');

  if (code === 'storage/retry-limit-exceeded' || code === 'storage/timeout') {
    return 'Cover image upload timed out. Please check your connection and try again.';
  }

  if (code === 'storage/unauthorized') {
    return 'You do not have permission to upload cover images. Please contact an administrator.';
  }

  if (code === 'storage/quota-exceeded') {
    return 'Storage quota exceeded. Please contact an administrator.';
  }

  if (code === 'storage/canceled') {
    return 'Cover image upload was canceled. Please try again.';
  }

  if (code.startsWith('storage/')) {
    return 'Failed to upload cover image. Please try again.';
  }

  return '';
}

export function getShepherdingToolsSubmitErrorMessage(error) {
  return (
    getShepherdingCoverStorageErrorMessage(error)
    || error?.message
    || 'The resource could not be saved. Please check the information and try again.'
  );
}

export function toShepherdingCoverUploadError(error) {
  const message =
    getShepherdingCoverStorageErrorMessage(error)
    || error?.message
    || 'Failed to upload cover image. Please try again.';

  const uploadError = new Error(message);
  uploadError.code = error?.code;
  return uploadError;
}

export function normalizeShepherdingCoverUploadResult(uploadResult) {
  if (!uploadResult) {
    throw new Error('The cover image upload returned no result. Please try again.');
  }

  const coverImageUrl = String(uploadResult.coverImageUrl || '').trim();
  const coverImageStoragePath = String(uploadResult.coverImageStoragePath || '').trim();

  if (!coverImageUrl) {
    throw new Error('The cover image upload did not return a valid image URL.');
  }

  if (!coverImageStoragePath) {
    throw new Error('The cover image upload did not return a storage path.');
  }

  if (!isShepherdingCoverStoragePath(coverImageStoragePath)) {
    throw new Error(
      'The cover image upload returned a storage path that does not match Firebase Storage rules.',
    );
  }

  return { coverImageUrl, coverImageStoragePath };
}
