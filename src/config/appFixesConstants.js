export const APP_FIX_STATUS = {
  OPEN: 'open',
  IN_REVIEW: 'in-review',
  IN_PROGRESS: 'in-progress',
  WAITING_FOR_USER: 'waiting-for-user',
  TESTING: 'testing',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  CLOSED: 'closed',
};

export const APP_FIX_STATUS_LIST = Object.values(APP_FIX_STATUS);

export const APP_FIX_STATUS_OPTIONS = [
  { value: APP_FIX_STATUS.OPEN, label: 'Open' },
  { value: APP_FIX_STATUS.IN_REVIEW, label: 'In Review' },
  { value: APP_FIX_STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: APP_FIX_STATUS.WAITING_FOR_USER, label: 'Waiting for User' },
  { value: APP_FIX_STATUS.TESTING, label: 'Testing' },
  { value: APP_FIX_STATUS.RESOLVED, label: 'Resolved' },
  { value: APP_FIX_STATUS.REJECTED, label: 'Rejected' },
  { value: APP_FIX_STATUS.CLOSED, label: 'Closed' },
];

export const APP_FIX_COMPLETED_STATUSES = [
  APP_FIX_STATUS.RESOLVED,
  APP_FIX_STATUS.CLOSED,
];

export const APP_FIX_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const APP_FIX_PRIORITY_LIST = Object.values(APP_FIX_PRIORITY);

export const APP_FIX_PRIORITY_OPTIONS = [
  { value: APP_FIX_PRIORITY.LOW, label: 'Low' },
  { value: APP_FIX_PRIORITY.MEDIUM, label: 'Medium' },
  { value: APP_FIX_PRIORITY.HIGH, label: 'High' },
  { value: APP_FIX_PRIORITY.URGENT, label: 'Urgent' },
];

export const APP_FIX_CATEGORY = {
  BUG: 'bug',
  UI: 'ui-issue',
  DATA: 'data-issue',
  PERFORMANCE: 'performance',
  ACCESS: 'access-login',
  FEATURE: 'feature-request',
  OTHER: 'other',
};

export const APP_FIX_CATEGORY_LIST = Object.values(APP_FIX_CATEGORY);

export const APP_FIX_CATEGORY_OPTIONS = [
  { value: APP_FIX_CATEGORY.BUG, label: 'Bug / Error' },
  { value: APP_FIX_CATEGORY.UI, label: 'UI / Layout' },
  { value: APP_FIX_CATEGORY.DATA, label: 'Data Issue' },
  { value: APP_FIX_CATEGORY.PERFORMANCE, label: 'Performance' },
  { value: APP_FIX_CATEGORY.ACCESS, label: 'Access / Login' },
  { value: APP_FIX_CATEGORY.FEATURE, label: 'Feature Request' },
  { value: APP_FIX_CATEGORY.OTHER, label: 'Other' },
];

export const APP_FIX_DEVICE_TYPE = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  TABLET: 'tablet',
  OTHER: 'other',
};

export const APP_FIX_DEVICE_TYPE_LIST = Object.values(APP_FIX_DEVICE_TYPE);

export const APP_FIX_DEVICE_TYPE_OPTIONS = [
  { value: APP_FIX_DEVICE_TYPE.DESKTOP, label: 'Desktop' },
  { value: APP_FIX_DEVICE_TYPE.MOBILE, label: 'Mobile' },
  { value: APP_FIX_DEVICE_TYPE.TABLET, label: 'Tablet' },
  { value: APP_FIX_DEVICE_TYPE.OTHER, label: 'Other' },
];

export const APP_FIX_BROWSER_MODE = {
  CHROME: 'chrome',
  SAFARI: 'safari',
  FIREFOX: 'firefox',
  EDGE: 'edge',
  IN_APP: 'in-app',
  OTHER: 'other',
};

export const APP_FIX_BROWSER_MODE_LIST = Object.values(APP_FIX_BROWSER_MODE);

export const APP_FIX_BROWSER_MODE_OPTIONS = [
  { value: APP_FIX_BROWSER_MODE.CHROME, label: 'Chrome' },
  { value: APP_FIX_BROWSER_MODE.SAFARI, label: 'Safari' },
  { value: APP_FIX_BROWSER_MODE.FIREFOX, label: 'Firefox' },
  { value: APP_FIX_BROWSER_MODE.EDGE, label: 'Edge' },
  { value: APP_FIX_BROWSER_MODE.IN_APP, label: 'In-App Browser' },
  { value: APP_FIX_BROWSER_MODE.OTHER, label: 'Other' },
];

export const APP_FIX_UPDATE_TYPE = {
  COMMENT: 'comment',
  STATUS_CHANGE: 'status-change',
  PRIORITY_CHANGE: 'priority-change',
  ASSIGNMENT: 'assignment',
};

export const APP_FIX_GROUP_MODES = {
  ALL: 'all',
  BY_STATUS: 'by-status',
  BY_USER: 'by-user',
  USER_GROUPS: 'user-groups',
};

export const APP_FIX_GROUP_MODE_OPTIONS = [
  { value: APP_FIX_GROUP_MODES.ALL, label: 'All Requests' },
  { value: APP_FIX_GROUP_MODES.BY_STATUS, label: 'Group by Status' },
  { value: APP_FIX_GROUP_MODES.BY_USER, label: 'Group by User' },
  { value: APP_FIX_GROUP_MODES.USER_GROUPS, label: 'User Groups' },
];

export const APP_FIX_UPDATE_TYPE_LIST = Object.values(APP_FIX_UPDATE_TYPE);

export const APP_FIX_USER_EDITABLE_STATUSES = [
  APP_FIX_STATUS.OPEN,
  APP_FIX_STATUS.WAITING_FOR_USER,
];

export const DEFAULT_APP_FIX_STATUS = APP_FIX_STATUS.OPEN;
export const DEFAULT_APP_FIX_PRIORITY = APP_FIX_PRIORITY.MEDIUM;

export const APP_FIX_REQUEST_FIRESTORE_FIELDS = [
  'title',
  'description',
  'stepsToReproduce',
  'errorMessage',
  'pageUrl',
  'affectedModule',
  'customCategory',
  'referenceNumber',
  'attachmentCount',
  'status',
  'priority',
  'category',
  'deviceType',
  'browserMode',
  'assignedToUserId',
  'assignedToName',
  'internalNotes',
  'developerNotes',
  'resolutionSummary',
  'createdByUserId',
  'createdByStaffId',
  'createdByName',
  'createdAt',
  'updatedAt',
  'deletedAt',
];

export const APP_FIX_UPDATE_FIRESTORE_FIELDS = [
  'requestId',
  'updateType',
  'message',
  'previousStatus',
  'newStatus',
  'previousPriority',
  'newPriority',
  'assignedToUserId',
  'assignedToName',
  'isInternal',
  'createdByUserId',
  'createdByName',
  'createdAt',
  'deletedAt',
];

export const APP_FIX_ATTACHMENT_FIRESTORE_FIELDS = [
  'requestId',
  'fileName',
  'fileUrl',
  'fileStoragePath',
  'contentType',
  'fileSizeBytes',
  'uploadedByUserId',
  'createdAt',
  'deletedAt',
];
