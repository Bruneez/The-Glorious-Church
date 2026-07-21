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

const PASTOR_OPERATIONAL_ACTIONS = [
  'MANAGE_MEMBERS',
  'MANAGE_ATTENDANCE',
  'MANAGE_OFFERINGS',
  'MANAGE_EVENTS',
  'MANAGE_CREATIVE_ARTS',
  'MANAGE_MINISTRIES',
  'MANAGE_TRANSPORT',
  'MANAGE_SCHOOLS',
  'EDIT_DELETE_SCHOOLS',
  'MANAGE_SERVICE_PROGRAM',
  'MANAGE_TRAVELLING',
  'UPDATE_OWN_TASK_STATUS',
  'VIEW_TRAVELLING',
];

const PASTOR_DENIED_ACTIONS = [
  'MANAGE_STAFF',
  'MANAGE_DEVELOPMENT_BOARD',
  'MANAGE_TASKS',
  'VIEW_ALL_TASKS',
];

const PASTOR_VISIBLE_ROUTES = [
  '/dashboard',
  '/blueprint',
  '/members',
  '/creative-arts',
  '/ministries',
  '/map',
  '/attendance',
  '/offerings',
  '/transport',
  '/travelling',
  '/calendar',
  '/service-program',
  '/tasks',
];

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

test('Pastor can access operational ministry routes but not restricted admin routes', () => {
  PASTOR_VISIBLE_ROUTES.forEach((route) => {
    assert.equal(canAccessRoute(ROLES.PASTOR, route), true, route);
  });

  ADMIN_ONLY_ROUTES.forEach((route) => {
    assert.equal(canAccessRoute(ROLES.PASTOR, route), false, route);
  });
});

test('Pastor receives operational management permissions across ministry modules', () => {
  PASTOR_OPERATIONAL_ACTIONS.forEach((action) => {
    assert.equal(canPerformAction(ROLES.PASTOR, action), true, action);
  });
});

test('Pastor is denied user management, development board, and task admin actions', () => {
  PASTOR_DENIED_ACTIONS.forEach((action) => {
    assert.equal(canPerformAction(ROLES.PASTOR, action), false, action);
  });
});

test('other roles still follow existing permission boundaries', () => {
  assert.equal(canPerformAction(ROLES.ELDER, 'MANAGE_TRAVELLING'), false);
  assert.equal(canPerformAction(ROLES.LEADER, 'MANAGE_TASKS'), false);
  assert.equal(canPerformAction(ROLES.ELDER, 'MANAGE_CREATIVE_ARTS'), false);
  assert.equal(canAccessRoute(ROLES.ELDER, '/development-board'), false);
});
