import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getTravelStorageErrorMessage,
  getTravellingSubmitErrorMessage,
  isValidTravelDestinationStoragePath,
  normalizeTravelImageUploadResult,
} from './travellingImageValidation.js';

test('getTravelStorageErrorMessage returns user-facing upload errors', () => {
  assert.match(
    getTravelStorageErrorMessage({ code: 'storage/unauthorized' }),
    /permission/i,
  );
  assert.match(
    getTravelStorageErrorMessage({ code: 'storage/timeout' }),
    /timed out/i,
  );
  assert.match(
    getTravelStorageErrorMessage({ code: 'firestore/permission-denied' }),
    /permission/i,
  );
});

test('normalizeTravelImageUploadResult rejects null upload results', () => {
  assert.throws(
    () => normalizeTravelImageUploadResult(null),
    /returned no result/i,
  );
});

test('normalizeTravelImageUploadResult requires imageUrl and imageStoragePath', () => {
  assert.throws(
    () => normalizeTravelImageUploadResult({ imageStoragePath: 'travel-destinations/a/image.jpg' }),
    /valid image URL/i,
  );

  assert.throws(
    () => normalizeTravelImageUploadResult({
      imageUrl: 'https://example.com/image.jpg',
      imageStoragePath: 'wrong-prefix/a/image.jpg',
    }),
    /does not match Firebase Storage rules/i,
  );

  assert.deepEqual(
    normalizeTravelImageUploadResult({
      imageUrl: 'https://example.com/image.jpg',
      imageStoragePath: 'travel-destinations/abc123/123_image.jpg',
    }),
    {
      imageUrl: 'https://example.com/image.jpg',
      imageStoragePath: 'travel-destinations/abc123/123_image.jpg',
    },
  );
});

test('isValidTravelDestinationStoragePath matches Firebase rule shape', () => {
  assert.equal(
    isValidTravelDestinationStoragePath('travel-destinations/abc123/123_image.jpg'),
    true,
  );
  assert.equal(isValidTravelDestinationStoragePath('travel-destinations/abc123'), false);
});

test('getTravellingSubmitErrorMessage prefers friendly storage messages', () => {
  assert.match(
    getTravellingSubmitErrorMessage({ code: 'storage/unauthorized' }),
    /permission/i,
  );
  assert.match(
    getTravellingSubmitErrorMessage(new Error('Country is required.')),
    /Country is required/i,
  );
});
