import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessRoute, canPerformAction } from '../config/permissions.js';
import { PUBLISHED_STATUS, SHEPHERDING_RESOURCE_TYPES } from '../config/shepherdingToolsConstants.js';
import { ROLES } from '../config/roles.js';
import {
  assertCanManageResource,
  assertCanViewResource,
  canDeleteResource,
  canEditResource,
  canManageResource,
  canPublishResource,
  canViewResource,
} from './shepherdingToolsGuards.js';

const SHEPHERDING_TOOLS_ROUTE = '/shepherding-tools';

const publishedResource = {
  id: 'resource-1',
  resourceType: SHEPHERDING_RESOURCE_TYPES.AUDIO_SERMON,
  title: 'Sunday Message',
  publishedStatus: PUBLISHED_STATUS.PUBLISHED,
};

const draftResource = {
  id: 'resource-2',
  resourceType: SHEPHERDING_RESOURCE_TYPES.BOOK,
  title: 'Draft Book',
  publishedStatus: PUBLISHED_STATUS.DRAFT,
};

const deletedResource = {
  id: 'resource-3',
  resourceType: SHEPHERDING_RESOURCE_TYPES.MUSIC,
  title: 'Removed Song',
  publishedStatus: PUBLISHED_STATUS.PUBLISHED,
  deletedAt: '2026-01-01T00:00:00.000Z',
};

test('all leadership roles can access Shepherding Tools route', () => {
  assert.equal(canAccessRoute(ROLES.LEAD_PASTOR, SHEPHERDING_TOOLS_ROUTE), true);
  assert.equal(canAccessRoute(ROLES.PASTOR, SHEPHERDING_TOOLS_ROUTE), true);
  assert.equal(canAccessRoute(ROLES.ADMIN, SHEPHERDING_TOOLS_ROUTE), true);
  assert.equal(canAccessRoute(ROLES.ELDER, SHEPHERDING_TOOLS_ROUTE), true);
  assert.equal(canAccessRoute(ROLES.LEADER, SHEPHERDING_TOOLS_ROUTE), true);
});

test('guest users cannot access Shepherding Tools route', () => {
  assert.equal(canAccessRoute('Guest', SHEPHERDING_TOOLS_ROUTE), false);
});

test('Lead Pastor and Admin can manage Shepherding Tools resources', () => {
  assert.equal(canPerformAction(ROLES.LEAD_PASTOR, 'MANAGE_SHEPHERDING_TOOLS'), true);
  assert.equal(canPerformAction(ROLES.ADMIN, 'MANAGE_SHEPHERDING_TOOLS'), true);
  assert.doesNotThrow(() => assertCanManageResource(ROLES.ADMIN));
});

test('Pastor, Elder, and Leader can view but not manage Shepherding Tools resources', () => {
  assert.equal(canPerformAction(ROLES.PASTOR, 'VIEW_SHEPHERDING_TOOLS'), true);
  assert.equal(canPerformAction(ROLES.ELDER, 'VIEW_SHEPHERDING_TOOLS'), true);
  assert.equal(canPerformAction(ROLES.LEADER, 'VIEW_SHEPHERDING_TOOLS'), true);
  assert.equal(canPerformAction(ROLES.PASTOR, 'MANAGE_SHEPHERDING_TOOLS'), false);
  assert.equal(canPerformAction(ROLES.ELDER, 'MANAGE_SHEPHERDING_TOOLS'), false);
  assert.equal(canPerformAction(ROLES.LEADER, 'MANAGE_SHEPHERDING_TOOLS'), false);
});

test('read-only roles can view published resources only', () => {
  assert.equal(canViewResource(ROLES.PASTOR, publishedResource), true);
  assert.equal(canViewResource(ROLES.ELDER, publishedResource), true);
  assert.equal(canViewResource(ROLES.LEADER, publishedResource), true);
  assert.equal(canViewResource(ROLES.PASTOR, draftResource), false);
  assert.equal(canViewResource(ROLES.PASTOR, deletedResource), false);
});

test('management roles can view drafts and published resources but not deleted ones', () => {
  assert.equal(canViewResource(ROLES.ADMIN, draftResource), true);
  assert.equal(canViewResource(ROLES.LEAD_PASTOR, draftResource), true);
  assert.equal(canViewResource(ROLES.ADMIN, deletedResource), false);
  assert.equal(canEditResource(ROLES.ADMIN, draftResource), true);
  assert.equal(canEditResource(ROLES.PASTOR, draftResource), false);
  assert.equal(canDeleteResource(ROLES.ADMIN, publishedResource), true);
  assert.equal(canPublishResource(ROLES.ADMIN, draftResource), true);
  assert.equal(canPublishResource(ROLES.PASTOR, draftResource), false);
});

test('resource guards throw expected permission messages', () => {
  assert.throws(
    () => assertCanViewResource(ROLES.PASTOR, draftResource),
    /view Shepherding Tools resources/i,
  );
  assert.throws(
    () => assertCanManageResource(ROLES.PASTOR),
    /manage Shepherding Tools resources/i,
  );
});
