import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanupUnusedUpload,
  replaceImage,
  resolvePreviousShepherdingCoverPath,
  shouldCleanupPreviousShepherdingCover,
} from './shepherdingToolsStorageLifecycle.js';

test('resolvePreviousShepherdingCoverPath prefers explicit previousCoverPath', () => {
  assert.equal(
    resolvePreviousShepherdingCoverPath(
      { previousCoverPath: 'shepherding-tools/abc/explicit.jpg' },
      { coverImageStoragePath: 'shepherding-tools/abc/other.jpg' },
    ),
    'shepherding-tools/abc/explicit.jpg',
  );
});

test('replaceImage validates file and returns next storage path metadata', () => {
  const replacement = replaceImage('resource-123', {
    type: 'image/png',
    size: 2048,
    name: 'cover.png',
  }, {
    previousPath: 'shepherding-tools/resource-123/old.png',
  });

  assert.equal(replacement.contentType, 'image/png');
  assert.match(replacement.coverImageStoragePath, /^shepherding-tools\/resource-123\//);
  assert.equal(replacement.shouldCleanupPrevious, true);
});

test('shouldCleanupPreviousShepherdingCover skips cleanup when paths match', () => {
  assert.equal(
    shouldCleanupPreviousShepherdingCover(
      'shepherding-tools/abc/cover.jpg',
      'shepherding-tools/abc/cover.jpg',
    ),
    false,
  );
});

test('storage/object-not-found remains non-fatal during cover cleanup', async () => {
  const deleteFn = async () => {
    const error = new Error('Object not found');
    error.code = 'storage/object-not-found';
    throw error;
  };

  const warning = await cleanupUnusedUpload('shepherding-tools/abc/old.jpg', deleteFn);
  assert.equal(warning, null);
});

test('cleanupUnusedUpload returns a warning for unexpected delete failures', async () => {
  const deleteFn = async () => {
    throw new Error('Permission denied');
  };

  const warning = await cleanupUnusedUpload('shepherding-tools/abc/old.jpg', deleteFn);
  assert.match(warning, /could not be removed from storage/i);
});
