import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanupUnusedUpload,
  prepareProjectAttachmentUpload,
  prepareProjectCoverUpload,
  shouldCleanupPreviousProjectCover,
} from './projectStorageLifecycle.js';

test('prepareProjectCoverUpload validates file and returns next storage path metadata', () => {
  const prepared = prepareProjectCoverUpload('project-123', {
    type: 'image/png',
    size: 2048,
    name: 'cover.png',
  }, {
    previousPath: 'projects/project-123/cover/old.png',
  });

  assert.equal(prepared.contentType, 'image/png');
  assert.match(prepared.coverStoragePath, /^projects\/project-123\/cover\//);
  assert.equal(prepared.shouldCleanupPrevious, true);
});

test('prepareProjectAttachmentUpload validates file and returns attachment metadata', () => {
  const prepared = prepareProjectAttachmentUpload('project-123', {
    type: 'application/pdf',
    size: 4096,
    name: 'brief.pdf',
  });

  assert.equal(prepared.contentType, 'application/pdf');
  assert.match(prepared.fileStoragePath, /^projects\/project-123\/attachments\//);
});

test('shouldCleanupPreviousProjectCover skips cleanup when paths match', () => {
  assert.equal(
    shouldCleanupPreviousProjectCover(
      'projects/abc/cover/file.png',
      'projects/abc/cover/file.png',
    ),
    false,
  );
});

test('cleanupUnusedUpload returns a warning for unexpected delete failures', async () => {
  const deleteFn = async () => {
    throw new Error('Permission denied');
  };

  const warning = await cleanupUnusedUpload('projects/abc/cover/old.png', deleteFn);
  assert.match(warning, /could not be removed from storage/i);
});
