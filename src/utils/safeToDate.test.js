import test from 'node:test';
import assert from 'node:assert/strict';
import { safeToDate, safeToMillis } from './safeToDate.js';

test('safeToDate returns null for invalid values', () => {
  assert.equal(safeToDate(null), null);
  assert.equal(safeToDate('not-a-date'), null);
  assert.equal(safeToDate({}), null);
});

test('safeToDate converts Firestore-like timestamps safely', () => {
  const date = new Date('2024-05-10T10:00:00.000Z');
  const timestamp = {
    toDate() {
      return date;
    },
  };

  assert.equal(safeToDate(timestamp)?.toISOString(), date.toISOString());
  assert.equal(safeToMillis(timestamp), date.getTime());
});

test('safeToDate handles throwing toDate implementations', () => {
  const brokenTimestamp = {
    toDate() {
      throw new Error('invalid timestamp');
    },
  };

  assert.equal(safeToDate(brokenTimestamp), null);
});
