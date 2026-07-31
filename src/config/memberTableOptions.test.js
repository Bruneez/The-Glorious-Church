import test from 'node:test';
import assert from 'node:assert/strict';
import { MEMBERSHIP_NA } from './memberFormValidation.js';
import {
  getMemberTableCreativeArtsLabel,
  getMemberTableMinistryLabel,
  sortMembersTable,
} from './memberTableOptions.js';
import { SORT_DIRECTION } from '../utils/tableSort.js';

const activeCreativeArtsTeams = [
  { id: 'ca-1', name: 'Choir', status: 'Active' },
];

const activeMinistries = [
  { id: 'min-1', ministryName: 'Youth', status: 'Active' },
];

test('getMemberTableCreativeArtsLabel resolves live department names and falls back to N/A', () => {
  assert.equal(
    getMemberTableCreativeArtsLabel({ creativeArtsId: 'ca-1' }, activeCreativeArtsTeams),
    'Choir',
  );
  assert.equal(getMemberTableCreativeArtsLabel({}, activeCreativeArtsTeams), MEMBERSHIP_NA);
  assert.equal(
    getMemberTableMinistryLabel({ ministryId: 'min-1' }, activeMinistries),
    'Youth',
  );
  assert.equal(getMemberTableMinistryLabel({}, activeMinistries), MEMBERSHIP_NA);
});

test('sortMembersTable sorts members by name and Creative Arts', () => {
  const members = [
    { id: '1', name: 'Zane', surname: 'Zulu', phone: '999', creativeArtsId: 'ca-1', ministryId: 'min-1' },
    { id: '2', name: 'Amy', surname: 'Adams', phone: '111', creativeArtsId: '', ministryId: '' },
  ];

  const byNameAsc = sortMembersTable(members, 'fullName', SORT_DIRECTION.ASC, {
    creativeArtsTeams: activeCreativeArtsTeams,
    ministries: activeMinistries,
  });
  assert.deepEqual(byNameAsc.map((member) => member.id), ['2', '1']);

  const byCreativeArtsAsc = sortMembersTable(members, 'creativeArts', SORT_DIRECTION.ASC, {
    creativeArtsTeams: activeCreativeArtsTeams,
    ministries: activeMinistries,
  });
  assert.equal(byCreativeArtsAsc[0].id, '1');
});
