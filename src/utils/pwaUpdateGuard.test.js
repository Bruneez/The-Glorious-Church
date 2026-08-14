import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canApplyPwaUpdate,
  getPwaUpdateBlockedMessage,
  shouldDeferPwaUpdate,
} from './pwaUpdateGuard.js';

test('canApplyPwaUpdate blocks while dirty forms are active', () => {
  assert.equal(canApplyPwaUpdate({ hasDirtyForms: false }), true);
  assert.equal(canApplyPwaUpdate({ hasDirtyForms: true }), false);
});

test('shouldDeferPwaUpdate only defers when refresh is pending and forms are dirty', () => {
  assert.equal(shouldDeferPwaUpdate({ needRefresh: true, hasDirtyForms: true }), true);
  assert.equal(shouldDeferPwaUpdate({ needRefresh: true, hasDirtyForms: false }), false);
  assert.equal(shouldDeferPwaUpdate({ needRefresh: false, hasDirtyForms: true }), false);
});

test('getPwaUpdateBlockedMessage explains why update is deferred', () => {
  assert.match(getPwaUpdateBlockedMessage(), /form/i);
});
