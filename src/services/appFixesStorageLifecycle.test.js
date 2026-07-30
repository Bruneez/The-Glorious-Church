import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanupUnusedUpload,
  prepareAttachmentUpload,
  resolvePreviousAppFixAttachmentPath,
  shouldCleanupPreviousAppFixAttachment,
} from './appFixesStorageLifecycle.js';

test('resolvePreviousAppFixAttachmentPath prefers explicit previousAttachmentPath', () => {
  assert.equal(
    resolvePreviousAppFixAttachmentPath(
      { previousAttachmentPath: 'app-fixes/abc/explicit.pdf' },
      { fileStoragePath: 'app-fixes/abc/other.pdf' },
    ),
    'app-fixes/abc/explicit.pdf',
  );
});

test('prepareAttachmentUpload validates file and returns next storage path metadata', () => {
  const prepared = prepareAttachmentUpload('request-123', {
    type: 'application/pdf',
    size: 2048,
    name: 'error-log.pdf',
  }, {
    previousPath: 'app-fixes/request-123/old.pdf',
  });

  assert.equal(prepared.contentType, 'application/pdf');
  assert.match(prepared.fileStoragePath, /^app-fixes\/request-123\//);
  assert.equal(prepared.shouldCleanupPrevious, true);
});

test('shouldCleanupPreviousAppFixAttachment skips cleanup when paths match', () => {
  assert.equal(
    shouldCleanupPreviousAppFixAttachment(
      'app-fixes/abc/file.pdf',
      'app-fixes/abc/file.pdf',
    ),
    false,
  );
});

test('cleanupUnusedUpload returns a warning for unexpected delete failures', async () => {
  const deleteFn = async () => {
    throw new Error('Permission denied');
  };

  const warning = await cleanupUnusedUpload('app-fixes/abc/old.pdf', deleteFn);
  assert.match(warning, /could not be removed from storage/i);
});
