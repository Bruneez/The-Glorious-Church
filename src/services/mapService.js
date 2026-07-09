import {
  filterPlottableMarkers,
  mapMemberRecordsToHomeMarkers,
  mapMemberRecordsToLocationMarkers,
} from '@/config/mapMarkerModels';
import {
  getMemberHomeCoords,
  getMemberWorkCoords,
} from '@/utils/memberLocations';

/**
 * Map service — Firestore marker loading and future geocoding/autocomplete integration.
 * Returns an empty marker set until member coordinates are stored or geocoding is connected.
 */

/** Future: load all map markers from Firestore collections. */
export async function fetchMapMarkers() {
  return filterPlottableMarkers([]);
}

/**
 * Future: geocode a street address into [latitude, longitude].
 * Not implemented — connect a provider (e.g. Nominatim, Google Places) here.
 */
export async function geocodeAddress(_address) {
  throw new Error('Geocoding is not implemented yet.');
}

/**
 * Future: autocomplete address suggestions while typing.
 * Not implemented — wire AddressInput to this when a provider is selected.
 */
export async function searchAddressSuggestions(_query) {
  return [];
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
