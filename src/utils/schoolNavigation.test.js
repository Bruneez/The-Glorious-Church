import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSchoolDetailUrl,
  findSchoolById,
  removeSchoolIdSearchParam,
  shouldOpenSchoolFromDeepLink,
  shouldShowSchoolNotFoundFeedback,
} from './schoolNavigation.js';

const schools = [
  { id: 'school-primary-1', schoolName: 'Sunshine Primary', schoolType: 'Primary School' },
  { id: 'school-high-2', schoolName: 'River High', schoolType: 'High School' },
];

test('buildSchoolDetailUrl builds /schools?schoolId={id}', () => {
  assert.equal(
    buildSchoolDetailUrl('school-primary-1'),
    '/schools?schoolId=school-primary-1',
  );
});

test('buildSchoolDetailUrl encodes special characters in school IDs', () => {
  assert.equal(
    buildSchoolDetailUrl('school/with spaces'),
    '/schools?schoolId=school%2Fwith%20spaces',
  );
});

test('buildSchoolDetailUrl falls back to /schools when ID is missing', () => {
  assert.equal(buildSchoolDetailUrl(''), '/schools');
  assert.equal(buildSchoolDetailUrl(null), '/schools');
});

test('valid schoolId resolves to the correct school record', () => {
  assert.deepEqual(findSchoolById(schools, 'school-primary-1'), schools[0]);
});

test('no schoolId leaves deep-link resolution unchanged', () => {
  assert.equal(shouldOpenSchoolFromDeepLink({ schools }), false);
  assert.equal(shouldShowSchoolNotFoundFeedback({ schools }), false);
});

test('unknown schoolId does not crash and triggers not-found feedback after load', () => {
  assert.equal(findSchoolById(schools, 'missing-school'), null);
  assert.equal(
    shouldOpenSchoolFromDeepLink({
      schoolId: 'missing-school',
      loading: false,
      schools,
    }),
    false,
  );
  assert.equal(
    shouldShowSchoolNotFoundFeedback({
      schoolId: 'missing-school',
      loading: false,
      schools,
    }),
    true,
  );
});

test('no false not-found state while schools are loading', () => {
  assert.equal(
    shouldShowSchoolNotFoundFeedback({
      schoolId: 'missing-school',
      loading: true,
      schools,
    }),
    false,
  );
  assert.equal(
    shouldOpenSchoolFromDeepLink({
      schoolId: 'school-primary-1',
      loading: true,
      schools,
    }),
    false,
  );
});

test('valid schoolId opens the correct school when loaded', () => {
  assert.equal(
    shouldOpenSchoolFromDeepLink({
      schoolId: 'school-primary-1',
      loading: false,
      schools,
    }),
    true,
  );
});

test('already selected school avoids reopen loop', () => {
  assert.equal(
    shouldOpenSchoolFromDeepLink({
      schoolId: 'school-primary-1',
      loading: false,
      schools,
      viewingSchoolId: 'school-primary-1',
    }),
    false,
  );
});

test('closing the modal removes schoolId from the URL', () => {
  const nextParams = removeSchoolIdSearchParam(
    new URLSearchParams('schoolId=school-primary-1'),
  );

  assert.equal(nextParams.get('schoolId'), null);
  assert.equal(nextParams.toString(), '');
});

test('closing preserves other query parameters', () => {
  const nextParams = removeSchoolIdSearchParam(
    new URLSearchParams('tab=high&schoolId=school-primary-1&view=grid'),
  );

  assert.equal(nextParams.get('schoolId'), null);
  assert.equal(nextParams.get('tab'), 'high');
  assert.equal(nextParams.get('view'), 'grid');
});

test('card-based modal opening still uses raw school records from the loaded list', () => {
  const tableSchool = { id: 'school-high-2', raw: schools[1] };

  assert.deepEqual(findSchoolById(schools, tableSchool.id), tableSchool.raw);
});
