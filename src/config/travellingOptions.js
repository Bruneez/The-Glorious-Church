import { getTravelCountryLabel, isValidTravelCountryCode } from './travelCountryOptions.js';

export const TRAVEL_EXTENT = {
  INTERNATIONAL: 'international',
  NATIONAL: 'national',
};

export const TRAVEL_EXTENTS = [TRAVEL_EXTENT.INTERNATIONAL, TRAVEL_EXTENT.NATIONAL];

export const TRAVEL_EXTENT_OPTIONS = [
  { value: TRAVEL_EXTENT.INTERNATIONAL, label: 'International' },
  { value: TRAVEL_EXTENT.NATIONAL, label: 'National' },
];

export const RECOMMENDED_TRANSPORT = {
  CAR: 'car',
  TAXI: 'taxi',
  BUS: 'bus',
  TRAIN: 'train',
  PLANE: 'plane',
};

export const RECOMMENDED_TRANSPORT_OPTIONS = [
  { value: RECOMMENDED_TRANSPORT.CAR, label: 'Car' },
  { value: RECOMMENDED_TRANSPORT.TAXI, label: 'Taxi' },
  { value: RECOMMENDED_TRANSPORT.BUS, label: 'Bus' },
  { value: RECOMMENDED_TRANSPORT.TRAIN, label: 'Train' },
  { value: RECOMMENDED_TRANSPORT.PLANE, label: 'Plane' },
];

export const RECOMMENDED_TRANSPORTS = Object.values(RECOMMENDED_TRANSPORT);

export const VISA_REQUIRED_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

export const ACCEPTED_TRAVEL_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ACCEPTED_TRAVEL_IMAGE_ACCEPT =
  '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

export const MAX_TRAVEL_IMAGE_BYTES = 5 * 1024 * 1024;

export const TRAVEL_IMAGE_UPLOAD_TIMEOUT_MS = 30_000;

const INTERNATIONAL_ONLY_FIELDS = ['country', 'visaRequired'];
const NATIONAL_ONLY_FIELDS = ['townCity', 'recommendedTransport'];

export function isValidTravelExtent(value) {
  return TRAVEL_EXTENTS.includes(String(value || '').trim().toLowerCase());
}

export function normalizeTravelExtent(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return isValidTravelExtent(normalized) ? normalized : '';
}

export function isValidRecommendedTransport(value) {
  return RECOMMENDED_TRANSPORTS.includes(String(value || '').trim().toLowerCase());
}

export function normalizeRecommendedTransport(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return isValidRecommendedTransport(normalized) ? normalized : '';
}

export function parseNonNegativeNumber(value, fieldLabel) {
  if (value === '' || value === null || value === undefined) {
    return { value: null, error: '' };
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/[rR$,]|km/i.test(trimmed)) {
      return { value: null, error: `${fieldLabel} must be a plain number without units or symbols.` };
    }
  }

  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    return { value: null, error: `${fieldLabel} must be a valid number.` };
  }

  if (parsed < 0) {
    return { value: null, error: `${fieldLabel} cannot be negative.` };
  }

  return { value: parsed, error: '' };
}

export function validateTravelImageFile(file) {
  if (!file) return '';

  if (file.size > MAX_TRAVEL_IMAGE_BYTES) {
    return 'Image must be 5 MB or smaller.';
  }

  const hasAllowedType = ACCEPTED_TRAVEL_IMAGE_TYPES.includes(file.type);
  const hasAllowedExtension = /\.(jpe?g|png|webp)$/i.test(file.name || '');

  if (!hasAllowedType && !hasAllowedExtension) {
    return 'Please upload a JPG, PNG, or WEBP image.';
  }

  return '';
}

export function isPermanentImageUrl(url) {
  const value = String(url || '').trim();
  if (!value) return false;
  return !value.startsWith('blob:') && !value.startsWith('data:');
}

export function getRecommendedTransportLabel(value) {
  const match = RECOMMENDED_TRANSPORT_OPTIONS.find(
    (option) => option.value === normalizeRecommendedTransport(value),
  );
  return match?.label || '';
}

export function mapTravelDestinationToFormData(destination) {
  if (!destination) {
    return {
      travelExtent: TRAVEL_EXTENT.INTERNATIONAL,
      country: '',
      visaRequired: '',
      townCity: '',
      distanceFromCapeTownKm: '',
      recommendedTransport: '',
      estimatedCostZar: '',
      imageUrl: '',
      imageStoragePath: '',
    };
  }

  return {
    travelExtent: normalizeTravelExtent(destination.travelExtent) || TRAVEL_EXTENT.INTERNATIONAL,
    country: destination.country || '',
    visaRequired:
      destination.visaRequired === true ? 'yes' : destination.visaRequired === false ? 'no' : '',
    townCity: destination.townCity || '',
    distanceFromCapeTownKm:
      destination.distanceFromCapeTownKm === null || destination.distanceFromCapeTownKm === undefined
        ? ''
        : String(destination.distanceFromCapeTownKm),
    recommendedTransport: destination.recommendedTransport || '',
    estimatedCostZar:
      destination.estimatedCostZar === null || destination.estimatedCostZar === undefined
        ? ''
        : String(destination.estimatedCostZar),
    imageUrl: isPermanentImageUrl(destination.imageUrl) ? destination.imageUrl : '',
    imageStoragePath: destination.imageStoragePath || '',
  };
}

function parseVisaRequired(value) {
  if (value === true || value === 'yes') return true;
  if (value === false || value === 'no') return false;
  return null;
}

function validateInternationalFields(formData, errors) {
  const country = String(formData.country || '').trim().toUpperCase();
  if (!country) {
    errors.country = 'Country is required.';
  } else if (!isValidTravelCountryCode(country)) {
    errors.country = 'Please select a valid country.';
  }

  const visa = parseVisaRequired(formData.visaRequired);
  if (visa === null) {
    errors.visaRequired = 'Visa requirement is required.';
  }

  if (String(formData.townCity || '').trim()) {
    errors.townCity = 'Town or city must not be set for international destinations.';
  }

  if (String(formData.recommendedTransport || '').trim()) {
    errors.recommendedTransport = 'Recommended transport must not be set for international destinations.';
  }

  const distance = parseNonNegativeNumber(
    formData.distanceFromCapeTownKm,
    'Estimated distance from Cape Town',
  );
  if (distance.error) errors.distanceFromCapeTownKm = distance.error;
}

function validateNationalFields(formData, errors) {
  if (!String(formData.townCity || '').trim()) {
    errors.townCity = 'Town or city is required.';
  }

  if (String(formData.country || '').trim()) {
    errors.country = 'Country must not be set for national destinations.';
  }

  if (formData.visaRequired !== '' && formData.visaRequired !== null && formData.visaRequired !== undefined) {
    errors.visaRequired = 'Visa requirement must not be set for national destinations.';
  }

  const distance = parseNonNegativeNumber(formData.distanceFromCapeTownKm, 'Distance from Cape Town');
  if (distance.error) errors.distanceFromCapeTownKm = distance.error;

  if (!normalizeRecommendedTransport(formData.recommendedTransport)) {
    errors.recommendedTransport = 'Recommended form of transportation is required.';
  }
}

export function validateTravelDestinationFieldErrors(formData) {
  const errors = {};
  const rawExtent = String(formData.travelExtent || '').trim().toLowerCase();
  const travelExtent = normalizeTravelExtent(formData.travelExtent);

  if (!travelExtent) {
    errors.travelExtent = rawExtent
      ? 'Travel extent must be International or National.'
      : 'Travel extent is required.';
    return errors;
  }

  const cost = parseNonNegativeNumber(formData.estimatedCostZar, 'Estimated cost');
  if (cost.error) errors.estimatedCostZar = cost.error;

  if (travelExtent === TRAVEL_EXTENT.INTERNATIONAL) {
    validateInternationalFields(formData, errors);
  } else {
    validateNationalFields(formData, errors);
  }

  return errors;
}

export function validateTravelDestinationForm(formData) {
  const errors = validateTravelDestinationFieldErrors(formData);
  return Object.values(errors).find(Boolean) || '';
}

export function buildTravelDestinationPayload(formData, { createdBy = '' } = {}) {
  const travelExtent = normalizeTravelExtent(formData.travelExtent);
  const cost = parseNonNegativeNumber(formData.estimatedCostZar, 'Estimated cost');
  const distance = parseNonNegativeNumber(formData.distanceFromCapeTownKm, 'Distance from Cape Town');

  const imageUrl = isPermanentImageUrl(formData.imageUrl) ? String(formData.imageUrl).trim() : '';
  const imageStoragePath = String(formData.imageStoragePath || '').trim();

  const base = {
    travelExtent,
    imageUrl,
    imageStoragePath,
    distanceFromCapeTownKm: distance.value,
    estimatedCostZar: cost.value,
    createdBy: String(createdBy || formData.createdBy || '').trim(),
  };

  if (travelExtent === TRAVEL_EXTENT.INTERNATIONAL) {
    return {
      ...base,
      country: String(formData.country || '').trim().toUpperCase(),
      visaRequired: parseVisaRequired(formData.visaRequired) === true,
    };
  }

  return {
    ...base,
    townCity: String(formData.townCity || '').trim(),
    recommendedTransport: normalizeRecommendedTransport(formData.recommendedTransport),
  };
}

export function getTravelDestinationFieldClears(travelExtent) {
  if (travelExtent === TRAVEL_EXTENT.INTERNATIONAL) {
    return NATIONAL_ONLY_FIELDS;
  }

  if (travelExtent === TRAVEL_EXTENT.NATIONAL) {
    return INTERNATIONAL_ONLY_FIELDS;
  }

  return [];
}

export function filterTravelDestinations(destinations = [], { searchTerm = '', travelExtent = '' } = {}) {
  const normalizedExtent = normalizeTravelExtent(travelExtent);
  const term = String(searchTerm || '').trim().toLowerCase();

  return destinations.filter((destination) => {
    if (normalizedExtent && destination.travelExtent !== normalizedExtent) {
      return false;
    }

    if (!term) return true;

    if (destination.travelExtent === TRAVEL_EXTENT.INTERNATIONAL) {
      const countryLabel = getTravelCountryLabel(destination.country).toLowerCase();
      const countryCode = String(destination.country || '').toLowerCase();
      return countryLabel.includes(term) || countryCode.includes(term);
    }

    return String(destination.townCity || '').toLowerCase().includes(term);
  });
}

export function getEmptyTravelMessage(travelExtent, hasSearch) {
  if (hasSearch) {
    return 'No matching travel locations found.';
  }

  return travelExtent === TRAVEL_EXTENT.NATIONAL
    ? 'No national travel locations have been added yet.'
    : 'No international travel locations have been added yet.';
}
