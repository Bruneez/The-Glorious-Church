import test from 'node:test';
import assert from 'node:assert/strict';
import { ROLES } from './roles.js';
import {
  DEFAULT_STAFF_TABLE_SORT,
  filterStaffMembers,
  prepareStaffTableRows,
  resolveStaffTableSort,
} from './staffOptions.js';
import { SORT_DIRECTION } from '../utils/tableSort.js';

const staff = [
  { id: '1', name: 'Zara', fullName: 'Zara Adams', email: 'zara@example.com', role: ROLES.ADMIN },
  { id: '2', name: 'James', fullName: 'James Brown', email: 'james@example.com', role: ROLES.PASTOR },
  { id: '3', name: 'Jane', fullName: 'Jane Cooper', email: 'jane@example.com', role: ROLES.LEADER },
  { id: '4', name: 'Jacob', fullName: 'Jacob Lee', email: 'jacob@example.com', role: ROLES.ELDER },
];

test('resolveStaffTableSort uses default name ascending before user selection', () => {
  assert.deepEqual(resolveStaffTableSort(null, null), DEFAULT_STAFF_TABLE_SORT);
});

test('prepareStaffTableRows applies default name sort on initial load', () => {
  const rows = prepareStaffTableRows(staff);

  assert.deepEqual(
    rows.map((row) => row.id),
    ['4', '2', '3', '1'],
  );
});

test('prepareStaffTableRows filters by search before sorting', () => {
  const rows = prepareStaffTableRows(staff, {
    searchTerm: 'Ja',
    sortColumn: 'name',
    sortDirection: SORT_DIRECTION.ASC,
  });

  assert.deepEqual(
    rows.map((row) => row.fullName),
    ['Jacob Lee', 'James Brown', 'Jane Cooper'],
  );
});

test('prepareStaffTableRows filters by role before sorting', () => {
  const rows = prepareStaffTableRows(staff, {
    filterRole: ROLES.ADMIN,
    sortColumn: 'email',
    sortDirection: SORT_DIRECTION.DESC,
  });

  assert.deepEqual(rows.map((row) => row.id), ['1']);
});

test('filterStaffMembers does not mutate the source array', () => {
  const source = [...staff];
  const filtered = filterStaffMembers(source, 'Ja', 'all');

  assert.notEqual(filtered, source);
  assert.deepEqual(source, staff);
  assert.equal(filtered.length, 3);
});

test('prepareStaffTableRows only overrides default sort after user selection', () => {
  const defaultRows = prepareStaffTableRows(staff);
  const explicitRows = prepareStaffTableRows(staff, {
    sortColumn: 'email',
    sortDirection: SORT_DIRECTION.DESC,
  });

  assert.notDeepEqual(
    defaultRows.map((row) => row.id),
    explicitRows.map((row) => row.id),
  );
  assert.deepEqual(
    explicitRows.map((row) => row.email),
    ['zara@example.com', 'jane@example.com', 'james@example.com', 'jacob@example.com'],
  );
});

test('name sorting supports A-Z and Z-A', () => {
  const asc = prepareStaffTableRows(staff, {
    sortColumn: 'name',
    sortDirection: SORT_DIRECTION.ASC,
  }).map((row) => row.id);
  const desc = prepareStaffTableRows(staff, {
    sortColumn: 'name',
    sortDirection: SORT_DIRECTION.DESC,
  }).map((row) => row.id);

  assert.deepEqual(asc, ['4', '2', '3', '1']);
  assert.deepEqual(desc, ['1', '3', '2', '4']);
});

test('email sorting supports A-Z and Z-A', () => {
  const asc = prepareStaffTableRows(staff, {
    sortColumn: 'email',
    sortDirection: SORT_DIRECTION.ASC,
  }).map((row) => row.email);
  const desc = prepareStaffTableRows(staff, {
    sortColumn: 'email',
    sortDirection: SORT_DIRECTION.DESC,
  }).map((row) => row.email);

  assert.deepEqual(asc, [
    'jacob@example.com',
    'james@example.com',
    'jane@example.com',
    'zara@example.com',
  ]);
  assert.deepEqual(desc, [
    'zara@example.com',
    'jane@example.com',
    'james@example.com',
    'jacob@example.com',
  ]);
});

test('role sorting uses configured portal role order ascending and descending', () => {
  const asc = prepareStaffTableRows(staff, {
    sortColumn: 'role',
    sortDirection: SORT_DIRECTION.ASC,
  }).map((row) => row.role);
  const desc = prepareStaffTableRows(staff, {
    sortColumn: 'role',
    sortDirection: SORT_DIRECTION.DESC,
  }).map((row) => row.role);

  assert.deepEqual(asc, [ROLES.ADMIN, ROLES.ELDER, ROLES.LEADER, ROLES.PASTOR]);
  assert.deepEqual(desc, [ROLES.PASTOR, ROLES.LEADER, ROLES.ELDER, ROLES.ADMIN]);
});

test('last seen sorting uses timestamps and keeps missing values last', () => {
  const staffWithActivity = [
    { id: '1', fullName: 'A', lastSeenAt: '2026-01-10T10:00:00.000Z' },
    { id: '2', fullName: 'B', lastSeenAt: null },
    { id: '3', fullName: 'C', lastSeenAt: '2026-01-12T10:00:00.000Z' },
    { id: '4', fullName: 'D', lastSeenAt: '2026-01-11T10:00:00.000Z' },
  ];

  const asc = prepareStaffTableRows(staffWithActivity, {
    sortColumn: 'lastSeenAt',
    sortDirection: SORT_DIRECTION.ASC,
  }).map((row) => row.id);
  const desc = prepareStaffTableRows(staffWithActivity, {
    sortColumn: 'lastSeenAt',
    sortDirection: SORT_DIRECTION.DESC,
  }).map((row) => row.id);

  assert.deepEqual(asc, ['1', '4', '3', '2']);
  assert.deepEqual(desc, ['3', '4', '1', '2']);
});

test('search and role filters combine with sorting without changing match sets', () => {
  const searchRows = prepareStaffTableRows(staff, {
    searchTerm: 'Ja',
    sortColumn: 'email',
    sortDirection: SORT_DIRECTION.ASC,
  });
  const roleRows = prepareStaffTableRows(staff, {
    filterRole: ROLES.LEADER,
    sortColumn: 'name',
    sortDirection: SORT_DIRECTION.ASC,
  });

  assert.deepEqual(searchRows.map((row) => row.id), ['4', '2', '3']);
  assert.deepEqual(roleRows.map((row) => row.id), ['3']);
});
