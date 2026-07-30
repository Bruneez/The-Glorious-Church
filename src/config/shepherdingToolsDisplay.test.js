import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PUBLISHED_STATUS,
  SHEPHERDING_RESOURCE_TYPES,
} from './shepherdingToolsConstants.js';
import {
  formatResourceDisplayDate,
  formatResourcePublicationYear,
  getEmptyShepherdingToolsMessage,
  getResourceActionLabel,
  getResourceBadges,
  getResourceCardModel,
  getResourceCoverUrl,
  getResourceMetadata,
  getResourceSpeaker,
  getResourceSubtitle,
  getResourceTitle,
  isResourceDraft,
  shouldShowResourceActionButton,
  shouldShowResourceCover,
} from './shepherdingToolsDisplay.js';

const audioSermon = {
  id: 'audio-1',
  resourceType: SHEPHERDING_RESOURCE_TYPES.AUDIO_SERMON,
  title: 'Faith Over Fear',
  speaker: 'Pastor John',
  shortDescription: 'A message on trusting God.',
  category: 'Faith',
  platform: 'YouTube',
  series: 'Sunday Messages',
  datePreached: '2026-06-12',
  externalUrl: 'https://example.com/sermon',
  publishedStatus: PUBLISHED_STATUS.PUBLISHED,
};

test('getResourceTitle falls back to Untitled resource', () => {
  assert.equal(getResourceTitle({}), 'Untitled resource');
  assert.equal(getResourceTitle(audioSermon), 'Faith Over Fear');
});

test('getResourceSpeaker uses Unknown Speaker fallback for sermon cards', () => {
  assert.equal(getResourceSpeaker(audioSermon), 'Pastor John');
  assert.equal(
    getResourceSpeaker({ resourceType: SHEPHERDING_RESOURCE_TYPES.AUDIO_SERMON }),
    'Unknown Speaker',
  );
});

test('getResourceSubtitle varies by resource type with fallbacks', () => {
  assert.equal(getResourceSubtitle(audioSermon), 'Pastor John');
  assert.equal(
    getResourceSubtitle({ resourceType: SHEPHERDING_RESOURCE_TYPES.MUSIC }),
    'Unknown Artist',
  );
  assert.equal(
    getResourceSubtitle({
      resourceType: SHEPHERDING_RESOURCE_TYPES.MUSIC,
      artist: 'Worship Team',
    }),
    'Worship Team',
  );
  assert.equal(
    getResourceSubtitle({
      resourceType: SHEPHERDING_RESOURCE_TYPES.BOOK,
      author: 'Jane Doe',
    }),
    'Jane Doe',
  );
});

test('formatResourceDisplayDate renders day month year', () => {
  assert.equal(formatResourceDisplayDate('2026-06-12'), '12 June 2026');
});

test('formatResourcePublicationYear renders Published bullet year', () => {
  assert.equal(formatResourcePublicationYear(2024), 'Published • 2024');
});

test('getResourceMetadata includes sermon fields and hides empty series', () => {
  const metadata = getResourceMetadata(audioSermon);

  assert.ok(metadata.some((item) => item.label === 'Category' && item.value === 'Faith'));
  assert.ok(metadata.some((item) => item.label === 'Platform' && item.value === 'YouTube'));
  assert.ok(metadata.some((item) => item.label === 'Date preached' && item.value === '12 June 2026'));
  assert.ok(metadata.some((item) => item.label === 'Series' && item.value === 'Sunday Messages'));

  const withoutSeries = getResourceMetadata({ ...audioSermon, series: '' });
  assert.equal(withoutSeries.some((item) => item.label === 'Series'), false);
});

test('getResourceActionLabel uses type defaults and book-specific custom labels', () => {
  assert.equal(getResourceActionLabel(audioSermon), 'Listen to Sermon');
  assert.equal(
    getResourceActionLabel({
      resourceType: SHEPHERDING_RESOURCE_TYPES.VIDEO_SERMON,
    }),
    'Watch Sermon',
  );
  assert.equal(
    getResourceActionLabel({
      resourceType: SHEPHERDING_RESOURCE_TYPES.BOOK,
      linkActionLabel: 'Read Book',
    }),
    'Read Book',
  );
  assert.equal(
    getResourceActionLabel({
      ...audioSermon,
      linkActionLabel: 'Ignored for audio',
    }),
    'Listen to Sermon',
  );
});

test('getResourceCoverUrl prefers uploaded cover over generated thumbnail', () => {
  assert.equal(
    getResourceCoverUrl({
      coverImageUrl: 'https://example.com/uploaded.jpg',
      generatedThumbnailUrl: 'https://example.com/generated.jpg',
    }),
    'https://example.com/uploaded.jpg',
  );
  assert.equal(
    getResourceCoverUrl({
      generatedThumbnailUrl: 'https://example.com/generated.jpg',
    }),
    'https://example.com/generated.jpg',
  );
});

test('getResourceCardModel assembles card display fields', () => {
  const card = getResourceCardModel(audioSermon);

  assert.equal(card.title, 'Faith Over Fear');
  assert.equal(card.subtitle, 'Pastor John');
  assert.equal(card.actionLabel, 'Listen to Sermon');
  assert.equal(card.externalUrl, 'https://example.com/sermon');
  assert.equal(card.isDraft, false);
  assert.equal(card.showActionButton, true);
  assert.equal(card.isExternalAction, true);
  assert.equal(card.coverAspectClass, 'aspect-video');
});

test('daily devotional cards omit cover when none exists and still show Read Devotional', () => {
  const devotional = {
    id: 'dev-1',
    resourceType: SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONAL,
    title: 'Morning Hope',
    scriptureReference: 'Psalm 23:1',
    resourceDate: '2026-06-12',
    themes: ['Hope'],
    devotionalContent: 'The Lord is my shepherd. He leads me beside still waters and restores my soul.',
    publishedStatus: PUBLISHED_STATUS.PUBLISHED,
  };

  assert.equal(shouldShowResourceCover(devotional), false);
  assert.equal(shouldShowResourceActionButton(devotional), true);

  const card = getResourceCardModel(devotional);
  assert.equal(card.actionLabel, 'Read Devotional');
  assert.equal(card.isExternalAction, false);
  assert.equal(card.showCover, false);
  assert.match(card.contentPreview, /Lord is my shepherd/i);
});

test('getResourceBadges includes draft, published, featured, and new badges', () => {
  const badges = getResourceBadges(
    {
      publishedStatus: PUBLISHED_STATUS.PUBLISHED,
      tags: ['Featured', 'New'],
    },
    { showDraftStatus: true },
  );

  assert.deepEqual(
    badges.map((badge) => badge.label),
    ['Published', 'Featured', 'New'],
  );

  const draftBadges = getResourceBadges(
    { publishedStatus: PUBLISHED_STATUS.DRAFT },
    { showDraftStatus: true },
  );
  assert.deepEqual(draftBadges.map((badge) => badge.label), ['Draft']);
});

test('isResourceDraft identifies draft resources', () => {
  assert.equal(isResourceDraft({ publishedStatus: PUBLISHED_STATUS.DRAFT }), true);
  assert.equal(isResourceDraft(audioSermon), false);
});

test('getEmptyShepherdingToolsMessage handles search and default empty states', () => {
  const tab = { label: 'Books', emptyMessage: 'No books have been added yet.' };

  assert.equal(getEmptyShepherdingToolsMessage(tab), 'No books have been added yet.');
  assert.equal(
    getEmptyShepherdingToolsMessage(tab, 'leadership'),
    'No books match your search.',
  );
});

test('book metadata formats publication year and uses portrait aspect ratio', () => {
  const book = {
    resourceType: SHEPHERDING_RESOURCE_TYPES.BOOK,
    title: 'Growing Deep',
    author: 'Jane Doe',
    publicationYear: 2024,
    category: 'Discipleship',
  };

  const card = getResourceCardModel(book);
  const metadata = getResourceMetadata(book);

  assert.equal(card.coverAspectClass, 'aspect-[2/3]');
  assert.ok(metadata.some((item) => item.value === 'Published • 2024'));
});
