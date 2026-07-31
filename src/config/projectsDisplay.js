import {
  DEFAULT_PROJECT_PRIORITY,
  PROJECT_CATEGORY_OPTIONS,
  PROJECT_JOINING_METHOD_OPTIONS,
  PROJECT_MEMBERSHIP_ROLE,
  PROJECT_MEMBERSHIP_STATUS,
  PROJECT_PRIORITY,
  PROJECT_PRIORITY_LIST,
  PROJECT_PRIORITY_OPTIONS,
  PROJECT_STATUS,
  PROJECT_STATUS_OPTIONS,
  PROJECT_TEAM_ROLE,
  PROJECT_UPDATE_TYPE,
} from './projectsConstants.js';
import {
  filterProjects,
  isProjectAttachmentDeleted,
  isProjectDeleted,
  isProjectMembershipActive,
  isProjectMembershipDeleted,
  isProjectMembershipPending,
  isProjectMembershipRejected,
  isProjectUpdateDeleted,
  PROJECT_SUMMARY_MAX_LENGTH,
  resolveJoiningMethod,
} from './projectsOptions.js';
import {
  canCancelJoinRequest,
  canJoinProject,
  canLeaveProject,
  canRequestToJoin,
  isProjectLeader,
} from '../services/projectGuards.js';

export { PROJECT_SUMMARY_MAX_LENGTH };

export const PROJECT_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  ...PROJECT_STATUS_OPTIONS,
];

export const PROJECT_PRIORITY_FILTER_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  ...PROJECT_PRIORITY_OPTIONS,
];

export const PROJECT_SORT_OPTIONS = [
  { value: 'updated-desc', label: 'Recently Updated' },
  { value: 'updated-asc', label: 'Oldest Updated' },
  { value: 'title-asc', label: 'Title A–Z' },
  { value: 'title-desc', label: 'Title Z–A' },
  { value: 'due-date-asc', label: 'Due Date (Soonest)' },
  { value: 'due-date-desc', label: 'Due Date (Latest)' },
  { value: 'priority-desc', label: 'Priority (High First)' },
  { value: 'progress-desc', label: 'Progress (High First)' },
];

const PROJECT_PRIORITY_SORT_WEIGHT = {
  [PROJECT_PRIORITY.CRITICAL]: 4,
  [PROJECT_PRIORITY.HIGH]: 3,
  [PROJECT_PRIORITY.MEDIUM]: 2,
  [PROJECT_PRIORITY.LOW]: 1,
};

const STATUS_BADGE_CLASSES = {
  [PROJECT_STATUS.PLANNING]: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  [PROJECT_STATUS.ACTIVE]: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  [PROJECT_STATUS.ON_HOLD]: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  [PROJECT_STATUS.COMPLETED]: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  [PROJECT_STATUS.CANCELLED]: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
};

const PRIORITY_BADGE_CLASSES = {
  [PROJECT_PRIORITY.CRITICAL]: 'bg-rose-950/60 text-rose-400 border-rose-500/20',
  [PROJECT_PRIORITY.HIGH]: 'bg-amber-950/60 text-amber-400 border-amber-500/20',
  [PROJECT_PRIORITY.MEDIUM]: 'bg-indigo-950/60 text-indigo-400 border-indigo-500/20',
  [PROJECT_PRIORITY.LOW]: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

const PARTICIPATION_BADGE_CLASSES = {
  owner: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  coordinator: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  member: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  leader: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  pending: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  rejected: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  not_joined: 'bg-slate-500/10 text-slate-400 border-slate-600/40',
};

export const PROJECT_TILE_STATE = {
  JOIN: 'join',
  REQUEST: 'request',
  PENDING: 'pending',
  JOINED: 'joined',
  PROJECT_LEADER: 'project_leader',
};

function normalizeText(value) {
  return String(value ?? '').trim();
}

function parseProjectDate(value) {
  const text = normalizeText(value);
  if (!text) return null;

  const parsed = Date.parse(text);
  if (Number.isNaN(parsed)) return null;

  const date = new Date(parsed);
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfToday(today = new Date()) {
  const date = new Date(today);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function normalizeProjectPriority(value) {
  const normalized = normalizeText(value).toLowerCase();
  return PROJECT_PRIORITY_LIST.includes(normalized)
    ? normalized
    : DEFAULT_PROJECT_PRIORITY;
}

export function getProjectPriorityLabel(priority) {
  const normalized = normalizeProjectPriority(priority);
  return PROJECT_PRIORITY_OPTIONS.find((option) => option.value === normalized)?.label
    || 'Medium';
}

export function getProjectJoiningMethodLabel(project) {
  const method = resolveJoiningMethod(project);
  return PROJECT_JOINING_METHOD_OPTIONS.find((option) => option.value === method)?.label
    || 'Open Join';
}

export function getProjectCategoryLabel(category) {
  const normalized = normalizeText(category);
  return PROJECT_CATEGORY_OPTIONS.find((option) => option.value === normalized)?.label
    || normalized
    || 'Other';
}

const MEMBERSHIP_ROLE_LABELS = {
  [PROJECT_MEMBERSHIP_ROLE.OWNER]: 'Leader',
  [PROJECT_MEMBERSHIP_ROLE.COORDINATOR]: 'Participant',
  [PROJECT_MEMBERSHIP_ROLE.MEMBER]: 'Team Member',
};

const PROJECT_TEAM_ROLE_LABELS = {
  [PROJECT_TEAM_ROLE.CREATOR]: 'Creator',
  [PROJECT_TEAM_ROLE.LEADER]: 'Leader',
  [PROJECT_TEAM_ROLE.PARTICIPANT]: 'Participant',
  [PROJECT_TEAM_ROLE.TEAM_MEMBER]: 'Team Member',
};

const PROJECT_TEAM_ROLE_BADGE_CLASSES = {
  [PROJECT_TEAM_ROLE.CREATOR]: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  [PROJECT_TEAM_ROLE.LEADER]: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  [PROJECT_TEAM_ROLE.PARTICIPANT]: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  [PROJECT_TEAM_ROLE.TEAM_MEMBER]: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
};

const MEMBERSHIP_STATUS_LABELS = {
  [PROJECT_MEMBERSHIP_STATUS.ACTIVE]: 'Active',
  [PROJECT_MEMBERSHIP_STATUS.PENDING]: 'Pending',
  [PROJECT_MEMBERSHIP_STATUS.REJECTED]: 'Rejected',
  [PROJECT_MEMBERSHIP_STATUS.LEFT]: 'Left',
};

export function getProjectMembershipRoleLabel(role) {
  return MEMBERSHIP_ROLE_LABELS[normalizeText(role)] || 'Member';
}

export function getProjectMembershipStatusLabel(status) {
  return MEMBERSHIP_STATUS_LABELS[normalizeText(status)] || normalizeText(status) || 'Unknown';
}

const TEAM_ROLE_ORDER = {
  [PROJECT_MEMBERSHIP_ROLE.OWNER]: 0,
  [PROJECT_MEMBERSHIP_ROLE.COORDINATOR]: 1,
  [PROJECT_MEMBERSHIP_ROLE.MEMBER]: 2,
};

export function sortProjectTeamMembers(memberships = []) {
  return [...memberships].sort((left, right) => {
    const leftOrder = TEAM_ROLE_ORDER[normalizeText(left.role)] ?? 3;
    const rightOrder = TEAM_ROLE_ORDER[normalizeText(right.role)] ?? 3;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;

    return normalizeText(left.memberName).localeCompare(normalizeText(right.memberName));
  });
}

export function getActiveProjectTeamMembers(memberships = []) {
  return sortProjectTeamMembers(
    memberships.filter(
      (membership) => !isProjectMembershipDeleted(membership)
        && isProjectMembershipActive(membership),
    ),
  );
}

export function getPendingProjectMemberships(memberships = []) {
  return [...memberships]
    .filter(
      (membership) => !isProjectMembershipDeleted(membership)
        && isProjectMembershipPending(membership),
    )
    .sort((left, right) => (
      getProjectTimelineTimestamp(right.createdAt) - getProjectTimelineTimestamp(left.createdAt)
    ));
}

function isProjectLeaderUser(userId, project) {
  const leaderId = normalizeText(project?.leaderUserId);
  const currentUserId = normalizeText(userId);
  return Boolean(leaderId && currentUserId && leaderId === currentUserId);
}

export function resolveProjectTeamRole(project, membership, userId = '') {
  const memberUserId = normalizeText(membership?.userId || userId);

  if (memberUserId && isProjectCreator(memberUserId, project)) {
    return {
      key: PROJECT_TEAM_ROLE.CREATOR,
      label: PROJECT_TEAM_ROLE_LABELS[PROJECT_TEAM_ROLE.CREATOR],
      badgeClass: PROJECT_TEAM_ROLE_BADGE_CLASSES[PROJECT_TEAM_ROLE.CREATOR],
    };
  }

  if (
    membership?.role === PROJECT_MEMBERSHIP_ROLE.OWNER
    || isProjectLeaderUser(memberUserId, project)
  ) {
    return {
      key: PROJECT_TEAM_ROLE.LEADER,
      label: PROJECT_TEAM_ROLE_LABELS[PROJECT_TEAM_ROLE.LEADER],
      badgeClass: PROJECT_TEAM_ROLE_BADGE_CLASSES[PROJECT_TEAM_ROLE.LEADER],
    };
  }

  if (membership?.role === PROJECT_MEMBERSHIP_ROLE.COORDINATOR) {
    return {
      key: PROJECT_TEAM_ROLE.PARTICIPANT,
      label: PROJECT_TEAM_ROLE_LABELS[PROJECT_TEAM_ROLE.PARTICIPANT],
      badgeClass: PROJECT_TEAM_ROLE_BADGE_CLASSES[PROJECT_TEAM_ROLE.PARTICIPANT],
    };
  }

  return {
    key: PROJECT_TEAM_ROLE.TEAM_MEMBER,
    label: PROJECT_TEAM_ROLE_LABELS[PROJECT_TEAM_ROLE.TEAM_MEMBER],
    badgeClass: PROJECT_TEAM_ROLE_BADGE_CLASSES[PROJECT_TEAM_ROLE.TEAM_MEMBER],
  };
}

export function getProjectTeamRoleLabel(project, membership, userId = '') {
  return resolveProjectTeamRole(project, membership, userId).label;
}

export function getProjectTeamRoleBadgeClass(project, membership, userId = '') {
  return resolveProjectTeamRole(project, membership, userId).badgeClass;
}

export const PROJECT_TIMELINE_KIND = {
  UPDATE: 'update',
  ATTACHMENT: 'attachment',
};

const TIMELINE_TYPE_LABELS = {
  [PROJECT_UPDATE_TYPE.COMMENT]: 'Update',
  [PROJECT_UPDATE_TYPE.PROGRESS_CHANGE]: 'Progress Change',
  [PROJECT_UPDATE_TYPE.STATUS_CHANGE]: 'Status Change',
  [PROJECT_UPDATE_TYPE.MEMBER_JOINED]: 'Member Joined',
  [PROJECT_UPDATE_TYPE.MEMBER_LEFT]: 'Member Left',
  [PROJECT_UPDATE_TYPE.MEMBER_REQUESTED]: 'Join Request',
  [PROJECT_UPDATE_TYPE.MEMBER_APPROVED]: 'Join Approved',
  [PROJECT_UPDATE_TYPE.MEMBER_REJECTED]: 'Join Rejected',
  [PROJECT_UPDATE_TYPE.LEADER_ASSIGNED]: 'Leader Assigned',
  [PROJECT_UPDATE_TYPE.LEADERSHIP_TRANSFERRED]: 'Leadership Transferred',
  [PROJECT_UPDATE_TYPE.PROJECT_CREATED]: 'Project Created',
  [PROJECT_UPDATE_TYPE.PROJECT_EDITED]: 'Project Edited',
  [PROJECT_UPDATE_TYPE.PROJECT_DELETED]: 'Project Deleted',
};

const TIMELINE_TYPE_TONES = {
  [PROJECT_UPDATE_TYPE.COMMENT]: 'text-slate-300',
  [PROJECT_UPDATE_TYPE.PROGRESS_CHANGE]: 'text-indigo-300',
  [PROJECT_UPDATE_TYPE.STATUS_CHANGE]: 'text-sky-300',
  [PROJECT_UPDATE_TYPE.MEMBER_JOINED]: 'text-emerald-300',
  [PROJECT_UPDATE_TYPE.MEMBER_LEFT]: 'text-slate-400',
  [PROJECT_UPDATE_TYPE.MEMBER_REQUESTED]: 'text-amber-300',
  [PROJECT_UPDATE_TYPE.MEMBER_APPROVED]: 'text-emerald-300',
  [PROJECT_UPDATE_TYPE.MEMBER_REJECTED]: 'text-rose-300',
  [PROJECT_UPDATE_TYPE.LEADER_ASSIGNED]: 'text-sky-300',
  [PROJECT_UPDATE_TYPE.LEADERSHIP_TRANSFERRED]: 'text-violet-300',
  [PROJECT_UPDATE_TYPE.PROJECT_CREATED]: 'text-emerald-300',
  [PROJECT_UPDATE_TYPE.PROJECT_EDITED]: 'text-indigo-300',
  [PROJECT_UPDATE_TYPE.PROJECT_DELETED]: 'text-rose-300',
  attachment: 'text-violet-300',
};

export function getProjectTimelineTimestamp(value) {
  if (!value) return 0;

  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function formatProjectTimelineDate(value) {
  const timestamp = getProjectTimelineTimestamp(value);
  if (!timestamp) return '—';

  return new Date(timestamp).toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getProjectTimelineTypeLabel(item) {
  if (item?.kind === PROJECT_TIMELINE_KIND.ATTACHMENT) return 'Attachment';
  return TIMELINE_TYPE_LABELS[normalizeText(item?.updateType)] || 'Activity';
}

export function getProjectTimelineToneClass(item) {
  if (item?.kind === PROJECT_TIMELINE_KIND.ATTACHMENT) {
    return TIMELINE_TYPE_TONES.attachment;
  }

  return TIMELINE_TYPE_TONES[normalizeText(item?.updateType)] || 'text-slate-300';
}

export function getProjectTimelineMessage(item) {
  if (item?.kind === PROJECT_TIMELINE_KIND.ATTACHMENT) {
    return `Uploaded ${item.fileName || 'a file'}.`;
  }

  const message = normalizeText(item?.message);
  if (message) return message;

  const type = normalizeText(item?.updateType);
  if (type === PROJECT_UPDATE_TYPE.PROGRESS_CHANGE) {
    return `Progress changed from ${item.previousProgress ?? 0}% to ${item.newProgress ?? 0}%.`;
  }

  if (type === PROJECT_UPDATE_TYPE.STATUS_CHANGE) {
    return `Status changed from ${getProjectStatusLabel(item.previousStatus)} to ${getProjectStatusLabel(item.newStatus)}.`;
  }

  return getProjectTimelineTypeLabel(item);
}

export function buildProjectTimelineItems(updates = [], attachments = []) {
  const updateItems = updates
    .filter((update) => !isProjectUpdateDeleted(update))
    .map((update) => ({
      kind: PROJECT_TIMELINE_KIND.UPDATE,
      id: `update-${update.id}`,
      sourceId: update.id,
      updateType: update.updateType,
      message: update.message,
      previousProgress: update.previousProgress,
      newProgress: update.newProgress,
      previousStatus: update.previousStatus,
      newStatus: update.newStatus,
      createdByUserId: update.createdByUserId,
      createdByName: update.createdByName,
      createdAt: update.createdAt,
      updatedAt: update.updatedAt,
      sortTime: getProjectTimelineTimestamp(update.updatedAt || update.createdAt),
    }));

  const attachmentItems = attachments
    .filter((attachment) => !isProjectAttachmentDeleted(attachment))
    .map((attachment) => ({
      kind: PROJECT_TIMELINE_KIND.ATTACHMENT,
      id: `attachment-${attachment.id}`,
      sourceId: attachment.id,
      fileName: attachment.fileName,
      fileUrl: attachment.fileUrl,
      contentType: attachment.contentType,
      uploadedByUserId: attachment.uploadedByUserId,
      createdAt: attachment.createdAt,
      sortTime: getProjectTimelineTimestamp(attachment.createdAt),
    }));

  return [...updateItems, ...attachmentItems].sort((left, right) => right.sortTime - left.sortTime);
}

export function isProjectImageAttachment(attachment) {
  const contentType = String(attachment?.contentType || '').trim().toLowerCase();
  if (contentType.startsWith('image/')) return true;
  return /\.(jpe?g|png|webp)$/i.test(String(attachment?.fileName || ''));
}

export function isProjectPdfAttachment(attachment) {
  const contentType = String(attachment?.contentType || '').trim().toLowerCase();
  if (contentType === 'application/pdf') return true;
  return /\.pdf$/i.test(String(attachment?.fileName || ''));
}

export function formatProjectAttachmentSize(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return '—';

  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

export function getProjectStatusLabel(status) {
  const normalized = normalizeText(status);
  return PROJECT_STATUS_OPTIONS.find((option) => option.value === normalized)?.label
    || normalized
    || 'Unknown';
}

export function getProjectStatusBadgeClass(status) {
  return STATUS_BADGE_CLASSES[normalizeText(status)] || STATUS_BADGE_CLASSES[PROJECT_STATUS.PLANNING];
}

export function getProjectPriorityBadgeClass(priority) {
  return PRIORITY_BADGE_CLASSES[normalizeProjectPriority(priority)]
    || PRIORITY_BADGE_CLASSES[PROJECT_PRIORITY.MEDIUM];
}

export function getProjectCoverUrl(project) {
  const url = normalizeText(project?.coverUrl);
  if (!url || url.startsWith('blob:') || url.startsWith('data:')) return '';
  return url;
}

export function getProjectLeaderName(project) {
  return normalizeText(project?.leaderName)
    || normalizeText(project?.createdByName)
    || 'Unassigned';
}

export function getProjectDueDate(project) {
  return normalizeText(project?.dueDate)
    || normalizeText(project?.targetCompletionDate)
    || '';
}

export function truncateProjectSummary(value, maxLength = PROJECT_SUMMARY_MAX_LENGTH) {
  const text = normalizeText(value);
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export function getProjectSummary(project) {
  return truncateProjectSummary(
    project?.summary
    || project?.shortSummary
    || project?.description
    || '',
  );
}

export function isProjectOverdue(project, { today = new Date() } = {}) {
  if (!project || isProjectDeleted(project)) return false;

  const status = normalizeText(project.status);
  if (status === PROJECT_STATUS.COMPLETED || status === PROJECT_STATUS.CANCELLED) {
    return false;
  }

  const dueDate = parseProjectDate(getProjectDueDate(project));
  if (!dueDate) return false;

  return dueDate.getTime() < startOfToday(today).getTime();
}

export function isProjectCreator(userId, project) {
  const ownerId = normalizeText(project?.createdByUserId);
  const currentUserId = normalizeText(userId);
  return Boolean(ownerId && currentUserId && ownerId === currentUserId);
}

export function resolveProjectParticipation(project, membership, userId = '') {
  if (membership && isProjectMembershipPending(membership)) {
    return {
      key: 'pending',
      label: 'Pending',
      badgeClass: PARTICIPATION_BADGE_CLASSES.pending,
    };
  }

  if (membership && isProjectMembershipRejected(membership)) {
    return {
      key: 'rejected',
      label: 'Request Rejected',
      badgeClass: PARTICIPATION_BADGE_CLASSES.rejected,
    };
  }

  if (membership && isProjectMembershipActive(membership)) {
    const role = normalizeText(membership.role);

    if (isProjectLeader(project, userId, membership)) {
      return {
        key: 'leader',
        label: 'Project Leader',
        badgeClass: PARTICIPATION_BADGE_CLASSES.leader,
      };
    }

    if (role === PROJECT_MEMBERSHIP_ROLE.OWNER) {
      return {
        key: 'owner',
        label: 'Project Leader',
        badgeClass: PARTICIPATION_BADGE_CLASSES.leader,
      };
    }

    if (role === PROJECT_MEMBERSHIP_ROLE.COORDINATOR) {
      return {
        key: 'coordinator',
        label: 'Coordinator',
        badgeClass: PARTICIPATION_BADGE_CLASSES.coordinator,
      };
    }

    return {
      key: 'member',
      label: 'Joined',
      badgeClass: PARTICIPATION_BADGE_CLASSES.member,
    };
  }

  if (isProjectLeader(project, userId, membership)) {
    return {
      key: 'leader',
      label: 'Project Leader',
      badgeClass: PARTICIPATION_BADGE_CLASSES.leader,
    };
  }

  return {
    key: 'not_joined',
    label: 'Not Joined',
    badgeClass: PARTICIPATION_BADGE_CLASSES.not_joined,
  };
}

export function resolveProjectTileState(project, membership, userId = '', { role = '' } = {}) {
  if (isProjectLeader(project, userId, membership)
    && membership
    && isProjectMembershipActive(membership)) {
    return {
      key: PROJECT_TILE_STATE.PROJECT_LEADER,
      label: 'Project Leader',
      action: null,
      canLeave: false,
    };
  }

  if (membership && isProjectMembershipActive(membership)) {
    return {
      key: PROJECT_TILE_STATE.JOINED,
      label: 'Joined',
      action: 'leave',
      canLeave: canLeaveProject(role, project, userId, membership),
    };
  }

  if (membership && isProjectMembershipPending(membership)) {
    return {
      key: PROJECT_TILE_STATE.PENDING,
      label: 'Pending',
      action: 'cancel',
      canCancel: canCancelJoinRequest(role, project, userId, membership),
    };
  }

  if (canJoinProject(role, project, userId, membership)) {
    return {
      key: PROJECT_TILE_STATE.JOIN,
      label: 'Join',
      action: 'join',
    };
  }

  if (canRequestToJoin(role, project, userId, membership)) {
    return {
      key: PROJECT_TILE_STATE.REQUEST,
      label: 'Request',
      action: 'request',
    };
  }

  return null;
}

export function buildProjectsDashboardSummary(projects = [], { memberships = [], userId = '' } = {}) {
  const visibleProjects = projects.filter((project) => !isProjectDeleted(project));
  const activeMemberships = memberships.filter(
    (membership) => !isProjectMembershipDeleted(membership) && isProjectMembershipActive(membership),
  );
  const joinedProjectIds = new Set(activeMemberships.map((membership) => membership.projectId));

  const joinedProjects = visibleProjects.filter((project) => joinedProjectIds.has(project.id)).length;

  return {
    total: visibleProjects.length,
    active: visibleProjects.filter((project) => project.status === PROJECT_STATUS.ACTIVE).length,
    planning: visibleProjects.filter((project) => project.status === PROJECT_STATUS.PLANNING).length,
    onHold: visibleProjects.filter((project) => project.status === PROJECT_STATUS.ON_HOLD).length,
    completed: visibleProjects.filter((project) => project.status === PROJECT_STATUS.COMPLETED).length,
    overdue: visibleProjects.filter((project) => isProjectOverdue(project)).length,
    joined: joinedProjects,
    userId,
  };
}

export function getProjectsDashboardSummaryCards(summary = {}) {
  return [
    { key: 'total', label: 'Total Projects', value: summary.total ?? 0 },
    { key: 'active', label: 'Active', value: summary.active ?? 0 },
    { key: 'planning', label: 'Planning', value: summary.planning ?? 0 },
    { key: 'onHold', label: 'On Hold', value: summary.onHold ?? 0 },
    { key: 'completed', label: 'Completed', value: summary.completed ?? 0 },
    {
      key: 'overdue',
      label: 'Overdue',
      value: summary.overdue ?? 0,
      highlight: Number(summary.overdue || 0) > 0,
    },
    { key: 'joined', label: 'Joined Projects', value: summary.joined ?? 0 },
  ];
}

export function filterProjectsForDashboard(
  projects = [],
  {
    searchTerm = '',
    statusFilter = 'all',
    priorityFilter = 'all',
    sortBy = 'updated-desc',
  } = {},
) {
  const normalizedStatus = normalizeText(statusFilter);
  const normalizedPriority = normalizeText(priorityFilter).toLowerCase();

  const filtered = filterProjects(projects, {
    searchTerm,
    statusFilter: normalizedStatus === 'all' ? '' : normalizedStatus,
  }).filter((project) => {
    if (!normalizedPriority || normalizedPriority === 'all') return true;
    return normalizeProjectPriority(project.priority) === normalizedPriority;
  });

  return sortProjectsForDashboard(filtered, sortBy);
}

function getProjectUpdatedTimestamp(project) {
  return Number(project.updatedAt?.toDate?.()?.getTime?.()
    || Date.parse(project.updatedAt || 0)
    || 0);
}

function getProjectDueTimestamp(project) {
  return Number(parseProjectDate(project.dueDate)?.getTime?.() || 0);
}

function getProjectPriorityWeight(project) {
  return PROJECT_PRIORITY_SORT_WEIGHT[normalizeProjectPriority(project.priority)] || 0;
}

export function sortProjectsForDashboard(projects = [], sortBy = 'updated-desc') {
  const list = [...projects];

  switch (sortBy) {
    case 'updated-asc':
      return list.sort((left, right) => getProjectUpdatedTimestamp(left) - getProjectUpdatedTimestamp(right));
    case 'title-asc':
      return list.sort((left, right) => normalizeText(left.title).localeCompare(normalizeText(right.title)));
    case 'title-desc':
      return list.sort((left, right) => normalizeText(right.title).localeCompare(normalizeText(left.title)));
    case 'due-date-asc':
      return list.sort((left, right) => {
        const leftDue = getProjectDueTimestamp(left);
        const rightDue = getProjectDueTimestamp(right);
        if (!leftDue && !rightDue) return 0;
        if (!leftDue) return 1;
        if (!rightDue) return -1;
        return leftDue - rightDue;
      });
    case 'due-date-desc':
      return list.sort((left, right) => getProjectDueTimestamp(right) - getProjectDueTimestamp(left));
    case 'priority-desc':
      return list.sort((left, right) => getProjectPriorityWeight(right) - getProjectPriorityWeight(left));
    case 'progress-desc':
      return list.sort((left, right) => Number(right.progress || 0) - Number(left.progress || 0));
    case 'updated-desc':
    default:
      return list.sort((left, right) => getProjectUpdatedTimestamp(right) - getProjectUpdatedTimestamp(left));
  }
}

export function enrichProjectForDisplay(project, { membership = null, userId = '', role = '' } = {}) {
  return {
    ...project,
    membership,
    leaderName: getProjectLeaderName(project),
    summaryText: getProjectSummary(project),
    dueDateText: getProjectDueDate(project),
    priorityLabel: getProjectPriorityLabel(project.priority),
    statusLabel: getProjectStatusLabel(project.status),
    participation: resolveProjectParticipation(project, membership, userId),
    tileState: resolveProjectTileState(project, membership, userId, { role }),
    overdue: isProjectOverdue(project),
    progressValue: Number.isFinite(Number(project.progress)) ? Number(project.progress) : 0,
    memberCountValue: Number.isFinite(Number(project.memberCount)) ? Number(project.memberCount) : 0,
  };
}
