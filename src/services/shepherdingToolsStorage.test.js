import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateStoragePath,
  validateImage,
} from './shepherdingToolsStorage.js';

test('generateStoragePath builds a resource-scoped storage path', () => {
  const path = generateStoragePath('resource-123', 'Cover Photo.jpg');

  assert.match(path, /^shepherding-tools\/resource-123\/\d+_Cover_Photo\.jpg$/);
});

test('generateStoragePath requires a resource id', () => {
  assert.throws(() => generateStoragePath('', 'cover.jpg'), /Resource ID is required/i);
});

test('validateImage accepts supported cover image types', () => {
  assert.equal(
    validateImage({ type: 'image/jpeg', size: 1024, name: 'cover.jpg' }),
    '',
  );
  assert.match(
    validateImage({ type: 'application/pdf', size: 1024, name: 'cover.pdf' }),
    /JPG, PNG, or WEBP/i,
  );
});
