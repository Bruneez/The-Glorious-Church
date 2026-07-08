/** Future Firestore collection names for map pin sources. */
export const MAP_SOURCE_COLLECTIONS = {
  MEMBERS: 'members',
  SCHOOLS: 'schools',
  BRANCHES: 'branches',
  MINISTRIES: 'ministries',
  CREATIVE_ARTS: 'creative_arts',
};

/**
 * Normalized map marker shape used by Leaflet rendering.
 * `coords` should be [latitude, longitude] once geocoded.
 */
export function createMapMarker({
  id,
  layerId,
  type,
  coords,
  label,
  sourceId = '',
  sourceCollection = '',
  data = {},
}) {
  return {
    id,
    layerId,
    type,
    coords: normalizeCoords(coords),
    label,
    sourceId,
    sourceCollection,
    data,
  };
}

/** Validates and normalizes [lat, lng] coordinates for map pins. */
export function normalizeCoords(coords) {
  if (!Array.isArray(coords) || coords.length < 2) {
    return null;
  }

  const lat = Number(coords[0]);
  const lng = Number(coords[1]);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  return [lat, lng];
}

/** Returns markers with valid coordinates — use after geocoding or Firestore load. */
export function filterPlottableMarkers(markers = []) {
  return markers.filter((marker) => Array.isArray(marker.coords) && marker.coords.length === 2);
}

export function getMemberMarkerLabel(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'M';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function getSchoolMarkerLabel(schoolType = '') {
  const value = String(schoolType).toLowerCase();
  if (value.includes('primary')) return 'PS';
  if (value.includes('high')) return 'HS';
  if (value.includes('university') || value.includes('college')) return 'UC';
  return 'SC';
}

export function buildMemberMarkerData({
  name,
  photo = '',
  address = '',
  phone = '',
  branch = '',
  cellLeader = '',
  profilePath = '/members',
} = {}) {
  return {
    name,
    photo,
    address,
    phone,
    branch,
    cellLeader,
    profilePath,
  };
}

export function buildSchoolMarkerData({
  name,
  logo = '',
  schoolType = '',
  memberCount = 0,
  schoolPath = '/schools',
} = {}) {
  return {
    name,
    logo,
    schoolType,
    memberCount,
    schoolPath,
  };
}

export function buildBranchMarkerData({
  name,
  pastor = '',
  memberCount = 0,
  branchPath = '',
} = {}) {
  return {
    name,
    pastor,
    memberCount,
    branchPath,
  };
}

export function buildMinistryMarkerData({
  name,
  leader = '',
  memberCount = 0,
  ministryPath = '',
} = {}) {
  return {
    name,
    leader,
    memberCount,
    ministryPath,
  };
}

export function buildCreativeArtsMarkerData({
  name,
  leader = '',
  memberCount = 0,
  departmentPath = '/creative-arts',
} = {}) {
  return {
    name,
    leader,
    memberCount,
    departmentPath,
  };
}

/** Maps a raw Firestore member document to a map marker (geocoding applied separately). */
export function mapMemberRecordToMarker(member, layerId, coords = null) {
  const name = member?.fullName || member?.name || 'Unknown Member';

  return createMapMarker({
    id: `member-${member?.id}`,
    layerId,
    type: 'member',
    coords,
    label: getMemberMarkerLabel(name),
    sourceId: member?.id || '',
    sourceCollection: MAP_SOURCE_COLLECTIONS.MEMBERS,
    data: buildMemberMarkerData({
      name,
      photo: member?.photo || '',
      address: member?.address || '',
      phone: member?.phone || member?.cellphone || '',
      branch: member?.branch || member?.fellowship || '',
      cellLeader: member?.cellLeader || member?.leader || '',
      profilePath: member?.id ? `/members` : '/members',
    }),
  });
}

/** Maps a raw Firestore school document to a map marker. */
export function mapSchoolRecordToMarker(school, layerId, coords = null) {
  const name = school?.schoolName || school?.name || 'Unknown School';
  const schoolType = school?.schoolType || school?.type || '';

  return createMapMarker({
    id: `school-${school?.id}`,
    layerId,
    type: 'school',
    coords,
    label: getSchoolMarkerLabel(schoolType),
    sourceId: school?.id || '',
    sourceCollection: MAP_SOURCE_COLLECTIONS.SCHOOLS,
    data: buildSchoolMarkerData({
      name,
      logo: school?.logo || school?.photo || '',
      schoolType,
      memberCount: Number(school?.memberCount) || 0,
      schoolPath: '/schools',
    }),
  });
}

/** Maps a raw Firestore branch document to a map marker. */
export function mapBranchRecordToMarker(branch, coords = null) {
  const name = branch?.name || 'Unknown Branch';

  return createMapMarker({
    id: `branch-${branch?.id}`,
    layerId: 'branches',
    type: 'branch',
    coords,
    label: '⛪',
    sourceId: branch?.id || '',
    sourceCollection: MAP_SOURCE_COLLECTIONS.BRANCHES,
    data: buildBranchMarkerData({
      name,
      pastor: branch?.pastor || branch?.leader || '',
      memberCount: Number(branch?.memberCount) || 0,
      branchPath: branch?.id ? `/branches/${branch.id}` : '',
    }),
  });
}

/** Maps a raw Firestore ministry document to a map marker. */
export function mapMinistryRecordToMarker(ministry, coords = null) {
  const name = ministry?.name || 'Unknown Ministry';

  return createMapMarker({
    id: `ministry-${ministry?.id}`,
    layerId: 'ministries',
    type: 'ministry',
    coords,
    label: 'M',
    sourceId: ministry?.id || '',
    sourceCollection: MAP_SOURCE_COLLECTIONS.MINISTRIES,
    data: buildMinistryMarkerData({
      name,
      leader: ministry?.leader || '',
      memberCount: Number(ministry?.memberCount) || 0,
      ministryPath: ministry?.id ? `/ministries/${ministry.id}` : '',
    }),
  });
}

/** Maps a Creative Arts department document to a map marker. */
export function mapCreativeArtsRecordToMarker(department, coords = null) {
  const name = department?.name || 'Unknown Department';

  return createMapMarker({
    id: `creative-arts-${department?.id}`,
    layerId: 'creative-arts',
    type: 'creative-arts',
    coords,
    label: '♪',
    sourceId: department?.id || '',
    sourceCollection: MAP_SOURCE_COLLECTIONS.CREATIVE_ARTS,
    data: buildCreativeArtsMarkerData({
      name,
      leader: department?.leader || '',
      memberCount: Array.isArray(department?.members) ? department.members.length : 0,
      departmentPath: '/creative-arts',
    }),
  });
}
