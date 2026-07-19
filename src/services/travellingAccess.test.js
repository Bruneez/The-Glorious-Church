import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessRoute, canPerformAction } from '../config/permissions.js';
import { ROLES } from '../config/roles.js';
import {
  assertCanManageTravelling,
  assertCanViewTravelling,
  MANAGE_DENIED_MESSAGE,
  VIEW_DENIED_MESSAGE,
} from './travellingGuards.js';

test('authorised staff roles can view travelling', () => {
  assert.equal(canPerformAction(ROLES.ADMIN, 'VIEW_TRAVELLING'), true);
  assert.equal(canPerformAction(ROLES.PASTOR, 'VIEW_TRAVELLING'), true);
  assert.equal(canPerformAction(ROLES.CA_LEADER, 'VIEW_TRAVELLING'), true);
  assert.doesNotThrow(() => assertCanViewTravelling(ROLES.PASTOR));
});

test('users without travelling view permission cannot view', () => {
  assert.equal(canPerformAction('', 'VIEW_TRAVELLING'), false);
  assert.equal(canPerformAction('Guest', 'VIEW_TRAVELLING'), false);
  assert.throws(() => assertCanViewTravelling('Guest'), /view travel destinations/i);
});

test('admin can manage travelling', () => {
  assert.equal(canPerformAction(ROLES.ADMIN, 'MANAGE_TRAVELLING'), true);
  assert.doesNotThrow(() => assertCanManageTravelling(ROLES.ADMIN));
});

test('non-admin users cannot manage travelling', () => {
  assert.equal(canPerformAction(ROLES.PASTOR, 'MANAGE_TRAVELLING'), false);
  assert.equal(canPerformAction(ROLES.CA_LEADER, 'MANAGE_TRAVELLING'), false);
  assert.throws(() => assertCanManageTravelling(ROLES.PASTOR), /administrators can manage/i);
  assert.throws(() => assertCanManageTravelling(ROLES.CA_LEADER), /administrators can manage/i);
});

test('travelling route access follows view permission and role aliases', () => {
  assert.equal(canAccessRoute(ROLES.ADMIN, '/travelling'), true);
  assert.equal(canAccessRoute(ROLES.PASTOR, '/travelling'), true);
  assert.equal(canAccessRoute(ROLES.CA_LEADER, '/travelling'), true);
  assert.equal(canAccessRoute('pastor', '/travelling'), true);
  assert.equal(canAccessRoute('Guest', '/travelling'), false);
  assert.equal(canAccessRoute('', '/travelling'), true);
});

test('role normalization aliases still grant expected travelling permissions', () => {
  assert.equal(canPerformAction('administrator', 'MANAGE_TRAVELLING'), true);
  assert.equal(canPerformAction('ca leader', 'VIEW_TRAVELLING'), true);
  assert.equal(canPerformAction('administrator', 'VIEW_TRAVELLING'), true);
});
