import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessRoute, canPerformAction } from '../config/permissions.js';
import { ROLES } from '../config/roles.js';
import {
  assertCanManageMerchandise,
  assertCanViewMerchandise,
} from './merchandiseGuards.js';

test('authorised leadership roles can view Merchandise', () => {
  assert.equal(canPerformAction(ROLES.ADMIN, 'VIEW_MERCHANDISE'), true);
  assert.equal(canPerformAction(ROLES.PASTOR, 'VIEW_MERCHANDISE'), true);
  assert.equal(canPerformAction(ROLES.LEADER, 'VIEW_MERCHANDISE'), true);
  assert.equal(canPerformAction(ROLES.ELDER, 'VIEW_MERCHANDISE'), true);
  assert.doesNotThrow(() => assertCanViewMerchandise(ROLES.PASTOR));
});

test('users without Merchandise view permission cannot view', () => {
  assert.equal(canPerformAction('', 'VIEW_MERCHANDISE'), false);
  assert.equal(canPerformAction('Guest', 'VIEW_MERCHANDISE'), false);
  assert.throws(() => assertCanViewMerchandise('Guest'), /Merchandise/i);
});

test('Lead Pastor, Pastor, and Admin can manage Merchandise', () => {
  assert.equal(canPerformAction(ROLES.LEAD_PASTOR, 'MANAGE_MERCHANDISE'), true);
  assert.equal(canPerformAction(ROLES.PASTOR, 'MANAGE_MERCHANDISE'), true);
  assert.equal(canPerformAction(ROLES.ADMIN, 'MANAGE_MERCHANDISE'), true);
  assert.doesNotThrow(() => assertCanManageMerchandise(ROLES.ADMIN));
});

test('Elder and Leader can view but not manage Merchandise', () => {
  assert.equal(canPerformAction(ROLES.ELDER, 'VIEW_MERCHANDISE'), true);
  assert.equal(canPerformAction(ROLES.ELDER, 'MANAGE_MERCHANDISE'), false);
  assert.equal(canPerformAction(ROLES.LEADER, 'VIEW_MERCHANDISE'), true);
  assert.equal(canPerformAction(ROLES.LEADER, 'MANAGE_MERCHANDISE'), false);
  assert.throws(() => assertCanManageMerchandise(ROLES.LEADER), /manage Merchandise/i);
});

test('Merchandise route access follows view permission', () => {
  assert.equal(canAccessRoute(ROLES.ADMIN, '/merchandise'), true);
  assert.equal(canAccessRoute(ROLES.PASTOR, '/merchandise'), true);
  assert.equal(canAccessRoute(ROLES.ELDER, '/merchandise'), true);
  assert.equal(canAccessRoute(ROLES.LEADER, '/merchandise'), true);
  assert.equal(canAccessRoute(ROLES.LEAD_PASTOR, '/merchandise'), true);
  assert.equal(canAccessRoute('Guest', '/merchandise'), false);
});
