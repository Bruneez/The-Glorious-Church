export const ACCEPTED_SCHOOL_BADGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ACCEPTED_SCHOOL_BADGE_ACCEPT =
  '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

export const MAX_SCHOOL_BADGE_SIZE_BYTES = 5 * 1024 * 1024;

export function validateSchoolBadgeFile(file) {
  if (!file) return '';

  const hasAllowedType = ACCEPTED_SCHOOL_BADGE_TYPES.includes(file.type);
  const hasAllowedExtension = /\.(jpe?g|png|webp)$/i.test(file.name || '');

  if (!hasAllowedType && !hasAllowedExtension) {
    return 'Please upload a JPG, PNG, or WEBP image.';
  }

  if (file.size > MAX_SCHOOL_BADGE_SIZE_BYTES) {
    return 'School badge must be 5 MB or smaller.';
  }

  return '';
}
