export function extractStoragePathFromDownloadUrl(url = '') {
  const value = String(url || '').trim();
  if (!value.startsWith('http')) return '';

  const firebaseMatch = value.match(/\/o\/([^?]+)/);
  if (!firebaseMatch?.[1]) return '';

  try {
    return decodeURIComponent(firebaseMatch[1]).replace(/^\/+/, '');
  } catch {
    return '';
  }
}

export function isNonFirebaseStorageReference(value = '') {
  const trimmed = String(value || '').trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('blob:')) return true;
  if (trimmed.startsWith('data:')) return true;
  if (trimmed.startsWith('http') && !trimmed.includes('firebasestorage.googleapis.com')) {
    return true;
  }

  return false;
}

export function normalizeStorageObjectPath(path = '') {
  const value = String(path || '').trim();
  if (!value) return '';

  if (value.startsWith('http')) {
    return extractStoragePathFromDownloadUrl(value);
  }

  return value.replace(/^\/+/, '');
}

export function resolveMemberPhotoStoragePath(member = {}) {
  const directPath = normalizeStorageObjectPath(member.profileImagePath);
  if (directPath) return directPath;

  return extractStoragePathFromDownloadUrl(member.profileImageUrl || member.photo || '');
}

export function resolveMemberReportCardStoragePath(member = {}) {
  const directPath = normalizeStorageObjectPath(member.reportCardPath);
  if (directPath) return directPath;

  return extractStoragePathFromDownloadUrl(member.reportCardUrl || '');
}

export function resolveSchoolBadgeStoragePath(school = {}) {
  const directPath = normalizeStorageObjectPath(school.badgePath);
  if (directPath) return directPath;

  const fromBadgeUrl = extractStoragePathFromDownloadUrl(school.badgeUrl || '');
  if (fromBadgeUrl) return fromBadgeUrl;

  const logo = String(school.logo || '').trim();
  if (!isNonFirebaseStorageReference(logo)) {
    return extractStoragePathFromDownloadUrl(logo);
  }

  return '';
}

export function resolveCreativeArtsLogoStoragePath(department = {}) {
  const directPath = normalizeStorageObjectPath(department.logoPath);
  if (directPath) return directPath;

  const fromLogoUrl = extractStoragePathFromDownloadUrl(department.logoUrl || '');
  if (fromLogoUrl) return fromLogoUrl;

  const photo = String(department.photo || '').trim();
  if (!isNonFirebaseStorageReference(photo)) {
    return extractStoragePathFromDownloadUrl(photo);
  }

  return '';
}

export function resolveMinistryAvatarStoragePath(ministry = {}) {
  const directPath = normalizeStorageObjectPath(ministry.avatarPath);
  if (directPath) return directPath;

  const fromAvatarUrl = extractStoragePathFromDownloadUrl(ministry.avatarUrl || '');
  if (fromAvatarUrl) return fromAvatarUrl;

  return '';
}
