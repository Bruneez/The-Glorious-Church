import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAccessRoute,
  canPerformAction,
  canCreateCalendarEvent,
  canManageCalendarEvent,
  ACTIONS,
} from './permissions.js';
import { ROLES } from './roles.js';

const LEAD_PASTOR_ONLY_ACTIONS = [
  'MANAGE_STAFF',
  'MANAGE_DEVELOPMENT_BOARD',
  'MANAGE_TASKS',
  'VIEW_ALL_TASKS',
];

const LEAD_PASTOR_ONLY_ROUTES = ['/users', '/system-users', '/development-board'];

const OPERATIONAL_ACTIONS = [
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

const OPERATIONAL_DENIED_ACTIONS = [
  'MANAGE_STAFF',
  'MANAGE_DEVELOPMENT_BOARD',
  'MANAGE_TASKS',
  'VIEW_ALL_TASKS',
];

const OPERATIONAL_VISIBLE_ROUTES = [
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
  'OPEN_CREATIVE_ARTS_DEPARTMENT',
  'OPEN_SCHOOL_RECORD',
];

const LEADER_VISIBLE_ROUTES = ELDER_VISIBLE_ROUTES;
const LEADER_RESTRICTED_ROUTES = ELDER_RESTRICTED_ROUTES;

const LEADER_ALLOWED_ACTIONS = [
  'VIEW_TRAVELLING',
  'UPDATE_OWN_TASK_STATUS',
  'CREATE_CALENDAR_EVENTS',
  'MANAGE_OWN_CALENDAR_EVENTS',
];

const LEADER_DENIED_ACTIONS = [
  'MANAGE_STAFF',
  'MANAGE_MEMBERS',
  'MANAGE_ATTENDANCE',
  'RECORD_DEPARTMENT_ATTENDANCE',
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
  'MANAGE_SERVICE_PROGRAM',
  'OPEN_CREATIVE_ARTS_DEPARTMENT',
  'OPEN_SCHOOL_RECORD',
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

test('Lead Pastor receives full access to system admin routes', () => {
  LEAD_PASTOR_ONLY_ROUTES.forEach((route) => {
    assert.equal(canAccessRoute(ROLES.LEAD_PASTOR, route), true);
  });
});

test('Lead Pastor receives full access to system admin actions', () => {
  LEAD_PASTOR_ONLY_ACTIONS.forEach((action) => {
    assert.equal(canPerformAction(ROLES.LEAD_PASTOR, action), true);
  });
});

test('Lead Pastor receives operational actions through full access', () => {
  assert.equal(canPerformAction(ROLES.LEAD_PASTOR, 'MANAGE_MEMBERS'), true);
  assert.equal(canPerformAction(ROLES.LEAD_PASTOR, 'MANAGE_ATTENDANCE'), true);
  assert.equal(canPerformAction(ROLES.LEAD_PASTOR, 'MANAGE_TRAVELLING'), true);
});

test('Admin and Pastor share identical operational route access', () => {
  OPERATIONAL_VISIBLE_ROUTES.forEach((route) => {
    assert.equal(canAccessRoute(ROLES.ADMIN, route), true, route);
    assert.equal(canAccessRoute(ROLES.PASTOR, route), true, route);
  });

  LEAD_PASTOR_ONLY_ROUTES.forEach((route) => {
    assert.equal(canAccessRoute(ROLES.ADMIN, route), false, route);
    assert.equal(canAccessRoute(ROLES.PASTOR, route), false, route);
  });
});

test('Admin and Pastor share identical operational action permissions', () => {
  OPERATIONAL_ACTIONS.forEach((action) => {
    assert.equal(canPerformAction(ROLES.ADMIN, action), true, action);
    assert.equal(canPerformAction(ROLES.PASTOR, action), true, action);
  });

  OPERATIONAL_DENIED_ACTIONS.forEach((action) => {
    assert.equal(canPerformAction(ROLES.ADMIN, action), false, action);
    assert.equal(canPerformAction(ROLES.PASTOR, action), false, action);
  });
});

test('Admin and Pastor permissions stay aligned across every configured action', () => {
  Object.keys(ACTIONS).forEach((action) => {
    assert.equal(
      canPerformAction(ROLES.ADMIN, action),
      canPerformAction(ROLES.PASTOR, action),
      action,
    );
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
  assert.equal(canCreateCalendarEvent(ROLES.LEADER), true);
  assert.equal(canCreateCalendarEvent(ROLES.PASTOR), true);
  assert.equal(canCreateCalendarEvent(ROLES.ADMIN), true);

  const elderOwnEvent = { createdBy: 'elder-1' };
  const leaderOwnEvent = { createdBy: 'leader-1' };
  const otherEvent = { createdBy: 'pastor-1' };

  assert.equal(canManageCalendarEvent(ROLES.ELDER, elderOwnEvent, 'elder-1'), true);
  assert.equal(canManageCalendarEvent(ROLES.ELDER, otherEvent, 'elder-1'), false);
  assert.equal(canManageCalendarEvent(ROLES.LEADER, leaderOwnEvent, 'leader-1'), true);
  assert.equal(canManageCalendarEvent(ROLES.LEADER, otherEvent, 'leader-1'), false);
  assert.equal(canManageCalendarEvent(ROLES.PASTOR, otherEvent, 'elder-1'), true);
  assert.equal(canManageCalendarEvent(ROLES.ADMIN, otherEvent, 'elder-1'), true);
});

test('Leader can access ministry participant routes but not restricted admin routes', () => {
  LEADER_VISIBLE_ROUTES.forEach((route) => {
    assert.equal(canAccessRoute(ROLES.LEADER, route), true, route);
  });

  LEADER_RESTRICTED_ROUTES.forEach((route) => {
    assert.equal(canAccessRoute(ROLES.LEADER, route), false, route);
  });
});

test('Leader receives task, travelling, and calendar ownership actions only', () => {
  LEADER_ALLOWED_ACTIONS.forEach((action) => {
    assert.equal(canPerformAction(ROLES.LEADER, action), true, action);
  });

  LEADER_DENIED_ACTIONS.forEach((action) => {
    assert.equal(canPerformAction(ROLES.LEADER, action), false, action);
  });
});

test('Leader can view Creative Arts and school tiles but not open detailed records', () => {
  assert.equal(canPerformAction(ROLES.ELDER, 'OPEN_CREATIVE_ARTS_DEPARTMENT'), true);
  assert.equal(canPerformAction(ROLES.ELDER, 'OPEN_SCHOOL_RECORD'), true);
  assert.equal(canPerformAction(ROLES.LEADER, 'OPEN_CREATIVE_ARTS_DEPARTMENT'), false);
  assert.equal(canPerformAction(ROLES.LEADER, 'OPEN_SCHOOL_RECORD'), false);
});

test('other roles still follow existing permission boundaries', () => {
  assert.equal(canPerformAction(ROLES.LEADER, 'MANAGE_TASKS'), false);
  assert.equal(canPerformAction(ROLES.LEADER, 'MANAGE_CREATIVE_ARTS'), false);
  assert.equal(canAccessRoute(ROLES.LEADER, '/development-board'), false);
  assert.equal(canAccessRoute(ROLES.LEADER, '/members'), false);
});
