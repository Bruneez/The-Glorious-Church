import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getShepherdingCoverStorageErrorMessage,
  getShepherdingToolsSubmitErrorMessage,
  normalizeShepherdingCoverUploadResult,
} from './shepherdingToolsCoverValidation.js';

test('normalizeShepherdingCoverUploadResult rejects null upload results', () => {
  assert.throws(
    () => normalizeShepherdingCoverUploadResult(null),
    /returned no result/i,
  );
});

test('normalizeShepherdingCoverUploadResult requires coverImageUrl and coverImageStoragePath', () => {
  assert.throws(
    () => normalizeShepherdingCoverUploadResult({ coverImageStoragePath: 'shepherding-tools/a/c.jpg' }),
    /valid image URL/i,
  );

  assert.throws(
    () => normalizeShepherdingCoverUploadResult({ coverImageUrl: 'https://example.com/c.jpg' }),
    /storage path/i,
  );

  assert.throws(
    () => normalizeShepherdingCoverUploadResult({
      coverImageUrl: 'https://example.com/c.jpg',
      coverImageStoragePath: 'wrong-prefix/a/c.jpg',
    }),
    /does not match Firebase Storage rules/i,
  );

  assert.deepEqual(
    normalizeShepherdingCoverUploadResult({
      coverImageUrl: 'https://example.com/c.jpg',
      coverImageStoragePath: 'shepherding-tools/a/c.jpg',
    }),
    {
      coverImageUrl: 'https://example.com/c.jpg',
      coverImageStoragePath: 'shepherding-tools/a/c.jpg',
    },
  );
});

test('getShepherdingCoverStorageErrorMessage maps storage permission failures', () => {
  assert.match(
    getShepherdingCoverStorageErrorMessage({ code: 'storage/unauthorized' }),
    /permission to upload cover images/i,
  );
});

test('getShepherdingToolsSubmitErrorMessage prefers friendly storage messages', () => {
  assert.match(
    getShepherdingToolsSubmitErrorMessage({ code: 'storage/unauthorized' }),
    /permission to upload cover images/i,
  );

  assert.match(
    getShepherdingToolsSubmitErrorMessage(new Error('Movie title is required.')),
    /Movie title is required/i,
  );
});
