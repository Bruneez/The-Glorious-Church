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
