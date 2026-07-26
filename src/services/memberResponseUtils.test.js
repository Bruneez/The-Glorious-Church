import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMemberResponse } from './memberResponseUtils.js';

test('normalizeMemberResponse accepts plain created member documents', () => {
  const member = { id: 'member-1', name: 'Jane', surname: 'Doe' };
  assert.deepEqual(normalizeMemberResponse(member), member);
});

test('normalizeMemberResponse unwraps member and nested data shapes', () => {
  const member = { id: 'member-2', name: 'John' };

  assert.deepEqual(normalizeMemberResponse({ member }), member);
  assert.deepEqual(normalizeMemberResponse({ data: { member } }), member);
  assert.deepEqual(normalizeMemberResponse({ data: member }), member);
});

test('normalizeMemberResponse returns null for invalid responses', () => {
  assert.equal(normalizeMemberResponse(null), null);
  assert.equal(normalizeMemberResponse(undefined), null);
  assert.equal(normalizeMemberResponse({}), null);
  assert.equal(normalizeMemberResponse({ data: {} }), null);
});
