import {
  filterPlottableMarkers,
  mapMemberRecordsToHomeMarkers,
  mapMemberRecordsToLocationMarkers,
} from '@/config/mapMarkerModels';
import {
  GEOAPIFY_AUTOCOMPLETE_URL,
  GEOAPIFY_GEOCODE_LIMIT,
  GEOAPIFY_GEOCODE_URL,
  GEOAPIFY_MIN_QUERY_LENGTH,
  buildGeoapifySearchParams,
  isGeoapifyConfigured,
} from '@/config/geoapify';
import {
  getMemberHomeCoords,
  getMemberWorkCoords,
} from '@/utils/memberLocations';
import {
  createGeocodingError,
  mapGeoapifyHttpStatusToError,
} from '@/utils/geocodingErrors';

/**
 * Map service — Firestore marker loading and Geoapify geocoding/autocomplete.
 */

function buildPrimaryText(result) {
  const line1 = String(result.address_line1 || '').trim();
  if (line1) return line1;

  const streetParts = [result.housenumber, result.street].filter(Boolean).join(' ').trim();
  if (streetParts) return streetParts;

  const name = String(result.name || result.city || '').trim();
  if (name) return name;

  const formatted = String(result.formatted || '').trim();
  return formatted.split(',')[0]?.trim() || formatted;
}

function buildSecondaryText(result) {
  const parts = [
    result.suburb,
    result.district,
    result.municipality,
    result.county,
    result.city,
    result.state,
    result.postcode,
  ]
    .map((part) => String(part || '').trim())
    .filter(Boolean);

  return [...new Set(parts)].join(', ');
}

function isHouseLevelResult(result) {
  if (!result) return false;

  const resultType = String(result.result_type || '').toLowerCase();
  if (resultType === 'building' || resultType === 'amenity') return true;
  if (result.housenumber) return true;

  const line1 = String(result.address_line1 || '').trim();
  return Boolean(line1 && /\d/.test(line1));
}

function normalizeGeoapifyResult(result) {
  if (!result) return null;

  const latitude = Number(result.lat);
  const longitude = Number(result.lon);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  const formattedAddress = String(result.formatted || result.address_line1 || '').trim();
  const primaryText = buildPrimaryText(result);
  const secondaryText = buildSecondaryText(result);

  if (!formattedAddress && !primaryText) {
    return null;
  }

  return {
    id: result.place_id || `${latitude},${longitude}`,
    formattedAddress: formattedAddress || primaryText,
    primaryText: primaryText || formattedAddress,
    secondaryText,
    latitude,
    longitude,
    houseLevel: isHouseLevelResult(result),
  };
}

function sortSuggestions(results = []) {
  return [...results].sort((left, right) => {
    if (left.houseLevel === right.houseLevel) return 0;
    return left.houseLevel ? -1 : 1;
  });
}

function toPublicSuggestion(result) {
  return {
    id: result.id,
    formattedAddress: result.formattedAddress,
    primaryText: result.primaryText,
    secondaryText: result.secondaryText,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

async function geoapifyRequest(baseUrl, params) {
  let response;

  try {
    response = await fetch(`${baseUrl}?${params.toString()}`);
  } catch {
    throw createGeocodingError(
      'NETWORK',
      'The address service is unavailable. Check your internet connection and try again.',
    );
  }

  if (!response.ok) {
    throw mapGeoapifyHttpStatusToError(response.status);
  }

  return response.json();
}

/** Future: load all map markers from Firestore collections. */
export async function fetchMapMarkers() {
  return filterPlottableMarkers([]);
}

/**
 * Geocode a street address into coordinates via Geoapify.
 * Returns null when no match is found.
 */
export async function geocodeAddress(address) {
  const text = String(address || '').trim();

  if (!text) {
    throw createGeocodingError('INVALID', 'An address is required.');
  }

  if (!isGeoapifyConfigured()) {
    throw createGeocodingError(
      'NOT_CONFIGURED',
      'Address lookup is not configured. Please contact an administrator.',
    );
  }

  const params = buildGeoapifySearchParams(text, { limit: GEOAPIFY_GEOCODE_LIMIT });
  const data = await geoapifyRequest(GEOAPIFY_GEOCODE_URL, params);
  const normalized = normalizeGeoapifyResult(data?.results?.[0]);

  if (!normalized) {
    return null;
  }

  return {
    formattedAddress: normalized.formattedAddress,
    latitude: normalized.latitude,
    longitude: normalized.longitude,
  };
}

/** Autocomplete address suggestions while typing via Geoapify. */
export async function searchAddressSuggestions(query) {
  const text = String(query || '').trim();

  if (text.length < GEOAPIFY_MIN_QUERY_LENGTH || !isGeoapifyConfigured()) {
    return [];
  }

  const params = buildGeoapifySearchParams(text);
  const data = await geoapifyRequest(GEOAPIFY_AUTOCOMPLETE_URL, params);

  return sortSuggestions(
    (data?.results || [])
      .map(normalizeGeoapifyResult)
      .filter(Boolean),
  ).map(toPublicSuggestion);
}

/**
 * Reads stored member home coordinates and returns map-ready home markers.
 * Does not geocode missing addresses.
 */
export function buildMemberHomeLocationMarkers(members = [], layerId = 'members') {
  return mapMemberRecordsToHomeMarkers(members, layerId);
}

/**
 * Reads stored member home and work coordinates and returns map-ready markers.
 * Does not geocode missing addresses.
 */
export function buildMemberLocationMarkers(members = [], layerId = 'members') {
  return mapMemberRecordsToLocationMarkers(members, layerId);
}

/**
 * Attaches resolved coordinate arrays to member records from stored fields.
 */
export function attachMemberCoordinates(members = []) {
  return members.map((member) => ({
    ...member,
    homeCoords: getMemberHomeCoords(member),
    workCoords: getMemberWorkCoords(member),
  }));
}

/**
 * Future: batch geocode and attach coordinates to school records.
 */
export async function attachSchoolCoordinates(_schools = []) {
  return [];
}

/**
 * Future: batch geocode and attach coordinates to branch records.
 */
export async function attachBranchCoordinates(_branches = []) {
  return [];
}

/**
 * Future: batch geocode and attach coordinates to ministry records.
 */
export async function attachMinistryCoordinates(_ministries = []) {
  return [];
}
