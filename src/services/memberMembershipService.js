import {
  isMembershipSelection,
  getMemberDepartment,
} from '@/config/memberOptions';
import {
  addMemberToTeam,
  removeMemberFromTeam,
} from '@/services/creativeArtsService';
import {
  addMemberToMinistry,
  removeMemberFromMinistry,
} from '@/services/ministriesService';

function resolveCreativeArtsTeamId(member = {}) {
  if (isMembershipSelection(member.creativeArtsId)) {
    return String(member.creativeArtsId).trim();
  }

  if (isMembershipSelection(member.departmentId)) {
    return String(member.departmentId).trim();
  }

  return '';
}

function resolveMinistryId(member = {}) {
  if (isMembershipSelection(member.ministryId)) {
    return String(member.ministryId).trim();
  }

  return '';
}

export async function syncMemberCreativeArtsMembership(memberId, previousMember, nextPayload) {
  const previousTeamId = resolveCreativeArtsTeamId(previousMember);
  const nextTeamId = resolveCreativeArtsTeamId(nextPayload);

  if (previousTeamId === nextTeamId) {
    return;
  }

  if (previousTeamId) {
    await removeMemberFromTeam(previousTeamId, memberId);
  }

  if (nextTeamId) {
    await addMemberToTeam(nextTeamId, memberId);
  }
}

export async function syncMemberMinistryMembership(memberId, previousMember, nextPayload) {
  const previousMinistryId = resolveMinistryId(previousMember);
  const nextMinistryId = resolveMinistryId(nextPayload);

  if (previousMinistryId === nextMinistryId) {
    return;
  }

  if (previousMinistryId) {
    await removeMemberFromMinistry(previousMinistryId, memberId);
  }

  if (nextMinistryId) {
    await addMemberToMinistry(nextMinistryId, memberId);
  }
}

export async function syncMemberModuleMemberships(memberId, previousMember, nextPayload) {
  await syncMemberCreativeArtsMembership(memberId, previousMember, nextPayload);
  await syncMemberMinistryMembership(memberId, previousMember, nextPayload);
}

export async function cleanupMemberModuleMemberships(memberId, member = {}) {
  const creativeArtsTeamId = resolveCreativeArtsTeamId(member);
  const ministryId = resolveMinistryId(member);

  if (creativeArtsTeamId) {
    await removeMemberFromTeam(creativeArtsTeamId, memberId);
  }

  if (ministryId) {
    await removeMemberFromMinistry(ministryId, memberId);
  }

  const legacyDepartmentName = getMemberDepartment(member);
  if (!creativeArtsTeamId && legacyDepartmentName) {
    // Legacy members may only have a department name without an ID-based team link.
    // Department-side member arrays are cleaned up when the member document is deleted.
  }
}
