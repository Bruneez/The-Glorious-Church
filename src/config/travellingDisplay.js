import { getTravelCountryLabel } from '@/config/travelCountryOptions';
import {
  TRAVEL_EXTENT,
  getRecommendedTransportLabel,
  isPermanentImageUrl,
} from '@/config/travellingOptions';

const distanceFormatter = new Intl.NumberFormat('en-ZA', {
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatTravelDistance(km) {
  if (km === null || km === undefined || km === '') {
    return 'Not provided';
  }

  const value = Number(km);
  if (!Number.isFinite(value)) return 'Not provided';
  return `${distanceFormatter.format(value)} km`;
}

export function formatTravelCostZar(amount) {
  if (amount === null || amount === undefined || amount === '') {
    return 'Not provided';
  }

  const value = Number(amount);
  if (!Number.isFinite(value)) return 'Not provided';
  return currencyFormatter.format(value);
}

export function formatVisaRequired(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return 'Not provided';
}

export function formatTravelExtentLabel(value) {
  return value === TRAVEL_EXTENT.NATIONAL ? 'National' : 'International';
}

export function getDestinationImageUrl(destination) {
  return isPermanentImageUrl(destination?.imageUrl) ? destination.imageUrl : '';
}

export function getDestinationCountryLabel(destination) {
  return getTravelCountryLabel(destination?.country) || 'Not provided';
}

export function getDestinationTransportLabel(destination) {
  return getRecommendedTransportLabel(destination?.recommendedTransport) || 'Not provided';
}

export function getDestinationPrimaryLabel(destination) {
  if (destination?.travelExtent === TRAVEL_EXTENT.NATIONAL) {
    return destination?.townCity || 'National destination';
  }

  return getDestinationCountryLabel(destination);
}

export function getDestinationImageAlt(destination) {
  const label = getDestinationPrimaryLabel(destination);
  return label ? `Destination image for ${label}` : 'Travel destination image';
}
