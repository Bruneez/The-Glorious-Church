import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROJECT_STATUS,
  PROJECT_VISIBILITY,
} from '../config/projectsConstants.js';
import {
  getProjectsQueryConstraints,
  normalizeProjects,
  sortProjects,
} from './projectsQueryUtils.js';

test('getProjectsQueryConstraints returns updatedAt ordering for all viewers', () => {
  const constraints = getProjectsQueryConstraints();

  assert.equal(constraints.length, 1);
  assert.equal(constraints[0].type, 'orderBy');
});

test('normalizeProjects hides closed projects from non-members while keeping open projects visible', () => {
  const projects = normalizeProjects(
    [
      {
        id: 'open',
        title: 'Open Project',
        status: PROJECT_STATUS.ACTIVE,
        visibility: PROJECT_VISIBILITY.OPEN,
        createdByUserId: 'user-pastor',
        updatedAt: '2026-06-12T00:00:00.000Z',
      },
      {
        id: 'closed',
        title: 'Closed Project',
        status: PROJECT_STATUS.ACTIVE,
        visibility: PROJECT_VISIBILITY.CLOSED,
        createdByUserId: 'user-pastor',
        updatedAt: '2026-06-10T00:00:00.000Z',
      },
      {
        id: 'deleted',
        title: 'Deleted Project',
        status: PROJECT_STATUS.ACTIVE,
        visibility: PROJECT_VISIBILITY.OPEN,
        createdByUserId: 'user-pastor',
        deletedAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-06-08T00:00:00.000Z',
      },
    ],
    'Elder',
    'user-elder',
  );

  assert.deepEqual(projects.map((project) => project.id), ['open']);
});

test('normalizeProjects keeps creator and manager visibility for closed projects', () => {
  const projects = normalizeProjects(
    [
      {
        id: 'closed',
        title: 'Closed Project',
        status: PROJECT_STATUS.ACTIVE,
        visibility: PROJECT_VISIBILITY.CLOSED,
        createdByUserId: 'user-pastor',
        updatedAt: '2026-06-10T00:00:00.000Z',
      },
    ],
    'Pastor',
    'user-pastor',
  );

  assert.deepEqual(projects.map((project) => project.id), ['closed']);
});

test('sortProjects orders newest updatedAt first', () => {
  const sorted = sortProjects([
    { id: 'older', updatedAt: '2026-01-01T00:00:00.000Z' },
    { id: 'newer', updatedAt: '2026-06-12T00:00:00.000Z' },
  ]);

  assert.deepEqual(sorted.map((project) => project.id), ['newer', 'older']);
});
