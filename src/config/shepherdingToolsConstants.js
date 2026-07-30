/** Resource type values — aligned with UI tab ids in shepherdingToolsOptions.js */
export const SHEPHERDING_RESOURCE_TYPES = {
  AUDIO_SERMON: 'audio-sermons',
  VIDEO_SERMON: 'video-sermons',
  MUSIC: 'music',
  BOOK: 'books',
  DAILY_DEVOTIONAL: 'daily-devotionals',
};

export const SHEPHERDING_RESOURCE_TYPE_LIST = Object.values(SHEPHERDING_RESOURCE_TYPES);

export const PUBLISHED_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
};

export const PUBLISHED_STATUS_OPTIONS = [
  { value: PUBLISHED_STATUS.DRAFT, label: 'Draft' },
  { value: PUBLISHED_STATUS.PUBLISHED, label: 'Published' },
];

export const SHEPHERDING_PLATFORM_OPTIONS = [
  { value: 'Spotify', label: 'Spotify' },
  { value: 'Apple Podcasts', label: 'Apple Podcasts' },
  { value: 'Apple Music', label: 'Apple Music' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'YouTube Music', label: 'YouTube Music' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Google Drive', label: 'Google Drive' },
  { value: 'Website', label: 'Website' },
  { value: 'Other', label: 'Other' },
];

export const SHEPHERDING_CATEGORY_OPTIONS = [
  { value: 'Faith', label: 'Faith' },
  { value: 'Prayer', label: 'Prayer' },
  { value: 'Leadership', label: 'Leadership' },
  { value: 'Shepherding', label: 'Shepherding' },
  { value: 'Church Growth', label: 'Church Growth' },
  { value: 'Evangelism', label: 'Evangelism' },
  { value: 'Discipleship', label: 'Discipleship' },
  { value: 'Holy Spirit', label: 'Holy Spirit' },
  { value: 'Family', label: 'Family' },
  { value: 'Youth', label: 'Youth' },
  { value: 'Theology', label: 'Theology' },
  { value: 'Other', label: 'Other' },
];

export const SHEPHERDING_PLATFORM_VALUES = SHEPHERDING_PLATFORM_OPTIONS.map((option) => option.value);
export const SHEPHERDING_CATEGORY_VALUES = SHEPHERDING_CATEGORY_OPTIONS.map((option) => option.value);

export const SHEPHERDING_AUDIO_PLATFORM_OPTIONS = [
  { value: 'Spotify', label: 'Spotify' },
  { value: 'Apple Podcasts', label: 'Apple Podcasts' },
  { value: 'SoundCloud', label: 'SoundCloud' },
  { value: 'YouTube Music', label: 'YouTube Music' },
  { value: 'Google Drive', label: 'Google Drive' },
  { value: 'Website', label: 'Website' },
  { value: 'Other', label: 'Other' },
];

export const SHEPHERDING_VIDEO_PLATFORM_OPTIONS = [
  { value: 'YouTube', label: 'YouTube' },
  { value: 'Vimeo', label: 'Vimeo' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Website', label: 'Church Website' },
  { value: 'Google Drive', label: 'Google Drive' },
  { value: 'Other', label: 'Other' },
];

export const SHEPHERDING_MUSIC_PLATFORM_OPTIONS = [
  { value: 'Spotify', label: 'Spotify' },
  { value: 'Apple Music', label: 'Apple Music' },
  { value: 'YouTube Music', label: 'YouTube Music' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'SoundCloud', label: 'SoundCloud' },
  { value: 'Website', label: 'Website' },
  { value: 'Other', label: 'Other' },
];

export const MUSIC_RESOURCE_SUBTYPE_OPTIONS = [
  { value: 'Song', label: 'Song' },
  { value: 'Album', label: 'Album' },
  { value: 'Playlist', label: 'Playlist' },
  { value: 'Worship Set', label: 'Worship Set' },
  { value: 'Instrumental', label: 'Instrumental' },
  { value: 'Choir Resource', label: 'Choir Resource' },
];

export const BOOK_LINK_ACTION_OPTIONS = [
  { value: 'Access Book', label: 'Access Book' },
  { value: 'Read Book', label: 'Read Book' },
  { value: 'Download Book', label: 'Download Book' },
  { value: 'View Resource', label: 'View Resource' },
  { value: 'Open Library', label: 'Open Library' },
];

export const BOOK_CATEGORY_OPTIONS = [
  { value: 'Leadership', label: 'Leadership' },
  { value: 'Shepherding', label: 'Shepherding' },
  { value: 'Church Growth', label: 'Church Growth' },
  { value: 'Prayer', label: 'Prayer' },
  { value: 'Faith', label: 'Faith' },
  { value: 'Discipleship', label: 'Discipleship' },
  { value: 'Evangelism', label: 'Evangelism' },
  { value: 'Ministry', label: 'Ministry' },
  { value: 'Family', label: 'Family' },
  { value: 'Youth', label: 'Youth' },
  { value: 'Theology', label: 'Theology' },
  { value: 'Other', label: 'Other' },
];

export const BOOK_CATEGORY_VALUES = BOOK_CATEGORY_OPTIONS.map((option) => option.value);

export const PUBLISHED_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

export const DEFAULT_NOTIFICATION_ENABLED = false;

export const SHEPHERDING_TOOLS_FIRESTORE_FIELDS = [
  'resourceType',
  'title',
  'speaker',
  'author',
  'artist',
  'externalUrl',
  'platform',
  'linkActionLabel',
  'series',
  'category',
  'resourceSubtype',
  'datePreached',
  'publicationYear',
  'resourceDate',
  'scriptureReference',
  'shortDescription',
  'fullDescription',
  'devotionalContent',
  'coverImageUrl',
  'coverImageStoragePath',
  'themes',
  'tags',
  'publishedStatus',
  'notificationEnabled',
  'createdByUserId',
  'createdAt',
  'updatedAt',
  'deletedAt',
];
