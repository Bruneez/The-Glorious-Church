import {
  APP_FIX_COMPLETED_STATUSES,
  APP_FIX_GROUP_MODES,
  APP_FIX_PRIORITY,
  APP_FIX_STATUS,
  APP_FIX_STATUS_OPTIONS,
} from './appFixesConstants.js';
import { getAppFixAffectedModuleLabel } from './appFixesOptions.js';
import { buildAppFixReferenceNumber } from './appFixesOptions.js';
import { filterAppFixRequests } from './appFixesRequestOptions.js';

function toMillis(value) {
  if (!value) return 0;
  if (typeof value?.toDate === 'function') return value.toDate().getTime() || 0;
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
}

export const APP_FIX_MANAGEMENT_ACTIONS = {
  REVIEW: {
    status: APP_FIX_STATUS.IN_REVIEW,
    label: 'Review',
    message: 'Request moved to review.',
  },
  PROGRESS: {
    status: APP_FIX_STATUS.IN_PROGRESS,
    label: 'In Progress',
    message: 'Request moved to in progress.',
  },
  WAITING: {
    status: APP_FIX_STATUS.WAITING_FOR_USER,
    label: 'Waiting',
    message: 'Waiting for user response.',
  },
  TESTING: {
    status: APP_FIX_STATUS.TESTING,
    label: 'Testing',
    message: 'Request moved to testing.',
  },
  COMPLETED: {
    status: APP_FIX_STATUS.RESOLVED,
    label: 'Completed',
    message: 'Request marked as completed.',
  },
  REOPEN: {
    status: APP_FIX_STATUS.OPEN,
    label: 'Reopen',
    message: 'Request reopened.',
  },
  REJECTED: {
    status: APP_FIX_STATUS.REJECTED,
    label: 'Rejected',
    message: 'Request rejected.',
  },
};

export function buildAppFixDashboardSummary(requests = []) {
  const list = Array.isArray(requests) ? requests : [];

  return {
    total: list.length,
    open: list.filter((request) => request.status === APP_FIX_STATUS.OPEN).length,
    inReview: list.filter((request) => request.status === APP_FIX_STATUS.IN_REVIEW).length,
    inProgress: list.filter((request) => request.status === APP_FIX_STATUS.IN_PROGRESS).length,
    completed: list.filter((request) => APP_FIX_COMPLETED_STATUSES.includes(request.status)).length,
    critical: list.filter((request) => request.priority === APP_FIX_PRIORITY.URGENT).length,
  };
}

export function getAppFixDashboardSummaryCards(summary = {}) {
  return [
    { key: 'total', label: 'Total Requests', value: summary.total ?? 0 },
    { key: 'open', label: 'Open', value: summary.open ?? 0 },
    { key: 'inReview', label: 'In Review', value: summary.inReview ?? 0 },
    { key: 'inProgress', label: 'In Progress', value: summary.inProgress ?? 0 },
    { key: 'completed', label: 'Completed', value: summary.completed ?? 0 },
    { key: 'critical', label: 'Critical', value: summary.critical ?? 0, highlight: true },
  ];
}

function buildManagementSearchHaystack(request = {}, staffByUserId = new Map()) {
  const submitter = staffByUserId.get(String(request.createdByUserId || '').trim());
  const moduleLabel = getAppFixAffectedModuleLabel(request.affectedModule);
  const reference = request.referenceNumber || buildAppFixReferenceNumber(request.id);

  return [
    request.title,
    request.description,
    request.errorMessage,
    request.createdByName,
    submitter?.name,
    submitter?.fullName,
    submitter?.role,
    moduleLabel,
    request.affectedModule,
    reference,
  ]
    .map((value) => String(value || '').toLowerCase())
    .join(' ');
}

export function applyManagementRequestFilters(
  requests = [],
  {
    searchTerm = '',
    statusFilter = '',
    priorityFilter = '',
    categoryFilter = '',
    submittedByFilter = '',
    dateFrom = '',
    dateTo = '',
    staffByUserId = new Map(),
  } = {},
) {
  const filtered = filterAppFixRequests(requests, {
    searchTerm: '',
    statusFilter,
    priorityFilter,
    categoryFilter,
    createdByUserId: submittedByFilter,
  });

  const normalizedSearch = String(searchTerm || '').trim().toLowerCase();
  const fromMillis = dateFrom ? toMillis(`${dateFrom}T00:00:00`) : 0;
  const toMillisValue = dateTo ? toMillis(`${dateTo}T23:59:59`) : 0;

  return filtered.filter((request) => {
    if (normalizedSearch) {
      const haystack = buildManagementSearchHaystack(request, staffByUserId);
      if (!haystack.includes(normalizedSearch)) return false;
    }

    if (fromMillis || toMillisValue) {
      const createdMillis = toMillis(request.createdAt);
      if (fromMillis && createdMillis < fromMillis) return false;
      if (toMillisValue && createdMillis > toMillisValue) return false;
    }

    return true;
  });
}

export function groupRequestsByStatus(requests = []) {
  const groups = APP_FIX_STATUS_OPTIONS.map((option) => ({
    key: option.value,
    label: option.label,
    requests: requests.filter((request) => request.status === option.value),
  }));

  return groups.filter((group) => group.requests.length > 0);
}

export function resolveRequestSubmitter(request = {}, staffByUserId = new Map()) {
  const staff = staffByUserId.get(String(request.createdByUserId || '').trim());
  return {
    userId: String(request.createdByUserId || '').trim(),
    name: request.createdByName || staff?.name || staff?.fullName || 'Unknown User',
    role: staff?.role || 'Staff',
    photo: staff?.photo || staff?.profileImageUrl || '',
  };
}

export function groupRequestsByUser(requests = [], staffByUserId = new Map()) {
  const grouped = new Map();

  requests.forEach((request) => {
    const submitter = resolveRequestSubmitter(request, staffByUserId);
    const key = submitter.userId || submitter.name;
    const existing = grouped.get(key) || {
      key,
      ...submitter,
      requests: [],
      openCount: 0,
    };

    existing.requests.push(request);
    if (request.status === APP_FIX_STATUS.OPEN) {
      existing.openCount += 1;
    }

    grouped.set(key, existing);
  });

  return [...grouped.values()].sort((left, right) =>
    left.name.localeCompare(right.name));
}

export function groupRequestsByUserRole(requests = [], staffByUserId = new Map()) {
  const userGroups = groupRequestsByUser(requests, staffByUserId);
  const grouped = new Map();

  userGroups.forEach((group) => {
    const roleKey = group.role || 'Staff';
    const existing = grouped.get(roleKey) || {
      key: roleKey,
      label: roleKey,
      users: [],
      requestCount: 0,
      openCount: 0,
    };

    existing.users.push(group);
    existing.requestCount += group.requests.length;
    existing.openCount += group.openCount;
    grouped.set(roleKey, existing);
  });

  return [...grouped.values()].sort((left, right) => left.label.localeCompare(right.label));
}

export function buildManagementRequestGroups(
  requests = [],
  groupMode = APP_FIX_GROUP_MODES.ALL,
  staffByUserId = new Map(),
) {
  if (groupMode === APP_FIX_GROUP_MODES.BY_STATUS) {
    return groupRequestsByStatus(requests).map((group) => ({
      key: group.key,
      label: group.label,
      requests: group.requests,
      requestCount: group.requests.length,
      openCount: group.requests.filter((request) => request.status === APP_FIX_STATUS.OPEN).length,
    }));
  }

  if (groupMode === APP_FIX_GROUP_MODES.BY_USER) {
    return groupRequestsByUser(requests, staffByUserId).map((group) => ({
      key: group.key,
      label: group.name,
      subtitle: group.role,
      avatarName: group.name,
      avatarPhoto: group.photo,
      requests: group.requests,
      requestCount: group.requests.length,
      openCount: group.openCount,
    }));
  }

  if (groupMode === APP_FIX_GROUP_MODES.USER_GROUPS) {
    return groupRequestsByUserRole(requests, staffByUserId).map((group) => ({
      key: group.key,
      label: group.label,
      users: group.users,
      requests: group.users.flatMap((user) => user.requests),
      requestCount: group.requestCount,
      openCount: group.openCount,
    }));
  }

  return [{
    key: 'all',
    label: 'All Requests',
    requests,
    requestCount: requests.length,
    openCount: requests.filter((request) => request.status === APP_FIX_STATUS.OPEN).length,
  }];
}

export function buildStaffLookupMap(staff = []) {
  const map = new Map();

  staff.forEach((member) => {
    const authUid = String(member.authUid || member.id || '').trim();
    if (authUid) {
      map.set(authUid, member);
    }
  });

  return map;
}

export function getAssignableStaffOptions(staff = []) {
  return staff
    .filter((member) => String(member.role || '').trim())
    .map((member) => ({
      value: String(member.authUid || member.id || '').trim(),
      label: member.name || member.fullName || member.email || 'Staff member',
      role: member.role || '',
    }))
    .filter((option) => option.value)
    .sort((left, right) => left.label.localeCompare(right.label));
}
