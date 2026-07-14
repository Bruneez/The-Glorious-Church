import { createGeocodingError } from '@/utils/geocodingErrors';

export const GEOAPIFY_AUTOCOMPLETE_URL = 'https://api.geoapify.com/v1/geocode/autocomplete';
export const GEOAPIFY_GEOCODE_URL = 'https://api.geoapify.com/v1/geocode/search';

/** Geoapify bias uses longitude,latitude */
export const GEOAPIFY_CAPE_TOWN_BIAS = 'proximity:18.4241,-33.9249';
export const GEOAPIFY_SOUTH_AFRICA_FILTER = 'countrycode:za';

export const GEOAPIFY_DEFAULT_LANG = 'en';
export const GEOAPIFY_AUTOCOMPLETE_LIMIT = 6;
export const GEOAPIFY_GEOCODE_LIMIT = 1;
export const GEOAPIFY_MIN_QUERY_LENGTH = 3;

const PLACEHOLDER_KEYS = new Set(['', 'your_actual_api_key_here']);

export function isGeoapifyConfigured() {
  const key = String(import.meta.env.VITE_GEOAPIFY_API_KEY || '').trim();
  return Boolean(key && !PLACEHOLDER_KEYS.has(key));
}

export function getGeoapifyApiKey() {
  const key = String(import.meta.env.VITE_GEOAPIFY_API_KEY || '').trim();

  if (!key || PLACEHOLDER_KEYS.has(key)) {
    throw createGeocodingError(
      'NOT_CONFIGURED',
      'Address lookup is not configured. Please contact an administrator.',
    );
  }

  return key;
}

export function buildGeoapifySearchParams(text, { limit = GEOAPIFY_AUTOCOMPLETE_LIMIT } = {}) {
  return new URLSearchParams({
    text: String(text || '').trim(),
    format: 'json',
    limit: String(limit),
    lang: GEOAPIFY_DEFAULT_LANG,
    apiKey: getGeoapifyApiKey(),
    filter: GEOAPIFY_SOUTH_AFRICA_FILTER,
    bias: GEOAPIFY_CAPE_TOWN_BIAS,
  });
}
