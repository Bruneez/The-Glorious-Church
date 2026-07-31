import { PROJECT_MEMBERSHIP_ROLE, PROJECT_MEMBERSHIP_STATUS } from '@/config/projectsConstants';
import {
  NOTIFICATION_ENTITY_TYPE,
  NOTIFICATION_TYPE,
} from '@/config/notificationOptions';
import { createNotification } from '@/services/notificationService';
import { getDocuments } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/config/collections';

function normalizeText(value) {
  return String(value || '').trim();
}

function resolveStaffDocId(staffMember = {}) {
  return normalizeText(staffMember.id);
}

function staffMatchesFirebaseUid(staffMember, firebaseUid = '') {
  const targetUid = normalizeText(firebaseUid);
  if (!targetUid) return false;

  return normalizeText(staffMember.id) === targetUid
    || normalizeText(staffMember.uid) === targetUid
    || normalizeText(staffMember.authUid) === targetUid;
}

async function getStaffDirectory() {
  return getDocuments(COLLECTIONS.STAFF);
}

async function resolveStaffDocIdsForFirebaseUids(firebaseUids = [], staffDirectory = null) {
  const staffMembers = staffDirectory || await getStaffDirectory();
  const resolved = new Set();

  firebaseUids.forEach((firebaseUid) => {
    const match = staffMembers.find((staffMember) => staffMatchesFirebaseUid(staffMember, firebaseUid));
    const staffDocId = resolveStaffDocId(match);
    if (staffDocId) resolved.add(staffDocId);
  });

  return [...resolved];
}

export async function resolveProjectManagerStaffDocIds(
  project = {},
  memberships = [],
  { excludeStaffId = '', staffDirectory = null } = {},
) {
  const staffMembers = staffDirectory || await getStaffDirectory();
  const recipientIds = new Set();

  const managerFirebaseUids = new Set([
    project.createdByUserId,
    project.leaderUserId,
  ].map(normalizeText).filter(Boolean));

  memberships
    .filter(
      (membership) => membership.role === PROJECT_MEMBERSHIP_ROLE.OWNER
        && membership.status === PROJECT_MEMBERSHIP_STATUS.ACTIVE,
    )
    .forEach((membership) => {
      if (membership.userId) managerFirebaseUids.add(normalizeText(membership.userId));
      if (membership.staffId) recipientIds.add(normalizeText(membership.staffId));
    });

  [project.createdByStaffId, project.leaderStaffId]
    .map(normalizeText)
    .filter(Boolean)
    .forEach((staffId) => recipientIds.add(staffId));

  const resolvedFromUids = await resolveStaffDocIdsForFirebaseUids(
    [...managerFirebaseUids],
    staffMembers,
  );

  resolvedFromUids.forEach((staffDocId) => recipientIds.add(staffDocId));

  const excluded = normalizeText(excludeStaffId);
  return [...recipientIds].filter((staffDocId) => staffDocId && staffDocId !== excluded);
}

async function notifyStaffRecipients({
  recipientStaffDocIds = [],
  title,
  description,
  type,
  projectId,
}) {
  if (!recipientStaffDocIds.length) return [];

  const results = await Promise.all(
    recipientStaffDocIds.map((staffDocId) => createNotification({
      userId: staffDocId,
      title,
      description,
      type,
      relatedEntityId: projectId,
      relatedEntityType: NOTIFICATION_ENTITY_TYPE.PROJECT,
    })),
  );

  return results.filter(Boolean);
}

export async function notifyProjectJoinRequest({
  project,
  memberships = [],
  requesterName = '',
  excludeStaffId = '',
}) {
  const projectTitle = normalizeText(project?.title) || 'a project';
  const requester = normalizeText(requesterName) || 'Someone';

  const recipients = await resolveProjectManagerStaffDocIds(project, memberships, {
    excludeStaffId,
  });

  return notifyStaffRecipients({
    recipientStaffDocIds: recipients,
    title: 'Project Join Request',
    description: `${requester} requested to join ${projectTitle}.`,
    type: NOTIFICATION_TYPE.PROJECT_JOIN_REQUEST,
    projectId: project.id,
  });
}

export async function notifyProjectJoinApproved({
  staffDocId = '',
  project,
  reviewerName = '',
}) {
  const normalizedStaffDocId = normalizeText(staffDocId);
  if (!normalizedStaffDocId || !project?.id) return null;

  const projectTitle = normalizeText(project.title) || 'the project';
  const reviewer = normalizeText(reviewerName) || 'A project leader';

  return createNotification({
    userId: normalizedStaffDocId,
    title: 'Project Join Approved',
    description: `${reviewer} approved your request to join ${projectTitle}.`,
    type: NOTIFICATION_TYPE.PROJECT_JOIN_APPROVED,
    relatedEntityId: project.id,
    relatedEntityType: NOTIFICATION_ENTITY_TYPE.PROJECT,
  });
}

export async function notifyProjectJoinRejected({
  staffDocId = '',
  project,
  reviewerName = '',
}) {
  const normalizedStaffDocId = normalizeText(staffDocId);
  if (!normalizedStaffDocId || !project?.id) return null;

  const projectTitle = normalizeText(project.title) || 'the project';
  const reviewer = normalizeText(reviewerName) || 'A project leader';

  return createNotification({
    userId: normalizedStaffDocId,
    title: 'Project Join Not Approved',
    description: `${reviewer} did not approve your request to join ${projectTitle}.`,
    type: NOTIFICATION_TYPE.PROJECT_JOIN_REJECTED,
    relatedEntityId: project.id,
    relatedEntityType: NOTIFICATION_ENTITY_TYPE.PROJECT,
  });
}

export async function notifyProjectLeaderAssigned({
  staffDocId = '',
  project,
  assignerName = '',
}) {
  const normalizedStaffDocId = normalizeText(staffDocId);
  if (!normalizedStaffDocId || !project?.id) return null;

  const projectTitle = normalizeText(project.title) || 'a project';
  const assigner = normalizeText(assignerName) || 'A project leader';

  return createNotification({
    userId: normalizedStaffDocId,
    title: 'Assigned as Project Leader',
    description: `${assigner} assigned you as leader of ${projectTitle}.`,
    type: NOTIFICATION_TYPE.PROJECT_LEADER_ASSIGNED,
    relatedEntityId: project.id,
    relatedEntityType: NOTIFICATION_ENTITY_TYPE.PROJECT,
  });
}

export async function notifyProjectStatusChanged({
  project,
  memberships = [],
  previousStatus = '',
  nextStatus = '',
  actorName = '',
  excludeStaffId = '',
}) {
  if (!project?.id || previousStatus === nextStatus) return [];

  const projectTitle = normalizeText(project.title) || 'A project';
  const actor = normalizeText(actorName) || 'A team member';
  const recipients = await resolveProjectManagerStaffDocIds(project, memberships, {
    excludeStaffId,
  });

  return notifyStaffRecipients({
    recipientStaffDocIds: recipients,
    title: 'Project Status Updated',
    description: `${actor} changed ${projectTitle} from ${previousStatus || 'unknown'} to ${nextStatus}.`,
    type: NOTIFICATION_TYPE.PROJECT_STATUS_CHANGED,
    projectId: project.id,
  });
}
