import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SORT_DIRECTION,
  SORT_TYPES,
  compareActivityValues,
  compareDates,
  compareNumbers,
  compareOrderedValues,
  compareStrings,
  compareValues,
  detectSortType,
  parseSortableDate,
  sortData,
} from './tableSort.js';

const sampleRows = [
  { id: '1', name: 'Charlie', email: 'c@example.com', lastSeenAt: '2026-01-10T10:00:00.000Z' },
  { id: '2', name: 'Alice', email: 'b@example.com', lastSeenAt: null },
  { id: '3', name: 'Bob', email: 'a@example.com', lastSeenAt: '2026-01-12T10:00:00.000Z' },
  { id: '4', name: 'Dana', email: 'd@example.com', lastSeenAt: '2026-01-11T10:00:00.000Z' },
];

test('sortData does not mutate the original array', () => {
  const original = [...sampleRows];
  const sorted = sortData(sampleRows, 'name', SORT_DIRECTION.ASC);

  assert.notEqual(sorted, sampleRows);
  assert.deepEqual(sampleRows, original);
});

test('sortData sorts strings ascending and descending', () => {
  const asc = sortData(sampleRows, 'name', SORT_DIRECTION.ASC).map((row) => row.name);
  const desc = sortData(sampleRows, 'name', SORT_DIRECTION.DESC).map((row) => row.name);

  assert.deepEqual(asc, ['Alice', 'Bob', 'Charlie', 'Dana']);
  assert.deepEqual(desc, ['Dana', 'Charlie', 'Bob', 'Alice']);
});

test('sortData places null and missing values last', () => {
  const sorted = sortData(sampleRows, 'lastSeenAt', SORT_DIRECTION.DESC).map((row) => row.id);

  assert.equal(sorted.at(-1), '2');
});

test('sortData handles missing fields safely', () => {
  const rows = [{ id: '1' }, { id: '2', nickname: 'Ace' }, { id: '3', nickname: 'Zed' }];
  const sorted = sortData(rows, 'nickname', SORT_DIRECTION.ASC).map((row) => row.id);

  assert.deepEqual(sorted, ['2', '3', '1']);
});

test('sortData returns empty array for non-array input', () => {
  assert.deepEqual(sortData(null, 'name', SORT_DIRECTION.ASC), []);
  assert.deepEqual(sortData(undefined, 'name', SORT_DIRECTION.ASC), []);
});

test('sortData sorts timestamps and activity values by recency', () => {
  const asc = sortData(sampleRows, 'lastSeenAt', SORT_DIRECTION.ASC, {
    type: SORT_TYPES.ACTIVITY,
  }).map((row) => row.id);
  const desc = sortData(sampleRows, 'lastSeenAt', SORT_DIRECTION.DESC, {
    type: SORT_TYPES.ACTIVITY,
  }).map((row) => row.id);

  assert.deepEqual(asc, ['1', '4', '3', '2']);
  assert.deepEqual(desc, ['3', '4', '1', '2']);
});

test('sortData supports custom getValue accessors', () => {
  const rows = [
    { id: '1', profile: { label: 'Zulu' } },
    { id: '2', profile: { label: 'Alpha' } },
  ];

  const sorted = sortData(rows, 'label', SORT_DIRECTION.ASC, {
    getValue: (row) => row.profile?.label,
  }).map((row) => row.id);

  assert.deepEqual(sorted, ['2', '1']);
});

test('compareNumbers handles numeric strings and invalid numbers', () => {
  assert.equal(compareNumbers('10', '2', SORT_DIRECTION.ASC), 1);
  assert.equal(compareNumbers(null, '2', SORT_DIRECTION.ASC), 1);
  assert.equal(compareNumbers('2', null, SORT_DIRECTION.ASC), -1);
});

test('parseSortableDate supports Date, ISO strings, timestamps, and Firestore-like values', () => {
  const iso = parseSortableDate('2026-01-01T00:00:00.000Z');
  const date = parseSortableDate(new Date('2026-01-02T00:00:00.000Z'));
  const timestamp = parseSortableDate(1_767_225_600_000);
  const firestoreLike = parseSortableDate({
    toDate: () => new Date('2026-01-03T00:00:00.000Z'),
  });

  assert.equal(iso?.toISOString(), '2026-01-01T00:00:00.000Z');
  assert.equal(date?.toISOString(), '2026-01-02T00:00:00.000Z');
  assert.ok(timestamp instanceof Date);
  assert.equal(firestoreLike?.toISOString(), '2026-01-03T00:00:00.000Z');
  assert.equal(parseSortableDate('not-a-date'), null);
});

test('detectSortType chooses number, date, or string comparators', () => {
  assert.equal(detectSortType('10', '2'), SORT_TYPES.NUMBER);
  assert.equal(
    detectSortType('2026-01-01T00:00:00.000Z', '2026-01-02T00:00:00.000Z'),
    SORT_TYPES.DATE,
  );
  assert.equal(detectSortType('Alpha', 'Beta'), SORT_TYPES.STRING);
});

test('compareValues auto mode sorts mixed-safe values as strings', () => {
  assert.equal(compareValues('Alpha', 'Beta', SORT_TYPES.AUTO, SORT_DIRECTION.ASC), -1);
  assert.equal(compareValues('Beta', 'Alpha', SORT_TYPES.AUTO, SORT_DIRECTION.DESC), -1);
});

test('compareDates and compareActivityValues sort chronologically', () => {
  const older = '2026-01-01T00:00:00.000Z';
  const newer = '2026-01-02T00:00:00.000Z';

  assert.equal(compareDates(older, newer, SORT_DIRECTION.ASC), -1);
  assert.equal(compareActivityValues(newer, older, SORT_DIRECTION.DESC), -1);
});

test('compareStrings is case-insensitive by base sensitivity', () => {
  assert.equal(compareStrings('alpha', 'Beta', SORT_DIRECTION.ASC), -1);
});

test('compareOrderedValues sorts by custom rank order', () => {
  const order = ['Admin', 'Elder', 'Leader', 'Lead Pastor', 'Pastor'];

  assert.equal(compareOrderedValues('Admin', 'Pastor', order, SORT_DIRECTION.ASC), -1);
  assert.equal(compareOrderedValues('Pastor', 'Admin', order, SORT_DIRECTION.DESC), -1);
});

test('sortData supports ordered sort type', () => {
  const rows = [
    { id: '1', role: 'Pastor' },
    { id: '2', role: 'Admin' },
    { id: '3', role: 'Leader' },
  ];
  const order = ['Admin', 'Elder', 'Leader', 'Lead Pastor', 'Pastor'];

  const sorted = sortData(rows, 'role', SORT_DIRECTION.ASC, {
    type: SORT_TYPES.ORDERED,
    order,
  }).map((row) => row.id);

  assert.deepEqual(sorted, ['2', '3', '1']);
});
