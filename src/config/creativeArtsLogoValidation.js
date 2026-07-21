export const ACCEPTED_CREATIVE_ARTS_LOGO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ACCEPTED_CREATIVE_ARTS_LOGO_ACCEPT =
  '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

export const MAX_CREATIVE_ARTS_LOGO_SIZE_BYTES = 5 * 1024 * 1024;

export function validateCreativeArtsLogoFile(file) {
  if (!file) return '';

  const hasAllowedType = ACCEPTED_CREATIVE_ARTS_LOGO_TYPES.includes(file.type);
  const hasAllowedExtension = /\.(jpe?g|png|webp)$/i.test(file.name || '');

  if (!hasAllowedType && !hasAllowedExtension) {
    return 'Please upload a JPG, PNG, or WEBP image.';
  }

  if (file.size > MAX_CREATIVE_ARTS_LOGO_SIZE_BYTES) {
    return 'Department logo must be 5 MB or smaller.';
  }

  return '';
}

export function getCreativeArtsStorageErrorMessage(error) {
  const code = String(error?.code || '');

  if (code === 'storage/retry-limit-exceeded' || code === 'storage/timeout') {
    return 'Department logo upload timed out. Please check your connection and try again.';
  }

  if (code === 'storage/unauthorized') {
    return 'You do not have permission to upload department logos. Please contact an administrator.';
  }

  if (code === 'storage/quota-exceeded') {
    return 'Storage quota exceeded. Please contact an administrator.';
  }

  if (code === 'storage/canceled') {
    return 'Department logo upload was canceled. Please try again.';
  }

  if (code.startsWith('storage/')) {
    return 'Failed to upload department logo. Please try again.';
  }

  return '';
}
