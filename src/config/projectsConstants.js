export const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on-hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const PROJECT_STATUS_LIST = Object.values(PROJECT_STATUS);

export const PROJECT_STATUS_OPTIONS = [
  { value: PROJECT_STATUS.PLANNING, label: 'Planning' },
  { value: PROJECT_STATUS.ACTIVE, label: 'Active' },
  { value: PROJECT_STATUS.ON_HOLD, label: 'On Hold' },
  { value: PROJECT_STATUS.COMPLETED, label: 'Completed' },
  { value: PROJECT_STATUS.CANCELLED, label: 'Cancelled' },
];

export const PROJECT_VISIBILITY = {
  OPEN: 'open',
  CLOSED: 'closed',
};

export const PROJECT_VISIBILITY_LIST = Object.values(PROJECT_VISIBILITY);

export const PROJECT_VISIBILITY_OPTIONS = [
  { value: PROJECT_VISIBILITY.OPEN, label: 'Open to Join' },
  { value: PROJECT_VISIBILITY.CLOSED, label: 'Closed' },
];

export const PROJECT_JOINING_METHOD = {
  OPEN: 'open',
  APPROVAL_REQUIRED: 'approval-required',
  INVITATION_ONLY: 'invitation-only',
};

export const PROJECT_JOINING_METHOD_LIST = Object.values(PROJECT_JOINING_METHOD);

export const PROJECT_JOINING_METHOD_OPTIONS = [
  { value: PROJECT_JOINING_METHOD.OPEN, label: 'Open Join' },
  { value: PROJECT_JOINING_METHOD.APPROVAL_REQUIRED, label: 'Approval Required' },
  { value: PROJECT_JOINING_METHOD.INVITATION_ONLY, label: 'Invitation Only' },
];

export const DEFAULT_PROJECT_JOINING_METHOD = PROJECT_JOINING_METHOD.OPEN;

export const PROJECT_MEMBERSHIP_ROLE = {
  OWNER: 'owner',
  COORDINATOR: 'coordinator',
  MEMBER: 'member',
};

export const PROJECT_MEMBERSHIP_ROLE_LIST = Object.values(PROJECT_MEMBERSHIP_ROLE);

export const PROJECT_TEAM_ROLE = {
  CREATOR: 'creator',
  LEADER: 'leader',
  PARTICIPANT: 'participant',
  TEAM_MEMBER: 'team_member',
};

export const PROJECT_TEAM_ROLE_LIST = Object.values(PROJECT_TEAM_ROLE);

export const PROJECT_MEMBERSHIP_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  REJECTED: 'rejected',
  LEFT: 'left',
};

export const PROJECT_MEMBERSHIP_STATUS_LIST = Object.values(PROJECT_MEMBERSHIP_STATUS);

export const PROJECT_UPDATE_TYPE = {
  COMMENT: 'comment',
  PROGRESS_CHANGE: 'progress-change',
  STATUS_CHANGE: 'status-change',
  MEMBER_JOINED: 'member-joined',
  MEMBER_LEFT: 'member-left',
  MEMBER_REQUESTED: 'member-requested',
  MEMBER_APPROVED: 'member-approved',
  MEMBER_REJECTED: 'member-rejected',
  LEADER_ASSIGNED: 'leader-assigned',
  LEADERSHIP_TRANSFERRED: 'leadership-transferred',
  PROJECT_CREATED: 'project-created',
  PROJECT_EDITED: 'project-edited',
  PROJECT_DELETED: 'project-deleted',
};

export const PROJECT_UPDATE_TYPE_LIST = Object.values(PROJECT_UPDATE_TYPE);

export const DEFAULT_PROJECT_STATUS = PROJECT_STATUS.PLANNING;
export const DEFAULT_PROJECT_VISIBILITY = PROJECT_VISIBILITY.OPEN;
export const DEFAULT_PROJECT_PROGRESS = 0;

export const PROJECT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const PROJECT_PRIORITY_LIST = Object.values(PROJECT_PRIORITY);

export const PROJECT_PRIORITY_OPTIONS = [
  { value: PROJECT_PRIORITY.LOW, label: 'Low' },
  { value: PROJECT_PRIORITY.MEDIUM, label: 'Medium' },
  { value: PROJECT_PRIORITY.HIGH, label: 'High' },
  { value: PROJECT_PRIORITY.CRITICAL, label: 'Critical' },
];

export const DEFAULT_PROJECT_PRIORITY = PROJECT_PRIORITY.MEDIUM;

export const PROJECT_CATEGORY = {
  MINISTRY: 'ministry',
  OUTREACH: 'outreach',
  EVENTS: 'events',
  DISCIPLESHIP: 'discipleship',
  INFRASTRUCTURE: 'infrastructure',
  OTHER: 'other',
};

export const PROJECT_CATEGORY_LIST = Object.values(PROJECT_CATEGORY);

export const PROJECT_CATEGORY_OPTIONS = [
  { value: PROJECT_CATEGORY.MINISTRY, label: 'Ministry' },
  { value: PROJECT_CATEGORY.OUTREACH, label: 'Outreach' },
  { value: PROJECT_CATEGORY.EVENTS, label: 'Events' },
  { value: PROJECT_CATEGORY.DISCIPLESHIP, label: 'Discipleship' },
  { value: PROJECT_CATEGORY.INFRASTRUCTURE, label: 'Infrastructure' },
  { value: PROJECT_CATEGORY.OTHER, label: 'Other' },
];

export const DEFAULT_PROJECT_CATEGORY = PROJECT_CATEGORY.MINISTRY;

export const MAX_PROJECT_OBJECTIVES = 10;

export const MIN_PROJECT_PROGRESS = 0;
export const MAX_PROJECT_PROGRESS = 100;

export const PROJECT_COVER_UPLOAD_TIMEOUT_MS = 30_000;
export const PROJECT_ATTACHMENT_UPLOAD_TIMEOUT_MS = 60_000;

export const PROJECT_FIRESTORE_FIELDS = [
  'title',
  'description',
  'status',
  'visibility',
  'joiningMethod',
  'progress',
  'coverUrl',
  'coverStoragePath',
  'memberCount',
  'summary',
  'priority',
  'startDate',
  'dueDate',
  'leaderName',
  'leaderUserId',
  'leaderStaffId',
  'category',
  'expectedOutcome',
  'objectives',
  'createdByUserId',
  'createdByStaffId',
  'createdByName',
  'createdAt',
  'updatedAt',
  'deletedAt',
];

export const PROJECT_MEMBERSHIP_FIRESTORE_FIELDS = [
  'projectId',
  'userId',
  'staffId',
  'memberName',
  'role',
  'status',
  'reviewedByUserId',
  'reviewedByName',
  'reviewedAt',
  'joinedAt',
  'createdAt',
  'updatedAt',
  'deletedAt',
];

export const PROJECT_UPDATE_FIRESTORE_FIELDS = [
  'projectId',
  'updateType',
  'message',
  'previousProgress',
  'newProgress',
  'previousStatus',
  'newStatus',
  'createdByUserId',
  'createdByName',
  'createdAt',
  'updatedAt',
  'deletedAt',
];

export const PROJECT_ATTACHMENT_FIRESTORE_FIELDS = [
  'projectId',
  'fileName',
  'fileUrl',
  'fileStoragePath',
  'contentType',
  'fileSizeBytes',
  'uploadedByUserId',
  'createdAt',
  'deletedAt',
];
