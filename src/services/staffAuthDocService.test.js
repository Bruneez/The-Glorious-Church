import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStaffAuthDocPayload,
  getStaffAuthUid,
  isStaffDocAtAuthUid,
} from './staffAuthDocHelpers.js';

test('getStaffAuthUid reads uid or authUid fields', () => {
  assert.equal(getStaffAuthUid({ uid: 'abc123' }), 'abc123');
  assert.equal(getStaffAuthUid({ authUid: 'def456' }), 'def456');
  assert.equal(getStaffAuthUid({ uid: 'abc123', authUid: 'def456' }), 'abc123');
  assert.equal(getStaffAuthUid({}), '');
});

test('isStaffDocAtAuthUid validates document path alignment', () => {
  assert.equal(isStaffDocAtAuthUid('abc123', { uid: 'abc123' }), true);
  assert.equal(isStaffDocAtAuthUid('legacy-id', { uid: 'abc123' }), false);
  assert.equal(isStaffDocAtAuthUid('abc123', {}), true);
});

test('buildStaffAuthDocPayload normalizes uid fields', () => {
  const payload = buildStaffAuthDocPayload(
    {
      name: 'Test User',
      email: 'test@example.com',
      role: 'Admin',
      authUid: 'old-value',
    },
    'abc123',
  );

  assert.equal(payload.uid, 'abc123');
  assert.equal(payload.authUid, 'abc123');
  assert.equal(payload.name, 'Test User');
});
