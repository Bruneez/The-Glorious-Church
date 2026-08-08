import { canPerformAction } from './permissions.js';
import {
  APP_FIX_COMPLETED_STATUSES,
  APP_FIX_STATUS,
} from './appFixesConstants.js';

export function resolveAppFixPermissionStatus({
  role = '',
  isStaffSessionLoading = false,
} = {}) {
  if (isStaffSessionLoading) {
    return 'loading';
  }

  if (!canPerformAction(role, 'VIEW_APP_FIXES')) {
    return 'denied';
  }

  return 'allowed';
}

export function buildAppFixUserSummary(requests = []) {
  const list = Array.isArray(requests) ? requests : [];

  return {
    total: list.length,
    open: list.filter((request) => request.status === APP_FIX_STATUS.OPEN).length,
    inProgress: list.filter((request) => (
      request.status === APP_FIX_STATUS.IN_PROGRESS
      || request.status === APP_FIX_STATUS.IN_REVIEW
      || request.status === APP_FIX_STATUS.TESTING
      || request.status === APP_FIX_STATUS.WAITING_FOR_USER
    )).length,
    completed: list.filter((request) => APP_FIX_COMPLETED_STATUSES.includes(request.status)).length,
  };
}

export function getAppFixUserSummaryCards(summary = {}) {
  return [
    { key: 'total', label: 'My Requests', value: summary.total ?? 0 },
    { key: 'open', label: 'Open', value: summary.open ?? 0 },
    { key: 'inProgress', label: 'In Progress', value: summary.inProgress ?? 0 },
    { key: 'completed', label: 'Completed', value: summary.completed ?? 0 },
  ];
}
