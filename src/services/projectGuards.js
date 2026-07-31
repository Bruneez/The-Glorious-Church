import { canPerformAction } from '../config/permissions.js';
import { isFullAccessRole, normalizeRole } from '../config/roles.js';
import {
  PROJECT_JOINING_METHOD,
  PROJECT_MEMBERSHIP_ROLE,
  PROJECT_STATUS,
  PROJECT_UPDATE_TYPE,
} from '../config/projectsConstants.js';
import {
  hasBlockingProjectMembership,
  isProjectDeleted,
  isProjectAttachmentDeleted,
  isProjectMembershipActive,
  isProjectMembershipPending,
  isProjectPubliclyDiscoverable,
  isProjectUpdateDeleted,
  resolveJoiningMethod,
} from '../config/projectsOptions.js';

export const VIEW_DENIED_MESSAGE =
  'You do not have permission to view Projects.';
export const CREATE_DENIED_MESSAGE =
  'You do not have permission to create projects.';
export const PROJECT_DENIED_MESSAGE =
  'You do not have permission to view this project.';
export const MANAGE_DENIED_MESSAGE =
  'You do not have permission to manage this project.';
export const DELETE_DENIED_MESSAGE =
  'You do not have permission to delete this project.';
export const JOIN_DENIED_MESSAGE =
  'You do not have permission to join this project.';
export const REQUEST_DENIED_MESSAGE =
  'You do not have permission to request to join this project.';
export const LEAVE_DENIED_MESSAGE =
  'You do not have permission to leave this project.';
export const APPROVE_DENIED_MESSAGE =
  'You do not have permission to approve membership requests.';
export const REJECT_DENIED_MESSAGE =
  'You do not have permission to reject membership requests.';
export const CANCEL_REQUEST_DENIED_MESSAGE =
  'You do not have permission to cancel this join request.';
export const INVITE_DENIED_MESSAGE =
  'You do not have permission to invite members to this project.';
export const UPLOAD_DENIED_MESSAGE =
  'You do not have permission to upload attachments for this project.';
export const DELETE_ATTACHMENT_DENIED_MESSAGE =
  'You do not have permission to delete this attachment.';
export const PROGRESS_DENIED_MESSAGE =
  'You do not have permission to update progress for this project.';
export const ADD_UPDATE_DENIED_MESSAGE =
  'You do not have permission to add updates to this project.';
export const EDIT_UPDATE_DENIED_MESSAGE =
  'You do not have permission to edit this update.';
export const STATUS_DENIED_MESSAGE =
  'You do not have permission to change project status.';
export const TEAM_MANAGE_DENIED_MESSAGE =
  'You do not have permission to manage this project team.';
export const REMOVE_MEMBER_DENIED_MESSAGE =
  'You do not have permission to remove this team member.';
export const ASSIGN_LEADER_DENIED_MESSAGE =
  'You do not have permission to assign a project leader.';
export const TRANSFER_LEADERSHIP_DENIED_MESSAGE =
  'You do not have permission to transfer project leadership.';

function isProjectCreator(userId, project) {
  const ownerId = String(project?.createdByUserId || '').trim();
  const currentUserId = String(userId || '').trim();
  return Boolean(ownerId && currentUserId && ownerId === currentUserId);
}

function isProjectLeaderUser(userId, project) {
  const leaderId = String(project?.leaderUserId || '').trim();
  const currentUserId = String(userId || '').trim();
  return Boolean(leaderId && currentUserId && leaderId === currentUserId);
}

function isCoordinatorMembership(membership) {
  const role = String(membership?.role || '').trim();
  return role === PROJECT_MEMBERSHIP_ROLE.OWNER
    || role === PROJECT_MEMBERSHIP_ROLE.COORDINATOR;
}

function isProjectJoinableStatus(project) {
  const status = String(project?.status || '').trim();
  return status !== PROJECT_STATUS.COMPLETED && status !== PROJECT_STATUS.CANCELLED;
}

function canParticipateInProject(role, project, userId = '', membership = null) {
  if (!canPerformAction(role, 'VIEW_PROJECTS')) return false;
  if (!project || isProjectDeleted(project)) return false;
  if (!isProjectJoinableStatus(project)) return false;
  if (isProjectCreator(userId, project)) return false;
  if (isProjectLeaderUser(userId, project)) return false;
  if (membership && hasBlockingProjectMembership(membership)) return false;
  return true;
}

export function isProjectLeader(project, userId = '', membership = null) {
  if (isProjectCreator(userId, project)) return true;
  if (isProjectLeaderUser(userId, project)) return true;
  if (membership?.role === PROJECT_MEMBERSHIP_ROLE.OWNER) return true;
  return false;
}

export function canCreateProject(role) {
  return canPerformAction(role, 'CREATE_PROJECTS');
}

export function canViewProject(role, project, userId = '', membership = null) {
  if (!canPerformAction(role, 'VIEW_PROJECTS')) return false;
  if (!project || isProjectDeleted(project)) return false;
  if (canManageProject(role, project, userId)) return true;
  if (isProjectCreator(userId, project)) return true;
  if (membership && isProjectMembershipActive(membership)) return true;
  if (membership && isProjectMembershipPending(membership)) return true;
  return isProjectPubliclyDiscoverable(project);
}

export function canJoinProject(role, project, userId = '', membership = null) {
  if (!canParticipateInProject(role, project, userId, membership)) return false;
  return resolveJoiningMethod(project) === PROJECT_JOINING_METHOD.OPEN;
}

export function canRequestToJoin(role, project, userId = '', membership = null) {
  if (!canParticipateInProject(role, project, userId, membership)) return false;
  return resolveJoiningMethod(project) === PROJECT_JOINING_METHOD.APPROVAL_REQUIRED;
}

export function canLeaveProject(role, project, userId = '', membership = null) {
  if (!canPerformAction(role, 'VIEW_PROJECTS')) return false;
  if (!project || isProjectDeleted(project)) return false;
  if (!membership || !isProjectMembershipActive(membership)) return false;
  if (String(membership.userId || '') !== String(userId || '')) return false;
  if (membership.role === PROJECT_MEMBERSHIP_ROLE.OWNER) return false;
  return true;
}

export function canCancelJoinRequest(role, project, userId = '', membership = null) {
  if (!canPerformAction(role, 'VIEW_PROJECTS')) return false;
  if (!project || isProjectDeleted(project)) return false;
  if (!membership || !isProjectMembershipPending(membership)) return false;
  return String(membership.userId || '') === String(userId || '');
}

export function canManageProjectTeam(role, project, userId = '', membership = null) {
  if (!project || isProjectDeleted(project)) return false;
  if (canManageProject(role, project, userId)) return true;
  return isProjectLeader(project, userId, membership);
}

export function canApproveMembership(role, project, userId = '', membership = null) {
  return canManageProjectTeam(role, project, userId, membership);
}

export function canRejectMembership(role, project, userId = '', membership = null) {
  return canManageProjectTeam(role, project, userId, membership);
}

export function canInviteMember(role, project, userId = '', membership = null) {
  return canManageProjectTeam(role, project, userId, membership);
}

export function canRemoveMember(
  role,
  project,
  userId = '',
  actorMembership = null,
  targetMembership = null,
) {
  if (!canManageProjectTeam(role, project, userId, actorMembership)) return false;
  if (!targetMembership || !isProjectMembershipActive(targetMembership)) return false;
  if (targetMembership.role === PROJECT_MEMBERSHIP_ROLE.OWNER) return false;
  return true;
}

export function canAssignProjectLeader(role, project, userId = '', membership = null) {
  return canManageProjectTeam(role, project, userId, membership);
}

export function canTransferProjectLeadership(role, project, userId = '', membership = null) {
  if (!canManageProjectTeam(role, project, userId, membership)) return false;
  return canManageProject(role, project, userId)
    || membership?.role === PROJECT_MEMBERSHIP_ROLE.OWNER;
}

export function canManageProject(role, project, userId = '') {
  if (!project || isProjectDeleted(project)) return false;
  if (isFullAccessRole(normalizeRole(role))) return true;
  if (canCreateProject(role) && isProjectCreator(userId, project)) return true;
  return false;
}

export function canDeleteProject(role, project, userId = '') {
  return canManageProject(role, project, userId);
}

export function canUploadAttachments(role, project, userId = '', membership = null) {
  if (!canViewProject(role, project, userId, membership)) return false;
  if (canManageProject(role, project, userId)) return true;
  return Boolean(membership && isProjectMembershipActive(membership));
}

export function canUpdateProgress(role, project, userId = '', membership = null) {
  if (!canViewProject(role, project, userId, membership)) return false;
  if (canManageProject(role, project, userId)) return true;
  if (isProjectLeader(project, userId, membership)) return true;
  return Boolean(membership && isProjectMembershipActive(membership) && isCoordinatorMembership(membership));
}

export function canAddProjectUpdate(role, project, userId = '', membership = null) {
  return canUploadAttachments(role, project, userId, membership);
}

export function canEditProjectUpdate(update, userId = '') {
  if (!update || isProjectUpdateDeleted(update)) return false;
  if (String(update.updateType || '').trim() !== PROJECT_UPDATE_TYPE.COMMENT) return false;
  return String(update.createdByUserId || '').trim() === String(userId || '').trim();
}

export function canChangeProjectStatus(role, project, userId = '', membership = null) {
  return canUpdateProgress(role, project, userId, membership);
}

export function canDeleteProjectAttachment(role, project, attachment, userId = '', membership = null) {
  if (!project || !attachment || isProjectAttachmentDeleted(attachment)) return false;
  if (!canViewProject(role, project, userId, membership)) return false;
  if (canManageProject(role, project, userId)) return true;
  if (isProjectLeader(project, userId, membership)) return true;
  return String(attachment.uploadedByUserId || '').trim() === String(userId || '').trim();
}

export function assertCanViewProjects(role) {
  if (!canPerformAction(role, 'VIEW_PROJECTS')) {
    throw new Error(VIEW_DENIED_MESSAGE);
  }
}

export function assertCanCreateProject(role) {
  if (!canCreateProject(role)) {
    throw new Error(CREATE_DENIED_MESSAGE);
  }
}

export function assertCanViewProject(role, project, userId = '', membership = null) {
  if (!canViewProject(role, project, userId, membership)) {
    throw new Error(PROJECT_DENIED_MESSAGE);
  }
}

export function assertCanManageProject(role, project, userId = '') {
  if (!canManageProject(role, project, userId)) {
    throw new Error(MANAGE_DENIED_MESSAGE);
  }
}

export function assertCanDeleteProject(role, project, userId = '') {
  if (!canDeleteProject(role, project, userId)) {
    throw new Error(DELETE_DENIED_MESSAGE);
  }
}

export function assertCanJoinProject(role, project, userId = '', membership = null) {
  if (!canJoinProject(role, project, userId, membership)) {
    throw new Error(JOIN_DENIED_MESSAGE);
  }
}

export function assertCanRequestToJoin(role, project, userId = '', membership = null) {
  if (!canRequestToJoin(role, project, userId, membership)) {
    throw new Error(REQUEST_DENIED_MESSAGE);
  }
}

export function assertCanLeaveProject(role, project, userId = '', membership = null) {
  if (!canLeaveProject(role, project, userId, membership)) {
    throw new Error(LEAVE_DENIED_MESSAGE);
  }
}

export function assertCanCancelJoinRequest(role, project, userId = '', membership = null) {
  if (!canCancelJoinRequest(role, project, userId, membership)) {
    throw new Error(CANCEL_REQUEST_DENIED_MESSAGE);
  }
}

export function assertCanApproveMembership(role, project, userId = '', membership = null) {
  if (!canApproveMembership(role, project, userId, membership)) {
    throw new Error(APPROVE_DENIED_MESSAGE);
  }
}

export function assertCanRejectMembership(role, project, userId = '', membership = null) {
  if (!canRejectMembership(role, project, userId, membership)) {
    throw new Error(REJECT_DENIED_MESSAGE);
  }
}

export function assertCanInviteMember(role, project, userId = '', membership = null) {
  if (!canInviteMember(role, project, userId, membership)) {
    throw new Error(INVITE_DENIED_MESSAGE);
  }
}

export function assertCanManageProjectTeam(role, project, userId = '', membership = null) {
  if (!canManageProjectTeam(role, project, userId, membership)) {
    throw new Error(TEAM_MANAGE_DENIED_MESSAGE);
  }
}

export function assertCanRemoveMember(
  role,
  project,
  userId = '',
  actorMembership = null,
  targetMembership = null,
) {
  if (!canRemoveMember(role, project, userId, actorMembership, targetMembership)) {
    throw new Error(REMOVE_MEMBER_DENIED_MESSAGE);
  }
}

export function assertCanAssignProjectLeader(role, project, userId = '', membership = null) {
  if (!canAssignProjectLeader(role, project, userId, membership)) {
    throw new Error(ASSIGN_LEADER_DENIED_MESSAGE);
  }
}

export function assertCanTransferProjectLeadership(role, project, userId = '', membership = null) {
  if (!canTransferProjectLeadership(role, project, userId, membership)) {
    throw new Error(TRANSFER_LEADERSHIP_DENIED_MESSAGE);
  }
}

export function assertCanUploadAttachments(role, project, userId = '', membership = null) {
  if (!canUploadAttachments(role, project, userId, membership)) {
    throw new Error(UPLOAD_DENIED_MESSAGE);
  }
}

export function assertCanUpdateProgress(role, project, userId = '', membership = null) {
  if (!canUpdateProgress(role, project, userId, membership)) {
    throw new Error(PROGRESS_DENIED_MESSAGE);
  }
}

export function assertCanAddProjectUpdate(role, project, userId = '', membership = null) {
  if (!canAddProjectUpdate(role, project, userId, membership)) {
    throw new Error(ADD_UPDATE_DENIED_MESSAGE);
  }
}

export function assertCanEditProjectUpdate(update, userId = '') {
  if (!canEditProjectUpdate(update, userId)) {
    throw new Error(EDIT_UPDATE_DENIED_MESSAGE);
  }
}

export function assertCanChangeProjectStatus(role, project, userId = '', membership = null) {
  if (!canChangeProjectStatus(role, project, userId, membership)) {
    throw new Error(STATUS_DENIED_MESSAGE);
  }
}

export function assertCanDeleteProjectAttachment(
  role,
  project,
  attachment,
  userId = '',
  membership = null,
) {
  if (!canDeleteProjectAttachment(role, project, attachment, userId, membership)) {
    throw new Error(DELETE_ATTACHMENT_DENIED_MESSAGE);
  }
}
