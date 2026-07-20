import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateSchoolBadgeFile,
  MAX_SCHOOL_BADGE_SIZE_BYTES,
} from './schoolsBadgeValidation.js';

test('validateSchoolBadgeFile accepts jpeg', () => {
  assert.equal(
    validateSchoolBadgeFile({ type: 'image/jpeg', size: 1024, name: 'badge.jpg' }),
    '',
  );
});

test('validateSchoolBadgeFile accepts png', () => {
  assert.equal(
    validateSchoolBadgeFile({ type: 'image/png', size: 1024, name: 'badge.png' }),
    '',
  );
});

test('validateSchoolBadgeFile accepts webp', () => {
  assert.equal(
    validateSchoolBadgeFile({ type: 'image/webp', size: 1024, name: 'badge.webp' }),
    '',
  );
});

test('validateSchoolBadgeFile rejects gif', () => {
  const message = validateSchoolBadgeFile({
    type: 'image/gif',
    size: 1024,
    name: 'badge.gif',
  });

  assert.match(message, /JPG, PNG, or WEBP/i);
});

test('validateSchoolBadgeFile rejects file larger than 5 MB', () => {
  const message = validateSchoolBadgeFile({
    type: 'image/jpeg',
    size: MAX_SCHOOL_BADGE_SIZE_BYTES + 1,
    name: 'badge.jpg',
  });

  assert.match(message, /5 MB/i);
});
