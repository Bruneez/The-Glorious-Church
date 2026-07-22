import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAccessRoute,
  canPerformAction,
  canCreateCalendarEvent,
  canManageCalendarEvent,
} from './permissions.js';
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

const ELDER_VISIBLE_ROUTES = [
  '/dashboard',
  '/blueprint',
  '/creative-arts',
  '/ministries',
  '/schools',
  '/schools/primary',
  '/schools/high',
  '/schools/higher-education',
  '/attendance',
  '/transport',
  '/travelling',
  '/calendar',
  '/service-program',
  '/tasks',
];

const ELDER_RESTRICTED_ROUTES = [
  '/users',
  '/system-users',
  '/members',
  '/map',
  '/offerings',
  '/development-board',
];

const ELDER_ALLOWED_ACTIONS = [
  'VIEW_TRAVELLING',
  'UPDATE_OWN_TASK_STATUS',
  'MANAGE_SERVICE_PROGRAM',
  'CREATE_CALENDAR_EVENTS',
  'MANAGE_OWN_CALENDAR_EVENTS',
];

const ELDER_DENIED_MANAGE_ACTIONS = [
  'MANAGE_STAFF',
  'MANAGE_MEMBERS',
  'MANAGE_ATTENDANCE',
  'MANAGE_OFFERINGS',
  'MANAGE_EVENTS',
  'MANAGE_CREATIVE_ARTS',
  'MANAGE_MINISTRIES',
  'MANAGE_TRANSPORT',
  'MANAGE_SCHOOLS',
  'EDIT_DELETE_SCHOOLS',
  'MANAGE_DEVELOPMENT_BOARD',
  'MANAGE_TASKS',
  'VIEW_ALL_TASKS',
  'MANAGE_TRAVELLING',
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

test('Elder can access ministry oversight routes but not restricted admin routes', () => {
  ELDER_VISIBLE_ROUTES.forEach((route) => {
    assert.equal(canAccessRoute(ROLES.ELDER, route), true, route);
  });

  ELDER_RESTRICTED_ROUTES.forEach((route) => {
    assert.equal(canAccessRoute(ROLES.ELDER, route), false, route);
  });
});

test('Elder receives view, task, service program, and calendar ownership actions', () => {
  ELDER_ALLOWED_ACTIONS.forEach((action) => {
    assert.equal(canPerformAction(ROLES.ELDER, action), true, action);
  });
});

test('Elder is denied management actions across restricted modules', () => {
  ELDER_DENIED_MANAGE_ACTIONS.forEach((action) => {
    assert.equal(canPerformAction(ROLES.ELDER, action), false, action);
  });
});

test('Elder calendar permissions enforce event ownership', () => {
  assert.equal(canCreateCalendarEvent(ROLES.ELDER), true);
  assert.equal(canCreateCalendarEvent(ROLES.PASTOR), true);
  assert.equal(canCreateCalendarEvent(ROLES.LEADER), false);

  const ownEvent = { createdBy: 'elder-1' };
  const otherEvent = { createdBy: 'pastor-1' };

  assert.equal(canManageCalendarEvent(ROLES.ELDER, ownEvent, 'elder-1'), true);
  assert.equal(canManageCalendarEvent(ROLES.ELDER, otherEvent, 'elder-1'), false);
  assert.equal(canManageCalendarEvent(ROLES.PASTOR, otherEvent, 'elder-1'), true);
});

test('other roles still follow existing permission boundaries', () => {
  assert.equal(canPerformAction(ROLES.LEADER, 'MANAGE_TASKS'), false);
  assert.equal(canPerformAction(ROLES.LEADER, 'MANAGE_CREATIVE_ARTS'), false);
  assert.equal(canAccessRoute(ROLES.LEADER, '/development-board'), false);
});
