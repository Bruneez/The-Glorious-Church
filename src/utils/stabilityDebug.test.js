import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeStabilityPayload } from './stabilityDebug.js';

test('sanitizeStabilityPayload redacts sensitive keys and uid prefixes', () => {
  const sanitized = sanitizeStabilityPayload({
    uid: 'abcdefghijklmnopqrstuvwxyz',
    email: 'staff@example.com',
    code: 'auth/network-request-failed',
    pathname: '/members',
  });

  assert.equal(sanitized.uid, 'abcdefgh…');
  assert.equal(sanitized.email, '[redacted]');
  assert.equal(sanitized.code, 'auth/network-request-failed');
  assert.equal(sanitized.pathname, '/members');
});
