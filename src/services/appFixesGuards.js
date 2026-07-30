import { canPerformAction } from '../config/permissions.js';
import { isAppFixRequestDeleted } from '../config/appFixesRequestOptions.js';
import { APP_FIX_USER_EDITABLE_STATUSES } from '../config/appFixesConstants.js';

export const VIEW_DENIED_MESSAGE =
  'You do not have permission to view App Fixes.';
export const MANAGE_DENIED_MESSAGE =
  'Only authorised church leadership can manage App Fixes.';
export const REQUEST_DENIED_MESSAGE =
  'You do not have permission to view this app-fix request.';
export const EDIT_DENIED_MESSAGE =
  'You do not have permission to edit this app-fix request.';
export const DELETE_DENIED_MESSAGE =
  'You do not have permission to delete this app-fix request.';

function isRequestOwner(userId, request) {
  const ownerId = String(request?.createdByUserId || '').trim();
  const currentUserId = String(userId || '').trim();
  return Boolean(ownerId && currentUserId && ownerId === currentUserId);
}

export function canManageRequest(role) {
  return canPerformAction(role, 'MANAGE_APP_FIXES');
}

export function canViewRequest(role, request, userId = '') {
  if (!canPerformAction(role, 'VIEW_APP_FIXES')) return false;
  if (isAppFixRequestDeleted(request)) return false;
  if (canManageRequest(role)) return true;
  return isRequestOwner(userId, request);
}

export function canEditRequest(role, request, userId = '') {
  if (isAppFixRequestDeleted(request)) return false;
  if (canManageRequest(role)) return true;
  return isRequestOwner(userId, request);
}

export function canDeleteRequest(role, request, userId = '') {
  if (isAppFixRequestDeleted(request)) return false;
  if (canManageRequest(role)) return true;
  return isRequestOwner(userId, request);
}

export function canUserEditRequestContent(role, request, userId = '') {
  if (!canEditRequest(role, request, userId)) return false;
  if (canManageRequest(role)) return true;
  return APP_FIX_USER_EDITABLE_STATUSES.includes(String(request?.status || '').trim());
}

export function assertCanUserEditRequestContent(role, request, userId = '') {
  if (!canUserEditRequestContent(role, request, userId)) {
    throw new Error('This request can only be edited while it is Open or Waiting for User.');
  }
}

export function assertCanViewAppFixes(role) {
  if (!canPerformAction(role, 'VIEW_APP_FIXES')) {
    throw new Error(VIEW_DENIED_MESSAGE);
  }
}

export function assertCanManageAppFixes(role) {
  if (!canPerformAction(role, 'MANAGE_APP_FIXES')) {
    throw new Error(MANAGE_DENIED_MESSAGE);
  }
}

export function assertCanViewRequest(role, request, userId = '') {
  if (!canViewRequest(role, request, userId)) {
    throw new Error(REQUEST_DENIED_MESSAGE);
  }
}

export function assertCanEditRequest(role, request, userId = '') {
  if (!canEditRequest(role, request, userId)) {
    throw new Error(EDIT_DENIED_MESSAGE);
  }
}

export function assertCanDeleteRequest(role, request, userId = '') {
  if (!canDeleteRequest(role, request, userId)) {
    throw new Error(DELETE_DENIED_MESSAGE);
  }
}

export function assertCanCreateRequest(role) {
  assertCanViewAppFixes(role);
}
