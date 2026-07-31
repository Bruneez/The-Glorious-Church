import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateProjectAttachmentStoragePath,
  generateProjectCoverStoragePath,
  validateAttachment,
  validateCoverImage,
} from './projectStorage.js';

test('generateProjectCoverStoragePath builds a project-scoped cover path', () => {
  const path = generateProjectCoverStoragePath('project-123', 'Cover Photo.jpg');

  assert.match(path, /^projects\/project-123\/cover\/\d+_Cover_Photo\.jpg$/);
});

test('generateProjectAttachmentStoragePath builds a project-scoped attachment path', () => {
  const path = generateProjectAttachmentStoragePath('project-123', 'Brief.pdf');

  assert.match(path, /^projects\/project-123\/attachments\/\d+_Brief\.pdf$/);
});

test('generateProjectCoverStoragePath requires a project id', () => {
  assert.throws(() => generateProjectCoverStoragePath('', 'cover.png'), /Project ID is required/i);
});

test('validateCoverImage accepts supported cover types', () => {
  assert.equal(
    validateCoverImage({ type: 'image/jpeg', size: 1024, name: 'cover.jpg' }),
    '',
  );
  assert.match(
    validateCoverImage({ type: 'text/plain', size: 1024, name: 'notes.txt' }),
    /JPG, PNG, or WEBP/i,
  );
  assert.match(
    validateCoverImage({ type: 'image/jpeg', size: 6 * 1024 * 1024, name: 'cover.jpg' }),
    /5 MB or smaller/i,
  );
});

test('validateAttachment accepts supported project attachment types', () => {
  assert.equal(
    validateAttachment({ type: 'image/png', size: 1024, name: 'diagram.png' }),
    '',
  );
  assert.equal(
    validateAttachment({ type: 'application/pdf', size: 1024, name: 'plan.pdf' }),
    '',
  );
  assert.match(
    validateAttachment({ type: 'video/mp4', size: 1024, name: 'clip.mp4' }),
    /JPG, PNG, WEBP, or PDF/i,
  );
});
