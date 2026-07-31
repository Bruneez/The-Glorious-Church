import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidTransportVehicleImageStoragePath,
  normalizeTransportImageUploadResult,
} from './transportImageValidation.js';
import { validateTransportImageFile } from './transportOptions.js';

test('validateTransportImageFile accepts supported image types', () => {
  assert.equal(
    validateTransportImageFile({ type: 'image/jpeg', name: 'driver.jpg', size: 1024 }),
    '',
  );
  assert.equal(
    validateTransportImageFile({ type: 'image/png', name: 'vehicle.png', size: 1024 }),
    '',
  );
});

test('validateTransportImageFile rejects unsupported files and oversized uploads', () => {
  assert.match(
    validateTransportImageFile({ type: 'application/pdf', name: 'doc.pdf', size: 1024 }),
    /JPG, PNG, or WEBP/i,
  );
  assert.match(
    validateTransportImageFile({ type: 'image/jpeg', name: 'large.jpg', size: 6 * 1024 * 1024 }),
    /5 MB/i,
  );
});

test('isValidTransportVehicleImageStoragePath matches transport storage layout', () => {
  assert.equal(
    isValidTransportVehicleImageStoragePath('transport/driver-1/1712345678_photo.jpg'),
    true,
  );
  assert.equal(isValidTransportVehicleImageStoragePath('travel-destinations/x/y.jpg'), false);
});

test('normalizeTransportImageUploadResult validates upload response', () => {
  assert.deepEqual(
    normalizeTransportImageUploadResult({
      vehicleImageUrl: 'https://firebasestorage.googleapis.com/v0/b/demo/o/transport%2Fa%2Fb.jpg?alt=media',
      vehicleImageStoragePath: 'transport/a/b.jpg',
    }),
    {
      vehicleImageUrl:
        'https://firebasestorage.googleapis.com/v0/b/demo/o/transport%2Fa%2Fb.jpg?alt=media',
      vehicleImageStoragePath: 'transport/a/b.jpg',
    },
  );

  assert.throws(
    () =>
      normalizeTransportImageUploadResult({
        vehicleImageUrl: 'https://example.com/photo.jpg',
        vehicleImageStoragePath: 'other/a/b.jpg',
      }),
    /does not match Firebase Storage rules/i,
  );
});
