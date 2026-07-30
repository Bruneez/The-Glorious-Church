import {
  APP_FIX_BROWSER_MODE_LIST,
  APP_FIX_CATEGORY,
  APP_FIX_CATEGORY_LIST,
  APP_FIX_DEVICE_TYPE_LIST,
  APP_FIX_PRIORITY,
  APP_FIX_PRIORITY_LIST,
  APP_FIX_STATUS,
  APP_FIX_STATUS_LIST,
  DEFAULT_APP_FIX_PRIORITY,
  DEFAULT_APP_FIX_STATUS,
} from './appFixesConstants.js';
import { buildAppFixReferenceNumber } from './appFixesOptions.js';

const BLOCKED_URL_PROTOCOL_PATTERN = /^(javascript:|file:|ftp:|data:)/i;

export function normalizeOptionalString(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed || null;
}

export function isAppFixStatus(value) {
  return APP_FIX_STATUS_LIST.includes(String(value || '').trim());
}

export function isAppFixPriority(value) {
  return APP_FIX_PRIORITY_LIST.includes(String(value || '').trim());
}

export function isAppFixCategory(value) {
  const normalized = String(value || '').trim();
  return !normalized || APP_FIX_CATEGORY_LIST.includes(normalized);
}

export function isAppFixDeviceType(value) {
  const normalized = String(value || '').trim();
  return !normalized || APP_FIX_DEVICE_TYPE_LIST.includes(normalized);
}

export function isAppFixBrowserMode(value) {
  const normalized = String(value || '').trim();
  return !normalized || APP_FIX_BROWSER_MODE_LIST.includes(normalized);
}

export function isAppFixRequestDeleted(request) {
  return Boolean(request?.deletedAt);
}

export function validateAppFixRequestTitle(title) {
  if (!String(title || '').trim()) {
    return 'Title is required.';
  }

  return '';
}

export function validateOptionalHttpUrl(url, { fieldLabel = 'URL' } = {}) {
  const value = String(url ?? '').trim();

  if (!value) {
    return '';
  }

  if (BLOCKED_URL_PROTOCOL_PATTERN.test(value)) {
    return `${fieldLabel} must use HTTP or HTTPS.`;
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return `Enter a valid HTTP or HTTPS ${fieldLabel.toLowerCase()}.`;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return `${fieldLabel} must use HTTP or HTTPS.`;
  }

  return '';
}

export function validateAppFixRequestForm(input = {}, { requireTitle = true } = {}) {
  if (requireTitle) {
    const titleMessage = validateAppFixRequestTitle(input.title);
    if (titleMessage) return titleMessage;
  }

  if (input.status && !isAppFixStatus(input.status)) {
    return 'Status is invalid.';
  }

  if (input.priority && !isAppFixPriority(input.priority)) {
    return 'Priority is invalid.';
  }

  if (!isAppFixCategory(input.category)) {
    return 'Category is invalid.';
  }

  if (String(input.category || '').trim() === APP_FIX_CATEGORY.OTHER
    && !String(input.customCategory || '').trim()) {
    return 'Custom category is required when Other is selected.';
  }

  if (!String(input.affectedModule || '').trim()) {
    return 'Affected module is required.';
  }

  if (!String(input.description || '').trim()) {
    return 'Description is required.';
  }

  if (!String(input.priority || '').trim()) {
    return 'Priority is required.';
  }

  if (!isAppFixDeviceType(input.deviceType)) {
    return 'Device type is invalid.';
  }

  if (!isAppFixBrowserMode(input.browserMode)) {
    return 'Browser mode is invalid.';
  }

  const pageUrlMessage = validateOptionalHttpUrl(input.pageUrl, { fieldLabel: 'Page URL' });
  if (pageUrlMessage) return pageUrlMessage;

  return '';
}

export function getAppFixRequestValidationErrors(input = {}, { requireTitle = true } = {}) {
  const errors = {};

  if (requireTitle) {
    const titleMessage = validateAppFixRequestTitle(input.title);
    if (titleMessage) errors.title = titleMessage;
  }

  if (!String(input.category || '').trim()) {
    errors.category = 'Category is required.';
  } else if (!isAppFixCategory(input.category)) {
    errors.category = 'Category is invalid.';
  }

  if (String(input.category || '').trim() === APP_FIX_CATEGORY.OTHER
    && !String(input.customCategory || '').trim()) {
    errors.customCategory = 'Custom category is required.';
  }

  if (!String(input.affectedModule || '').trim()) {
    errors.affectedModule = 'Affected module is required.';
  }

  if (!String(input.priority || '').trim()) {
    errors.priority = 'Priority is required.';
  } else if (!isAppFixPriority(input.priority)) {
    errors.priority = 'Priority is invalid.';
  }

  if (!String(input.description || '').trim()) {
    errors.description = 'Description is required.';
  }

  if (input.deviceType && !isAppFixDeviceType(input.deviceType)) {
    errors.deviceType = 'Device type is invalid.';
  }

  if (input.browserMode && !isAppFixBrowserMode(input.browserMode)) {
    errors.browserMode = 'Browser mode is invalid.';
  }

  const pageUrlMessage = validateOptionalHttpUrl(input.pageUrl, { fieldLabel: 'Page URL' });
  if (pageUrlMessage) errors.pageUrl = pageUrlMessage;

  return errors;
}

export function buildAppFixRequestPayload(input = {}, { createdByUserId = '', requestId = '' } = {}) {
  return {
    title: String(input.title || '').trim(),
    description: normalizeOptionalString(input.description),
    stepsToReproduce: normalizeOptionalString(input.stepsToReproduce),
    errorMessage: normalizeOptionalString(input.errorMessage),
    pageUrl: normalizeOptionalString(input.pageUrl),
    affectedModule: normalizeOptionalString(input.affectedModule),
    customCategory: String(input.category || '').trim() === APP_FIX_CATEGORY.OTHER
      ? normalizeOptionalString(input.customCategory)
      : null,
    referenceNumber: normalizeOptionalString(input.referenceNumber)
      || buildAppFixReferenceNumber(requestId),
    attachmentCount: Number.isFinite(Number(input.attachmentCount))
      ? Number(input.attachmentCount)
      : 0,
    status: isAppFixStatus(input.status) ? input.status : DEFAULT_APP_FIX_STATUS,
    priority: isAppFixPriority(input.priority) ? input.priority : DEFAULT_APP_FIX_PRIORITY,
    category: normalizeOptionalString(input.category),
    deviceType: normalizeOptionalString(input.deviceType),
    browserMode: normalizeOptionalString(input.browserMode),
    assignedToUserId: normalizeOptionalString(input.assignedToUserId),
    assignedToName: normalizeOptionalString(input.assignedToName),
    internalNotes: normalizeOptionalString(input.internalNotes),
    developerNotes: normalizeOptionalString(input.developerNotes),
    resolutionSummary: normalizeOptionalString(input.resolutionSummary),
    createdByUserId: normalizeOptionalString(createdByUserId || input.createdByUserId),
    createdByStaffId: normalizeOptionalString(input.createdByStaffId),
    createdByName: normalizeOptionalString(input.createdByName),
  };
}

export function buildAppFixRequestFirestoreDocument(payload, timestamps = {}) {
  const document = {
    title: payload.title,
    description: payload.description,
    stepsToReproduce: payload.stepsToReproduce,
    errorMessage: payload.errorMessage,
    pageUrl: payload.pageUrl,
    affectedModule: payload.affectedModule,
    customCategory: payload.customCategory,
    referenceNumber: payload.referenceNumber,
    attachmentCount: payload.attachmentCount,
    status: payload.status,
    priority: payload.priority,
    category: payload.category,
    deviceType: payload.deviceType,
    browserMode: payload.browserMode,
    assignedToUserId: payload.assignedToUserId,
    assignedToName: payload.assignedToName,
    internalNotes: payload.internalNotes,
    developerNotes: payload.developerNotes,
    resolutionSummary: payload.resolutionSummary,
    createdByUserId: payload.createdByUserId,
    createdByStaffId: payload.createdByStaffId,
    createdByName: payload.createdByName,
    createdAt: timestamps.createdAt ?? null,
    updatedAt: timestamps.updatedAt ?? null,
    deletedAt: timestamps.deletedAt ?? null,
  };

  return Object.fromEntries(
    Object.entries(document).filter(([, value]) => value !== undefined),
  );
}

export function filterAppFixRequests(
  requests = [],
  {
    searchTerm = '',
    statusFilter = '',
    priorityFilter = '',
    categoryFilter = '',
    createdByUserId = '',
  } = {},
) {
  const normalizedSearch = String(searchTerm || '').trim().toLowerCase();
  const normalizedStatus = String(statusFilter || '').trim();
  const normalizedPriority = String(priorityFilter || '').trim();
  const normalizedCategory = String(categoryFilter || '').trim();
  const normalizedOwner = String(createdByUserId || '').trim();

  return requests.filter((request) => {
    if (normalizedOwner && String(request.createdByUserId || '').trim() !== normalizedOwner) {
      return false;
    }

    if (normalizedStatus && String(request.status || '').trim() !== normalizedStatus) {
      return false;
    }

    if (normalizedPriority && String(request.priority || '').trim() !== normalizedPriority) {
      return false;
    }

    if (normalizedCategory && String(request.category || '').trim() !== normalizedCategory) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const haystack = [
      request.title,
      request.description,
      request.stepsToReproduce,
      request.errorMessage,
      request.pageUrl,
      request.affectedModule,
      request.customCategory,
      request.referenceNumber,
      request.createdByName,
      request.status,
      request.priority,
      request.category,
    ]
      .map((value) => String(value || '').toLowerCase())
      .join(' ');

    return haystack.includes(normalizedSearch);
  });
}
