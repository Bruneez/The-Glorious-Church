import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateStoragePath,
  isShepherdingCoverStoragePath,
  SHEPHERDING_TOOLS_STORAGE_ROOT,
  validateImage,
} from './shepherdingToolsStorage.js';

test('generateStoragePath builds a resource-scoped storage path', () => {
  const path = generateStoragePath('resource-123', 'Cover Photo.jpg');

  assert.match(path, /^shepherding-tools\/resource-123\/\d+_Cover_Photo\.jpg$/);
  assert.equal(SHEPHERDING_TOOLS_STORAGE_ROOT, 'shepherding-tools');
  assert.equal(isShepherdingCoverStoragePath(path), true);
});

test('isShepherdingCoverStoragePath matches Firebase rule shape resourceId/fileName', () => {
  assert.equal(
    isShepherdingCoverStoragePath('shepherding-tools/abc123/1700000000000_cover.jpg'),
    true,
  );
  assert.equal(isShepherdingCoverStoragePath('shepherding-tools/abc123'), false);
  assert.equal(isShepherdingCoverStoragePath('travel-destinations/abc123/cover.jpg'), false);
  assert.equal(isShepherdingCoverStoragePath('shepherding-tools/abc123/extra/nested.jpg'), false);
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
