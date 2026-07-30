import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessRoute, canPerformAction } from '../config/permissions.js';
import { ROLES } from '../config/roles.js';
import {
  assertCanManageAppFixes,
  assertCanViewAppFixes,
} from './appFixesGuards.js';

const APP_FIXES_ROUTE = '/app-fixes';

test('all leadership roles can access App Fixes route', () => {
  assert.equal(canAccessRoute(ROLES.LEAD_PASTOR, APP_FIXES_ROUTE), true);
  assert.equal(canAccessRoute(ROLES.ADMIN, APP_FIXES_ROUTE), true);
  assert.equal(canAccessRoute(ROLES.PASTOR, APP_FIXES_ROUTE), true);
  assert.equal(canAccessRoute(ROLES.ELDER, APP_FIXES_ROUTE), true);
  assert.equal(canAccessRoute(ROLES.LEADER, APP_FIXES_ROUTE), true);
});

test('guest users cannot access App Fixes route', () => {
  assert.equal(canAccessRoute('Guest', APP_FIXES_ROUTE), false);
});

test('Lead Pastor and Admin can manage App Fixes', () => {
  assert.equal(canPerformAction(ROLES.LEAD_PASTOR, 'MANAGE_APP_FIXES'), true);
  assert.equal(canPerformAction(ROLES.ADMIN, 'MANAGE_APP_FIXES'), true);
  assert.doesNotThrow(() => assertCanManageAppFixes(ROLES.ADMIN));
});

test('Pastor, Elder, and Leader can view but not manage App Fixes', () => {
  assert.equal(canPerformAction(ROLES.PASTOR, 'VIEW_APP_FIXES'), true);
  assert.equal(canPerformAction(ROLES.ELDER, 'VIEW_APP_FIXES'), true);
  assert.equal(canPerformAction(ROLES.LEADER, 'VIEW_APP_FIXES'), true);
  assert.equal(canPerformAction(ROLES.PASTOR, 'MANAGE_APP_FIXES'), false);
  assert.equal(canPerformAction(ROLES.ELDER, 'MANAGE_APP_FIXES'), false);
  assert.equal(canPerformAction(ROLES.LEADER, 'MANAGE_APP_FIXES'), false);
  assert.doesNotThrow(() => assertCanViewAppFixes(ROLES.PASTOR));
});

test('users without App Fixes view permission cannot view', () => {
  assert.equal(canPerformAction('', 'VIEW_APP_FIXES'), false);
  assert.equal(canPerformAction('Guest', 'VIEW_APP_FIXES'), false);
  assert.throws(() => assertCanViewAppFixes('Guest'), /App Fixes/i);
});

test('App Fixes guards throw expected permission messages', () => {
  assert.throws(
    () => assertCanManageAppFixes(ROLES.PASTOR),
    /manage App Fixes/i,
  );
});
