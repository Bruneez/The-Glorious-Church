import { MAP_LAYER_IDS } from '../config/mapOptions.js';

/** Normalizes a latitude/longitude value for Firestore storage. */
export function normalizeSchoolCoordinate(value) {
  if (value === '' || value == null) return null;

  const number = Number(value);
  if (!Number.isFinite(number)) return null;

  return number;
}

export function buildSchoolFirestoreLocationFields(formData = {}) {
  const address = String(formData.address || '').trim();

  return {
    address,
    latitude: normalizeSchoolCoordinate(formData.latitude),
    longitude: normalizeSchoolCoordinate(formData.longitude),
  };
}

export function shouldFallbackGeocodeSchoolAddress(address, latitude, longitude) {
  const trimmedAddress = String(address || '').trim();
  if (!trimmedAddress) return false;

  const lat = normalizeSchoolCoordinate(latitude);
  const lng = normalizeSchoolCoordinate(longitude);

  return lat == null || lng == null;
}

export function applyGeocodedSchoolLocation(formData, geocoded) {
  if (!geocoded) return formData;

  return {
    ...formData,
    address: geocoded.formattedAddress,
    latitude: geocoded.latitude,
    longitude: geocoded.longitude,
  };
}

export function getSchoolAddressManualChangeFormUpdates(address) {
  return {
    address,
    latitude: null,
    longitude: null,
  };
}

export function getSchoolAddressSelectionFormUpdates({ address, latitude, longitude }) {
  return {
    address,
    latitude,
    longitude,
  };
}

export function getSchoolAddress(school = {}) {
  return String(school.address || school.schoolLocation?.fullAddress || '').trim();
}

export function getSchoolCoords(school = {}) {
  const lat = normalizeSchoolCoordinate(
    school.latitude ?? school.lat ?? school.schoolLocation?.latitude,
  );
  const lng = normalizeSchoolCoordinate(
    school.longitude ?? school.lng ?? school.schoolLocation?.longitude,
  );

  if (lat == null || lng == null) {
    return null;
  }

  return [lat, lng];
}

export function resolveSchoolMapLayerId(school = {}) {
  const normalized = String(school.schoolType || school.type || '').trim().toLowerCase();

  if (!normalized) return null;

  if (normalized.includes('primary')) {
    return MAP_LAYER_IDS.PRIMARY_SCHOOLS;
  }

  if (normalized.includes('high')) {
    return MAP_LAYER_IDS.HIGH_SCHOOLS;
  }

  if (normalized.includes('university') || normalized.includes('college')) {
    return MAP_LAYER_IDS.UNIVERSITIES;
  }

  return null;
}

export function buildSchoolMapMarkerDescriptors(schools = []) {
  return schools
    .map((school) => {
      const layerId = resolveSchoolMapLayerId(school);
      const coords = getSchoolCoords(school);

      if (!layerId || !coords) {
        return null;
      }

      return {
        school,
        layerId,
        coords,
        id: school?.id || '',
        name: school?.schoolName || school?.name || 'Unknown School',
        address: getSchoolAddress(school),
        schoolType: school?.schoolType || school?.type || '',
      };
    })
    .filter(Boolean);
}

export function mergeMemberAndSchoolMarkers(memberMarkers = [], schoolMarkers = []) {
  return [...memberMarkers, ...schoolMarkers];
}

export function mapSchoolRecordToFormLocationFields(school = {}) {
  return {
    address: String(school.address || school.schoolLocation?.fullAddress || '').trim(),
    latitude: normalizeSchoolCoordinate(
      school.latitude ?? school.lat ?? school.schoolLocation?.latitude,
    ),
    longitude: normalizeSchoolCoordinate(
      school.longitude ?? school.lng ?? school.schoolLocation?.longitude,
    ),
  };
}
