import test from 'node:test';
import assert from 'node:assert/strict';
import { areFormValuesEqual, isFormDirty } from './formDirtyState.js';

test('areFormValuesEqual ignores object key order', () => {
  assert.equal(
    areFormValuesEqual({ name: 'Ada', role: 'Leader' }, { role: 'Leader', name: 'Ada' }),
    true,
  );
});

test('isFormDirty respects open state, submit state, and attachments', () => {
  assert.equal(
    isFormDirty({
      isOpen: true,
      baseline: { title: 'A' },
      current: { title: 'A' },
    }),
    false,
  );

  assert.equal(
    isFormDirty({
      isOpen: true,
      baseline: { title: 'A' },
      current: { title: 'B' },
    }),
    true,
  );

  assert.equal(
    isFormDirty({
      isOpen: false,
      baseline: { title: 'A' },
      current: { title: 'B' },
    }),
    false,
  );

  assert.equal(
    isFormDirty({
      isOpen: true,
      isSubmitting: true,
      baseline: { title: 'A' },
      current: { title: 'B' },
    }),
    false,
  );

  assert.equal(
    isFormDirty({
      isOpen: true,
      baseline: { title: 'A' },
      current: { title: 'A' },
      attachmentDirty: true,
    }),
    true,
  );
});
