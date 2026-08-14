import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifySessionError,
  createSingleFlight,
  getFirestoreQueryErrorMessage,
  getStaffProfileErrorMessage,
  isConfirmedInvalidAuthSession,
  isNetworkSessionError,
  isPermissionSessionError,
  SESSION_ERROR_KIND,
  shouldAttemptTokenRefresh,
} from './sessionResilience.js';

test('classifySessionError maps network, permission, invalid session, and transient auth errors', () => {
  assert.equal(
    classifySessionError({ code: 'auth/network-request-failed' }),
    SESSION_ERROR_KIND.NETWORK,
  );
  assert.equal(
    classifySessionError({ code: 'firestore/unavailable' }),
    SESSION_ERROR_KIND.NETWORK,
  );
  assert.equal(
    classifySessionError({ code: 'firestore/permission-denied' }),
    SESSION_ERROR_KIND.PERMISSION,
  );
  assert.equal(
    classifySessionError({ code: 'auth/invalid-user-token' }),
    SESSION_ERROR_KIND.INVALID_SESSION,
  );
  assert.equal(
    classifySessionError({ code: 'auth/user-token-expired' }),
    SESSION_ERROR_KIND.TRANSIENT,
  );
});

test('permission and network errors must not be treated as invalid sessions', () => {
  assert.equal(isConfirmedInvalidAuthSession({ code: 'firestore/permission-denied' }), false);
  assert.equal(isConfirmedInvalidAuthSession({ code: 'auth/network-request-failed' }), false);
  assert.equal(isPermissionSessionError({ code: 'firestore/permission-denied' }), true);
  assert.equal(isNetworkSessionError({ code: 'auth/network-request-failed' }), true);
});

test('shouldAttemptTokenRefresh covers transient and network auth failures', () => {
  assert.equal(shouldAttemptTokenRefresh({ code: 'auth/user-token-expired' }), true);
  assert.equal(shouldAttemptTokenRefresh({ code: 'auth/network-request-failed' }), true);
  assert.equal(shouldAttemptTokenRefresh({ code: 'auth/invalid-user-token' }), false);
  assert.equal(shouldAttemptTokenRefresh({ code: 'firestore/permission-denied' }), false);
});

test('getStaffProfileErrorMessage keeps the user signed in for permission and network failures', () => {
  assert.match(
    getStaffProfileErrorMessage({ code: 'firestore/permission-denied' }),
    /remain signed in|permissions error/i,
  );
  assert.match(
    getStaffProfileErrorMessage({ code: 'unavailable' }),
    /connection/i,
  );
});

test('getFirestoreQueryErrorMessage returns module-friendly retry messages', () => {
  assert.match(
    getFirestoreQueryErrorMessage({ code: 'firestore/permission-denied' }),
    /permission/i,
  );
  assert.match(
    getFirestoreQueryErrorMessage({ code: 'unavailable' }),
    /connection/i,
  );
  assert.match(
    getFirestoreQueryErrorMessage({ code: 'unknown' }),
    /try again/i,
  );
});

test('createSingleFlight deduplicates concurrent async work', async () => {
  let runs = 0;
  const run = createSingleFlight(async () => {
    runs += 1;
    await new Promise((resolve) => setTimeout(resolve, 20));
    return runs;
  });

  const [first, second] = await Promise.all([run(), run()]);
  assert.equal(first, 1);
  assert.equal(second, 1);
  assert.equal(runs, 1);
});
