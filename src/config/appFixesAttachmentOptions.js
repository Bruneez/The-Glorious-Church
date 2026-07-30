import { normalizeOptionalString } from './appFixesRequestOptions.js';

export const ACCEPTED_APP_FIX_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPTED_APP_FIX_PDF_TYPES = ['application/pdf'];
export const ACCEPTED_APP_FIX_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export const ACCEPTED_APP_FIX_ATTACHMENT_TYPES = [
  ...ACCEPTED_APP_FIX_IMAGE_TYPES,
  ...ACCEPTED_APP_FIX_PDF_TYPES,
  ...ACCEPTED_APP_FIX_VIDEO_TYPES,
];

export const ACCEPTED_APP_FIX_ATTACHMENT_ACCEPT =
  '.jpg,.jpeg,.png,.webp,.pdf,.mp4,.webm,.mov,image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/webm,video/quicktime';

export const MAX_APP_FIX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_APP_FIX_PDF_BYTES = 10 * 1024 * 1024;
export const MAX_APP_FIX_VIDEO_BYTES = 25 * 1024 * 1024;

export const APP_FIX_ATTACHMENT_UPLOAD_TIMEOUT_MS = 60_000;

const IMAGE_EXTENSION_PATTERN = /\.(jpe?g|png|webp)$/i;
const PDF_EXTENSION_PATTERN = /\.pdf$/i;
const VIDEO_EXTENSION_PATTERN = /\.(mp4|webm|mov)$/i;

export function isAppFixAttachmentDeleted(attachment) {
  return Boolean(attachment?.deletedAt);
}

export function resolveAppFixAttachmentKind(file) {
  if (!file) return null;

  const fileType = String(file.type || '').trim().toLowerCase();
  if (ACCEPTED_APP_FIX_IMAGE_TYPES.includes(fileType)) return 'image';
  if (ACCEPTED_APP_FIX_PDF_TYPES.includes(fileType)) return 'pdf';
  if (ACCEPTED_APP_FIX_VIDEO_TYPES.includes(fileType)) return 'video';

  const fileName = String(file.name || '').toLowerCase();
  if (IMAGE_EXTENSION_PATTERN.test(fileName)) return 'image';
  if (PDF_EXTENSION_PATTERN.test(fileName)) return 'pdf';
  if (VIDEO_EXTENSION_PATTERN.test(fileName)) return 'video';

  return null;
}

export function getMaxAppFixAttachmentBytes(kind) {
  if (kind === 'pdf') return MAX_APP_FIX_PDF_BYTES;
  if (kind === 'video') return MAX_APP_FIX_VIDEO_BYTES;
  return MAX_APP_FIX_IMAGE_BYTES;
}

export function validateAppFixAttachmentFile(file) {
  if (!file) return '';

  const kind = resolveAppFixAttachmentKind(file);
  if (!kind) {
    return 'Please upload a JPG, PNG, WEBP, PDF, MP4, WEBM, or MOV file.';
  }

  const maxBytes = getMaxAppFixAttachmentBytes(kind);
  if (file.size > maxBytes) {
    if (kind === 'video') {
      return 'Video attachments must be 25 MB or smaller.';
    }
    if (kind === 'pdf') {
      return 'PDF attachments must be 10 MB or smaller.';
    }
    return 'Image attachments must be 5 MB or smaller.';
  }

  return '';
}

export function resolveAppFixAttachmentContentType(file) {
  const kind = resolveAppFixAttachmentKind(file);
  if (!kind) return null;

  const fileType = String(file.type || '').trim().toLowerCase();
  if (ACCEPTED_APP_FIX_ATTACHMENT_TYPES.includes(fileType)) {
    return fileType;
  }

  const extension = String(file.name || '').match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'pdf') return 'application/pdf';
  if (extension === 'mp4') return 'video/mp4';
  if (extension === 'webm') return 'video/webm';
  if (extension === 'mov') return 'video/quicktime';

  return null;
}

export function buildAppFixAttachmentPayload(input = {}, { uploadedByUserId = '' } = {}) {
  return {
    requestId: String(input.requestId || '').trim(),
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

export function buildAppFixAttachmentFirestoreDocument(payload, timestamps = {}) {
  const document = {
    requestId: payload.requestId,
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
