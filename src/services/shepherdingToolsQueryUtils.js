import { orderBy, where } from 'firebase/firestore';
import { canManageResource, canViewResource } from './shepherdingToolsGuards.js';
import {
  filterShepherdingResources,
  isShepherdingResourceDeleted,
} from '../config/shepherdingToolsResourceOptions.js';

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

export function sortShepherdingToolsResources(resources = []) {
  return [...resources].sort(
    (left, right) => toUpdatedAtMillis(right?.updatedAt) - toUpdatedAtMillis(left?.updatedAt),
  );
}

function filterVisibleResources(resources = [], role) {
  return resources.filter((resource) => canViewResource(role, resource));
}

export function getShepherdingToolsQueryConstraints({ resourceType = '' } = {}) {
  const normalizedType = String(resourceType || '').trim();

  if (normalizedType) {
    return [where('resourceType', '==', normalizedType)];
  }

  return [orderBy('updatedAt', 'desc')];
}

export function normalizeShepherdingToolsResources(documents = [], role) {
  return sortShepherdingToolsResources(
    filterVisibleResources(
      documents.filter((resource) => !isShepherdingResourceDeleted(resource)),
      role,
    ),
  );
}

export function applyShepherdingToolsSearch(
  resources = [],
  {
    role,
    resourceType = '',
    searchTerm = '',
    categoryFilter = '',
    platformFilter = '',
    publishedStatusFilter = 'all',
  } = {},
) {
  return filterShepherdingResources(resources, {
    searchTerm,
    resourceType,
    includeDrafts: canManageResource(role),
    categoryFilter,
    platformFilter,
    publishedStatusFilter,
  });
}
