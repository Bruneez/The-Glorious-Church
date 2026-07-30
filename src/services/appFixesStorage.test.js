import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateStoragePath,
  validateAttachment,
} from './appFixesStorage.js';

test('generateStoragePath builds a request-scoped storage path', () => {
  const path = generateStoragePath('request-123', 'Screen Recording.mp4');

  assert.match(path, /^app-fixes\/request-123\/\d+_Screen_Recording\.mp4$/);
});

test('generateStoragePath requires a request id', () => {
  assert.throws(() => generateStoragePath('', 'screen.png'), /Request ID is required/i);
});

test('validateAttachment accepts supported attachment types', () => {
  assert.equal(
    validateAttachment({ type: 'image/jpeg', size: 1024, name: 'screen.jpg' }),
    '',
  );
  assert.equal(
    validateAttachment({ type: 'application/pdf', size: 1024, name: 'log.pdf' }),
    '',
  );
  assert.equal(
    validateAttachment({ type: 'video/webm', size: 1024, name: 'clip.webm' }),
    '',
  );
  assert.match(
    validateAttachment({ type: 'text/plain', size: 1024, name: 'notes.txt' }),
    /JPG, PNG, WEBP, PDF, MP4, WEBM, or MOV/i,
  );
});
