import {
  DEFAULT_PROJECT_CATEGORY,
  DEFAULT_PROJECT_PRIORITY,
  DEFAULT_PROJECT_PROGRESS,
  DEFAULT_PROJECT_STATUS,
  DEFAULT_PROJECT_VISIBILITY,
  DEFAULT_PROJECT_JOINING_METHOD,
  MAX_PROJECT_OBJECTIVES,
  MAX_PROJECT_PROGRESS,
  MIN_PROJECT_PROGRESS,
  PROJECT_CATEGORY,
  PROJECT_CATEGORY_LIST,
  PROJECT_CATEGORY_OPTIONS,
  PROJECT_MEMBERSHIP_ROLE,
  PROJECT_MEMBERSHIP_ROLE_LIST,
  PROJECT_MEMBERSHIP_STATUS,
  PROJECT_MEMBERSHIP_STATUS_LIST,
  PROJECT_PRIORITY,
  PROJECT_PRIORITY_LIST,
  PROJECT_PRIORITY_OPTIONS,
  PROJECT_STATUS,
  PROJECT_STATUS_LIST,
  PROJECT_STATUS_OPTIONS,
  PROJECT_UPDATE_TYPE,
  PROJECT_UPDATE_TYPE_LIST,
  PROJECT_VISIBILITY,
  PROJECT_VISIBILITY_LIST,
  PROJECT_VISIBILITY_OPTIONS,
  PROJECT_JOINING_METHOD,
  PROJECT_JOINING_METHOD_LIST,
  PROJECT_JOINING_METHOD_OPTIONS,
} from './projectsConstants.js';
import { getRoleLabel } from './roles.js';
import { getStaffAuthUid } from '../services/staffAuthDocHelpers.js';
import { getStorageErrorMessage } from '../utils/storageErrors.js';

export {
  PROJECT_CATEGORY_OPTIONS,
  PROJECT_PRIORITY_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  PROJECT_VISIBILITY_OPTIONS,
  PROJECT_JOINING_METHOD_OPTIONS,
} from './projectsConstants.js';
export const PROJECTS_PAGE_TITLE = 'Projects';

export const PROJECTS_PAGE_SUBTITLE =
  'Plan, join and collaborate on ministry projects.';

export const PROJECTS_EMPTY_STATE = {
  title: 'No projects have been created yet.',
  description: 'New ministry projects will appear here once they are created.',
};

export const PROJECTS_CREATE_BUTTON_LABEL = 'Create First Project';
export const PROJECTS_CREATE_MODAL_TITLE = 'Create Project';
export const PROJECTS_EDIT_MODAL_TITLE = 'Edit Project';
export const PROJECT_SUMMARY_MAX_LENGTH = 160;

export const ACCEPTED_PROJECT_COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPTED_PROJECT_COVER_ACCEPT = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';
export const MAX_PROJECT_COVER_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_PROJECT_ATTACHMENT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPTED_PROJECT_ATTACHMENT_PDF_TYPES = ['application/pdf'];
export const ACCEPTED_PROJECT_ATTACHMENT_TYPES = [
  ...ACCEPTED_PROJECT_ATTACHMENT_IMAGE_TYPES,
  ...ACCEPTED_PROJECT_ATTACHMENT_PDF_TYPES,
];
export const ACCEPTED_PROJECT_ATTACHMENT_ACCEPT =
  '.jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf';

export const MAX_PROJECT_ATTACHMENT_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PROJECT_ATTACHMENT_PDF_BYTES = 10 * 1024 * 1024;

const IMAGE_EXTENSION_PATTERN = /\.(jpe?g|png|webp)$/i;
const PDF_EXTENSION_PATTERN = /\.pdf$/i;

export function normalizeOptionalString(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed || null;
}

export function isProjectStatus(value) {
  return PROJECT_STATUS_LIST.includes(String(value || '').trim());
}

export function isProjectVisibility(value) {
  return PROJECT_VISIBILITY_LIST.includes(String(value || '').trim());
}

export function isProjectJoiningMethod(value) {
  return PROJECT_JOINING_METHOD_LIST.includes(String(value || '').trim());
}

export function resolveJoiningMethod(project) {
  const joiningMethod = String(project?.joiningMethod || '').trim();
  if (isProjectJoiningMethod(joiningMethod)) return joiningMethod;

  const visibility = String(project?.visibility || '').trim();
  if (visibility === PROJECT_VISIBILITY.CLOSED) {
    return PROJECT_JOINING_METHOD.INVITATION_ONLY;
  }

  return DEFAULT_PROJECT_JOINING_METHOD;
}

export function resolveProjectVisibilityFromJoiningMethod(joiningMethod) {
  const method = isProjectJoiningMethod(joiningMethod)
    ? joiningMethod
    : DEFAULT_PROJECT_JOINING_METHOD;

  return method === PROJECT_JOINING_METHOD.INVITATION_ONLY
    ? PROJECT_VISIBILITY.CLOSED
    : PROJECT_VISIBILITY.OPEN;
}

export function isProjectPubliclyDiscoverable(project) {
  const method = resolveJoiningMethod(project);
  return method === PROJECT_JOINING_METHOD.OPEN
    || method === PROJECT_JOINING_METHOD.APPROVAL_REQUIRED;
}

export function isProjectPriority(value) {
  return PROJECT_PRIORITY_LIST.includes(String(value || '').trim().toLowerCase());
}

export function isProjectCategory(value) {
  return PROJECT_CATEGORY_LIST.includes(String(value || '').trim());
}

export function normalizeProjectPriority(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return isProjectPriority(normalized) ? normalized : DEFAULT_PROJECT_PRIORITY;
}

export function createProjectObjectiveId() {
  return `obj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function normalizeProjectObjectivesForForm(objectives = []) {
  const list = Array.isArray(objectives) ? objectives : [];
  const normalized = list
    .map((item) => ({
      id: String(item?.id || createProjectObjectiveId()),
      text: String(item?.text || item || '').trim(),
      completed: Boolean(item?.completed),
    }))
    .filter((item) => item.text);

  if (!normalized.length) {
    return [{ id: createProjectObjectiveId(), text: '' }];
  }

  return normalized;
}

export function normalizeProjectObjectivesForStorage(objectives = []) {
  return (Array.isArray(objectives) ? objectives : [])
    .map((item) => ({
      id: String(item?.id || createProjectObjectiveId()),
      text: String(item?.text || item || '').trim(),
      completed: Boolean(item?.completed),
    }))
    .filter((item) => item.text)
    .slice(0, MAX_PROJECT_OBJECTIVES);
}

export function parseProjectDateString(value) {
  const text = String(value || '').trim();
  if (!text) return null;

  const parsed = Date.parse(text);
  if (Number.isNaN(parsed)) return null;

  const date = new Date(parsed);
  date.setHours(0, 0, 0, 0);
  return date;
}

export const EMPTY_PROJECT_FORM = {
  title: '',
  summary: '',
  description: '',
  status: DEFAULT_PROJECT_STATUS,
  priority: DEFAULT_PROJECT_PRIORITY,
  progress: String(DEFAULT_PROJECT_PROGRESS),
  startDate: '',
  dueDate: '',
  leaderUserId: '',
  leaderStaffId: '',
  leaderName: '',
  joiningMethod: DEFAULT_PROJECT_JOINING_METHOD,
  visibility: DEFAULT_PROJECT_VISIBILITY,
  category: DEFAULT_PROJECT_CATEGORY,
  expectedOutcome: '',
  objectives: [{ id: createProjectObjectiveId(), text: '' }],
  coverUrl: '',
  coverStoragePath: '',
};

export function mapProjectToFormData(project = null) {
  if (!project) {
    return {
      ...EMPTY_PROJECT_FORM,
      objectives: [{ id: createProjectObjectiveId(), text: '' }],
    };
  }

  return {
    title: project.title || '',
    summary: project.summary || project.shortSummary || '',
    description: project.description || '',
    status: isProjectStatus(project.status) ? project.status : DEFAULT_PROJECT_STATUS,
    priority: normalizeProjectPriority(project.priority),
    progress: String(project.progress ?? DEFAULT_PROJECT_PROGRESS),
    startDate: project.startDate || '',
    dueDate: project.dueDate || project.targetCompletionDate || '',
    leaderUserId: project.leaderUserId || project.createdByUserId || '',
    leaderStaffId: project.leaderStaffId || project.createdByStaffId || '',
    leaderName: project.leaderName || project.createdByName || '',
    joiningMethod: resolveJoiningMethod(project),
    visibility: isProjectVisibility(project.visibility) ? project.visibility : DEFAULT_PROJECT_VISIBILITY,
    category: isProjectCategory(project.category) ? project.category : DEFAULT_PROJECT_CATEGORY,
    expectedOutcome: project.expectedOutcome || '',
    objectives: normalizeProjectObjectivesForForm(project.objectives),
    coverUrl: project.coverUrl || '',
    coverStoragePath: project.coverStoragePath || '',
  };
}

export function buildProjectLeaderOptions(staff = []) {
  return staff
    .filter((member) => member?.status !== 'Inactive')
    .map((member) => {
      const userId = getStaffAuthUid(member) || String(member.id || '').trim();
      const name = String(member.fullName || member.name || '').trim();
      const roleLabel = getRoleLabel(member.role) || 'Staff';

      return {
        value: userId,
        label: name ? `${name} (${roleLabel})` : roleLabel,
        staffId: String(member.id || '').trim(),
        name,
      };
    })
    .filter((option) => option.value)
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function resolveProjectLeaderFields(formData = {}, staff = []) {
  const leaderUserId = String(formData.leaderUserId || '').trim();
  const selected = buildProjectLeaderOptions(staff).find((option) => option.value === leaderUserId);

  return {
    leaderUserId: leaderUserId || null,
    leaderStaffId: selected?.staffId || normalizeOptionalString(formData.leaderStaffId),
    leaderName: selected?.name || normalizeOptionalString(formData.leaderName),
  };
}

export function getProjectErrorMessage(
  error,
  fallback = 'Failed to save project. Please try again.',
) {
  const storageMessage = getStorageErrorMessage(error);
  if (storageMessage) return storageMessage;

  const message = String(error?.message || '').trim();
  if (!message) return fallback;
  if (/firebase|firestore/i.test(message)) return fallback;

  return message;
}

export function validateProjectSummary(summary) {
  const text = String(summary || '').trim();
  if (!text) return 'Summary is required.';
  if (text.length > PROJECT_SUMMARY_MAX_LENGTH) {
    return `Summary must be ${PROJECT_SUMMARY_MAX_LENGTH} characters or fewer.`;
  }
  return '';
}

export function validateProjectDates({ startDate = '', dueDate = '' } = {}) {
  const start = parseProjectDateString(startDate);
  const due = parseProjectDateString(dueDate);

  if (start && due && due.getTime() < start.getTime()) {
    return 'Due date cannot be before the start date.';
  }

  return '';
}

export function isProjectMembershipRole(value) {
  return PROJECT_MEMBERSHIP_ROLE_LIST.includes(String(value || '').trim());
}

export function isProjectMembershipStatus(value) {
  return PROJECT_MEMBERSHIP_STATUS_LIST.includes(String(value || '').trim());
}

export function isProjectUpdateType(value) {
  return PROJECT_UPDATE_TYPE_LIST.includes(String(value || '').trim());
}

export function isProjectDeleted(project) {
  return Boolean(project?.deletedAt);
}

export function isProjectMembershipDeleted(membership) {
  return Boolean(membership?.deletedAt);
}

export function isProjectMembershipActive(membership) {
  return !isProjectMembershipDeleted(membership)
    && String(membership?.status || '').trim() === PROJECT_MEMBERSHIP_STATUS.ACTIVE;
}

export function isProjectMembershipPending(membership) {
  return !isProjectMembershipDeleted(membership)
    && String(membership?.status || '').trim() === PROJECT_MEMBERSHIP_STATUS.PENDING;
}

export function isProjectMembershipRejected(membership) {
  return !isProjectMembershipDeleted(membership)
    && String(membership?.status || '').trim() === PROJECT_MEMBERSHIP_STATUS.REJECTED;
}

export function hasBlockingProjectMembership(membership) {
  return isProjectMembershipActive(membership) || isProjectMembershipPending(membership);
}

export function isProjectUpdateDeleted(update) {
  return Boolean(update?.deletedAt);
}

export function isProjectAttachmentDeleted(attachment) {
  return Boolean(attachment?.deletedAt);
}

export function isPermanentProjectCoverUrl(url) {
  const value = String(url || '').trim();
  if (!value) return false;
  return !value.startsWith('blob:') && !value.startsWith('data:');
}

export function normalizeProjectProgress(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_PROJECT_PROGRESS;
  return Math.min(MAX_PROJECT_PROGRESS, Math.max(MIN_PROJECT_PROGRESS, Math.round(parsed)));
}

export function validateProjectTitle(title) {
  if (!String(title || '').trim()) {
    return 'Title is required.';
  }
  return '';
}

export function validateProjectCoverFile(file) {
  if (!file) return '';

  if (file.size > MAX_PROJECT_COVER_BYTES) {
    return 'Cover image must be 5 MB or smaller.';
  }

  const hasAllowedType = ACCEPTED_PROJECT_COVER_TYPES.includes(String(file.type || '').trim().toLowerCase());
  const hasAllowedExtension = IMAGE_EXTENSION_PATTERN.test(file.name || '');

  if (!hasAllowedType && !hasAllowedExtension) {
    return 'Please upload a JPG, PNG, or WEBP cover image.';
  }

  return '';
}

export function resolveProjectCoverContentType(file) {
  const fileType = String(file?.type || '').trim().toLowerCase();
  if (ACCEPTED_PROJECT_COVER_TYPES.includes(fileType)) return fileType;

  const extension = String(file?.name || '').match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';

  return null;
}

export function resolveProjectAttachmentKind(file) {
  if (!file) return null;

  const fileType = String(file.type || '').trim().toLowerCase();
  if (ACCEPTED_PROJECT_ATTACHMENT_IMAGE_TYPES.includes(fileType)) return 'image';
  if (ACCEPTED_PROJECT_ATTACHMENT_PDF_TYPES.includes(fileType)) return 'pdf';

  const fileName = String(file.name || '').toLowerCase();
  if (IMAGE_EXTENSION_PATTERN.test(fileName)) return 'image';
  if (PDF_EXTENSION_PATTERN.test(fileName)) return 'pdf';

  return null;
}

export function validateProjectAttachmentFile(file) {
  if (!file) return '';

  const kind = resolveProjectAttachmentKind(file);
  if (!kind) {
    return 'Please upload a JPG, PNG, WEBP, or PDF file.';
  }

  const maxBytes = kind === 'pdf'
    ? MAX_PROJECT_ATTACHMENT_PDF_BYTES
    : MAX_PROJECT_ATTACHMENT_IMAGE_BYTES;

  if (file.size > maxBytes) {
    return kind === 'pdf'
      ? 'PDF attachments must be 10 MB or smaller.'
      : 'Image attachments must be 5 MB or smaller.';
  }

  return '';
}

export function resolveProjectAttachmentContentType(file) {
  const kind = resolveProjectAttachmentKind(file);
  if (!kind) return null;

  const fileType = String(file.type || '').trim().toLowerCase();
  if (ACCEPTED_PROJECT_ATTACHMENT_TYPES.includes(fileType)) return fileType;

  const extension = String(file.name || '').match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'pdf') return 'application/pdf';

  return null;
}

export function validateProjectForm(input = {}) {
  const titleMessage = validateProjectTitle(input.title);
  if (titleMessage) return titleMessage;

  const summaryMessage = validateProjectSummary(input.summary);
  if (summaryMessage) return summaryMessage;

  if (input.status && !isProjectStatus(input.status)) {
    return 'Status is invalid.';
  }

  if (input.priority && !isProjectPriority(input.priority)) {
    return 'Priority is invalid.';
  }

  if (input.joiningMethod && !isProjectJoiningMethod(input.joiningMethod)) {
    return 'Joining method is invalid.';
  }

  if (input.visibility && !isProjectVisibility(input.visibility)) {
    return 'Visibility is invalid.';
  }

  if (input.category && !isProjectCategory(input.category)) {
    return 'Category is invalid.';
  }

  if (!String(input.description || '').trim()) {
    return 'Description is required.';
  }

  if (!String(input.expectedOutcome || '').trim()) {
    return 'Expected outcome is required.';
  }

  if (!String(input.leaderUserId || '').trim()) {
    return 'Project leader is required.';
  }

  const dateMessage = validateProjectDates({
    startDate: input.startDate,
    dueDate: input.dueDate,
  });
  if (dateMessage) return dateMessage;

  if (input.progress !== undefined && input.progress !== null && input.progress !== '') {
    const parsed = Number(input.progress);
    if (!Number.isFinite(parsed) || parsed < MIN_PROJECT_PROGRESS || parsed > MAX_PROJECT_PROGRESS) {
      return 'Progress must be between 0 and 100.';
    }
  }

  const objectives = normalizeProjectObjectivesForStorage(input.objectives);
  if (objectives.length > MAX_PROJECT_OBJECTIVES) {
    return `Projects can include up to ${MAX_PROJECT_OBJECTIVES} objectives.`;
  }

  return '';
}

export function buildProjectPayload(input = {}, { createdByUserId = '', projectId = '' } = {}) {
  const leaderFields = {
    leaderUserId: normalizeOptionalString(input.leaderUserId),
    leaderStaffId: normalizeOptionalString(input.leaderStaffId),
    leaderName: normalizeOptionalString(input.leaderName),
  };

  const joiningMethod = isProjectJoiningMethod(input.joiningMethod)
    ? input.joiningMethod
    : resolveJoiningMethod(input);

  return {
    title: String(input.title || '').trim(),
    summary: String(input.summary || '').trim(),
    description: String(input.description || '').trim(),
    status: isProjectStatus(input.status) ? input.status : DEFAULT_PROJECT_STATUS,
    priority: normalizeProjectPriority(input.priority),
    joiningMethod,
    visibility: resolveProjectVisibilityFromJoiningMethod(joiningMethod),
    category: isProjectCategory(input.category) ? input.category : DEFAULT_PROJECT_CATEGORY,
    progress: normalizeProjectProgress(input.progress ?? DEFAULT_PROJECT_PROGRESS),
    startDate: normalizeOptionalString(input.startDate),
    dueDate: normalizeOptionalString(input.dueDate),
    expectedOutcome: String(input.expectedOutcome || '').trim(),
    objectives: normalizeProjectObjectivesForStorage(input.objectives),
    coverUrl: normalizeOptionalString(input.coverUrl),
    coverStoragePath: normalizeOptionalString(input.coverStoragePath),
    memberCount: Number.isFinite(Number(input.memberCount)) ? Number(input.memberCount) : 0,
    ...leaderFields,
    createdByUserId: normalizeOptionalString(createdByUserId || input.createdByUserId),
    createdByStaffId: normalizeOptionalString(input.createdByStaffId),
    createdByName: normalizeOptionalString(input.createdByName),
    projectId: normalizeOptionalString(projectId || input.id),
  };
}

export function buildProjectFirestoreDocument(payload, timestamps = {}) {
  const document = {
    title: payload.title,
    summary: payload.summary,
    description: payload.description,
    status: payload.status,
    priority: payload.priority,
    joiningMethod: payload.joiningMethod,
    visibility: payload.visibility,
    category: payload.category,
    progress: payload.progress,
    startDate: payload.startDate,
    dueDate: payload.dueDate,
    expectedOutcome: payload.expectedOutcome,
    objectives: payload.objectives,
    coverUrl: payload.coverUrl,
    coverStoragePath: payload.coverStoragePath,
    memberCount: payload.memberCount,
    leaderUserId: payload.leaderUserId,
    leaderStaffId: payload.leaderStaffId,
    leaderName: payload.leaderName,
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

export function validateProjectMembershipForm(input = {}) {
  if (!String(input.projectId || '').trim()) {
    return 'Project ID is required.';
  }

  if (!String(input.userId || '').trim()) {
    return 'User ID is required.';
  }

  if (input.role && !isProjectMembershipRole(input.role)) {
    return 'Membership role is invalid.';
  }

  if (input.status && !isProjectMembershipStatus(input.status)) {
    return 'Membership status is invalid.';
  }

  return '';
}

export function buildProjectMembershipPayload(
  input = {},
  { userId = '', staffId = '', memberName = '' } = {},
) {
  return {
    projectId: String(input.projectId || '').trim(),
    userId: normalizeOptionalString(userId || input.userId),
    staffId: normalizeOptionalString(staffId || input.staffId),
    memberName: normalizeOptionalString(memberName || input.memberName),
    role: isProjectMembershipRole(input.role)
      ? input.role
      : PROJECT_MEMBERSHIP_ROLE.MEMBER,
    status: isProjectMembershipStatus(input.status)
      ? input.status
      : PROJECT_MEMBERSHIP_STATUS.ACTIVE,
  };
}

export function buildProjectMembershipFirestoreDocument(payload, timestamps = {}) {
  const document = {
    projectId: payload.projectId,
    userId: payload.userId,
    staffId: payload.staffId,
    memberName: payload.memberName,
    role: payload.role,
    status: payload.status,
    reviewedByUserId: timestamps.reviewedByUserId ?? payload.reviewedByUserId ?? null,
    reviewedByName: timestamps.reviewedByName ?? payload.reviewedByName ?? null,
    reviewedAt: timestamps.reviewedAt ?? payload.reviewedAt ?? null,
    joinedAt: timestamps.joinedAt ?? timestamps.createdAt ?? null,
    createdAt: timestamps.createdAt ?? null,
    updatedAt: timestamps.updatedAt ?? null,
    deletedAt: timestamps.deletedAt ?? null,
  };

  return Object.fromEntries(
    Object.entries(document).filter(([, value]) => value !== undefined),
  );
}

export function validateProjectUpdateForm(input = {}) {
  if (!String(input.projectId || '').trim()) {
    return 'Project ID is required.';
  }

  if (input.updateType && !isProjectUpdateType(input.updateType)) {
    return 'Update type is invalid.';
  }

  if (!String(input.message || '').trim()
    && input.updateType === PROJECT_UPDATE_TYPE.COMMENT) {
    return 'Message is required.';
  }

  return '';
}

export function buildProjectUpdatePayload(
  input = {},
  { createdByUserId = '', createdByName = '' } = {},
) {
  return {
    projectId: String(input.projectId || '').trim(),
    updateType: isProjectUpdateType(input.updateType)
      ? input.updateType
      : PROJECT_UPDATE_TYPE.COMMENT,
    message: normalizeOptionalString(input.message),
    previousProgress: input.previousProgress ?? null,
    newProgress: input.newProgress ?? null,
    previousStatus: normalizeOptionalString(input.previousStatus),
    newStatus: normalizeOptionalString(input.newStatus),
    createdByUserId: normalizeOptionalString(createdByUserId || input.createdByUserId),
    createdByName: normalizeOptionalString(createdByName || input.createdByName),
  };
}

export function buildProjectUpdateFirestoreDocument(payload, timestamps = {}) {
  const document = {
    projectId: payload.projectId,
    updateType: payload.updateType,
    message: payload.message,
    previousProgress: payload.previousProgress,
    newProgress: payload.newProgress,
    previousStatus: payload.previousStatus,
    newStatus: payload.newStatus,
    createdByUserId: payload.createdByUserId,
    createdByName: payload.createdByName,
    createdAt: timestamps.createdAt ?? null,
    updatedAt: timestamps.updatedAt ?? null,
    deletedAt: timestamps.deletedAt ?? null,
  };

  return Object.fromEntries(
    Object.entries(document).filter(([, value]) => value !== undefined),
  );
}

export function buildProjectAttachmentPayload(input = {}, { uploadedByUserId = '' } = {}) {
  return {
    projectId: String(input.projectId || '').trim(),
    fileName: String(input.fileName || '').trim(),
    fileUrl: normalizeOptionalString(input.fileUrl),
    fileStoragePath: normalizeOptionalString(input.fileStoragePath),
    contentType: normalizeOptionalString(input.contentType),
    fileSizeBytes: Number.isFinite(Number(input.fileSizeBytes))
      ? Number(input.fileSizeBytes)
      : null,
    uploadedByUserId: normalizeOptionalString(uploadedByUserId || input.uploadedByUserId),
  };
}

export function buildProjectAttachmentFirestoreDocument(payload, timestamps = {}) {
  const document = {
    projectId: payload.projectId,
    fileName: payload.fileName,
    fileUrl: payload.fileUrl,
    fileStoragePath: payload.fileStoragePath,
    contentType: payload.contentType,
    fileSizeBytes: payload.fileSizeBytes,
    uploadedByUserId: payload.uploadedByUserId,
    createdAt: timestamps.createdAt ?? null,
    deletedAt: timestamps.deletedAt ?? null,
  };

  return Object.fromEntries(
    Object.entries(document).filter(([, value]) => value !== undefined),
  );
}

export function filterProjects(projects = [], { searchTerm = '', statusFilter = '' } = {}) {
  const normalizedSearch = String(searchTerm || '').trim().toLowerCase();
  const normalizedStatus = String(statusFilter || '').trim();

  return projects.filter((project) => {
    if (isProjectDeleted(project)) return false;
    if (normalizedStatus && project.status !== normalizedStatus) return false;

    if (!normalizedSearch) return true;

    const haystack = [
      project.title,
      project.description,
      project.summary,
      project.shortSummary,
      project.createdByName,
      project.leaderName,
      project.status,
      project.priority,
    ]
      .map((value) => String(value || '').toLowerCase())
      .join(' ');

    return haystack.includes(normalizedSearch);
  });
}
