import { FELLOWSHIP_HUBS, LEGACY_SCHOOL_COORDS } from '@/config/mapConfig';

function normalizeName(value = '') {
  return value.toLowerCase().trim();
}

export function resolveSchoolCoords(school) {
  if (school.lat != null && school.lng != null) {
    return [Number(school.lat), Number(school.lng)];
  }

  const name = normalizeName(school.name);
  if (LEGACY_SCHOOL_COORDS[name]) {
    return LEGACY_SCHOOL_COORDS[name];
  }

  for (const [legacyName, coords] of Object.entries(LEGACY_SCHOOL_COORDS)) {
    if (name.includes(legacyName) || legacyName.includes(name)) {
      return coords;
    }
  }

  return null;
}

export function countMembersInHub(members, hub) {
  return members.filter((member) => {
    const address = normalizeName(member.homeAddress || member.fullAddress || member.address);
    return hub.keywords.some((keyword) => address.includes(keyword));
  }).length;
}

export function buildMemberHubData(members) {
  return FELLOWSHIP_HUBS.map((hub) => ({
    ...hub,
    count: countMembersInHub(members, hub),
  }));
}

export function countMappedMembers(members) {
  return FELLOWSHIP_HUBS.reduce(
    (total, hub) => total + countMembersInHub(members, hub),
    0,
  );
}

export function partitionSchoolsForMap(schools) {
  const mapped = [];
  const unmapped = [];

  for (const school of schools) {
    const coords = resolveSchoolCoords(school);
    if (coords) {
      mapped.push({ school, coords });
    } else {
      unmapped.push(school);
    }
  }

  return { mapped, unmapped };
}
