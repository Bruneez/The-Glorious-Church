import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APP_FIX_GROUP_MODES,
  APP_FIX_PRIORITY,
  APP_FIX_STATUS,
} from './appFixesConstants.js';
import {
  applyManagementRequestFilters,
  buildAppFixDashboardSummary,
  buildManagementRequestGroups,
  buildStaffLookupMap,
  getAppFixDashboardSummaryCards,
  groupRequestsByUser,
  resolveRequestSubmitter,
} from './appFixesManagementOptions.js';

const sampleRequests = [
  {
    id: 'req-1',
    title: 'Login button broken',
    description: 'Cannot sign in on mobile',
    errorMessage: 'TypeError: undefined',
    affectedModule: '/dashboard',
    status: APP_FIX_STATUS.OPEN,
    priority: APP_FIX_PRIORITY.URGENT,
    category: 'bug',
    createdByUserId: 'user-a',
    createdByName: 'Alice Pastor',
    createdAt: '2026-07-01T10:00:00.000Z',
    referenceNumber: 'AF-2026-0001',
  },
  {
    id: 'req-2',
    title: 'Slow reports page',
    description: 'Reports take too long',
    errorMessage: '',
    affectedModule: '/reports',
    status: APP_FIX_STATUS.IN_REVIEW,
    priority: APP_FIX_PRIORITY.MEDIUM,
    category: 'performance',
    createdByUserId: 'user-b',
    createdByName: 'Bob Elder',
    createdAt: '2026-07-10T12:00:00.000Z',
    referenceNumber: 'AF-2026-0002',
  },
  {
    id: 'req-3',
    title: 'Resolved export issue',
    description: 'Export works again',
    errorMessage: '',
    affectedModule: '/members',
    status: APP_FIX_STATUS.RESOLVED,
    priority: APP_FIX_PRIORITY.LOW,
    category: 'bug',
    createdByUserId: 'user-a',
    createdByName: 'Alice Pastor',
    createdAt: '2026-07-20T08:00:00.000Z',
    referenceNumber: 'AF-2026-0003',
  },
];

const staff = [
  { authUid: 'user-a', name: 'Alice Pastor', role: 'Pastor' },
  { authUid: 'user-b', name: 'Bob Elder', role: 'Elder' },
];

test('buildAppFixDashboardSummary counts live request metrics', () => {
  const summary = buildAppFixDashboardSummary(sampleRequests);

  assert.equal(summary.total, 3);
  assert.equal(summary.open, 1);
  assert.equal(summary.inReview, 1);
  assert.equal(summary.inProgress, 0);
  assert.equal(summary.completed, 1);
  assert.equal(summary.critical, 1);
});

test('getAppFixDashboardSummaryCards returns card labels without hard-coded values', () => {
  const cards = getAppFixDashboardSummaryCards(buildAppFixDashboardSummary(sampleRequests));

  assert.deepEqual(
    cards.map((card) => card.label),
    ['Total Requests', 'Open', 'In Review', 'In Progress', 'Completed', 'Critical'],
  );
  assert.equal(cards.find((card) => card.key === 'critical')?.value, 1);
});

test('applyManagementRequestFilters searches title, reference, module, and user fields', () => {
  const staffByUserId = buildStaffLookupMap(staff);

  assert.equal(
    applyManagementRequestFilters(sampleRequests, {
      searchTerm: 'af-2026-0002',
      staffByUserId,
    }).length,
    1,
  );

  assert.equal(
    applyManagementRequestFilters(sampleRequests, {
      searchTerm: 'reports',
      staffByUserId,
    }).length,
    1,
  );

  assert.equal(
    applyManagementRequestFilters(sampleRequests, {
      searchTerm: 'alice',
      staffByUserId,
    }).length,
    2,
  );
});

test('applyManagementRequestFilters supports status, submitter, and date filters', () => {
  const staffByUserId = buildStaffLookupMap(staff);

  assert.equal(
    applyManagementRequestFilters(sampleRequests, {
      statusFilter: APP_FIX_STATUS.OPEN,
      staffByUserId,
    }).length,
    1,
  );

  assert.equal(
    applyManagementRequestFilters(sampleRequests, {
      submittedByFilter: 'user-a',
      staffByUserId,
    }).length,
    2,
  );

  assert.equal(
    applyManagementRequestFilters(sampleRequests, {
      dateFrom: '2026-07-09',
      dateTo: '2026-07-15',
      staffByUserId,
    }).length,
    1,
  );
});

test('buildManagementRequestGroups supports all grouping modes', () => {
  const staffByUserId = buildStaffLookupMap(staff);

  const allGroup = buildManagementRequestGroups(
    sampleRequests,
    APP_FIX_GROUP_MODES.ALL,
    staffByUserId,
  );
  assert.equal(allGroup.length, 1);
  assert.equal(allGroup[0].requestCount, 3);

  const statusGroups = buildManagementRequestGroups(
    sampleRequests,
    APP_FIX_GROUP_MODES.BY_STATUS,
    staffByUserId,
  );
  assert.equal(statusGroups.length, 3);

  const userGroups = buildManagementRequestGroups(
    sampleRequests,
    APP_FIX_GROUP_MODES.BY_USER,
    staffByUserId,
  );
  assert.equal(userGroups.length, 2);
  assert.equal(userGroups[0].openCount + userGroups[1].openCount, 1);

  const roleGroups = buildManagementRequestGroups(
    sampleRequests,
    APP_FIX_GROUP_MODES.USER_GROUPS,
    staffByUserId,
  );
  assert.equal(roleGroups.length, 2);
  assert.equal(roleGroups[0].users.length + roleGroups[1].users.length, 2);
});

test('resolveRequestSubmitter and groupRequestsByUser expose avatar metadata', () => {
  const staffByUserId = buildStaffLookupMap(staff);
  const submitter = resolveRequestSubmitter(sampleRequests[0], staffByUserId);

  assert.equal(submitter.name, 'Alice Pastor');
  assert.equal(submitter.role, 'Pastor');

  const grouped = groupRequestsByUser(sampleRequests, staffByUserId);
  assert.equal(grouped.find((group) => group.userId === 'user-a')?.requests.length, 2);
});
