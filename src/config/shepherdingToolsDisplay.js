import {
  PUBLISHED_STATUS,
  SHEPHERDING_RESOURCE_TYPES,
} from './shepherdingToolsConstants.js';
import { isPermanentCoverUrl } from './shepherdingToolsResourceOptions.js';

const DEFAULT_ACTION_LABELS = {
  [SHEPHERDING_RESOURCE_TYPES.AUDIO_SERMON]: 'Listen to Sermon',
  [SHEPHERDING_RESOURCE_TYPES.VIDEO_SERMON]: 'Watch Sermon',
  [SHEPHERDING_RESOURCE_TYPES.MUSIC]: 'Listen to Music',
  [SHEPHERDING_RESOURCE_TYPES.BOOK]: 'Access Book',
  [SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONAL]: 'Read Devotional',
};

const SPEAKER_FALLBACK = 'Unknown Speaker';
const ARTIST_FALLBACK = 'Unknown Artist';

const NEW_RESOURCE_DAYS = 14;

const BADGE_TONES = {
  draft: 'amber',
  published: 'emerald',
  featured: 'indigo',
  new: 'indigo',
};

function normalizeText(value) {
  const text = String(value ?? '').trim();
  return text || '';
}

function getResourceType(resource) {
  return normalizeText(resource?.resourceType);
}

function normalizeCoverUrl(url) {
  const value = normalizeText(url);
  return isPermanentCoverUrl(value) ? value : '';
}

function toDate(value) {
  if (!value) return null;

  if (typeof value?.toDate === 'function') {
    const converted = value.toDate();
    return Number.isNaN(converted?.getTime?.()) ? null : converted;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = Date.parse(String(value));
  if (Number.isNaN(parsed)) return null;

  return new Date(parsed);
}

export function formatResourceDisplayDate(value) {
  const directText = normalizeText(value);
  if (!directText) return '';

  const parsedDate = toDate(value);
  if (!parsedDate) return directText;

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate);
}

export function formatResourcePublicationYear(value) {
  const year = normalizeText(value);
  if (!year) return '';

  return `Published • ${year}`;
}

function hasListValue(values = [], target) {
  const normalizedTarget = String(target || '').trim().toLowerCase();
  if (!normalizedTarget) return false;

  return values.some((value) => String(value || '').trim().toLowerCase() === normalizedTarget);
}

function isResourceFeatured(resource) {
  if (resource?.featured === true) return true;

  return (
    hasListValue(resource?.tags, 'Featured')
    || hasListValue(resource?.themes, 'Featured')
  );
}

function isResourceNew(resource) {
  if (resource?.isNew === true) return true;
  if (hasListValue(resource?.tags, 'New')) return true;

  const createdAt = toDate(resource?.createdAt);
  if (!createdAt) return false;

  const ageMs = Date.now() - createdAt.getTime();
  return ageMs >= 0 && ageMs <= NEW_RESOURCE_DAYS * 24 * 60 * 60 * 1000;
}

export function getResourceCoverUrl(resource) {
  const uploadedCover = normalizeCoverUrl(resource?.coverImageUrl);
  const generatedThumbnail = normalizeCoverUrl(resource?.generatedThumbnailUrl);

  return uploadedCover || generatedThumbnail || '';
}

export function getResourceCoverAlt(resource) {
  const title = getResourceTitle(resource);
  const resourceType = getResourceType(resource);

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.VIDEO_SERMON) {
    return title ? `${title} thumbnail` : 'Video thumbnail';
  }

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.BOOK) {
    return title ? `${title} book cover` : 'Book cover';
  }

  return title ? `${title} cover` : 'Resource cover';
}

export function getResourceCoverAspectClass(resource) {
  const resourceType = getResourceType(resource);

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.BOOK) {
    return 'aspect-[2/3]';
  }

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.MUSIC) {
    return 'aspect-square';
  }

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONAL) {
    return 'aspect-[16/10]';
  }

  return 'aspect-video';
}

export function shouldShowResourceCover(resource) {
  const resourceType = getResourceType(resource);

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONAL) {
    return Boolean(getResourceCoverUrl(resource));
  }

  return true;
}

export function getResourceTitle(resource) {
  return normalizeText(resource?.title) || 'Untitled resource';
}

export function getResourceSpeaker(resource) {
  return normalizeText(resource?.speaker) || SPEAKER_FALLBACK;
}

export function getResourceArtist(resource) {
  const artist = normalizeText(resource?.artist);
  if (artist) return artist;

  const ministry = normalizeText(resource?.resourceSubtype);
  if (ministry) return ministry;

  return ARTIST_FALLBACK;
}

export function getResourceSubtitle(resource) {
  const resourceType = getResourceType(resource);

  if (
    resourceType === SHEPHERDING_RESOURCE_TYPES.AUDIO_SERMON
    || resourceType === SHEPHERDING_RESOURCE_TYPES.VIDEO_SERMON
  ) {
    return getResourceSpeaker(resource);
  }

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.MUSIC) {
    return getResourceArtist(resource);
  }

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.BOOK) {
    return normalizeText(resource?.author);
  }

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONAL) {
    return normalizeText(resource?.scriptureReference);
  }

  return '';
}

export function getResourceDate(resource) {
  const resourceType = getResourceType(resource);

  if (
    resourceType === SHEPHERDING_RESOURCE_TYPES.AUDIO_SERMON
    || resourceType === SHEPHERDING_RESOURCE_TYPES.VIDEO_SERMON
  ) {
    return formatResourceDisplayDate(resource?.datePreached);
  }

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONAL) {
    return formatResourceDisplayDate(resource?.resourceDate);
  }

  return '';
}

function buildMetadataLine(label, value) {
  const normalizedValue = normalizeText(value);
  if (!normalizedValue) return null;

  return { label, value: normalizedValue };
}

function buildAudioSermonMetadata(resource) {
  return [
    buildMetadataLine('Series', resource?.series),
    buildMetadataLine('Category', resource?.category),
    buildMetadataLine('Date preached', formatResourceDisplayDate(resource?.datePreached)),
    buildMetadataLine('Platform', resource?.platform),
  ].filter(Boolean);
}

function buildVideoSermonMetadata(resource) {
  return [
    buildMetadataLine('Series', resource?.series),
    buildMetadataLine('Platform', resource?.platform),
    buildMetadataLine('Date preached', formatResourceDisplayDate(resource?.datePreached)),
  ].filter(Boolean);
}

function buildMusicMetadata(resource) {
  return [
    buildMetadataLine('Resource Type', resource?.resourceSubtype),
    buildMetadataLine('Platform', resource?.platform),
    buildMetadataLine('Category', resource?.category),
  ].filter(Boolean);
}

function buildBookMetadata(resource) {
  return [
    buildMetadataLine('Published', formatResourcePublicationYear(resource?.publicationYear)),
    buildMetadataLine('Category', resource?.category),
  ].filter(Boolean);
}

function getDevotionalThemeOrTags(resource) {
  const theme = normalizeText(resource?.themes?.[0]);
  if (theme) return theme;

  const tags = (resource?.tags || [])
    .map((tag) => normalizeText(tag))
    .filter(Boolean)
    .slice(0, 3);

  if (!tags.length) return '';

  return tags.join(', ');
}

function buildDevotionalMetadata(resource) {
  const lines = [
    buildMetadataLine('Published', formatResourceDisplayDate(resource?.resourceDate)),
    buildMetadataLine('Theme', getDevotionalThemeOrTags(resource)),
  ].filter(Boolean);

  if (!getResourceSubtitle(resource)) {
    const scriptureLine = buildMetadataLine('Scripture', resource?.scriptureReference);
    if (scriptureLine) lines.unshift(scriptureLine);
  }

  return lines;
}

export function getResourceMetadata(resource) {
  const resourceType = getResourceType(resource);

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.AUDIO_SERMON) {
    return buildAudioSermonMetadata(resource);
  }

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.VIDEO_SERMON) {
    return buildVideoSermonMetadata(resource);
  }

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.MUSIC) {
    return buildMusicMetadata(resource);
  }

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.BOOK) {
    return buildBookMetadata(resource);
  }

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONAL) {
    return buildDevotionalMetadata(resource);
  }

  return [];
}

/** @deprecated Use getResourceMetadata instead. */
export function getResourceMetadataLines(resource) {
  return getResourceMetadata(resource);
}

export function getResourceSecondaryMetadata(resource) {
  const resourceType = getResourceType(resource);

  if (resourceType !== SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONAL) {
    return [];
  }

  const publicationDate = formatResourceDisplayDate(resource?.resourceDate);
  if (!publicationDate) return [];

  return [{ label: 'Published', value: publicationDate }];
}

export function getResourceShortDescription(resource) {
  return normalizeText(resource?.shortDescription);
}

export function getResourceContentPreview(resource) {
  const resourceType = getResourceType(resource);
  const shortDescription = getResourceShortDescription(resource);

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONAL) {
    if (shortDescription) return shortDescription;

    const devotionalContent = normalizeText(resource?.devotionalContent);
    if (!devotionalContent) return '';

    return devotionalContent;
  }

  return shortDescription;
}

export function getResourceActionLabel(resource) {
  const resourceType = getResourceType(resource);
  const customLabel = normalizeText(resource?.linkActionLabel);

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.BOOK && customLabel) {
    return customLabel;
  }

  return DEFAULT_ACTION_LABELS[resourceType] || 'Open';
}

export function getResourceExternalUrl(resource) {
  return normalizeText(resource?.externalUrl);
}

export function isResourceDraft(resource) {
  return resource?.publishedStatus === PUBLISHED_STATUS.DRAFT;
}

export function getResourceBadges(resource, { showDraftStatus = false } = {}) {
  const badges = [];

  if (showDraftStatus && isResourceDraft(resource)) {
    badges.push({ label: 'Draft', tone: BADGE_TONES.draft });
  }

  if (
    showDraftStatus
    && resource?.publishedStatus === PUBLISHED_STATUS.PUBLISHED
    && !isResourceDraft(resource)
  ) {
    badges.push({ label: 'Published', tone: BADGE_TONES.published });
  }

  if (isResourceFeatured(resource)) {
    badges.push({ label: 'Featured', tone: BADGE_TONES.featured });
  }

  if (isResourceNew(resource)) {
    badges.push({ label: 'New', tone: BADGE_TONES.new });
  }

  return badges;
}

export function shouldShowResourceActionButton(resource) {
  const resourceType = getResourceType(resource);

  if (resourceType === SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONAL) {
    return true;
  }

  return Boolean(getResourceExternalUrl(resource));
}

export function isResourceExternalAction(resource) {
  return Boolean(getResourceExternalUrl(resource));
}

export function getResourceCardModel(resource, { showDraftStatus = false } = {}) {
  const resourceType = getResourceType(resource);
  const subtitle = getResourceSubtitle(resource);

  return {
    id: resource?.id,
    resourceType,
    coverUrl: getResourceCoverUrl(resource),
    coverAlt: getResourceCoverAlt(resource),
    coverAspectClass: getResourceCoverAspectClass(resource),
    showCover: shouldShowResourceCover(resource),
    title: getResourceTitle(resource),
    subtitle,
    showSubtitle: (
      resourceType === SHEPHERDING_RESOURCE_TYPES.AUDIO_SERMON
      || resourceType === SHEPHERDING_RESOURCE_TYPES.VIDEO_SERMON
      || resourceType === SHEPHERDING_RESOURCE_TYPES.MUSIC
      || Boolean(subtitle)
    ),
    contentPreview: getResourceContentPreview(resource),
    metadata: getResourceMetadata(resource),
    secondaryMetadata: getResourceSecondaryMetadata(resource),
    badges: getResourceBadges(resource, { showDraftStatus }),
    actionLabel: getResourceActionLabel(resource),
    externalUrl: getResourceExternalUrl(resource),
    showActionButton: shouldShowResourceActionButton(resource),
    isExternalAction: isResourceExternalAction(resource),
    isDraft: isResourceDraft(resource),
  };
}

export function getEmptyShepherdingToolsMessage(tabConfig, searchTerm = '') {
  const hasSearch = Boolean(normalizeText(searchTerm));

  if (hasSearch) {
    return `No ${tabConfig?.label?.toLowerCase() || 'resources'} match your search.`;
  }

  return tabConfig?.emptyMessage || 'No resources have been added yet.';
}

export function getResourceCoverInitials(resource) {
  const title = getResourceTitle(resource);
  const words = title.split(/\s+/).filter(Boolean);

  if (!words.length) return 'ST';

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase();
}
