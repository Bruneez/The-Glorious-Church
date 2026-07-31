import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessRoute, canPerformAction } from '../config/permissions.js';
import { ROLES } from '../config/roles.js';

const PROJECTS_ROUTE = '/projects';

test('all leadership roles can access Projects route', () => {
  assert.equal(canAccessRoute(ROLES.LEAD_PASTOR, PROJECTS_ROUTE), true);
  assert.equal(canAccessRoute(ROLES.ADMIN, PROJECTS_ROUTE), true);
  assert.equal(canAccessRoute(ROLES.PASTOR, PROJECTS_ROUTE), true);
  assert.equal(canAccessRoute(ROLES.ELDER, PROJECTS_ROUTE), true);
  assert.equal(canAccessRoute(ROLES.LEADER, PROJECTS_ROUTE), true);
});

test('Elder and Leader can access project detail routes', () => {
  assert.equal(canAccessRoute(ROLES.ELDER, '/projects/project-1'), true);
  assert.equal(canAccessRoute(ROLES.LEADER, '/projects/project-1'), true);
});

test('guest users cannot access Projects route', () => {
  assert.equal(canAccessRoute('Guest', PROJECTS_ROUTE), false);
});

test('Lead Pastor and Pastor can create projects', () => {
  assert.equal(canPerformAction(ROLES.LEAD_PASTOR, 'CREATE_PROJECTS'), true);
  assert.equal(canPerformAction(ROLES.PASTOR, 'CREATE_PROJECTS'), true);
});

test('Admin, Elder, and Leader can view but not create projects', () => {
  assert.equal(canPerformAction(ROLES.ADMIN, 'VIEW_PROJECTS'), true);
  assert.equal(canPerformAction(ROLES.ELDER, 'VIEW_PROJECTS'), true);
  assert.equal(canPerformAction(ROLES.LEADER, 'VIEW_PROJECTS'), true);
  assert.equal(canPerformAction(ROLES.ADMIN, 'CREATE_PROJECTS'), false);
  assert.equal(canPerformAction(ROLES.ELDER, 'CREATE_PROJECTS'), false);
  assert.equal(canPerformAction(ROLES.LEADER, 'CREATE_PROJECTS'), false);
});

test('users without Projects view permission cannot view', () => {
  assert.equal(canPerformAction('', 'VIEW_PROJECTS'), false);
  assert.equal(canPerformAction('Guest', 'VIEW_PROJECTS'), false);
});
