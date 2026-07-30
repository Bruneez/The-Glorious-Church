import test from 'node:test';
import assert from 'node:assert/strict';
import { getAppFixErrorMessage, toAppFixError } from './appFixesErrorMessages.js';

test('getAppFixErrorMessage maps Firestore permission errors', () => {
  assert.match(
    getAppFixErrorMessage({ code: 'permission-denied' }),
    /permission/i,
  );
});

test('getAppFixErrorMessage maps storage upload errors', () => {
  assert.match(
    getAppFixErrorMessage({ code: 'storage/unauthorized' }),
    /permission/i,
  );
});

test('getAppFixErrorMessage hides raw Firebase error strings', () => {
  assert.equal(
    getAppFixErrorMessage(
      { code: 'firestore/internal', message: 'FirebaseError: INTERNAL ASSERT FAILED' },
      'Something went wrong.',
    ),
    'Something went wrong.',
  );
});

test('getAppFixErrorMessage preserves user-facing validation messages', () => {
  assert.equal(
    getAppFixErrorMessage({ message: 'Title is required.' }),
    'Title is required.',
  );
});

test('toAppFixError returns a friendly Error instance', () => {
  const error = toAppFixError(
    { code: 'unavailable', message: 'Firestore unavailable' },
    'Please try again.',
  );

  assert.equal(error.message, 'Unable to reach the server. Please check your connection and try again.');
  assert.equal(error.code, 'unavailable');
});
