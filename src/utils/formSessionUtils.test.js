import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createFormSessionKey,
  resolveFormRecordKey,
  shouldInitializeFormSession,
} from './formSessionUtils.js';

test('resolveFormRecordKey uses record id or create key', () => {
  assert.equal(resolveFormRecordKey({ id: 'member-1' }), 'member-1');
  assert.equal(resolveFormRecordKey(null), 'new');
  assert.equal(resolveFormRecordKey({}, { createKey: 'draft' }), 'draft');
});

test('shouldInitializeFormSession opens once per record and ignores background refetches', () => {
  assert.equal(
    shouldInitializeFormSession({
      isOpen: true,
      recordKey: 'member-1',
      previousIsOpen: false,
      previousRecordKey: '',
    }),
    true,
  );

  assert.equal(
    shouldInitializeFormSession({
      isOpen: true,
      recordKey: 'member-1',
      previousIsOpen: true,
      previousRecordKey: 'member-1',
    }),
    false,
  );

  assert.equal(
    shouldInitializeFormSession({
      isOpen: true,
      recordKey: 'member-2',
      previousIsOpen: true,
      previousRecordKey: 'member-1',
    }),
    true,
  );

  assert.equal(
    shouldInitializeFormSession({
      isOpen: false,
      recordKey: 'member-1',
      previousIsOpen: true,
      previousRecordKey: 'member-1',
    }),
    false,
  );
});

test('resolveFormRecordKey supports alternate id fields', () => {
  assert.equal(resolveFormRecordKey({ recordId: 'attendance-1' }, { idField: 'recordId' }), 'attendance-1');
  assert.equal(resolveFormRecordKey({ id: 'fallback' }, { idField: 'recordId' }), 'fallback');
});

test('createFormSessionKey builds stable remount keys for intentional resets', () => {
  assert.equal(createFormSessionKey({ formSessionKey: 2, recordKey: 'abc' }), '2-abc');
  assert.equal(
    createFormSessionKey({ formSessionKey: 1, recordKey: 'new', scope: 'devotional' }),
    '1-new-devotional',
  );
});
