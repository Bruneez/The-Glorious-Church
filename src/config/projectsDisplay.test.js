import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROJECT_PRIORITY,
  PROJECT_STATUS,
  PROJECT_JOINING_METHOD,
  PROJECT_UPDATE_TYPE,
  PROJECT_MEMBERSHIP_ROLE,
  PROJECT_MEMBERSHIP_STATUS,
  PROJECT_TEAM_ROLE,
} from './projectsConstants.js';
import {
  buildProjectsDashboardSummary,
  enrichProjectForDisplay,
  filterProjectsForDashboard,
  getProjectSummary,
  getProjectsDashboardSummaryCards,
  isProjectOverdue,
  PROJECT_TILE_STATE,
  resolveProjectParticipation,
  resolveProjectTileState,
  getProjectJoiningMethodLabel,
  getActiveProjectTeamMembers,
  getPendingProjectMemberships,
  resolveProjectTeamRole,
  sortProjectsForDashboard,
  buildProjectTimelineItems,
  PROJECT_TIMELINE_KIND,
  formatProjectAttachmentSize,
  isProjectImageAttachment,
  isProjectPdfAttachment,
} from './projectsDisplay.js';
import { ROLES } from './roles.js';

const baseProject = {
  id: 'project-1',
  title: 'Youth Outreach',
  description: 'Serve local youth with mentorship and outreach events across the city.',
  status: PROJECT_STATUS.ACTIVE,
  priority: PROJECT_PRIORITY.HIGH,
  dueDate: '2026-07-01',
  createdByUserId: 'user-pastor',
  createdByName: 'Pastor Smith',
  memberCount: 4,
  progress: 35,
};

test('buildProjectsDashboardSummary counts status and joined projects', () => {
  const summary = buildProjectsDashboardSummary(
    [
      baseProject,
      { ...baseProject, id: 'project-2', status: PROJECT_STATUS.PLANNING },
      { ...baseProject, id: 'project-3', status: PROJECT_STATUS.COMPLETED, dueDate: '2026-01-01' },
      { ...baseProject, id: 'project-4', status: PROJECT_STATUS.ON_HOLD },
    ],
    {
      memberships: [{ projectId: 'project-1', status: 'active', role: 'member' }],
      userId: 'user-elder',
    },
  );

  assert.equal(summary.total, 4);
  assert.equal(summary.active, 1);
  assert.equal(summary.planning, 1);
  assert.equal(summary.onHold, 1);
  assert.equal(summary.completed, 1);
  assert.equal(summary.joined, 1);
});

test('isProjectOverdue ignores completed projects and future due dates', () => {
  const today = new Date(2026, 6, 15);

  assert.equal(isProjectOverdue(baseProject, { today }), true);
  assert.equal(
    isProjectOverdue({ ...baseProject, dueDate: '2026-08-01' }, { today }),
    false,
  );
  assert.equal(
    isProjectOverdue({ ...baseProject, status: PROJECT_STATUS.COMPLETED }, { today }),
    false,
  );
});

test('getProjectSummary truncates long descriptions', () => {
  const summary = getProjectSummary({
    description: 'A'.repeat(200),
  });

  assert.equal(summary.length, 160);
  assert.match(summary, /…$/);
});

test('resolveProjectParticipation reflects membership and creator state', () => {
  assert.equal(
    resolveProjectParticipation(baseProject, { role: 'member', status: 'active' }).label,
    'Joined',
  );
  assert.equal(
    resolveProjectParticipation(baseProject, null, 'user-pastor').label,
    'Project Leader',
  );
  assert.equal(
    resolveProjectParticipation(baseProject, null, 'user-elder').label,
    'Not Joined',
  );
  assert.equal(
    resolveProjectParticipation(baseProject, { role: 'member', status: 'pending' }).label,
    'Pending',
  );
});

test('resolveProjectTileState exposes join, request, pending, joined, and leader actions', () => {
  const openProject = {
    ...baseProject,
    joiningMethod: PROJECT_JOINING_METHOD.OPEN,
  };
  const approvalProject = {
    ...baseProject,
    id: 'project-approval',
    joiningMethod: PROJECT_JOINING_METHOD.APPROVAL_REQUIRED,
  };

  assert.equal(
    resolveProjectTileState(openProject, null, 'user-elder', { role: ROLES.ELDER })?.key,
    PROJECT_TILE_STATE.JOIN,
  );
  assert.equal(
    resolveProjectTileState(approvalProject, null, 'user-elder', { role: ROLES.ELDER })?.key,
    PROJECT_TILE_STATE.REQUEST,
  );
  assert.equal(
    resolveProjectTileState(openProject, { role: 'member', status: 'pending' }, 'user-elder', { role: ROLES.ELDER })?.key,
    PROJECT_TILE_STATE.PENDING,
  );
  assert.equal(
    resolveProjectTileState(openProject, { role: 'member', status: 'active' }, 'user-elder', { role: ROLES.ELDER })?.key,
    PROJECT_TILE_STATE.JOINED,
  );
  assert.equal(
    resolveProjectTileState(openProject, { role: 'owner', status: 'active' }, 'user-pastor', { role: ROLES.PASTOR })?.key,
    PROJECT_TILE_STATE.PROJECT_LEADER,
  );
});

test('filterProjectsForDashboard supports status and priority filters', () => {
  const filtered = filterProjectsForDashboard(
    [
      baseProject,
      { ...baseProject, id: 'project-2', priority: PROJECT_PRIORITY.LOW, title: 'Prayer Team' },
    ],
    {
      searchTerm: 'Youth',
      statusFilter: PROJECT_STATUS.ACTIVE,
      priorityFilter: PROJECT_PRIORITY.HIGH,
    },
  );

  assert.deepEqual(filtered.map((project) => project.id), ['project-1']);
});

test('getProjectsDashboardSummaryCards highlights overdue counts', () => {
  const cards = getProjectsDashboardSummaryCards({ overdue: 2, total: 5 });

  assert.equal(cards.find((card) => card.key === 'overdue')?.highlight, true);
});

test('project detail helpers format joining method and active team members', () => {
  assert.equal(
    getProjectJoiningMethodLabel({ joiningMethod: PROJECT_JOINING_METHOD.APPROVAL_REQUIRED }),
    'Approval Required',
  );

  const team = getActiveProjectTeamMembers([
    { id: '1', role: 'member', status: 'active', memberName: 'Alex' },
    { id: '2', role: 'owner', status: 'active', memberName: 'Pastor' },
    { id: '3', role: 'member', status: 'pending', memberName: 'Pending User' },
  ]);

  assert.deepEqual(team.map((member) => member.id), ['2', '1']);
});

test('buildProjectTimelineItems merges updates and attachments newest first', () => {
  const items = buildProjectTimelineItems(
    [
      {
        id: 'update-1',
        updateType: PROJECT_UPDATE_TYPE.COMMENT,
        message: 'Older update',
        createdAt: '2026-01-01T10:00:00.000Z',
      },
      {
        id: 'update-2',
        updateType: PROJECT_UPDATE_TYPE.MEMBER_APPROVED,
        message: 'Member approved',
        createdAt: '2026-01-03T10:00:00.000Z',
      },
    ],
    [
      {
        id: 'attachment-1',
        fileName: 'plan.pdf',
        fileUrl: 'https://example.com/plan.pdf',
        createdAt: '2026-01-02T10:00:00.000Z',
      },
    ],
  );

  assert.equal(items.length, 3);
  assert.equal(items[0].sourceId, 'update-2');
  assert.equal(items[1].kind, PROJECT_TIMELINE_KIND.ATTACHMENT);
  assert.equal(items[2].sourceId, 'update-1');
});

test('project attachment display helpers identify file types and sizes', () => {
  assert.equal(isProjectImageAttachment({ contentType: 'image/png' }), true);
  assert.equal(isProjectPdfAttachment({ contentType: 'application/pdf' }), true);
  assert.equal(formatProjectAttachmentSize(2048), '2.0 KB');
});

test('enrichProjectForDisplay adds dashboard presentation fields', () => {
  const enriched = enrichProjectForDisplay(baseProject, {
    membership: { role: 'owner', status: 'active' },
    userId: 'user-pastor',
    role: ROLES.PASTOR,
  });

  assert.equal(enriched.leaderName, 'Pastor Smith');
  assert.equal(enriched.priorityLabel, 'High');
  assert.equal(enriched.participation.label, 'Project Leader');
  assert.equal(enriched.tileState?.key, PROJECT_TILE_STATE.PROJECT_LEADER);
  assert.equal(enriched.overdue, true);
});

test('resolveProjectTeamRole maps membership roles to display team roles', () => {
  const project = {
    ...baseProject,
    leaderUserId: 'user-leader',
    createdByUserId: 'user-pastor',
  };

  assert.equal(
    resolveProjectTeamRole(project, { role: PROJECT_MEMBERSHIP_ROLE.OWNER, userId: 'user-owner' }, 'user-owner').key,
    PROJECT_TEAM_ROLE.LEADER,
  );
  assert.equal(
    resolveProjectTeamRole(project, null, 'user-pastor').key,
    PROJECT_TEAM_ROLE.CREATOR,
  );
  assert.equal(
    resolveProjectTeamRole(project, { role: PROJECT_MEMBERSHIP_ROLE.COORDINATOR, userId: 'user-coord' }, 'user-coord').key,
    PROJECT_TEAM_ROLE.PARTICIPANT,
  );
  assert.equal(
    resolveProjectTeamRole(project, { role: PROJECT_MEMBERSHIP_ROLE.MEMBER, userId: 'user-member' }, 'user-member').key,
    PROJECT_TEAM_ROLE.TEAM_MEMBER,
  );
});

test('sortProjectsForDashboard supports title and priority sorting', () => {
  const projects = [
    { ...baseProject, id: 'a', title: 'Alpha', priority: PROJECT_PRIORITY.LOW, updatedAt: '2026-01-01T00:00:00.000Z' },
    { ...baseProject, id: 'b', title: 'Beta', priority: PROJECT_PRIORITY.CRITICAL, updatedAt: '2026-06-01T00:00:00.000Z' },
  ];

  assert.deepEqual(
    sortProjectsForDashboard(projects, 'title-asc').map((project) => project.id),
    ['a', 'b'],
  );
  assert.deepEqual(
    sortProjectsForDashboard(projects, 'priority-desc').map((project) => project.id),
    ['b', 'a'],
  );
});

test('getPendingProjectMemberships returns pending requests newest first', () => {
  const pending = getPendingProjectMemberships([
    {
      id: 'm-1',
      status: PROJECT_MEMBERSHIP_STATUS.PENDING,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'm-2',
      status: PROJECT_MEMBERSHIP_STATUS.PENDING,
      createdAt: '2026-02-01T00:00:00.000Z',
    },
    {
      id: 'm-3',
      status: PROJECT_MEMBERSHIP_STATUS.ACTIVE,
      createdAt: '2026-03-01T00:00:00.000Z',
    },
  ]);

  assert.equal(pending.length, 2);
  assert.equal(pending[0].id, 'm-2');
  assert.equal(pending[1].id, 'm-1');
});
