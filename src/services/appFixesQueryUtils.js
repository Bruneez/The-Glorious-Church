import { orderBy, where } from 'firebase/firestore';
import { canManageRequest, canViewRequest } from './appFixesGuards.js';
import {
  filterAppFixRequests,
  isAppFixRequestDeleted,
} from '../config/appFixesRequestOptions.js';

function toUpdatedAtMillis(value) {
  if (!value) return 0;

  if (typeof value?.toDate === 'function') {
    return value.toDate().getTime() || 0;
  }

  if (value instanceof Date) {
    return value.getTime() || 0;
  }

  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function sortAppFixRequests(requests = []) {
  return [...requests].sort(
    (left, right) => toUpdatedAtMillis(right?.updatedAt) - toUpdatedAtMillis(left?.updatedAt),
  );
}

function filterVisibleRequests(requests = [], role, userId = '') {
  return requests.filter((request) => canViewRequest(role, request, userId));
}

export function getAppFixRequestsQueryConstraints({ role, createdByUserId = '' } = {}) {
  const normalizedUserId = String(createdByUserId || '').trim();

  if (canManageRequest(role)) {
    return [orderBy('updatedAt', 'desc')];
  }

  if (normalizedUserId) {
    return [
      where('createdByUserId', '==', normalizedUserId),
      orderBy('updatedAt', 'desc'),
    ];
  }

  return [orderBy('updatedAt', 'desc')];
}

export function normalizeAppFixRequests(documents = [], role, userId = '') {
  return sortAppFixRequests(
    filterVisibleRequests(
      documents.filter((request) => !isAppFixRequestDeleted(request)),
      role,
      userId,
    ),
  );
}

export function applyAppFixRequestSearch(
  requests = [],
  {
    searchTerm = '',
    statusFilter = '',
    priorityFilter = '',
    categoryFilter = '',
    createdByUserId = '',
  } = {},
) {
  return filterAppFixRequests(requests, {
    searchTerm,
    statusFilter,
    priorityFilter,
    categoryFilter,
    createdByUserId,
  });
}

export function getAppFixUpdatesQueryConstraints(requestId) {
  const normalizedRequestId = String(requestId || '').trim();
  if (!normalizedRequestId) {
    return [];
  }

  return [
    where('requestId', '==', normalizedRequestId),
    orderBy('createdAt', 'desc'),
  ];
}

export function getAppFixAttachmentsQueryConstraints(requestId) {
  const normalizedRequestId = String(requestId || '').trim();
  if (!normalizedRequestId) {
    return [];
  }

  return [
    where('requestId', '==', normalizedRequestId),
    orderBy('createdAt', 'desc'),
  ];
}
