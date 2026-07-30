import {
  APP_FIX_BROWSER_MODE_OPTIONS,
  APP_FIX_CATEGORY,
  APP_FIX_CATEGORY_OPTIONS,
  APP_FIX_DEVICE_TYPE_OPTIONS,
  APP_FIX_PRIORITY_OPTIONS,
  APP_FIX_STATUS_OPTIONS,
  APP_FIX_USER_EDITABLE_STATUSES,
} from './appFixesConstants.js';
import {
  buildAppFixReferenceNumber,
  getAppFixAffectedModuleLabel,
} from './appFixesOptions.js';

function toDisplayDate(value) {
  if (!value) return '—';

  if (typeof value?.toDate === 'function') {
    return value.toDate().toLocaleString();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleString();
}

export function getAppFixStatusLabel(status = '') {
  return APP_FIX_STATUS_OPTIONS.find((option) => option.value === status)?.label || status || '—';
}

export function getAppFixPriorityLabel(priority = '') {
  return APP_FIX_PRIORITY_OPTIONS.find((option) => option.value === priority)?.label || priority || '—';
}

export function getAppFixCategoryLabel(request = {}) {
  if (String(request.category || '').trim() === APP_FIX_CATEGORY.OTHER) {
    return request.customCategory || 'Other';
  }

  return APP_FIX_CATEGORY_OPTIONS.find((option) => option.value === request.category)?.label
    || request.category
    || '—';
}

export function getAppFixDeviceTypeLabel(deviceType = '') {
  return APP_FIX_DEVICE_TYPE_OPTIONS.find((option) => option.value === deviceType)?.label
    || deviceType
    || '—';
}

export function getAppFixBrowserModeLabel(browserMode = '') {
  return APP_FIX_BROWSER_MODE_OPTIONS.find((option) => option.value === browserMode)?.label
    || browserMode
    || '—';
}

export function getAppFixRequestReferenceNumber(request = {}) {
  if (request.referenceNumber) return request.referenceNumber;
  return buildAppFixReferenceNumber(request.id);
}

export function getAppFixRequestSubmittedAt(request = {}) {
  return toDisplayDate(request.createdAt);
}

export function getAppFixRequestUpdatedAt(request = {}) {
  return toDisplayDate(request.updatedAt);
}

export function getAppFixDescriptionPreview(description = '', maxLength = 120) {
  const normalized = String(description || '').trim().replace(/\s+/g, ' ');
  if (!normalized) return 'No description provided.';
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}…`;
}

export function requestHasAttachments(request = {}) {
  return Number(request.attachmentCount || 0) > 0;
}

export function canUserEditRequestByStatus(request = {}) {
  return APP_FIX_USER_EDITABLE_STATUSES.includes(String(request.status || '').trim());
}

export function getAppFixAffectedModuleDisplay(request = {}) {
  return getAppFixAffectedModuleLabel(request.affectedModule);
}

export function getAppFixStatusToneClass(status = '') {
  switch (String(status || '').trim()) {
    case 'open':
      return 'bg-sky-500/10 text-sky-300 border-sky-500/20';
    case 'in-review':
      return 'bg-violet-500/10 text-violet-300 border-violet-500/20';
    case 'in-progress':
      return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
    case 'waiting-for-user':
      return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    case 'testing':
      return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
    case 'resolved':
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    case 'rejected':
      return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
    case 'closed':
      return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
    default:
      return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
  }
}

export function getAppFixPriorityToneClass(priority = '') {
  switch (String(priority || '').trim()) {
    case 'urgent':
      return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
    case 'high':
      return 'bg-orange-500/10 text-orange-300 border-orange-500/20';
    case 'medium':
      return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    default:
      return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
  }
}

export function isImageAttachment(attachment = {}) {
  return String(attachment.contentType || '').startsWith('image/');
}

export function isVideoAttachment(attachment = {}) {
  return String(attachment.contentType || '').startsWith('video/');
}

export function isPdfAttachment(attachment = {}) {
  return String(attachment.contentType || '') === 'application/pdf';
}

export function getAppFixUpdateTimelineLabel(update = {}) {
  if (update.updateType === 'status-change') {
    return 'Status updated';
  }
  if (update.updateType === 'priority-change') {
    return 'Priority updated';
  }
  if (update.updateType === 'assignment') {
    return 'Assignment updated';
  }
  if (update.isInternal) {
    return 'Internal note';
  }
  return 'Response';
}

export function formatAppFixUpdateTimestamp(update = {}) {
  return toDisplayDate(update.createdAt);
}
