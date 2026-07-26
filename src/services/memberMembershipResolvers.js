import { isMembershipSelection } from '../config/memberFormValidation.js';

function getMemberDepartmentName(member) {
  return String(member?.department || member?.creativeArts || member?.creativeArtsName || '').trim();
}

export function resolveMemberCreativeArtsTeamId(member) {
  const record = member || {};

  if (isMembershipSelection(record.creativeArtsId)) {
    return String(record.creativeArtsId).trim();
  }

  if (isMembershipSelection(record.departmentId)) {
    return String(record.departmentId).trim();
  }

  return '';
}

export function resolveMemberMinistryId(member) {
  const record = member || {};

  if (isMembershipSelection(record.ministryId)) {
    return String(record.ministryId).trim();
  }

  return '';
}

export function resolveCreativeArtsTeamIdFromMember(member, teams = []) {
  const directId = resolveMemberCreativeArtsTeamId(member);
  if (directId) return directId;

  const departmentName = getMemberDepartmentName(member).toLowerCase();
  if (!departmentName) return '';

  const matched = teams.find(
    (team) => String(team.name || '').trim().toLowerCase() === departmentName,
  );
  return matched?.id || '';
}

export function resolveMinistryIdFromMember(member, ministries = []) {
  const directId = resolveMemberMinistryId(member);
  if (directId) return directId;

  const ministryName = String(member?.ministryName || '').trim().toLowerCase();
  if (!ministryName) return '';

  const matched = ministries.find(
    (ministry) => String(ministry.ministryName || '').trim().toLowerCase() === ministryName,
  );
  return matched?.id || '';
}

export function planMemberCreativeArtsMembershipChange(previousMember, nextPayload, teams = []) {
  const previousTeamId = resolveCreativeArtsTeamIdFromMember(previousMember, teams);
  const nextTeamId = resolveCreativeArtsTeamIdFromMember(nextPayload, teams);

  if (previousTeamId === nextTeamId) {
    return {
      changed: false,
      previousTeamId,
      nextTeamId,
      removeFromTeamId: null,
      addToTeamId: null,
    };
  }

  return {
    changed: true,
    previousTeamId,
    nextTeamId,
    removeFromTeamId: previousTeamId || null,
    addToTeamId: nextTeamId || null,
  };
}

export function planMemberMinistryMembershipChange(previousMember, nextPayload, ministries = []) {
  const previousMinistryId = resolveMinistryIdFromMember(previousMember, ministries);
  const nextMinistryId = resolveMinistryIdFromMember(nextPayload, ministries);

  if (previousMinistryId === nextMinistryId) {
    return {
      changed: false,
      previousMinistryId,
      nextMinistryId,
      removeFromMinistryId: null,
      addToMinistryId: null,
    };
  }

  return {
    changed: true,
    previousMinistryId,
    nextMinistryId,
    removeFromMinistryId: previousMinistryId || null,
    addToMinistryId: nextMinistryId || null,
  };
}
