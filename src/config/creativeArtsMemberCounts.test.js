import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCreativeArtsStats,
  computeMemberCountsForCreativeArtsDepartments,
  getMemberCount,
  getMembersLinkedToCreativeArtsDepartment,
} from './creativeArtsOptions.js';

const choirDepartment = {
  id: 'ca-choir',
  name: 'Choir',
  members: [],
};

const worshipDepartment = {
  id: 'ca-worship',
  name: 'Worshippers',
  members: ['legacy-member-id'],
};

const members = [
  { id: 'member-1', creativeArtsId: 'ca-choir', name: 'Jane', surname: 'Doe' },
  { id: 'member-2', creativeArtsId: 'ca-choir', name: 'John', surname: 'Smith' },
  { id: 'member-3', ministryId: 'min-1', creativeArtsId: 'N/A', name: 'Amy', surname: 'Lee' },
];

test('getMemberCount uses linked members from the directory when members are provided', () => {
  assert.equal(getMemberCount(choirDepartment, members), 2);
  assert.equal(getMemberCount(worshipDepartment, members), 0);
});

test('getMemberCount falls back to department.members when members are not provided', () => {
  assert.equal(getMemberCount(worshipDepartment), 1);
  assert.equal(getMemberCount(choirDepartment), 0);
});

test('computeMemberCountsForCreativeArtsDepartments matches linked member lookup', () => {
  const counts = computeMemberCountsForCreativeArtsDepartments(members, [
    choirDepartment,
    worshipDepartment,
  ]);

  assert.equal(counts['ca-choir'], getMembersLinkedToCreativeArtsDepartment(members, choirDepartment).length);
  assert.equal(counts['ca-choir'], 2);
  assert.equal(counts['ca-worship'], 0);
});

test('computeCreativeArtsStats totals linked members across departments', () => {
  const stats = computeCreativeArtsStats([choirDepartment, worshipDepartment], members);

  assert.equal(stats.totalDepartments, 2);
  assert.equal(stats.totalMembers, 2);
  assert.equal(stats.activeDepartments, 2);
});

test('memberMatchesCreativeArtsDepartment does not double-count moved members via stale members array', () => {
  const movedMember = {
    id: 'member-1',
    creativeArtsId: 'ca-worship',
    department: 'Worship Team',
  };
  const staleChoirDepartment = {
    id: 'ca-choir',
    name: 'Choir',
    members: ['member-1'],
  };

  assert.equal(
    getMembersLinkedToCreativeArtsDepartment([movedMember], staleChoirDepartment).length,
    0,
  );
  assert.equal(
    getMembersLinkedToCreativeArtsDepartment([movedMember], {
      id: 'ca-worship',
      name: 'Worship Team',
      members: [],
    }).length,
    1,
  );
});
