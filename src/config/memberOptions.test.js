import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateMemberPhotoFile,
  MAX_MEMBER_PHOTO_SIZE_BYTES,
} from './memberPhotoValidation.js';

test('validateMemberPhotoFile accepts jpeg, png, and webp', () => {
  assert.equal(
    validateMemberPhotoFile({ type: 'image/jpeg', size: 1024, name: 'photo.jpg' }),
    '',
  );
  assert.equal(
    validateMemberPhotoFile({ type: 'image/png', size: 1024, name: 'photo.png' }),
    '',
  );
  assert.equal(
    validateMemberPhotoFile({ type: 'image/webp', size: 1024, name: 'photo.webp' }),
    '',
  );
});

test('validateMemberPhotoFile rejects unsupported file types', () => {
  const message = validateMemberPhotoFile({
    type: 'image/gif',
    size: 1024,
    name: 'photo.gif',
  });

  assert.match(message, /JPG, PNG, or WEBP/i);
});

test('validateMemberPhotoFile rejects oversized files', () => {
  const message = validateMemberPhotoFile({
    type: 'image/jpeg',
    size: MAX_MEMBER_PHOTO_SIZE_BYTES + 1,
    name: 'photo.jpg',
  });

  assert.match(message, /5 MB/i);
});

test('validateMemberPhotoFile accepts extension fallback when MIME is missing', () => {
  assert.equal(
    validateMemberPhotoFile({ type: '', size: 1024, name: 'photo.JPG' }),
    '',
  );
});
