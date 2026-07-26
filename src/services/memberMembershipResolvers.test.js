import test from 'node:test';
import assert from 'node:assert/strict';
import {
  planMemberCreativeArtsMembershipChange,
  planMemberMinistryMembershipChange,
  resolveCreativeArtsTeamIdFromMember,
  resolveMemberCreativeArtsTeamId,
  resolveMemberMinistryId,
  resolveMinistryIdFromMember,
} from './memberMembershipResolvers.js';

const creativeArtsTeams = [
  { id: 'ca-choir', name: 'Choir' },
  { id: 'ca-worship', name: 'Worship Team' },
];

const ministries = [
  { id: 'min-protocol', ministryName: 'Protocol' },
  { id: 'min-ushers', ministryName: 'Ushers' },
];

test('resolveMemberCreativeArtsTeamId treats null previous member as empty', () => {
  assert.equal(resolveMemberCreativeArtsTeamId(null), '');
  assert.equal(resolveMemberCreativeArtsTeamId(undefined), '');
});

test('resolveMemberCreativeArtsTeamId ignores N/A and returns real team ids', () => {
  assert.equal(resolveMemberCreativeArtsTeamId({ creativeArtsId: 'N/A' }), '');
  assert.equal(resolveMemberCreativeArtsTeamId({ creativeArtsId: 'ca-1' }), 'ca-1');
  assert.equal(resolveMemberCreativeArtsTeamId({ departmentId: 'ca-legacy' }), 'ca-legacy');
});

test('resolveMemberMinistryId treats null previous member as empty', () => {
  assert.equal(resolveMemberMinistryId(null), '');
  assert.equal(resolveMemberMinistryId(undefined), '');
});

test('resolveMemberMinistryId ignores N/A and returns real ministry ids', () => {
  assert.equal(resolveMemberMinistryId({ ministryId: 'N/A' }), '');
  assert.equal(resolveMemberMinistryId({ ministryId: 'min-1' }), 'min-1');
});

test('resolveCreativeArtsTeamIdFromMember resolves legacy department names', () => {
  assert.equal(
    resolveCreativeArtsTeamIdFromMember({ department: 'Choir' }, creativeArtsTeams),
    'ca-choir',
  );
});

test('resolveMinistryIdFromMember resolves legacy ministry names', () => {
  assert.equal(
    resolveMinistryIdFromMember({ ministryName: 'Protocol' }, ministries),
    'min-protocol',
  );
});

test('planMemberCreativeArtsMembershipChange moves member between teams', () => {
  const plan = planMemberCreativeArtsMembershipChange(
    { creativeArtsId: 'ca-choir' },
    { creativeArtsId: 'ca-worship' },
    creativeArtsTeams,
  );

  assert.equal(plan.changed, true);
  assert.equal(plan.removeFromTeamId, 'ca-choir');
  assert.equal(plan.addToTeamId, 'ca-worship');
});

test('planMemberCreativeArtsMembershipChange clears relationship for N/A', () => {
  const plan = planMemberCreativeArtsMembershipChange(
    { creativeArtsId: 'ca-choir' },
    { creativeArtsId: '', department: '', departmentId: '' },
    creativeArtsTeams,
  );

  assert.equal(plan.changed, true);
  assert.equal(plan.removeFromTeamId, 'ca-choir');
  assert.equal(plan.addToTeamId, null);
});

test('planMemberCreativeArtsMembershipChange is idempotent for unchanged assignment', () => {
  const member = { creativeArtsId: 'ca-choir' };
  const plan = planMemberCreativeArtsMembershipChange(member, member, creativeArtsTeams);

  assert.equal(plan.changed, false);
  assert.equal(plan.removeFromTeamId, null);
  assert.equal(plan.addToTeamId, null);
});

test('planMemberMinistryMembershipChange moves member between ministries', () => {
  const plan = planMemberMinistryMembershipChange(
    { ministryId: 'min-protocol' },
    { ministryId: 'min-ushers' },
    ministries,
  );

  assert.equal(plan.changed, true);
  assert.equal(plan.removeFromMinistryId, 'min-protocol');
  assert.equal(plan.addToMinistryId, 'min-ushers');
});

test('planMemberMinistryMembershipChange clears relationship for N/A', () => {
  const plan = planMemberMinistryMembershipChange(
    { ministryId: 'min-protocol' },
    { ministryId: '', ministryName: '' },
    ministries,
  );

  assert.equal(plan.changed, true);
  assert.equal(plan.removeFromMinistryId, 'min-protocol');
  assert.equal(plan.addToMinistryId, null);
});

test('planMemberMinistryMembershipChange is idempotent for unchanged assignment', () => {
  const member = { ministryId: 'min-protocol' };
  const plan = planMemberMinistryMembershipChange(member, member, ministries);

  assert.equal(plan.changed, false);
  assert.equal(plan.removeFromMinistryId, null);
  assert.equal(plan.addToMinistryId, null);
});
