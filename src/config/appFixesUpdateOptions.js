import {
  APP_FIX_STATUS_LIST,
  APP_FIX_UPDATE_TYPE,
  APP_FIX_UPDATE_TYPE_LIST,
} from './appFixesConstants.js';
import { normalizeOptionalString } from './appFixesRequestOptions.js';

export function isAppFixUpdateType(value) {
  return APP_FIX_UPDATE_TYPE_LIST.includes(String(value || '').trim());
}

export function isAppFixUpdateDeleted(update) {
  return Boolean(update?.deletedAt);
}

export function validateAppFixUpdateMessage(message) {
  if (!String(message || '').trim()) {
    return 'Update message is required.';
  }

  return '';
}

export function validateAppFixUpdateForm(input = {}) {
  const messageError = validateAppFixUpdateMessage(input.message);
  if (messageError) return messageError;

  if (!String(input.requestId || '').trim()) {
    return 'Request ID is required.';
  }

  if (input.updateType && !isAppFixUpdateType(input.updateType)) {
    return 'Update type is invalid.';
  }

  if (input.newStatus && !APP_FIX_STATUS_LIST.includes(String(input.newStatus).trim())) {
    return 'Status is invalid.';
  }

  if (input.previousStatus && !APP_FIX_STATUS_LIST.includes(String(input.previousStatus).trim())) {
    return 'Previous status is invalid.';
  }

  return '';
}

export function buildAppFixUpdatePayload(input = {}, { createdByUserId = '' } = {}) {
  return {
    requestId: String(input.requestId || '').trim(),
    updateType: isAppFixUpdateType(input.updateType)
      ? input.updateType
      : APP_FIX_UPDATE_TYPE.COMMENT,
    message: String(input.message || '').trim(),
    previousStatus: normalizeOptionalString(input.previousStatus),
    newStatus: normalizeOptionalString(input.newStatus),
    previousPriority: normalizeOptionalString(input.previousPriority),
    newPriority: normalizeOptionalString(input.newPriority),
    assignedToUserId: normalizeOptionalString(input.assignedToUserId),
    assignedToName: normalizeOptionalString(input.assignedToName),
    isInternal: Boolean(input.isInternal),
    createdByUserId: normalizeOptionalString(createdByUserId || input.createdByUserId),
    createdByName: normalizeOptionalString(input.createdByName),
  };
}

export function buildAppFixUpdateFirestoreDocument(payload, timestamps = {}) {
  const document = {
    requestId: payload.requestId,
    updateType: payload.updateType,
    message: payload.message,
    previousStatus: payload.previousStatus,
    newStatus: payload.newStatus,
    previousPriority: payload.previousPriority,
    newPriority: payload.newPriority,
    assignedToUserId: payload.assignedToUserId,
    assignedToName: payload.assignedToName,
    isInternal: payload.isInternal,
    createdByUserId: payload.createdByUserId,
    createdByName: payload.createdByName,
    createdAt: timestamps.createdAt ?? null,
    deletedAt: timestamps.deletedAt ?? null,
  };

  return Object.fromEntries(
    Object.entries(document).filter(([, value]) => value !== undefined),
  );
}
