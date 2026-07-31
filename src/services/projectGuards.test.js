import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROJECT_JOINING_METHOD,
  PROJECT_MEMBERSHIP_ROLE,
  PROJECT_MEMBERSHIP_STATUS,
  PROJECT_STATUS,
  PROJECT_UPDATE_TYPE,
  PROJECT_VISIBILITY,
} from '../config/projectsConstants.js';
import { ROLES } from '../config/roles.js';
import {
  assertCanCreateProject,
  assertCanDeleteProject,
  assertCanJoinProject,
  assertCanManageProject,
  assertCanRequestToJoin,
  assertCanUpdateProgress,
  assertCanUploadAttachments,
  assertCanViewProject,
  canCreateProject,
  canDeleteProject,
  canJoinProject,
  canManageProject,
  canAddProjectUpdate,
  canDeleteProjectAttachment,
  canEditProjectUpdate,
  canRequestToJoin,
  canUpdateProgress,
  canUploadAttachments,
  canViewProject,
  canManageProjectTeam,
  canApproveMembership,
  canRejectMembership,
  canRemoveMember,
  canAssignProjectLeader,
  canTransferProjectLeadership,
} from './projectGuards.js';

const openProject = {
  id: 'project-1',
  title: 'Youth Outreach',
  status: PROJECT_STATUS.ACTIVE,
  visibility: PROJECT_VISIBILITY.OPEN,
  joiningMethod: PROJECT_JOINING_METHOD.OPEN,
  createdByUserId: 'user-pastor',
};

const closedProject = {
  ...openProject,
  id: 'project-2',
  visibility: PROJECT_VISIBILITY.CLOSED,
  joiningMethod: PROJECT_JOINING_METHOD.INVITATION_ONLY,
  createdByUserId: 'user-pastor',
};

const approvalRequiredProject = {
  ...openProject,
  id: 'project-3',
  visibility: PROJECT_VISIBILITY.OPEN,
  joiningMethod: PROJECT_JOINING_METHOD.APPROVAL_REQUIRED,
};

const deletedProject = {
  ...openProject,
  deletedAt: '2026-01-01T00:00:00.000Z',
};

const activeMembership = {
  role: PROJECT_MEMBERSHIP_ROLE.MEMBER,
  status: PROJECT_MEMBERSHIP_STATUS.ACTIVE,
};

const coordinatorMembership = {
  role: PROJECT_MEMBERSHIP_ROLE.COORDINATOR,
  status: PROJECT_MEMBERSHIP_STATUS.ACTIVE,
};

test('Lead Pastor and Pastor can create projects', () => {
  assert.equal(canCreateProject(ROLES.LEAD_PASTOR), true);
  assert.equal(canCreateProject(ROLES.PASTOR), true);
  assert.equal(canCreateProject(ROLES.ADMIN), false);
  assert.equal(canCreateProject(ROLES.ELDER), false);
});

test('Lead Pastor can manage any project', () => {
  assert.equal(canManageProject(ROLES.LEAD_PASTOR, closedProject, 'user-lead'), true);
  assert.equal(canDeleteProject(ROLES.LEAD_PASTOR, closedProject, 'user-lead'), true);
  assert.equal(canManageProject(ROLES.ADMIN, closedProject, 'user-admin'), false);
});

test('project creators with create permission can manage their own projects', () => {
  assert.equal(canManageProject(ROLES.PASTOR, openProject, 'user-pastor'), true);
  assert.equal(canManageProject(ROLES.PASTOR, openProject, 'user-other'), false);
  assert.equal(canDeleteProject(ROLES.PASTOR, openProject, 'user-pastor'), true);
});

test('viewers can see open and approval-required projects and their own closed projects', () => {
  assert.equal(canViewProject(ROLES.ELDER, openProject, 'user-elder'), true);
  assert.equal(canViewProject(ROLES.ELDER, approvalRequiredProject, 'user-elder'), true);
  assert.equal(canViewProject(ROLES.LEADER, closedProject, 'user-leader'), false);
  assert.equal(canViewProject(ROLES.PASTOR, closedProject, 'user-pastor'), true);
  assert.equal(canViewProject(ROLES.ELDER, closedProject, 'user-elder', activeMembership), true);
  assert.equal(canViewProject(ROLES.ADMIN, deletedProject, 'user-admin'), false);
});

test('users can join open projects and request approval-required projects', () => {
  assert.equal(canJoinProject(ROLES.ELDER, openProject, 'user-elder'), true);
  assert.equal(canJoinProject(ROLES.ELDER, closedProject, 'user-elder'), false);
  assert.equal(canJoinProject(ROLES.ELDER, approvalRequiredProject, 'user-elder'), false);
  assert.equal(canRequestToJoin(ROLES.ELDER, approvalRequiredProject, 'user-elder'), true);
  assert.equal(canRequestToJoin(ROLES.ELDER, openProject, 'user-elder'), false);
  assert.equal(canJoinProject(ROLES.PASTOR, openProject, 'user-pastor'), false);
  assert.equal(canJoinProject(ROLES.LEADER, openProject, 'user-leader', activeMembership), false);
  assert.equal(
    canJoinProject(ROLES.LEADER, { ...openProject, status: PROJECT_STATUS.COMPLETED }, 'user-leader'),
    false,
  );
});

test('attachments and progress updates follow membership and management rules', () => {
  assert.equal(canUploadAttachments(ROLES.ELDER, openProject, 'user-elder', activeMembership), true);
  assert.equal(canAddProjectUpdate(ROLES.ELDER, openProject, 'user-elder', activeMembership), true);
  assert.equal(canUploadAttachments(ROLES.LEADER, openProject, 'user-leader'), false);
  assert.equal(canUploadAttachments(ROLES.LEAD_PASTOR, closedProject, 'user-lead'), true);
  assert.equal(canUpdateProgress(ROLES.ELDER, openProject, 'user-elder', activeMembership), false);
  assert.equal(canUpdateProgress(ROLES.ELDER, openProject, 'user-elder', coordinatorMembership), true);
  assert.equal(canUpdateProgress(ROLES.PASTOR, openProject, 'user-pastor'), true);
  assert.equal(
    canUpdateProgress(
      ROLES.ELDER,
      { ...openProject, leaderUserId: 'user-elder' },
      'user-elder',
      activeMembership,
    ),
    true,
  );
});

test('users can edit only their own comment updates', () => {
  const ownComment = {
    updateType: PROJECT_UPDATE_TYPE.COMMENT,
    createdByUserId: 'user-elder',
  };
  const otherComment = {
    updateType: PROJECT_UPDATE_TYPE.COMMENT,
    createdByUserId: 'user-leader',
  };

  assert.equal(canEditProjectUpdate(ownComment, 'user-elder'), true);
  assert.equal(canEditProjectUpdate(otherComment, 'user-elder'), false);
  assert.equal(
    canEditProjectUpdate(
      { updateType: PROJECT_UPDATE_TYPE.STATUS_CHANGE, createdByUserId: 'user-elder' },
      'user-elder',
    ),
    false,
  );
});

test('attachment delete permissions allow owners and project leaders', () => {
  const attachment = {
    uploadedByUserId: 'user-elder',
  };

  assert.equal(
    canDeleteProjectAttachment(ROLES.ELDER, openProject, attachment, 'user-elder', activeMembership),
    true,
  );
  assert.equal(
    canDeleteProjectAttachment(ROLES.LEADER, openProject, attachment, 'user-leader'),
    false,
  );
  assert.equal(
    canDeleteProjectAttachment(ROLES.PASTOR, openProject, attachment, 'user-pastor'),
    true,
  );
  assert.equal(
    canDeleteProjectAttachment(
      ROLES.ELDER,
      { ...openProject, leaderUserId: 'user-elder' },
      { uploadedByUserId: 'user-other' },
      'user-elder',
      activeMembership,
    ),
    true,
  );
});

test('project team management permissions include leaders and owners', () => {
  const ownerMembership = {
    role: PROJECT_MEMBERSHIP_ROLE.OWNER,
    status: PROJECT_MEMBERSHIP_STATUS.ACTIVE,
  };

  const memberMembership = {
    role: PROJECT_MEMBERSHIP_ROLE.MEMBER,
    status: PROJECT_MEMBERSHIP_STATUS.ACTIVE,
  };

  assert.equal(
    canManageProjectTeam(ROLES.ELDER, { ...openProject, leaderUserId: 'user-elder' }, 'user-elder', activeMembership),
    true,
  );
  assert.equal(
    canApproveMembership(ROLES.ELDER, { ...openProject, leaderUserId: 'user-elder' }, 'user-elder', activeMembership),
    true,
  );
  assert.equal(
    canRejectMembership(ROLES.ELDER, closedProject, 'user-elder', ownerMembership),
    true,
  );
  assert.equal(
    canRemoveMember(ROLES.ELDER, closedProject, 'user-elder', ownerMembership, memberMembership),
    true,
  );
  assert.equal(
    canRemoveMember(ROLES.ELDER, closedProject, 'user-elder', ownerMembership, ownerMembership),
    false,
  );
  assert.equal(
    canAssignProjectLeader(ROLES.ELDER, closedProject, 'user-elder', ownerMembership),
    true,
  );
  assert.equal(
    canTransferProjectLeadership(ROLES.ELDER, closedProject, 'user-elder', memberMembership),
    false,
  );
  assert.equal(
    canTransferProjectLeadership(ROLES.ELDER, closedProject, 'user-elder', ownerMembership),
    true,
  );
  assert.equal(canManageProjectTeam(ROLES.LEADER, closedProject, 'user-leader', activeMembership), false);
});

test('project guards throw expected permission messages', () => {
  assert.throws(() => assertCanCreateProject(ROLES.ELDER), /create projects/i);
  assert.throws(
    () => assertCanViewProject(ROLES.LEADER, closedProject, 'user-leader'),
    /view this project/i,
  );
  assert.throws(
    () => assertCanManageProject(ROLES.PASTOR, closedProject, 'user-other'),
    /manage this project/i,
  );
  assert.throws(
    () => assertCanDeleteProject(ROLES.ELDER, closedProject, 'user-elder'),
    /delete this project/i,
  );
  assert.throws(
    () => assertCanJoinProject(ROLES.LEADER, closedProject, 'user-leader'),
    /join this project/i,
  );
  assert.throws(
    () => assertCanRequestToJoin(ROLES.LEADER, openProject, 'user-leader'),
    /request to join/i,
  );
  assert.throws(
    () => assertCanUploadAttachments(ROLES.LEADER, openProject, 'user-leader'),
    /upload attachments/i,
  );
  assert.throws(
    () => assertCanUpdateProgress(ROLES.LEADER, openProject, 'user-leader', activeMembership),
    /update progress/i,
  );
});
