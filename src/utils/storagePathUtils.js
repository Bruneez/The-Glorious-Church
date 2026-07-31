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

function asStorageRecord(record) {
  return record && typeof record === 'object' ? record : {};
}

export function resolveMemberPhotoStoragePath(member) {
  const record = asStorageRecord(member);
  const directPath = normalizeStorageObjectPath(record.profileImagePath);
  if (directPath) return directPath;

  return extractStoragePathFromDownloadUrl(record.profileImageUrl || record.photo || '');
}

export function resolveMemberReportCardStoragePath(member) {
  const record = asStorageRecord(member);
  const directPath = normalizeStorageObjectPath(record.reportCardPath);
  if (directPath) return directPath;

  return extractStoragePathFromDownloadUrl(record.reportCardUrl || '');
}

export function resolveSchoolBadgeStoragePath(school = {}) {
  const record = asStorageRecord(school);
  const directPath = normalizeStorageObjectPath(record.badgePath);
  if (directPath) return directPath;

  const fromBadgeUrl = extractStoragePathFromDownloadUrl(record.badgeUrl || '');
  if (fromBadgeUrl) return fromBadgeUrl;

  const logo = String(record.logo || '').trim();
  if (!isNonFirebaseStorageReference(logo)) {
    return extractStoragePathFromDownloadUrl(logo);
  }

  return '';
}

export function resolveCreativeArtsLogoStoragePath(department = {}) {
  const record = asStorageRecord(department);
  const directPath = normalizeStorageObjectPath(record.logoPath);
  if (directPath) return directPath;

  const fromLogoUrl = extractStoragePathFromDownloadUrl(record.logoUrl || '');
  if (fromLogoUrl) return fromLogoUrl;

  const photo = String(record.photo || '').trim();
  if (!isNonFirebaseStorageReference(photo)) {
    return extractStoragePathFromDownloadUrl(photo);
  }

  return '';
}

export function resolveMinistryAvatarStoragePath(ministry = {}) {
  const record = asStorageRecord(ministry);
  const directPath = normalizeStorageObjectPath(record.avatarPath);
  if (directPath) return directPath;

  const fromAvatarUrl = extractStoragePathFromDownloadUrl(record.avatarUrl || '');
  if (fromAvatarUrl) return fromAvatarUrl;

  return '';
}

export function resolveTravelDestinationImageStoragePath(destination = {}) {
  const record = asStorageRecord(destination);
  const directPath = normalizeStorageObjectPath(record.imageStoragePath);
  if (directPath) return directPath;

  const fromImageUrl = extractStoragePathFromDownloadUrl(record.imageUrl || '');
  if (fromImageUrl) return fromImageUrl;

  return '';
}

export function resolveTransportVehicleImageStoragePath(driver = {}) {
  const record = asStorageRecord(driver);
  const directPath = normalizeStorageObjectPath(record.vehicleImageStoragePath);
  if (directPath) return directPath;

  const fromImageUrl = extractStoragePathFromDownloadUrl(record.vehicleImageUrl || '');
  if (fromImageUrl) return fromImageUrl;

  const legacyUrl = String(
    record.vehicleImage || record.vehiclePhoto || record.photo || record.image || '',
  ).trim();
  if (!isNonFirebaseStorageReference(legacyUrl)) {
    return extractStoragePathFromDownloadUrl(legacyUrl);
  }

  return '';
}

export function resolveMachanehMoviePosterStoragePath(movie = {}) {
  const record = asStorageRecord(movie);
  const directPath = normalizeStorageObjectPath(record.posterStoragePath);
  if (directPath) return directPath;

  const fromPosterUrl = extractStoragePathFromDownloadUrl(record.posterUrl || '');
  if (fromPosterUrl) return fromPosterUrl;

  return '';
}

export function resolveMerchandiseImageStoragePath(image = {}) {
  const record = asStorageRecord(image);
  const directPath = normalizeStorageObjectPath(record.storagePath);
  if (directPath) return directPath;

  return extractStoragePathFromDownloadUrl(record.url || '');
}

export function resolveShepherdingCoverStoragePath(resource = {}) {
  const record = asStorageRecord(resource);
  const directPath = normalizeStorageObjectPath(record.coverImageStoragePath);
  if (directPath) return directPath;

  return extractStoragePathFromDownloadUrl(record.coverImageUrl || '');
}

export function resolveAppFixAttachmentStoragePath(attachment = {}) {
  const record = asStorageRecord(attachment);
  const directPath = normalizeStorageObjectPath(record.fileStoragePath);
  if (directPath) return directPath;

  return extractStoragePathFromDownloadUrl(record.fileUrl || '');
}

export function resolveProjectCoverStoragePath(project = {}) {
  const record = asStorageRecord(project);
  const directPath = normalizeStorageObjectPath(record.coverStoragePath);
  if (directPath) return directPath;

  return extractStoragePathFromDownloadUrl(record.coverUrl || '');
}

export function resolveProjectAttachmentStoragePath(attachment = {}) {
  const record = asStorageRecord(attachment);
  const directPath = normalizeStorageObjectPath(record.fileStoragePath);
  if (directPath) return directPath;

  return extractStoragePathFromDownloadUrl(record.fileUrl || '');
}
