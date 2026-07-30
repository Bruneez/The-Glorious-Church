import test from 'node:test';
import assert from 'node:assert/strict';
import { APP_FIX_STATUS } from '../config/appFixesConstants.js';
import {
  applyAppFixRequestSearch,
  getAppFixRequestsQueryConstraints,
  normalizeAppFixRequests,
  sortAppFixRequests,
} from './appFixesQueryUtils.js';

test('getAppFixRequestsQueryConstraints scopes personal users to createdByUserId', () => {
  const managerConstraints = getAppFixRequestsQueryConstraints({ role: 'Admin' });
  const personalConstraints = getAppFixRequestsQueryConstraints({
    role: 'Pastor',
    createdByUserId: 'user-pastor',
  });

  assert.equal(managerConstraints.length, 1);
  assert.equal(personalConstraints.length, 2);
});

test('normalizeAppFixRequests hides other users requests from personal roles', () => {
  const requests = normalizeAppFixRequests(
    [
      {
        id: 'mine',
        title: 'Mine',
        status: APP_FIX_STATUS.OPEN,
        createdByUserId: 'user-pastor',
        updatedAt: '2026-06-12T00:00:00.000Z',
      },
      {
        id: 'theirs',
        title: 'Theirs',
        status: APP_FIX_STATUS.OPEN,
        createdByUserId: 'user-leader',
        updatedAt: '2026-06-10T00:00:00.000Z',
      },
    ],
    'Pastor',
    'user-pastor',
  );

  assert.deepEqual(requests.map((request) => request.id), ['mine']);
});

test('sortAppFixRequests orders newest updatedAt first', () => {
  const sorted = sortAppFixRequests([
    { id: 'older', updatedAt: '2026-01-01T00:00:00.000Z' },
    { id: 'newer', updatedAt: '2026-06-12T00:00:00.000Z' },
  ]);

  assert.deepEqual(sorted.map((request) => request.id), ['newer', 'older']);
});

test('applyAppFixRequestSearch filters by search term and status', () => {
  const filtered = applyAppFixRequestSearch(
    [
      { title: 'Login issue', status: APP_FIX_STATUS.OPEN },
      { title: 'Calendar bug', status: APP_FIX_STATUS.RESOLVED },
    ],
    { searchTerm: 'login', statusFilter: APP_FIX_STATUS.OPEN },
  );

  assert.deepEqual(filtered.map((request) => request.title), ['Login issue']);
});
