import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveMerchandiseImageContentType } from './merchandiseOptions.js';
import {
  getMerchandiseStorageErrorMessage,
  isValidMerchandiseImageStoragePath,
  toMerchandiseImageUploadError,
} from './merchandiseImageValidation.js';

test('resolveMerchandiseImageContentType resolves supported image types', () => {
  assert.equal(
    resolveMerchandiseImageContentType({ type: 'image/jpeg', name: 'product.jpg' }),
    'image/jpeg',
  );
  assert.equal(
    resolveMerchandiseImageContentType({ type: '', name: 'product.png' }),
    'image/png',
  );
  assert.equal(
    resolveMerchandiseImageContentType({ type: '', name: 'product.webp' }),
    'image/webp',
  );
  assert.equal(resolveMerchandiseImageContentType({ type: 'image/gif', name: 'product.gif' }), null);
});

test('getMerchandiseStorageErrorMessage returns merchandise-specific upload errors', () => {
  assert.equal(
    getMerchandiseStorageErrorMessage({ code: 'storage/unauthorized' }),
    'You do not have permission to upload merchandise images.',
  );
  assert.match(
    getMerchandiseStorageErrorMessage({ code: 'storage/timeout' }),
    /check your connection/i,
  );
  assert.match(
    getMerchandiseStorageErrorMessage({ code: 'storage/retry-limit-exceeded' }),
    /check your connection/i,
  );
  assert.match(
    getMerchandiseStorageErrorMessage({ code: 'storage/unknown' }),
    /could not be uploaded/i,
  );
  assert.equal(getMerchandiseStorageErrorMessage({ code: 'auth/user-not-found' }), '');
});

test('toMerchandiseImageUploadError never exposes profile-picture messaging', () => {
  const mapped = toMerchandiseImageUploadError({
    code: 'storage/unauthorized',
    message: 'You do not have permission to upload profile pictures. Please contact an administrator.',
  });

  assert.match(mapped.message, /merchandise images/i);
  assert.doesNotMatch(mapped.message, /profile pictures/i);
  assert.equal(mapped.code, 'storage/unauthorized');
});

test('toMerchandiseImageUploadError preserves validation messages', () => {
  const mapped = toMerchandiseImageUploadError(new Error('Image must be 5 MB or smaller.'));
  assert.equal(mapped.message, 'Image must be 5 MB or smaller.');
});

test('isValidMerchandiseImageStoragePath matches merchandise storage layout', () => {
  assert.equal(
    isValidMerchandiseImageStoragePath('merchandise/item-1/1712345678_photo.jpg'),
    true,
  );
  assert.equal(isValidMerchandiseImageStoragePath('transport/driver-1/photo.jpg'), false);
});
