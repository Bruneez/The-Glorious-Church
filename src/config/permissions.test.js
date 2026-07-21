import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessRoute, canPerformAction } from './permissions.js';
import { ROLES } from './roles.js';

const ADMIN_ONLY_ACTIONS = [
  'MANAGE_CREATIVE_ARTS',
  'MANAGE_MINISTRIES',
  'EDIT_DELETE_SCHOOLS',
  'MANAGE_DEVELOPMENT_BOARD',
  'MANAGE_TASKS',
  'VIEW_ALL_TASKS',
  'MANAGE_TRAVELLING',
];

const ADMIN_ONLY_ROUTES = ['/users', '/system-users', '/development-board'];

test('Lead Pastor receives full access to admin-only routes', () => {
  ADMIN_ONLY_ROUTES.forEach((route) => {
    assert.equal(canAccessRoute(ROLES.LEAD_PASTOR, route), true);
  });
});

test('Lead Pastor receives full access to admin-only actions', () => {
  ADMIN_ONLY_ACTIONS.forEach((action) => {
    assert.equal(canPerformAction(ROLES.LEAD_PASTOR, action), true);
  });
});

test('Lead Pastor receives pastor-level actions through full access', () => {
  assert.equal(canPerformAction(ROLES.LEAD_PASTOR, 'MANAGE_STAFF'), true);
  assert.equal(canPerformAction(ROLES.LEAD_PASTOR, 'MANAGE_MEMBERS'), true);
  assert.equal(canPerformAction(ROLES.LEAD_PASTOR, 'MANAGE_ATTENDANCE'), true);
});

test('Admin permissions remain unchanged while Lead Pastor overlaps', () => {
  ADMIN_ONLY_ROUTES.forEach((route) => {
    assert.equal(canAccessRoute(ROLES.ADMIN, route), true);
  });

  ADMIN_ONLY_ACTIONS.forEach((action) => {
    assert.equal(canPerformAction(ROLES.ADMIN, action), true);
  });

  assert.equal(canPerformAction(ROLES.ADMIN, 'MANAGE_STAFF'), true);
});

test('other roles still follow existing permission boundaries', () => {
  assert.equal(canPerformAction(ROLES.PASTOR, 'MANAGE_CREATIVE_ARTS'), false);
  assert.equal(canPerformAction(ROLES.ELDER, 'MANAGE_TRAVELLING'), false);
  assert.equal(canPerformAction(ROLES.LEADER, 'MANAGE_TASKS'), false);
  assert.equal(canAccessRoute(ROLES.PASTOR, '/users'), false);
  assert.equal(canAccessRoute(ROLES.ELDER, '/development-board'), false);
});
