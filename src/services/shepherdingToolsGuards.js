import { canPerformAction } from '../config/permissions.js';
import {
  isShepherdingResourceDeleted,
  isShepherdingResourcePublished,
} from '../config/shepherdingToolsResourceOptions.js';

export const VIEW_DENIED_MESSAGE =
  'You do not have permission to view Shepherding Tools resources.';
export const MANAGE_DENIED_MESSAGE =
  'Only authorised church leadership can manage Shepherding Tools resources.';

export function canManageResource(role) {
  return canPerformAction(role, 'MANAGE_SHEPHERDING_TOOLS');
}

export function canViewResource(role, resource) {
  if (!canPerformAction(role, 'VIEW_SHEPHERDING_TOOLS')) return false;
  if (isShepherdingResourceDeleted(resource)) return false;
  if (canManageResource(role)) return true;
  return isShepherdingResourcePublished(resource);
}

export function canEditResource(role, resource) {
  return canManageResource(role) && !isShepherdingResourceDeleted(resource);
}

export function canDeleteResource(role, resource) {
  return canManageResource(role) && !isShepherdingResourceDeleted(resource);
}

export function canPublishResource(role, resource) {
  return canManageResource(role) && !isShepherdingResourceDeleted(resource);
}

export function assertCanViewShepherdingTools(role) {
  if (!canPerformAction(role, 'VIEW_SHEPHERDING_TOOLS')) {
    throw new Error(VIEW_DENIED_MESSAGE);
  }
}

export function assertCanViewResource(role, resource) {
  if (!canViewResource(role, resource)) {
    throw new Error(VIEW_DENIED_MESSAGE);
  }
}

export function assertCanManageResource(role) {
  if (!canManageResource(role)) {
    throw new Error(MANAGE_DENIED_MESSAGE);
  }
}

export function assertCanEditResource(role, resource) {
  if (!canEditResource(role, resource)) {
    throw new Error(MANAGE_DENIED_MESSAGE);
  }
}

export function assertCanDeleteResource(role, resource) {
  if (!canDeleteResource(role, resource)) {
    throw new Error(MANAGE_DENIED_MESSAGE);
  }
}

export function assertCanPublishResource(role, resource) {
  if (!canPublishResource(role, resource)) {
    throw new Error(MANAGE_DENIED_MESSAGE);
  }
}
