import test from 'node:test';
import assert from 'node:assert/strict';
import { APP_FIX_STATUS } from '../config/appFixesConstants.js';
import { ROLES } from '../config/roles.js';
import {
  assertCanDeleteRequest,
  assertCanEditRequest,
  assertCanViewRequest,
  canDeleteRequest,
  canEditRequest,
  canManageRequest,
  canUserEditRequestContent,
  canViewRequest,
} from './appFixesGuards.js';

const ownRequest = {
  id: 'req-1',
  title: 'Login issue',
  status: APP_FIX_STATUS.OPEN,
  createdByUserId: 'user-pastor',
};

const otherRequest = {
  id: 'req-2',
  title: 'Map issue',
  status: APP_FIX_STATUS.OPEN,
  createdByUserId: 'user-leader',
};

const deletedRequest = {
  ...ownRequest,
  deletedAt: '2026-01-01T00:00:00.000Z',
};

test('Lead Pastor and Admin can manage all requests', () => {
  assert.equal(canManageRequest(ROLES.LEAD_PASTOR), true);
  assert.equal(canManageRequest(ROLES.ADMIN), true);
  assert.equal(canViewRequest(ROLES.ADMIN, otherRequest, 'user-admin'), true);
  assert.equal(canEditRequest(ROLES.ADMIN, otherRequest, 'user-admin'), true);
  assert.equal(canDeleteRequest(ROLES.ADMIN, otherRequest, 'user-admin'), true);
});

test('Pastor, Elder, and Leader can view and edit only their own requests', () => {
  assert.equal(canViewRequest(ROLES.PASTOR, ownRequest, 'user-pastor'), true);
  assert.equal(canViewRequest(ROLES.PASTOR, otherRequest, 'user-pastor'), false);
  assert.equal(canEditRequest(ROLES.ELDER, { ...ownRequest, createdByUserId: 'user-elder' }, 'user-elder'), true);
  assert.equal(canEditRequest(ROLES.LEADER, ownRequest, 'user-leader'), false);
  assert.equal(canDeleteRequest(ROLES.PASTOR, ownRequest, 'user-pastor'), true);
  assert.equal(canDeleteRequest(ROLES.PASTOR, otherRequest, 'user-pastor'), false);
});

test('users can edit own requests only while open or waiting for user', () => {
  const waitingRequest = { ...ownRequest, status: APP_FIX_STATUS.WAITING_FOR_USER };
  const closedRequest = { ...ownRequest, status: APP_FIX_STATUS.CLOSED };

  assert.equal(canUserEditRequestContent(ROLES.PASTOR, ownRequest, 'user-pastor'), true);
  assert.equal(canUserEditRequestContent(ROLES.PASTOR, waitingRequest, 'user-pastor'), true);
  assert.equal(canUserEditRequestContent(ROLES.PASTOR, closedRequest, 'user-pastor'), false);
  assert.equal(canUserEditRequestContent(ROLES.ADMIN, closedRequest, 'user-admin'), true);
});

test('deleted requests are hidden from all viewers', () => {
  assert.equal(canViewRequest(ROLES.ADMIN, deletedRequest, 'user-admin'), false);
  assert.equal(canEditRequest(ROLES.PASTOR, deletedRequest, 'user-pastor'), false);
});

test('request guards throw expected permission messages', () => {
  assert.throws(
    () => assertCanViewRequest(ROLES.PASTOR, otherRequest, 'user-pastor'),
    /view this app-fix request/i,
  );
  assert.throws(
    () => assertCanEditRequest(ROLES.LEADER, ownRequest, 'user-leader'),
    /edit this app-fix request/i,
  );
  assert.throws(
    () => assertCanDeleteRequest(ROLES.ELDER, otherRequest, 'user-elder'),
    /delete this app-fix request/i,
  );
});

test('privilege escalation attempts are blocked at the guard layer', () => {
  const closedOtherRequest = {
    ...otherRequest,
    status: APP_FIX_STATUS.RESOLVED,
  };

  assert.equal(canManageRequest(ROLES.PASTOR), false);
  assert.equal(canManageRequest(ROLES.ELDER), false);
  assert.equal(canViewRequest(ROLES.PASTOR, closedOtherRequest, 'user-pastor'), false);
  assert.equal(canEditRequest(ROLES.PASTOR, closedOtherRequest, 'user-pastor'), false);
  assert.equal(canUserEditRequestContent(ROLES.PASTOR, closedOtherRequest, 'user-pastor'), false);
  assert.equal(canDeleteRequest(ROLES.LEADER, ownRequest, 'user-leader'), false);
  assert.equal(canViewRequest('', ownRequest, 'user-pastor'), false);
});
