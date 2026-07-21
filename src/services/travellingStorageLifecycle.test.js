import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanupTravelDestinationImageStoragePath,
  resolvePreviousTravelDestinationImagePath,
  shouldCleanupPreviousTravelDestinationImage,
} from './travellingStorageLifecycle.js';
import { buildTravelDestinationPayload } from '../config/travellingOptions.js';

test('edit without image replacement preserves existing image fields', () => {
  const payload = buildTravelDestinationPayload(
    {
      travelExtent: 'international',
      country: 'FR',
      visaRequired: 'yes',
      imageUrl: 'https://firebasestorage.googleapis.com/image.jpg',
      imageStoragePath: 'travel-destinations/abc123/123_image.jpg',
    },
    { createdBy: 'Admin' },
  );

  assert.equal(payload.imageUrl, 'https://firebasestorage.googleapis.com/image.jpg');
  assert.equal(payload.imageStoragePath, 'travel-destinations/abc123/123_image.jpg');
});

test('replace deletes old image only when previous and next paths differ', () => {
  assert.equal(
    shouldCleanupPreviousTravelDestinationImage(
      'travel-destinations/abc/old.jpg',
      'travel-destinations/abc/new.jpg',
    ),
    true,
  );
});

test('update without image change performs no cleanup', () => {
  assert.equal(
    shouldCleanupPreviousTravelDestinationImage(
      'travel-destinations/abc/old.jpg',
      'travel-destinations/abc/old.jpg',
    ),
    false,
  );
});

test('resolvePreviousTravelDestinationImagePath prefers explicit previousImagePath', () => {
  assert.equal(
    resolvePreviousTravelDestinationImagePath(
      { previousImagePath: 'travel-destinations/abc/explicit.jpg' },
      { imageStoragePath: 'travel-destinations/abc/other.jpg' },
    ),
    'travel-destinations/abc/explicit.jpg',
  );
});

test('storage/object-not-found remains non-fatal during destination image cleanup', async () => {
  const deleteFn = async () => {
    const error = new Error('Object not found');
    error.code = 'storage/object-not-found';
    throw error;
  };

  assert.equal(
    await cleanupTravelDestinationImageStoragePath('travel-destinations/abc/missing.jpg', deleteFn),
    null,
  );
});

test('cleanupTravelDestinationImageStoragePath returns warning for unexpected delete failures', async () => {
  const deleteFn = async () => {
    const error = new Error('Permission denied');
    error.code = 'storage/unauthorized';
    throw error;
  };

  const warning = await cleanupTravelDestinationImageStoragePath(
    'travel-destinations/abc/old.jpg',
    deleteFn,
  );
  assert.match(warning, /could not be removed from storage/i);
});

test('buildTravelDestinationPayload never persists blob preview URLs', () => {
  const payload = buildTravelDestinationPayload({
    travelExtent: 'national',
    townCity: 'George',
    recommendedTransport: 'car',
    imageUrl: 'blob:http://localhost/preview',
    imageStoragePath: '',
  });

  assert.equal(payload.imageUrl, '');
});
