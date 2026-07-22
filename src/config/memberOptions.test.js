import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateMemberPhotoFile,
  MAX_MEMBER_PHOTO_SIZE_BYTES,
} from './memberPhotoValidation.js';
import {
  applyChurchLocationFields,
  CHURCH_CAPE_TOWN,
  inferMemberChurch,
  isCapeTownChurch,
  MEMBERSHIP_NA,
  validateMemberFormData,
} from './memberFormValidation.js';

const activeCreativeArtsTeams = [
  { id: 'ca-1', name: 'Choir', status: 'Active' },
];

const activeMinistries = [
  { id: 'min-1', ministryName: 'Youth', status: 'Active' },
];

const activeSchools = [
  { id: 'school-1', schoolName: 'Test Primary', status: 'Active' },
];

test('validateMemberFormData requires church and accepts N/A module selections', () => {
  assert.match(
    validateMemberFormData(
      {
        creativeArtsId: MEMBERSHIP_NA,
        ministryId: MEMBERSHIP_NA,
      },
      { activeCreativeArtsTeams, activeMinistries, activeSchools },
    ),
    /Church is required/i,
  );

  assert.equal(
    validateMemberFormData(
      {
        church: CHURCH_CAPE_TOWN,
        creativeArtsId: MEMBERSHIP_NA,
        ministryId: MEMBERSHIP_NA,
      },
      { activeCreativeArtsTeams, activeMinistries, activeSchools },
    ),
    '',
  );
});

test('validateMemberFormData clears Cape Town-only requirements for other churches', () => {
  assert.equal(
    validateMemberFormData(
      {
        church: 'Midrand',
        branch: '',
        zoneSupervisor: '',
        creativeArtsId: MEMBERSHIP_NA,
        ministryId: MEMBERSHIP_NA,
      },
      { activeCreativeArtsTeams, activeMinistries, activeSchools },
    ),
    '',
  );
});

test('validateMemberFormData requires an active school for learner occupations', () => {
  assert.match(
    validateMemberFormData(
      {
        church: CHURCH_CAPE_TOWN,
        creativeArtsId: MEMBERSHIP_NA,
        ministryId: MEMBERSHIP_NA,
        occupation: 'Primary School',
        schoolId: '',
      },
      { activeCreativeArtsTeams, activeMinistries, activeSchools },
    ),
    /school or institution is required/i,
  );

  assert.equal(
    validateMemberFormData(
      {
        church: CHURCH_CAPE_TOWN,
        creativeArtsId: 'ca-1',
        creativeArtsName: 'Choir',
        ministryId: 'min-1',
        ministryName: 'Youth',
        occupation: 'Primary School',
        schoolId: 'school-1',
      },
      { activeCreativeArtsTeams, activeMinistries, activeSchools },
    ),
    '',
  );
});

test('applyChurchLocationFields clears Cape Town branch fields for non-Cape Town churches', () => {
  const payload = applyChurchLocationFields({
    church: 'Upington',
    branch: 'Korle-Bu',
    zoneSupervisor: 'Supervisor Name',
  });

  assert.equal(payload.branch, '');
  assert.equal(payload.zoneSupervisor, '');
  assert.equal(payload.church, 'Upington');
});

test('inferMemberChurch defaults legacy branch members to Cape Town', () => {
  assert.equal(inferMemberChurch({ branch: 'Symphony' }), CHURCH_CAPE_TOWN);
  assert.equal(isCapeTownChurch(CHURCH_CAPE_TOWN), true);
});

test('validateMemberPhotoFile accepts jpeg, png, and webp', () => {
  assert.equal(
    validateMemberPhotoFile({ type: 'image/jpeg', size: 1024, name: 'photo.jpg' }),
    '',
  );
  assert.equal(
    validateMemberPhotoFile({ type: 'image/png', size: 1024, name: 'photo.png' }),
    '',
  );
  assert.equal(
    validateMemberPhotoFile({ type: 'image/webp', size: 1024, name: 'photo.webp' }),
    '',
  );
});

test('validateMemberPhotoFile rejects unsupported file types', () => {
  const message = validateMemberPhotoFile({
    type: 'image/gif',
    size: 1024,
    name: 'photo.gif',
  });

  assert.match(message, /JPG, PNG, or WEBP/i);
});

test('validateMemberPhotoFile rejects oversized files', () => {
  const message = validateMemberPhotoFile({
    type: 'image/jpeg',
    size: MAX_MEMBER_PHOTO_SIZE_BYTES + 1,
    name: 'photo.jpg',
  });

  assert.match(message, /5 MB/i);
});

test('validateMemberPhotoFile accepts extension fallback when MIME is missing', () => {
  assert.equal(
    validateMemberPhotoFile({ type: '', size: 1024, name: 'photo.JPG' }),
    '',
  );
});
