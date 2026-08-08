import test from 'node:test';
import assert from 'node:assert/strict';
import { APP_FIX_STATUS } from './appFixesConstants.js';
import {
  buildAppFixUserSummary,
  getAppFixUserSummaryCards,
  resolveAppFixPermissionStatus,
} from './appFixesUserOptions.js';
import { ROLES } from './roles.js';

test('buildAppFixUserSummary counts open, in-progress, and completed requests', () => {
  const summary = buildAppFixUserSummary([
    { status: APP_FIX_STATUS.OPEN },
    { status: APP_FIX_STATUS.IN_PROGRESS },
    { status: APP_FIX_STATUS.IN_REVIEW },
    { status: APP_FIX_STATUS.RESOLVED },
  ]);

  assert.equal(summary.total, 4);
  assert.equal(summary.open, 1);
  assert.equal(summary.inProgress, 2);
  assert.equal(summary.completed, 1);
});

test('getAppFixUserSummaryCards returns compact user-facing labels', () => {
  const cards = getAppFixUserSummaryCards({
    total: 3,
    open: 1,
    inProgress: 1,
    completed: 1,
  });

  assert.deepEqual(
    cards.map((card) => card.label),
    ['My Requests', 'Open', 'In Progress', 'Completed'],
  );
});

test('resolveAppFixPermissionStatus waits for staff session before denying access', () => {
  assert.equal(
    resolveAppFixPermissionStatus({ role: ROLES.ELDER, isStaffSessionLoading: true }),
    'loading',
  );
  assert.equal(
    resolveAppFixPermissionStatus({ role: ROLES.ELDER, isStaffSessionLoading: false }),
    'allowed',
  );
  assert.equal(
    resolveAppFixPermissionStatus({ role: 'Guest', isStaffSessionLoading: false }),
    'denied',
  );
});
