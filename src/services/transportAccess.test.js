import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessRoute, canPerformAction } from '../config/permissions.js';
import { ROLES } from '../config/roles.js';
import {
  assertCanManageTransport,
  MANAGE_DENIED_MESSAGE,
} from './transportGuards.js';

test('Lead Pastor and Admin can manage Saturday Transport', () => {
  assert.equal(canPerformAction(ROLES.LEAD_PASTOR, 'MANAGE_TRANSPORT'), true);
  assert.equal(canPerformAction(ROLES.ADMIN, 'MANAGE_TRANSPORT'), true);
  assert.doesNotThrow(() => assertCanManageTransport(ROLES.ADMIN));
});

test('Pastor can access transport route but not manage records', () => {
  assert.equal(canAccessRoute(ROLES.PASTOR, '/transport'), true);
  assert.equal(canPerformAction(ROLES.PASTOR, 'MANAGE_TRANSPORT'), false);
  assert.throws(() => assertCanManageTransport(ROLES.PASTOR), /permission to manage/i);
});

test('Elder and Leader can view transport but not manage records', () => {
  assert.equal(canAccessRoute(ROLES.ELDER, '/transport'), true);
  assert.equal(canAccessRoute(ROLES.LEADER, '/transport'), true);
  assert.equal(canPerformAction(ROLES.ELDER, 'MANAGE_TRANSPORT'), false);
  assert.equal(canPerformAction(ROLES.LEADER, 'MANAGE_TRANSPORT'), false);
  assert.throws(() => assertCanManageTransport(ROLES.ELDER), MANAGE_DENIED_MESSAGE);
});

test('role normalization aliases still grant expected transport permissions', () => {
  assert.equal(canPerformAction('administrator', 'MANAGE_TRANSPORT'), true);
  assert.equal(canAccessRoute('pastor', '/transport'), true);
});
