import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveLinkedMemberId, warnMissingLinkedMemberId } from './linkedMemberUtils.js';

test('resolveLinkedMemberId prefers row id then raw member id', () => {
  assert.equal(resolveLinkedMemberId({ id: 'member-1', raw: { id: 'member-2' } }), 'member-1');
  assert.equal(resolveLinkedMemberId({ raw: { id: 'member-2' } }), 'member-2');
  assert.equal(resolveLinkedMemberId({ fullName: 'Jane Doe' }), '');
});

test('warnMissingLinkedMemberId logs a development warning', () => {
  const originalWarn = console.warn;
  const warnings = [];
  console.warn = (...args) => warnings.push(args.join(' '));

  try {
    warnMissingLinkedMemberId({ fullName: 'Jane Doe' }, 'test row');
    assert.match(warnings[0], /missing a member ID/i);
  } finally {
    console.warn = originalWarn;
  }
});
