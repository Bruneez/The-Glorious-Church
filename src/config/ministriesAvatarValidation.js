export const ACCEPTED_MINISTRY_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ACCEPTED_MINISTRY_AVATAR_ACCEPT =
  '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

export const MAX_MINISTRY_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

export function validateMinistryAvatarFile(file) {
  if (!file) return '';

  const hasAllowedType = ACCEPTED_MINISTRY_AVATAR_TYPES.includes(file.type);
  const hasAllowedExtension = /\.(jpe?g|png|webp)$/i.test(file.name || '');

  if (!hasAllowedType && !hasAllowedExtension) {
    return 'Please upload a JPG, PNG, or WEBP image.';
  }

  if (file.size > MAX_MINISTRY_AVATAR_SIZE_BYTES) {
    return 'Ministry avatar must be 5 MB or smaller.';
  }

  return '';
}

export function getMinistryStorageErrorMessage(error) {
  const code = String(error?.code || '');

  if (code === 'storage/retry-limit-exceeded' || code === 'storage/timeout') {
    return 'Ministry avatar upload timed out. Please check your connection and try again.';
  }

  if (code === 'storage/unauthorized') {
    return 'You do not have permission to upload ministry avatars. Please contact an administrator.';
  }

  if (code === 'storage/quota-exceeded') {
    return 'Storage quota exceeded. Please contact an administrator.';
  }

  if (code === 'storage/canceled') {
    return 'Ministry avatar upload was canceled. Please try again.';
  }

  if (code.startsWith('storage/')) {
    return 'Failed to upload ministry avatar. Please try again.';
  }

  return '';
}
