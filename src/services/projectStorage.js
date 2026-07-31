import {
  resolveProjectAttachmentContentType,
  resolveProjectCoverContentType,
  validateProjectAttachmentFile,
  validateProjectCoverFile,
} from '../config/projectsOptions.js';

export function generateProjectCoverStoragePath(projectId, fileName = 'cover') {
  const timestamp = Date.now();
  const safeName = String(fileName || 'cover').replace(/[^\w.-]+/g, '_');
  const normalizedProjectId = String(projectId || '').trim();

  if (!normalizedProjectId) {
    throw new Error('Project ID is required to generate a cover storage path.');
  }

  return `projects/${normalizedProjectId}/cover/${timestamp}_${safeName}`;
}

export function generateProjectAttachmentStoragePath(projectId, fileName = 'attachment') {
  const timestamp = Date.now();
  const safeName = String(fileName || 'attachment').replace(/[^\w.-]+/g, '_');
  const normalizedProjectId = String(projectId || '').trim();

  if (!normalizedProjectId) {
    throw new Error('Project ID is required to generate an attachment storage path.');
  }

  return `projects/${normalizedProjectId}/attachments/${timestamp}_${safeName}`;
}

export function validateCoverImage(file) {
  return validateProjectCoverFile(file);
}

export function validateAttachment(file) {
  return validateProjectAttachmentFile(file);
}

export function resolveCoverContentType(file) {
  return resolveProjectCoverContentType(file);
}

export function resolveAttachmentContentType(file) {
  return resolveProjectAttachmentContentType(file);
}
