import test from 'node:test';
import assert from 'node:assert/strict';
import { MAP_LAYER_IDS } from '../config/mapOptions.js';
import {
  applyGeocodedSchoolLocation,
  buildSchoolFirestoreLocationFields,
  buildSchoolMapMarkerDescriptors,
  getSchoolAddressManualChangeFormUpdates,
  getSchoolAddressSelectionFormUpdates,
  getSchoolCoords,
  mapSchoolRecordToFormLocationFields,
  mergeMemberAndSchoolMarkers,
  resolveSchoolMapLayerId,
  shouldFallbackGeocodeSchoolAddress,
} from './schoolLocations.js';

test('buildSchoolFirestoreLocationFields includes address, latitude, and longitude', () => {
  const fields = buildSchoolFirestoreLocationFields({
    address: '  123 Main Street, Cape Town  ',
    latitude: '-33.9249',
    longitude: '18.4241',
  });

  assert.equal(fields.address, '123 Main Street, Cape Town');
  assert.equal(fields.latitude, -33.9249);
  assert.equal(fields.longitude, 18.4241);
});

test('latitude and longitude remain numeric in school payload fields', () => {
  const fields = buildSchoolFirestoreLocationFields({
    address: 'Example Road',
    latitude: -33.9,
    longitude: 18.4,
  });

  assert.equal(typeof fields.latitude, 'number');
  assert.equal(typeof fields.longitude, 'number');
});

test('empty coordinates are stored as null', () => {
  const fields = buildSchoolFirestoreLocationFields({
    address: 'Example Road',
    latitude: '',
    longitude: null,
  });

  assert.equal(fields.latitude, null);
  assert.equal(fields.longitude, null);
});

test('changing the address clears stale coordinates', () => {
  assert.deepEqual(getSchoolAddressManualChangeFormUpdates('New Street'), {
    address: 'New Street',
    latitude: null,
    longitude: null,
  });
});

test('selecting a suggestion stores new coordinates', () => {
  assert.deepEqual(
    getSchoolAddressSelectionFormUpdates({
      address: '123 Main Street, Cape Town, South Africa',
      latitude: -33.9249,
      longitude: 18.4241,
    }),
    {
      address: '123 Main Street, Cape Town, South Africa',
      latitude: -33.9249,
      longitude: 18.4241,
    },
  );
});

test('submit fallback geocodes when address exists but coordinates are missing', () => {
  assert.equal(
    shouldFallbackGeocodeSchoolAddress('123 Main Street', null, null),
    true,
  );
  assert.equal(
    shouldFallbackGeocodeSchoolAddress('123 Main Street', -33.9, null),
    true,
  );
});

test('valid existing coordinates skip fallback geocoding', () => {
  assert.equal(
    shouldFallbackGeocodeSchoolAddress('123 Main Street', -33.9249, 18.4241),
    false,
  );
});

test('empty address does not trigger geocoding', () => {
  assert.equal(shouldFallbackGeocodeSchoolAddress('', null, null), false);
  assert.equal(shouldFallbackGeocodeSchoolAddress('   ', -33.9, null), false);
});

test('editing an unchanged school retains coordinates from the record', () => {
  const fields = mapSchoolRecordToFormLocationFields({
    address: '123 Main Street, Cape Town',
    latitude: -33.9249,
    longitude: 18.4241,
  });

  assert.equal(fields.address, '123 Main Street, Cape Town');
  assert.equal(fields.latitude, -33.9249);
  assert.equal(fields.longitude, 18.4241);
});

test('applyGeocodedSchoolLocation merges fallback geocode results', () => {
  const result = applyGeocodedSchoolLocation(
    {
      name: 'Example School',
      address: '123 Main Street',
      latitude: null,
      longitude: null,
    },
    {
      formattedAddress: '123 Main Street, Cape Town, South Africa',
      latitude: -33.9249,
      longitude: 18.4241,
    },
  );

  assert.equal(result.address, '123 Main Street, Cape Town, South Africa');
  assert.equal(result.latitude, -33.9249);
  assert.equal(result.longitude, 18.4241);
});

test('applyGeocodedSchoolLocation leaves form data unchanged when geocode returns null', () => {
  const original = {
    address: 'Unknown place',
    latitude: null,
    longitude: null,
  };

  assert.deepEqual(applyGeocodedSchoolLocation(original, null), original);
});

test('getSchoolCoords returns valid [lat, lng]', () => {
  assert.deepEqual(
    getSchoolCoords({ latitude: -33.9249, longitude: 18.4241 }),
    [-33.9249, 18.4241],
  );
});

test('invalid or missing coordinates return null from getSchoolCoords', () => {
  assert.equal(getSchoolCoords({ latitude: null, longitude: 18.4 }), null);
  assert.equal(getSchoolCoords({ latitude: -33.9 }), null);
  assert.equal(getSchoolCoords({ latitude: Number.NaN, longitude: 18.4 }), null);
  assert.equal(getSchoolCoords({}), null);
});

test('legacy lat/lng compatibility is supported by getSchoolCoords', () => {
  assert.deepEqual(
    getSchoolCoords({ lat: -33.9249, lng: 18.4241 }),
    [-33.9249, 18.4241],
  );
});

test('primary school resolves to primary layer', () => {
  assert.equal(
    resolveSchoolMapLayerId({ schoolType: 'Primary School' }),
    MAP_LAYER_IDS.PRIMARY_SCHOOLS,
  );
});

test('high school resolves to high-school layer', () => {
  assert.equal(
    resolveSchoolMapLayerId({ schoolType: 'High School' }),
    MAP_LAYER_IDS.HIGH_SCHOOLS,
  );
});

test('university and college resolve to universities layer', () => {
  assert.equal(
    resolveSchoolMapLayerId({ schoolType: 'University' }),
    MAP_LAYER_IDS.UNIVERSITIES,
  );
  assert.equal(
    resolveSchoolMapLayerId({ schoolType: 'College' }),
    MAP_LAYER_IDS.UNIVERSITIES,
  );
  assert.equal(
    resolveSchoolMapLayerId({ schoolType: 'University / College' }),
    MAP_LAYER_IDS.UNIVERSITIES,
  );
});

test('unknown school type is not misclassified', () => {
  assert.equal(resolveSchoolMapLayerId({ schoolType: 'Unknown Academy' }), null);
  assert.equal(resolveSchoolMapLayerId({ schoolType: '' }), null);
});

test('schools without coords produce no marker descriptor', () => {
  assert.deepEqual(
    buildSchoolMapMarkerDescriptors([
      {
        id: 'school-1',
        schoolName: 'No Coords School',
        schoolType: 'Primary School',
      },
    ]),
    [],
  );
});

test('valid schools produce marker descriptors with layer ID and identity data', () => {
  const [descriptor] = buildSchoolMapMarkerDescriptors([
    {
      id: 'school-2',
      schoolName: 'Sunshine Primary School',
      schoolType: 'Primary School',
      address: '123 Main Street, Cape Town',
      latitude: -33.9249,
      longitude: 18.4241,
    },
  ]);

  assert.equal(descriptor.layerId, MAP_LAYER_IDS.PRIMARY_SCHOOLS);
  assert.deepEqual(descriptor.coords, [-33.9249, 18.4241]);
  assert.equal(descriptor.id, 'school-2');
  assert.equal(descriptor.name, 'Sunshine Primary School');
  assert.equal(descriptor.address, '123 Main Street, Cape Town');
});

test('member markers remain included in the combined marker array', () => {
  const memberMarkers = [{ id: 'member-home-1', layerId: MAP_LAYER_IDS.MEMBERS }];
  const schoolMarkers = [{ id: 'school-1', layerId: MAP_LAYER_IDS.PRIMARY_SCHOOLS }];

  assert.deepEqual(
    mergeMemberAndSchoolMarkers(memberMarkers, schoolMarkers),
    [...memberMarkers, ...schoolMarkers],
  );
});
