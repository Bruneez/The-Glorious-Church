import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROJECTS_CREATE_BUTTON_LABEL,
  PROJECTS_EMPTY_STATE,
  PROJECTS_PAGE_SUBTITLE,
  PROJECTS_PAGE_TITLE,
  buildProjectPayload,
  mapProjectToFormData,
  validateProjectAttachmentFile,
  validateProjectCoverFile,
  validateProjectDates,
  validateProjectForm,
} from './projectsOptions.js';
import { PROJECT_CATEGORY, PROJECT_PRIORITY, PROJECT_STATUS } from './projectsConstants.js';

test('projectsOptions exposes page copy constants', () => {
  assert.equal(PROJECTS_PAGE_TITLE, 'Projects');
  assert.match(PROJECTS_PAGE_SUBTITLE, /Plan, join and collaborate/i);
  assert.equal(PROJECTS_EMPTY_STATE.title, 'No projects have been created yet.');
  assert.match(PROJECTS_EMPTY_STATE.description, /New ministry projects will appear here/i);
  assert.equal(PROJECTS_CREATE_BUTTON_LABEL, 'Create First Project');
});

test('projectsOptions validates project form and file uploads', () => {
  const validForm = {
    title: 'Outreach',
    summary: 'Serve the community through youth outreach.',
    description: 'Serve the community.',
    expectedOutcome: 'More youth engaged in church programs.',
    leaderUserId: 'user-pastor',
    objectives: [{ id: 'obj-1', text: 'Launch campaign' }],
  };

  assert.equal(validateProjectForm(validForm), '');
  assert.match(
    validateProjectForm({ ...validForm, title: '' }),
    /Title is required/i,
  );
  assert.match(
    validateProjectForm({ ...validForm, summary: '' }),
    /Summary is required/i,
  );
  assert.match(
    validateProjectCoverFile({ type: 'image/jpeg', size: 6 * 1024 * 1024, name: 'cover.jpg' }),
    /5 MB or smaller/i,
  );
  assert.match(
    validateProjectAttachmentFile({ type: 'text/plain', size: 1024, name: 'notes.txt' }),
    /JPG, PNG, WEBP, or PDF/i,
  );
});

test('mapProjectToFormData and buildProjectPayload preserve extended project fields', () => {
  const formData = mapProjectToFormData({
    id: 'project-1',
    title: 'Youth Outreach',
    summary: 'Expand youth ministry reach.',
    description: 'Detailed plan',
    status: PROJECT_STATUS.ACTIVE,
    priority: PROJECT_PRIORITY.HIGH,
    startDate: '2026-08-01',
    dueDate: '2026-12-01',
    leaderUserId: 'leader-1',
    leaderName: 'Pastor Smith',
    category: PROJECT_CATEGORY.MINISTRY,
    expectedOutcome: 'More youth connected',
    objectives: [{ id: 'obj-1', text: 'Launch campaign', completed: false }],
    visibility: 'open',
    progress: 25,
  });

  assert.equal(formData.title, 'Youth Outreach');
  assert.equal(formData.priority, PROJECT_PRIORITY.HIGH);

  const payload = buildProjectPayload(formData, { createdByUserId: 'creator-1', projectId: 'project-1' });
  assert.equal(payload.summary, 'Expand youth ministry reach.');
  assert.equal(payload.leaderUserId, 'leader-1');
  assert.equal(payload.objectives.length, 1);
});

test('validateProjectDates rejects due dates before start dates', () => {
  assert.match(
    validateProjectDates({ startDate: '2026-08-01', dueDate: '2026-07-01' }),
    /Due date cannot be before/i,
  );
});
