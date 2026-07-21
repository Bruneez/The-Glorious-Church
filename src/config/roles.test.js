import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ROLES,
  normalizeRole,
  getRoleLabel,
  getRoleBadgeClassName,
  isLeader,
  isCALeader,
  isFullAccessRole,
  isChurchWideStaff,
  isPastorRole,
} from './roles.js';

test('normalizeRole maps legacy leader aliases to Leader', () => {
  assert.equal(normalizeRole('Creative Arts Leader'), ROLES.LEADER);
  assert.equal(normalizeRole('ca leader'), ROLES.LEADER);
  assert.equal(normalizeRole('Leader'), ROLES.LEADER);
});

test('normalizeRole preserves existing admin and pastor roles', () => {
  assert.equal(normalizeRole('Admin'), ROLES.ADMIN);
  assert.equal(normalizeRole('administrator'), ROLES.ADMIN);
  assert.equal(normalizeRole('Pastor'), ROLES.PASTOR);
  assert.equal(normalizeRole('pastor'), ROLES.PASTOR);
});

test('normalizeRole recognizes new lead pastor and elder roles', () => {
  assert.equal(normalizeRole('Lead Pastor'), ROLES.LEAD_PASTOR);
  assert.equal(normalizeRole('lead pastor'), ROLES.LEAD_PASTOR);
  assert.equal(normalizeRole('Elder'), ROLES.ELDER);
  assert.equal(normalizeRole('elder'), ROLES.ELDER);
});

test('getRoleLabel returns display labels for all roles', () => {
  assert.equal(getRoleLabel('Creative Arts Leader'), 'Leader');
  assert.equal(getRoleLabel(ROLES.LEAD_PASTOR), 'Lead Pastor');
  assert.equal(getRoleLabel(ROLES.ELDER), 'Elder');
});

test('isLeader and isCALeader remain equivalent', () => {
  assert.equal(isLeader('Creative Arts Leader'), true);
  assert.equal(isCALeader(ROLES.LEADER), true);
  assert.equal(isLeader(ROLES.PASTOR), false);
});

test('isFullAccessRole recognises Lead Pastor and Admin only', () => {
  assert.equal(isFullAccessRole(ROLES.LEAD_PASTOR), true);
  assert.equal(isFullAccessRole(ROLES.ADMIN), true);
  assert.equal(isFullAccessRole(ROLES.PASTOR), false);
  assert.equal(isFullAccessRole(ROLES.ELDER), false);
  assert.equal(isFullAccessRole('lead pastor'), true);
});

test('isChurchWideStaff includes Lead Pastor, Admin, and Pastor', () => {
  assert.equal(isChurchWideStaff(ROLES.LEAD_PASTOR), true);
  assert.equal(isChurchWideStaff(ROLES.ADMIN), true);
  assert.equal(isChurchWideStaff(ROLES.PASTOR), true);
  assert.equal(isChurchWideStaff(ROLES.ELDER), false);
});

test('isPastorRole recognises Pastor only', () => {
  assert.equal(isPastorRole(ROLES.PASTOR), true);
  assert.equal(isPastorRole('pastor'), true);
  assert.equal(isPastorRole(ROLES.ADMIN), false);
  assert.equal(isPastorRole(ROLES.LEAD_PASTOR), false);
});

test('getRoleBadgeClassName returns distinct classes per role', () => {
  const leadPastor = getRoleBadgeClassName(ROLES.LEAD_PASTOR);
  const pastor = getRoleBadgeClassName(ROLES.PASTOR);
  const elder = getRoleBadgeClassName(ROLES.ELDER);
  const leader = getRoleBadgeClassName('Creative Arts Leader');
  const admin = getRoleBadgeClassName(ROLES.ADMIN);

  assert.match(leadPastor, /yellow/);
  assert.match(pastor, /orange/);
  assert.match(elder, /emerald/);
  assert.match(leader, /blue/);
  assert.match(admin, /rose/);
  assert.notEqual(leadPastor, pastor);
  assert.notEqual(elder, leader);
});
