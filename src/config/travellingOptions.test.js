import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TRAVEL_EXTENT,
  buildTravelDestinationPayload,
  filterTravelDestinations,
  getEmptyTravelMessage,
  getTravelDestinationFieldClears,
  isPermanentImageUrl,
  parseNonNegativeNumber,
  validateTravelDestinationForm,
  validateTravelImageFile,
} from './travellingOptions.js';

test('buildTravelDestinationPayload stores international fields only', () => {
  const payload = buildTravelDestinationPayload(
    {
      travelExtent: TRAVEL_EXTENT.INTERNATIONAL,
      country: 'fr',
      visaRequired: 'yes',
      estimatedCostZar: 15000,
      distanceFromCapeTownKm: 9000,
      townCity: '',
      recommendedTransport: '',
      imageUrl: 'https://example.com/image.png',
      imageStoragePath: 'travel-destinations/abc/image.png',
    },
    { createdBy: 'Admin User' },
  );

  assert.equal(payload.travelExtent, 'international');
  assert.equal(payload.country, 'FR');
  assert.equal(payload.visaRequired, true);
  assert.equal(payload.estimatedCostZar, 15000);
  assert.equal(payload.distanceFromCapeTownKm, 9000);
  assert.equal('townCity' in payload, false);
  assert.equal('recommendedTransport' in payload, false);
});

test('buildTravelDestinationPayload stores national fields only', () => {
  const payload = buildTravelDestinationPayload(
    {
      travelExtent: TRAVEL_EXTENT.NATIONAL,
      townCity: 'George',
      distanceFromCapeTownKm: 420,
      recommendedTransport: 'car',
      estimatedCostZar: '2500',
    },
    { createdBy: 'Admin User' },
  );

  assert.equal(payload.travelExtent, 'national');
  assert.equal(payload.townCity, 'George');
  assert.equal(payload.distanceFromCapeTownKm, 420);
  assert.equal(payload.recommendedTransport, 'car');
  assert.equal('country' in payload, false);
  assert.equal('visaRequired' in payload, false);
});

test('validateTravelDestinationForm rejects invalid travel extent', () => {
  const message = validateTravelDestinationForm({ travelExtent: 'regional' });
  assert.match(message, /international or national/i);
});

test('validateTravelDestinationForm rejects negative numbers and formatted currency', () => {
  assert.match(
    validateTravelDestinationForm({
      travelExtent: TRAVEL_EXTENT.NATIONAL,
      townCity: 'George',
      distanceFromCapeTownKm: -1,
      recommendedTransport: 'car',
    }),
    /cannot be negative/i,
  );

  assert.match(
    parseNonNegativeNumber('R 1,200', 'Estimated cost').error,
    /plain number/i,
  );
});

test('validateTravelDestinationForm rejects cross-extent field combinations', () => {
  const internationalMessage = validateTravelDestinationForm({
    travelExtent: TRAVEL_EXTENT.INTERNATIONAL,
    country: 'US',
    visaRequired: false,
    townCity: 'New York',
  });
  assert.match(internationalMessage, /town or city must not/i);

  const nationalMessage = validateTravelDestinationForm({
    travelExtent: TRAVEL_EXTENT.NATIONAL,
    townCity: 'George',
    recommendedTransport: 'bus',
    country: 'ZA',
  });
  assert.match(nationalMessage, /country must not/i);
});

test('filterTravelDestinations scopes by tab and search term', () => {
  const destinations = [
    { id: '1', travelExtent: 'international', country: 'FR', townCity: '' },
    { id: '2', travelExtent: 'national', townCity: 'George', country: '' },
    { id: '3', travelExtent: 'international', country: 'US', townCity: '' },
  ];

  const international = filterTravelDestinations(destinations, {
    travelExtent: TRAVEL_EXTENT.INTERNATIONAL,
    searchTerm: 'france',
  });
  assert.equal(international.length, 1);
  assert.equal(international[0].country, 'FR');

  const national = filterTravelDestinations(destinations, {
    travelExtent: TRAVEL_EXTENT.NATIONAL,
    searchTerm: 'geo',
  });
  assert.equal(national.length, 1);
  assert.equal(national[0].townCity, 'George');
});

test('getEmptyTravelMessage distinguishes empty tab and search states', () => {
  assert.match(
    getEmptyTravelMessage(TRAVEL_EXTENT.INTERNATIONAL, false),
    /no international travel locations/i,
  );
  assert.match(
    getEmptyTravelMessage(TRAVEL_EXTENT.NATIONAL, false),
    /no national travel locations/i,
  );
  assert.match(getEmptyTravelMessage(TRAVEL_EXTENT.NATIONAL, true), /no matching travel locations/i);
});

test('getTravelDestinationFieldClears returns opposite extent fields', () => {
  assert.deepEqual(getTravelDestinationFieldClears(TRAVEL_EXTENT.INTERNATIONAL), [
    'townCity',
    'recommendedTransport',
  ]);
  assert.deepEqual(getTravelDestinationFieldClears(TRAVEL_EXTENT.NATIONAL), ['country', 'visaRequired']);
});

test('isPermanentImageUrl rejects preview URLs', () => {
  assert.equal(isPermanentImageUrl('https://firebasestorage.googleapis.com/image.png'), true);
  assert.equal(isPermanentImageUrl('blob:https://example.com/123'), false);
  assert.equal(isPermanentImageUrl('data:image/png;base64,abc'), false);
  assert.equal(isPermanentImageUrl(''), false);
});

test('validateTravelImageFile rejects invalid and oversized files', () => {
  assert.equal(validateTravelImageFile(null), '');
  assert.match(
    validateTravelImageFile({ size: 6 * 1024 * 1024, type: 'image/png', name: 'big.png' }),
    /5 MB/i,
  );
  assert.match(
    validateTravelImageFile({ size: 1000, type: 'application/pdf', name: 'doc.pdf' }),
    /JPG, PNG, or WEBP/i,
  );
  assert.equal(
    validateTravelImageFile({ size: 1000, type: 'image/jpeg', name: 'photo.jpg' }),
    '',
  );
  assert.equal(
    validateTravelImageFile({ size: 1000, type: '', name: 'photo.webp' }),
    '',
  );
});
