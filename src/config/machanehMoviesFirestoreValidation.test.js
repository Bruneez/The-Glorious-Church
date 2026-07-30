import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getMachanehMovieFirestoreErrorMessage,
  toMachanehMovieFirestoreError,
} from './machanehMoviesFirestoreValidation.js';

test('getMachanehMovieFirestoreErrorMessage returns friendly database messages', () => {
  assert.match(
    getMachanehMovieFirestoreErrorMessage({ code: 'permission-denied' }),
    /permission to save movies/i,
  );
  assert.match(
    getMachanehMovieFirestoreErrorMessage({ code: 'unavailable' }),
    /Unable to reach the database/i,
  );
  assert.match(
    getMachanehMovieFirestoreErrorMessage({ code: 'firestore/internal' }),
    /Failed to save the movie/i,
  );
});

test('toMachanehMovieFirestoreError preserves error codes', () => {
  const firestoreError = toMachanehMovieFirestoreError({ code: 'permission-denied' });

  assert.equal(firestoreError.code, 'permission-denied');
  assert.match(firestoreError.message, /permission to save movies/i);
});
