import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getMachanehMoviePosterStorageErrorMessage,
  toMachanehMoviePosterUploadError,
} from './machanehMoviesPosterValidation.js';

test('getMachanehMoviePosterStorageErrorMessage returns friendly poster upload messages', () => {
  assert.match(
    getMachanehMoviePosterStorageErrorMessage({ code: 'storage/unauthorized' }),
    /permission to upload movie posters/i,
  );
  assert.match(
    getMachanehMoviePosterStorageErrorMessage({ code: 'storage/timeout' }),
    /timed out/i,
  );
  assert.match(
    getMachanehMoviePosterStorageErrorMessage({ code: 'storage/unknown' }),
    /Failed to upload poster image/i,
  );
});

test('toMachanehMoviePosterUploadError preserves storage error codes', () => {
  const uploadError = toMachanehMoviePosterUploadError({ code: 'storage/unauthorized' });

  assert.equal(uploadError.code, 'storage/unauthorized');
  assert.match(uploadError.message, /permission to upload movie posters/i);
});
