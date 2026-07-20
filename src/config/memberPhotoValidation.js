export const ACCEPTED_MEMBER_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ACCEPTED_MEMBER_PHOTO_ACCEPT =
  '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

export const MAX_MEMBER_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

export function validateMemberPhotoFile(file) {
  if (!file) return '';

  const hasAllowedType = ACCEPTED_MEMBER_PHOTO_TYPES.includes(file.type);
  const hasAllowedExtension = /\.(jpe?g|png|webp)$/i.test(file.name || '');

  if (!hasAllowedType && !hasAllowedExtension) {
    return 'Please upload a JPG, PNG, or WEBP image.';
  }

  if (file.size > MAX_MEMBER_PHOTO_SIZE_BYTES) {
    return 'Profile photo must be 5 MB or smaller.';
  }

  return '';
}
