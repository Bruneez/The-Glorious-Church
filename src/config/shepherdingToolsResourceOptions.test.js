import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PUBLISHED_STATUS,
  SHEPHERDING_RESOURCE_TYPES,
} from './shepherdingToolsConstants.js';
import {
  buildShepherdingResourceFirestoreDocument,
  buildShepherdingResourcePayload,
  filterShepherdingResources,
  isShepherdingResourcePublished,
  validateExternalUrl,
  validateShepherdingCoverFile,
  validateShepherdingResourceForm,
  validateShepherdingResourceTitle,
} from './shepherdingToolsResourceOptions.js';

test('validateShepherdingResourceTitle requires a non-empty title', () => {
  assert.equal(validateShepherdingResourceTitle(''), 'Title is required.');
  assert.equal(validateShepherdingResourceTitle('  '), 'Title is required.');
  assert.equal(validateShepherdingResourceTitle('Faith Walk'), '');
});

test('validateExternalUrl accepts HTTP and HTTPS only', () => {
  assert.equal(validateExternalUrl('https://example.com/sermon'), '');
  assert.equal(validateExternalUrl('http://example.com/sermon'), '');
  assert.equal(validateExternalUrl(''), '');
  assert.match(validateExternalUrl('javascript:alert(1)'), /HTTP or HTTPS/i);
  assert.match(validateExternalUrl('file:///tmp/test.mp3'), /HTTP or HTTPS/i);
  assert.match(validateExternalUrl('ftp://example.com'), /HTTP or HTTPS/i);
  assert.match(validateExternalUrl('data:text/plain,hello'), /HTTP or HTTPS/i);
  assert.match(validateExternalUrl('not-a-url'), /HTTP or HTTPS URL/i);
});

test('validateShepherdingCoverFile enforces image type and 5 MB limit', () => {
  assert.equal(
    validateShepherdingCoverFile({ type: 'image/jpeg', size: 1024, name: 'cover.jpg' }),
    '',
  );
  assert.equal(
    validateShepherdingCoverFile({ type: 'image/png', size: 1024, name: 'cover.png' }),
    '',
  );
  assert.equal(
    validateShepherdingCoverFile({ type: 'image/webp', size: 1024, name: 'cover.webp' }),
    '',
  );
  assert.match(
    validateShepherdingCoverFile({ type: 'application/pdf', size: 1024, name: 'cover.pdf' }),
    /JPG, PNG, or WEBP/i,
  );
  assert.match(
    validateShepherdingCoverFile({ type: 'image/jpeg', size: 6 * 1024 * 1024, name: 'cover.jpg' }),
    /5 MB/i,
  );
});

test('buildShepherdingResourcePayload normalizes optional fields and defaults', () => {
  const payload = buildShepherdingResourcePayload(
    {
      resourceType: SHEPHERDING_RESOURCE_TYPES.AUDIO_SERMON,
      title: '  Sunday Message  ',
      speaker: ' Pastor John ',
      externalUrl: 'https://example.com/audio',
      platform: 'YouTube',
      category: 'Faith',
      themes: [' hope ', ''],
      tags: [' sunday '],
      publishedStatus: 'invalid-status',
      notificationEnabled: true,
      coverImageUrl: 'blob:http://localhost/cover',
    },
    { createdByUserId: 'user-123' },
  );

  assert.equal(payload.title, 'Sunday Message');
  assert.equal(payload.speaker, 'Pastor John');
  assert.equal(payload.externalUrl, 'https://example.com/audio');
  assert.deepEqual(payload.themes, ['hope']);
  assert.deepEqual(payload.tags, ['sunday']);
  assert.equal(payload.publishedStatus, PUBLISHED_STATUS.DRAFT);
  assert.equal(payload.notificationEnabled, true);
  assert.equal(payload.createdByUserId, 'user-123');
  assert.equal(payload.coverImageUrl, null);
});

test('buildShepherdingResourceFirestoreDocument includes notificationEnabled default', () => {
  const payload = buildShepherdingResourcePayload({
    resourceType: SHEPHERDING_RESOURCE_TYPES.BOOK,
    title: 'Growing Deep',
  });

  const document = buildShepherdingResourceFirestoreDocument(payload, {
    createdAt: 'created',
    updatedAt: 'updated',
    deletedAt: null,
  });

  assert.equal(document.notificationEnabled, false);
  assert.equal(document.deletedAt, null);
  assert.equal(document.title, 'Growing Deep');
});

test('filterShepherdingResources hides drafts for read-only views and supports search', () => {
  const resources = [
    {
      id: '1',
      resourceType: SHEPHERDING_RESOURCE_TYPES.MUSIC,
      title: 'Worship Set',
      artist: 'Team A',
      publishedStatus: PUBLISHED_STATUS.PUBLISHED,
    },
    {
      id: '2',
      resourceType: SHEPHERDING_RESOURCE_TYPES.MUSIC,
      title: 'Draft Song',
      artist: 'Team B',
      publishedStatus: PUBLISHED_STATUS.DRAFT,
    },
    {
      id: '3',
      resourceType: SHEPHERDING_RESOURCE_TYPES.BOOK,
      title: 'Faith Foundations',
      author: 'Jane Doe',
      publishedStatus: PUBLISHED_STATUS.PUBLISHED,
      deletedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  assert.deepEqual(
    filterShepherdingResources(resources, { resourceType: SHEPHERDING_RESOURCE_TYPES.MUSIC }).map((item) => item.id),
    ['1'],
  );
  assert.deepEqual(
    filterShepherdingResources(resources, {
      resourceType: SHEPHERDING_RESOURCE_TYPES.MUSIC,
      includeDrafts: true,
    }).map((item) => item.id),
    ['1', '2'],
  );
  assert.deepEqual(
    filterShepherdingResources(resources, { searchTerm: 'jane' }).map((item) => item.id),
    [],
  );
  assert.deepEqual(
    filterShepherdingResources(resources, { searchTerm: 'faith' }).map((item) => item.id),
    [],
  );

  const worshipResults = filterShepherdingResources(resources, { searchTerm: 'worship' });
  assert.deepEqual(worshipResults.map((item) => item.id), ['1']);
});

test('isShepherdingResourcePublished requires published status and no deletedAt', () => {
  assert.equal(
    isShepherdingResourcePublished({ publishedStatus: PUBLISHED_STATUS.PUBLISHED }),
    true,
  );
  assert.equal(
    isShepherdingResourcePublished({ publishedStatus: PUBLISHED_STATUS.DRAFT }),
    false,
  );
  assert.equal(
    isShepherdingResourcePublished({
      publishedStatus: PUBLISHED_STATUS.PUBLISHED,
      deletedAt: '2026-01-01T00:00:00.000Z',
    }),
    false,
  );
});

test('validateShepherdingResourceForm validates resource type and published status', () => {
  assert.equal(
    validateShepherdingResourceForm({
      title: 'Message',
      resourceType: 'invalid',
    }),
    'Resource type is invalid.',
  );
  assert.equal(
    validateShepherdingResourceForm({
      title: 'Message',
      publishedStatus: 'scheduled',
    }),
    'Published status is invalid.',
  );
  assert.equal(
    validateShepherdingResourceForm({
      title: 'Message',
      externalUrl: 'javascript:alert(1)',
    }),
    'URL must use HTTP or HTTPS.',
  );
});
