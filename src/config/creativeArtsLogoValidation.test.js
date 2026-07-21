import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_CREATIVE_ARTS_LOGO_SIZE_BYTES,
  getCreativeArtsStorageErrorMessage,
  validateCreativeArtsLogoFile,
} from './creativeArtsLogoValidation.js';

test('validateCreativeArtsLogoFile accepts jpeg, png, and webp', () => {
  assert.equal(
    validateCreativeArtsLogoFile({ type: 'image/jpeg', size: 1024, name: 'logo.jpg' }),
    '',
  );
});

test('validateCreativeArtsLogoFile rejects unsupported file types', () => {
  assert.match(
    validateCreativeArtsLogoFile({ type: 'image/gif', size: 1024, name: 'logo.gif' }),
    /JPG, PNG, or WEBP/i,
  );
});

test('validateCreativeArtsLogoFile rejects oversized files', () => {
  assert.match(
    validateCreativeArtsLogoFile({
      type: 'image/jpeg',
      size: MAX_CREATIVE_ARTS_LOGO_SIZE_BYTES + 1,
      name: 'logo.jpg',
    }),
    /5 MB/i,
  );
});

test('getCreativeArtsStorageErrorMessage returns user-facing upload errors', () => {
  assert.match(
    getCreativeArtsStorageErrorMessage({ code: 'storage/unauthorized' }),
    /permission/i,
  );
});
