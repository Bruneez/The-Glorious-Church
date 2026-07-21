export function getSchoolTotalMembers(schoolId, memberCounts = {}) {
  if (!schoolId) return 0;
  return memberCounts[schoolId] ?? 0;
}

export function buildSchoolCardMemberCount(schoolId, memberCounts = {}) {
  return getSchoolTotalMembers(schoolId, memberCounts);
}

export function buildSchoolMapMarkerMemberCount(schoolId, memberCounts = {}) {
  return getSchoolTotalMembers(schoolId, memberCounts);
}
