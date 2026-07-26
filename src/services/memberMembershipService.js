import {
  planMemberCreativeArtsMembershipChange,
  planMemberMinistryMembershipChange,
  resolveCreativeArtsTeamIdFromMember,
  resolveMinistryIdFromMember,
} from '@/services/memberMembershipResolvers';
import {
  addMemberToTeam,
  getCreativeArts,
  removeMemberFromTeam,
} from '@/services/creativeArtsService';
import {
  addMemberToMinistry,
  getMinistries,
  removeMemberFromMinistry,
} from '@/services/ministriesService';

export {
  resolveMemberCreativeArtsTeamId,
  resolveMemberMinistryId,
  resolveCreativeArtsTeamIdFromMember,
  resolveMinistryIdFromMember,
  planMemberCreativeArtsMembershipChange,
  planMemberMinistryMembershipChange,
} from '@/services/memberMembershipResolvers';

export async function syncMemberCreativeArtsMembership(memberId, previousMember, nextPayload) {
  const teams = await getCreativeArts();
  const plan = planMemberCreativeArtsMembershipChange(previousMember, nextPayload, teams);

  if (!plan.changed) {
    return;
  }

  if (plan.removeFromTeamId) {
    await removeMemberFromTeam(plan.removeFromTeamId, memberId);
  }

  if (plan.addToTeamId) {
    await addMemberToTeam(plan.addToTeamId, memberId);
  }
}

export async function syncMemberMinistryMembership(memberId, previousMember, nextPayload) {
  const ministries = await getMinistries();
  const plan = planMemberMinistryMembershipChange(previousMember, nextPayload, ministries);

  if (!plan.changed) {
    return;
  }

  if (plan.removeFromMinistryId) {
    await removeMemberFromMinistry(plan.removeFromMinistryId, memberId);
  }

  if (plan.addToMinistryId) {
    await addMemberToMinistry(plan.addToMinistryId, memberId);
  }
}

export async function syncMemberModuleMemberships(memberId, previousMember, nextPayload) {
  await syncMemberCreativeArtsMembership(memberId, previousMember, nextPayload);
  await syncMemberMinistryMembership(memberId, previousMember, nextPayload);
}

export async function cleanupMemberModuleMemberships(memberId, member) {
  const record = member || {};
  const teams = await getCreativeArts();
  const ministries = await getMinistries();
  const creativeArtsTeamId = resolveCreativeArtsTeamIdFromMember(record, teams);
  const ministryId = resolveMinistryIdFromMember(record, ministries);

  if (creativeArtsTeamId) {
    await removeMemberFromTeam(creativeArtsTeamId, memberId);
  }

  if (ministryId) {
    await removeMemberFromMinistry(ministryId, memberId);
  }
}
