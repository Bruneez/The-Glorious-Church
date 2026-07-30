import {
  DEFAULT_NOTIFICATION_ENABLED,
  PUBLISHED_STATUS,
  SHEPHERDING_CATEGORY_VALUES,
  SHEPHERDING_PLATFORM_VALUES,
  SHEPHERDING_RESOURCE_TYPE_LIST,
  SHEPHERDING_RESOURCE_TYPES,
  BOOK_CATEGORY_VALUES,
} from './shepherdingToolsConstants.js';

export const ACCEPTED_SHEPHERDING_COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ACCEPTED_SHEPHERDING_COVER_ACCEPT =
  '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

/** Matches Machaneh Movies / Merchandise image limit (5 MB). */
export const MAX_SHEPHERDING_COVER_BYTES = 5 * 1024 * 1024;

export const SHEPHERDING_COVER_UPLOAD_TIMEOUT_MS = 30_000;

const BLOCKED_URL_PROTOCOL_PATTERN = /^(javascript:|file:|ftp:|data:)/i;

export function isPermanentCoverUrl(url) {
  const value = String(url || '').trim();
  if (!value) return false;
  return !value.startsWith('blob:') && !value.startsWith('data:');
}

export function normalizeOptionalString(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed || null;
}

export function normalizeStringList(values = []) {
  if (!Array.isArray(values)) return [];

  return values
    .map((value) => String(value || '').trim())
    .filter(Boolean);
}

export function isShepherdingResourceType(value) {
  return SHEPHERDING_RESOURCE_TYPE_LIST.includes(String(value || '').trim());
}

export function isPublishedStatus(value) {
  return Object.values(PUBLISHED_STATUS).includes(String(value || '').trim());
}

export function isShepherdingPlatform(value) {
  const normalized = String(value || '').trim();
  return !normalized || SHEPHERDING_PLATFORM_VALUES.includes(normalized);
}

export function isShepherdingCategory(value, resourceType = '') {
  const normalized = String(value || '').trim();
  if (!normalized) return true;

  if (String(resourceType || '').trim() === SHEPHERDING_RESOURCE_TYPES.BOOK) {
    return BOOK_CATEGORY_VALUES.includes(normalized);
  }

  return SHEPHERDING_CATEGORY_VALUES.includes(normalized);
}

export function validateExternalUrl(url, { required = false } = {}) {
  const value = String(url ?? '').trim();

  if (!value) {
    return required ? 'External URL is required.' : '';
  }

  if (BLOCKED_URL_PROTOCOL_PATTERN.test(value)) {
    return 'URL must use HTTP or HTTPS.';
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return 'Enter a valid HTTP or HTTPS URL.';
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return 'URL must use HTTP or HTTPS.';
  }

  return '';
}

export function validateShepherdingCoverFile(file) {
  if (!file) return '';

  if (file.size > MAX_SHEPHERDING_COVER_BYTES) {
    return 'Cover image must be 5 MB or smaller.';
  }

  const hasAllowedType = ACCEPTED_SHEPHERDING_COVER_TYPES.includes(file.type);
  const hasAllowedExtension = /\.(jpe?g|png|webp)$/i.test(file.name || '');

  if (!hasAllowedType && !hasAllowedExtension) {
    return 'Please upload a JPG, PNG, or WEBP cover image.';
  }

  return '';
}

export function resolveShepherdingCoverContentType(file) {
  if (!file) return null;

  const fileType = String(file.type || '').trim().toLowerCase();
  if (ACCEPTED_SHEPHERDING_COVER_TYPES.includes(fileType)) {
    return fileType;
  }

  const extension = String(file.name || '').match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';

  return null;
}

export function validateShepherdingResourceTitle(title) {
  if (!String(title || '').trim()) {
    return 'Title is required.';
  }

  return '';
}

export function validateShepherdingResourceForm(input = {}, { requireTitle = true } = {}) {
  if (requireTitle) {
    const titleMessage = validateShepherdingResourceTitle(input.title);
    if (titleMessage) return titleMessage;
  }

  if (input.resourceType && !isShepherdingResourceType(input.resourceType)) {
    return 'Resource type is invalid.';
  }

  if (input.publishedStatus && !isPublishedStatus(input.publishedStatus)) {
    return 'Published status is invalid.';
  }

  if (!isShepherdingPlatform(input.platform)) {
    return 'Platform is invalid.';
  }

  if (!isShepherdingCategory(input.category, input.resourceType)) {
    return 'Category is invalid.';
  }

  const externalUrlMessage = validateExternalUrl(input.externalUrl);
  if (externalUrlMessage) return externalUrlMessage;

  return '';
}

export function buildShepherdingResourcePayload(input = {}, { createdByUserId = '' } = {}) {
  const publicationYearValue = String(input.publicationYear ?? '').trim();
  const parsedPublicationYear = publicationYearValue ? Number(publicationYearValue) : null;
  const coverImageUrl = isPermanentCoverUrl(input.coverImageUrl)
    ? String(input.coverImageUrl).trim()
    : null;

  return {
    resourceType: String(input.resourceType || '').trim(),
    title: String(input.title || '').trim(),
    speaker: normalizeOptionalString(input.speaker),
    author: normalizeOptionalString(input.author),
    artist: normalizeOptionalString(input.artist),
    externalUrl: normalizeOptionalString(input.externalUrl),
    platform: normalizeOptionalString(input.platform),
    linkActionLabel: normalizeOptionalString(input.linkActionLabel),
    series: normalizeOptionalString(input.series),
    category: normalizeOptionalString(input.category),
    resourceSubtype: normalizeOptionalString(input.resourceSubtype),
    datePreached: normalizeOptionalString(input.datePreached),
    publicationYear: Number.isFinite(parsedPublicationYear) ? parsedPublicationYear : null,
    resourceDate: normalizeOptionalString(input.resourceDate),
    scriptureReference: normalizeOptionalString(input.scriptureReference),
    shortDescription: normalizeOptionalString(input.shortDescription),
    fullDescription: normalizeOptionalString(input.fullDescription),
    devotionalContent: normalizeOptionalString(input.devotionalContent),
    coverImageUrl,
    coverImageStoragePath: normalizeOptionalString(input.coverImageStoragePath),
    themes: normalizeStringList(input.themes),
    tags: normalizeStringList(input.tags),
    publishedStatus: isPublishedStatus(input.publishedStatus)
      ? input.publishedStatus
      : PUBLISHED_STATUS.DRAFT,
    notificationEnabled: Boolean(input.notificationEnabled),
    createdByUserId: normalizeOptionalString(createdByUserId || input.createdByUserId),
  };
}

export function buildShepherdingResourceFirestoreDocument(payload, timestamps = {}) {
  const document = {
    resourceType: payload.resourceType,
    title: payload.title,
    speaker: payload.speaker,
    author: payload.author,
    artist: payload.artist,
    externalUrl: payload.externalUrl,
    platform: payload.platform,
    linkActionLabel: payload.linkActionLabel,
    series: payload.series,
    category: payload.category,
    resourceSubtype: payload.resourceSubtype,
    datePreached: payload.datePreached,
    publicationYear: payload.publicationYear,
    resourceDate: payload.resourceDate,
    scriptureReference: payload.scriptureReference,
    shortDescription: payload.shortDescription,
    fullDescription: payload.fullDescription,
    devotionalContent: payload.devotionalContent,
    coverImageUrl: payload.coverImageUrl,
    coverImageStoragePath: payload.coverImageStoragePath,
    themes: payload.themes,
    tags: payload.tags,
    publishedStatus: payload.publishedStatus,
    notificationEnabled: payload.notificationEnabled ?? DEFAULT_NOTIFICATION_ENABLED,
    createdByUserId: payload.createdByUserId,
    createdAt: timestamps.createdAt ?? null,
    updatedAt: timestamps.updatedAt ?? null,
    deletedAt: timestamps.deletedAt ?? null,
  };

  return Object.fromEntries(
    Object.entries(document).filter(([, value]) => value !== undefined),
  );
}

export function isShepherdingResourceDeleted(resource = {}) {
  return Boolean(resource.deletedAt);
}

export function isShepherdingResourcePublished(resource = {}) {
  return (
    !isShepherdingResourceDeleted(resource)
    && resource.publishedStatus === PUBLISHED_STATUS.PUBLISHED
  );
}

export function filterShepherdingResources(
  resources = [],
  {
    searchTerm = '',
    resourceType = '',
    includeDrafts = false,
    categoryFilter = '',
    platformFilter = '',
    publishedStatusFilter = 'all',
  } = {},
) {
  const term = String(searchTerm || '').trim().toLowerCase();
  const normalizedType = String(resourceType || '').trim();
  const normalizedCategory = String(categoryFilter || '').trim();
  const normalizedPlatform = String(platformFilter || '').trim();
  const normalizedPublishedFilter = String(publishedStatusFilter || 'all').trim();

  return resources.filter((resource) => {
    if (isShepherdingResourceDeleted(resource)) return false;
    if (normalizedType && resource.resourceType !== normalizedType) return false;
    if (!includeDrafts && !isShepherdingResourcePublished(resource)) return false;

    if (normalizedPublishedFilter === PUBLISHED_STATUS.DRAFT
      && resource.publishedStatus !== PUBLISHED_STATUS.DRAFT) {
      return false;
    }

    if (normalizedPublishedFilter === PUBLISHED_STATUS.PUBLISHED
      && !isShepherdingResourcePublished(resource)) {
      return false;
    }

    if (normalizedCategory && String(resource.category || '').trim() !== normalizedCategory) {
      return false;
    }

    if (normalizedPlatform && String(resource.platform || '').trim() !== normalizedPlatform) {
      return false;
    }

    if (!term) return true;

    const haystack = [
      resource.title,
      resource.speaker,
      resource.author,
      resource.artist,
      resource.shortDescription,
      resource.fullDescription,
      resource.devotionalContent,
      resource.series,
      resource.category,
      resource.scriptureReference,
      resource.resourceDate,
      resource.resourceSubtype,
      ...(resource.themes || []),
      ...(resource.tags || []),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(term);
  });
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function mapShepherdingResourceToFormData(resource = null, resourceType = '') {
  const type = String(resource?.resourceType || resourceType || '').trim();

  return {
    resourceType: type,
    title: String(resource?.title || ''),
    speaker: String(resource?.speaker || ''),
    author: String(resource?.author || ''),
    artist: String(resource?.artist || ''),
    externalUrl: String(resource?.externalUrl || ''),
    platform: String(resource?.platform || ''),
    linkActionLabel: String(resource?.linkActionLabel || ''),
    series: String(resource?.series || ''),
    category: String(resource?.category || ''),
    resourceSubtype: String(resource?.resourceSubtype || ''),
    datePreached: String(resource?.datePreached || ''),
    publicationYear: resource?.publicationYear ? String(resource.publicationYear) : '',
    resourceDate: String(resource?.resourceDate || todayIsoDate()),
    scriptureReference: String(resource?.scriptureReference || ''),
    shortDescription: String(resource?.shortDescription || ''),
    fullDescription: String(resource?.fullDescription || ''),
    devotionalContent: String(resource?.devotionalContent || ''),
    coverImageUrl: String(resource?.coverImageUrl || ''),
    coverImageStoragePath: String(resource?.coverImageStoragePath || ''),
    themes: Array.isArray(resource?.themes) ? [...resource.themes] : [],
    tags: Array.isArray(resource?.tags) ? [...resource.tags] : [],
    publishedStatus: resource?.publishedStatus || PUBLISHED_STATUS.DRAFT,
    notificationEnabled: Boolean(resource?.notificationEnabled),
    themeTagsInput: [...(resource?.themes || []), ...(resource?.tags || [])].join(', '),
  };
}

function requiresExternalUrl(resourceType) {
  return resourceType !== SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONAL;
}

export function getShepherdingResourceValidationErrors(
  formData = {},
  { coverFile = null, removeCover = false, hasExistingCover = false } = {},
) {
  const errors = {};
  const resourceType = String(formData.resourceType || '').trim();

  const titleMessage = validateShepherdingResourceTitle(formData.title);
  if (titleMessage) errors.title = titleMessage;

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.AUDIO_SERMON
    || resourceType === SHEPHERDING_RESOURCE_TYPES.VIDEO_SERMON) {
    if (!String(formData.speaker || '').trim()) {
      errors.speaker = 'Speaker is required.';
    }
  }

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.MUSIC) {
    if (!String(formData.artist || '').trim()) {
      errors.artist = 'Artist or ministry is required.';
    }
  }

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.BOOK) {
    if (!String(formData.author || '').trim()) {
      errors.author = 'Author is required.';
    }
  }

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONAL) {
    if (!String(formData.resourceDate || '').trim()) {
      errors.resourceDate = 'Date is required.';
    }
    if (!String(formData.devotionalContent || '').trim()) {
      errors.devotionalContent = 'Devotional content is required.';
    }
  }

  if (requiresExternalUrl(resourceType)) {
    const externalUrlMessage = validateExternalUrl(formData.externalUrl, { required: true });
    if (externalUrlMessage) errors.externalUrl = externalUrlMessage;
  } else if (formData.externalUrl) {
    const optionalUrlMessage = validateExternalUrl(formData.externalUrl);
    if (optionalUrlMessage) errors.externalUrl = optionalUrlMessage;
  }

  if (coverFile) {
    const coverMessage = validateShepherdingCoverFile(coverFile);
    if (coverMessage) errors.cover = coverMessage;
  }

  const formMessage = validateShepherdingResourceForm(formData);
  if (formMessage && !Object.keys(errors).length) {
    errors.form = formMessage;
  }

  return errors;
}

export function buildShepherdingResourceFormPayload(formData = {}, { themeTagsInput = '' } = {}) {
  const themeTags = normalizeStringList(
    String(themeTagsInput || '')
      .split(',')
      .map((value) => value.trim()),
  );

  return buildShepherdingResourcePayload({
    ...formData,
    themes: themeTags,
    tags: themeTags,
  });
}
