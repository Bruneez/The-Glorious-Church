import {
  resolveAppFixAttachmentContentType,
  validateAppFixAttachmentFile,
} from '../config/appFixesAttachmentOptions.js';

export function generateStoragePath(requestId, fileName = 'attachment') {
  const timestamp = Date.now();
  const safeName = String(fileName || 'attachment').replace(/[^\w.-]+/g, '_');
  const normalizedRequestId = String(requestId || '').trim();

  if (!normalizedRequestId) {
    throw new Error('Request ID is required to generate a storage path.');
  }

  return `app-fixes/${normalizedRequestId}/${timestamp}_${safeName}`;
}

export function validateAttachment(file) {
  return validateAppFixAttachmentFile(file);
}

export function resolveAttachmentContentType(file) {
  return resolveAppFixAttachmentContentType(file);
}
