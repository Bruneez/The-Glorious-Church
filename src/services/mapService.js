import { filterPlottableMarkers } from '@/config/mapMarkerModels';

/**
 * Map service — future Firestore, geocoding, and address autocomplete integration.
 * Returns an empty marker set until Firestore data is connected.
 */

/** Future: load all map markers from Firestore collections. */
export async function fetchMapMarkers() {
  return filterPlottableMarkers([]);
}

/**
 * Future: geocode a street address into [latitude, longitude].
 * Not implemented — reserved for address-to-pin placement.
 */
export async function geocodeAddress(_address) {
  throw new Error('Geocoding is not implemented yet.');
}

/**
 * Future: autocomplete address suggestions while typing.
 * Not implemented — reserved for member/branch address forms.
 */
export async function searchAddressSuggestions(_query) {
  return [];
}

/**
 * Future: batch geocode and attach coordinates to member records.
 */
export async function attachMemberCoordinates(_members = []) {
  return [];
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
