import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessRoute, canPerformAction } from '../config/permissions.js';
import { ROLES } from '../config/roles.js';
import {
  assertCanManageMachanehMovies,
  assertCanViewMachanehMovies,
} from './machanehMoviesGuards.js';

test('authorised leadership roles can view Machaneh Movies', () => {
  assert.equal(canPerformAction(ROLES.ADMIN, 'VIEW_MACHANEH_MOVIES'), true);
  assert.equal(canPerformAction(ROLES.PASTOR, 'VIEW_MACHANEH_MOVIES'), true);
  assert.equal(canPerformAction(ROLES.LEADER, 'VIEW_MACHANEH_MOVIES'), true);
  assert.equal(canPerformAction(ROLES.ELDER, 'VIEW_MACHANEH_MOVIES'), true);
  assert.doesNotThrow(() => assertCanViewMachanehMovies(ROLES.PASTOR));
});

test('users without Machaneh Movies view permission cannot view', () => {
  assert.equal(canPerformAction('', 'VIEW_MACHANEH_MOVIES'), false);
  assert.equal(canPerformAction('Guest', 'VIEW_MACHANEH_MOVIES'), false);
  assert.throws(() => assertCanViewMachanehMovies('Guest'), /Machaneh Movies/i);
});

test('Lead Pastor, Pastor, and Admin can manage Machaneh Movies', () => {
  assert.equal(canPerformAction(ROLES.LEAD_PASTOR, 'MANAGE_MACHANEH_MOVIES'), true);
  assert.equal(canPerformAction(ROLES.PASTOR, 'MANAGE_MACHANEH_MOVIES'), true);
  assert.equal(canPerformAction(ROLES.ADMIN, 'MANAGE_MACHANEH_MOVIES'), true);
  assert.doesNotThrow(() => assertCanManageMachanehMovies(ROLES.ADMIN));
});

test('Elder and Leader can view but not manage Machaneh Movies', () => {
  assert.equal(canPerformAction(ROLES.ELDER, 'VIEW_MACHANEH_MOVIES'), true);
  assert.equal(canPerformAction(ROLES.ELDER, 'MANAGE_MACHANEH_MOVIES'), false);
  assert.equal(canPerformAction(ROLES.LEADER, 'VIEW_MACHANEH_MOVIES'), true);
  assert.equal(canPerformAction(ROLES.LEADER, 'MANAGE_MACHANEH_MOVIES'), false);
  assert.throws(() => assertCanManageMachanehMovies(ROLES.LEADER), /manage Machaneh Movies/i);
});

test('Machaneh Movies route access follows view permission', () => {
  assert.equal(canAccessRoute(ROLES.ADMIN, '/machaneh-movies'), true);
  assert.equal(canAccessRoute(ROLES.PASTOR, '/machaneh-movies'), true);
  assert.equal(canAccessRoute(ROLES.ELDER, '/machaneh-movies'), true);
  assert.equal(canAccessRoute(ROLES.LEADER, '/machaneh-movies'), true);
  assert.equal(canAccessRoute(ROLES.LEAD_PASTOR, '/machaneh-movies'), true);
  assert.equal(canAccessRoute('Guest', '/machaneh-movies'), false);
});
