import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTH_STATUS,
  canEvaluateRouteAccess,
  resolveAuthStatus,
  resolvePostLoginPath,
  shouldRedirectToLogin,
} from './authSessionState.js';

test('resolveAuthStatus distinguishes loading, authenticated, and unauthenticated', () => {
  assert.equal(resolveAuthStatus({ isLoading: true, firebaseUser: null }), AUTH_STATUS.LOADING);
  assert.equal(resolveAuthStatus({ isLoading: true, firebaseUser: { uid: '1' } }), AUTH_STATUS.LOADING);
  assert.equal(resolveAuthStatus({ isLoading: false, firebaseUser: null }), AUTH_STATUS.UNAUTHENTICATED);
  assert.equal(
    resolveAuthStatus({ isLoading: false, firebaseUser: { uid: '1' } }),
    AUTH_STATUS.AUTHENTICATED,
  );
});

test('shouldRedirectToLogin waits for auth bootstrap and only redirects confirmed logout', () => {
  assert.equal(shouldRedirectToLogin({ isLoading: true, firebaseUser: null }), false);
  assert.equal(shouldRedirectToLogin({ isLoading: true, firebaseUser: { uid: '1' } }), false);
  assert.equal(shouldRedirectToLogin({ isLoading: false, firebaseUser: { uid: '1' } }), false);
  assert.equal(shouldRedirectToLogin({ isLoading: false, firebaseUser: null }), true);
});

test('canEvaluateRouteAccess waits for staff role during profile loading', () => {
  assert.equal(canEvaluateRouteAccess({ isStaffSessionLoading: true, role: '' }), false);
  assert.equal(canEvaluateRouteAccess({ isStaffSessionLoading: true, role: 'Admin' }), true);
  assert.equal(canEvaluateRouteAccess({ isStaffSessionLoading: false, role: '' }), true);
});

test('resolvePostLoginPath preserves intended route for reauthentication', () => {
  assert.equal(resolvePostLoginPath('/members'), '/members');
  assert.equal(resolvePostLoginPath('/login'), '/dashboard');
  assert.equal(resolvePostLoginPath(''), '/dashboard');
});
