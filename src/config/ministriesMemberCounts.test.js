import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeMemberCountsForMinistries,
  getMembersLinkedToMinistry,
  getMinistryMemberCount,
  memberMatchesMinistry,
} from './ministriesOptions.js';

const youthMinistry = {
  id: 'min-youth',
  name: 'Youth Ministry',
  ministryName: 'Youth Ministry',
  members: [],
  totalMembers: 0,
};

const legacyMinistry = {
  id: 'min-legacy',
  ministryName: 'Legacy Ministry',
  members: ['legacy-id'],
  totalMembers: 1,
};

const members = [
  { id: 'member-1', ministryId: 'min-youth', name: 'Jane', surname: 'Doe' },
  { id: 'member-2', ministryId: 'min-youth', name: 'John', surname: 'Smith' },
  { id: 'member-3', ministryId: 'N/A', creativeArtsId: 'ca-1', name: 'Amy', surname: 'Lee' },
];

test('getMinistryMemberCount uses linked members from the directory when members are provided', () => {
  assert.equal(getMinistryMemberCount(youthMinistry, members), 2);
  assert.equal(getMinistryMemberCount(legacyMinistry, members), 0);
});

test('getMinistryMemberCount falls back to stored ministry members when members are not provided', () => {
  assert.equal(getMinistryMemberCount(legacyMinistry), 1);
  assert.equal(getMinistryMemberCount(youthMinistry), 0);
});

test('computeMemberCountsForMinistries matches linked member lookup', () => {
  const counts = computeMemberCountsForMinistries(members, [youthMinistry, legacyMinistry]);

  assert.equal(counts['min-youth'], getMembersLinkedToMinistry(members, youthMinistry).length);
  assert.equal(counts['min-youth'], 2);
  assert.equal(counts['min-legacy'], 0);
});

test('memberMatchesMinistry does not double-count moved members via stale ministry names', () => {
  const movedMember = {
    id: 'member-1',
    ministryId: 'min-ushers',
    ministryName: 'Ushers',
  };

  assert.equal(
    memberMatchesMinistry(movedMember, { id: 'min-protocol', ministryName: 'Protocol' }),
    false,
  );
  assert.equal(
    getMembersLinkedToMinistry([movedMember], { id: 'min-ushers', ministryName: 'Ushers' }).length,
    1,
  );
});
