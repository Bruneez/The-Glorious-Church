import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_MINISTRY_AVATAR_SIZE_BYTES,
  getMinistryStorageErrorMessage,
  validateMinistryAvatarFile,
} from './ministriesAvatarValidation.js';

test('validateMinistryAvatarFile accepts jpeg, png, and webp', () => {
  assert.equal(
    validateMinistryAvatarFile({ type: 'image/jpeg', size: 1024, name: 'avatar.jpg' }),
    '',
  );
});

test('validateMinistryAvatarFile rejects unsupported file types', () => {
  assert.match(
    validateMinistryAvatarFile({ type: 'image/gif', size: 1024, name: 'avatar.gif' }),
    /JPG, PNG, or WEBP/i,
  );
});

test('validateMinistryAvatarFile rejects oversized files', () => {
  assert.match(
    validateMinistryAvatarFile({
      type: 'image/jpeg',
      size: MAX_MINISTRY_AVATAR_SIZE_BYTES + 1,
      name: 'avatar.jpg',
    }),
    /5 MB/i,
  );
});

test('getMinistryStorageErrorMessage returns user-facing upload errors', () => {
  assert.match(
    getMinistryStorageErrorMessage({ code: 'storage/unauthorized' }),
    /permission/i,
  );
});
