import test from 'node:test';
import assert from 'node:assert/strict';
import { getTravelStorageErrorMessage } from './travellingImageValidation.js';

test('getTravelStorageErrorMessage returns user-facing upload errors', () => {
  assert.match(
    getTravelStorageErrorMessage({ code: 'storage/unauthorized' }),
    /permission/i,
  );
  assert.match(
    getTravelStorageErrorMessage({ code: 'storage/timeout' }),
    /timed out/i,
  );
});
