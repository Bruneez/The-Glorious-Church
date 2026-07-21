import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSchoolCardMemberCount,
  buildSchoolMapMarkerMemberCount,
  getSchoolTotalMembers,
} from './schoolMemberCountLookup.js';

const memberCounts = {
  'school-primary-1': 4,
  'school-high-2': 0,
};

test('popup member count equals Schools card Total Members lookup', () => {
  assert.equal(
    buildSchoolMapMarkerMemberCount('school-primary-1', memberCounts),
    buildSchoolCardMemberCount('school-primary-1', memberCounts),
  );
  assert.equal(buildSchoolMapMarkerMemberCount('school-primary-1', memberCounts), 4);
});

test('school card and map marker share one count lookup helper', () => {
  assert.equal(getSchoolTotalMembers('school-primary-1', memberCounts), 4);
  assert.equal(getSchoolTotalMembers('school-high-2', memberCounts), 0);
  assert.equal(getSchoolTotalMembers('missing-school', memberCounts), 0);
});

test('missing school ID returns zero members without duplicating count logic elsewhere', () => {
  assert.equal(buildSchoolMapMarkerMemberCount('', memberCounts), 0);
  assert.equal(buildSchoolCardMemberCount(null, memberCounts), 0);
});
