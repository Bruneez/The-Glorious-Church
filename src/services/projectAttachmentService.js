import {
  cleanupUnusedUpload,
  prepareProjectAttachmentUpload,
} from '@/services/projectStorageLifecycle';
import { deleteProjectAttachment, uploadProjectAttachment } from '@/services/storageService';
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import {
  buildProjectAttachmentFirestoreDocument,
  buildProjectAttachmentPayload,
  isProjectAttachmentDeleted,
} from '@/config/projectsOptions';
import { db } from '@/config/firebase';
import { getDocument, getDocuments } from '@/hooks/useFirestore';
import { resolveProjectAttachmentStoragePath } from '@/utils/storagePathUtils';
import {
  assertCanDeleteProjectAttachment,
  assertCanUploadAttachments,
  assertCanViewProject,
} from '@/services/projectGuards';
import { getMembershipForUser } from '@/services/projectMembershipService';
import { loadProject } from '@/services/projectLoader';
import { getProjectAttachmentsQueryConstraints } from '@/services/projectsQueryUtils';

async function createAttachmentRecord(projectId, uploadResult, { uploadedByUserId = '' } = {}) {
  const docRef = doc(collection(db, COLLECTIONS.PROJECT_ATTACHMENTS));
  const payload = buildProjectAttachmentPayload(
    {
      projectId,
      fileName: uploadResult.fileName,
      fileUrl: uploadResult.fileUrl,
      fileStoragePath: uploadResult.fileStoragePath,
      contentType: uploadResult.contentType,
      fileSizeBytes: uploadResult.fileSizeBytes,
    },
    { uploadedByUserId },
  );

  const document = buildProjectAttachmentFirestoreDocument(payload, {
    createdAt: serverTimestamp(),
    deletedAt: null,
  });

  await setDoc(docRef, document);

  return {
    attachment: { id: docRef.id, ...document },
  };
}

export async function listAttachmentsForProject(projectId, { role, userId = '' } = {}) {
  const project = await loadProject(projectId, { role, userId });
  const membership = await getMembershipForUser(projectId, userId, { role, currentUserId: userId });
  assertCanViewProject(role, project, userId, membership);

  const attachments = await getDocuments(
    COLLECTIONS.PROJECT_ATTACHMENTS,
    getProjectAttachmentsQueryConstraints(projectId),
  );

  return attachments.filter((attachment) => !isProjectAttachmentDeleted(attachment));
}

export async function uploadAttachmentForProject(
  projectId,
  file,
  { role, userId = '', onProgress, membership = null } = {},
) {
  const project = await loadProject(projectId, { role, userId });
  const resolvedMembership = membership || await getMembershipForUser(projectId, userId, {
    role,
    currentUserId: userId,
  });
  assertCanUploadAttachments(role, project, userId, resolvedMembership);

  const prepared = prepareProjectAttachmentUpload(projectId, file);
  let uploadResult = null;

  try {
    uploadResult = await uploadProjectAttachment(file, projectId, {
      storagePath: prepared.fileStoragePath,
      contentType: prepared.contentType,
      onProgress,
    });

    return await createAttachmentRecord(projectId, uploadResult, { uploadedByUserId: userId });
  } catch (error) {
    const storagePath = uploadResult?.fileStoragePath || prepared.fileStoragePath;
    await cleanupUnusedUpload(storagePath, deleteProjectAttachment);
    throw error;
  }
}

export async function deleteProjectAttachmentRecord(
  attachmentId,
  { role, userId = '', initialData = null, membership = null } = {},
) {
  if (!attachmentId) {
    throw new Error('Attachment ID is required.');
  }

  const existing = initialData || await getDocument(COLLECTIONS.PROJECT_ATTACHMENTS, attachmentId);

  if (!existing || isProjectAttachmentDeleted(existing)) {
    throw new Error('Attachment not found.');
  }

  const project = await loadProject(existing.projectId, { role, userId });
  const resolvedMembership = membership || await getMembershipForUser(existing.projectId, userId, {
    role,
    currentUserId: userId,
  });
  assertCanDeleteProjectAttachment(role, project, existing, userId, resolvedMembership);

  await updateDoc(doc(db, COLLECTIONS.PROJECT_ATTACHMENTS, attachmentId), {
    deletedAt: serverTimestamp(),
  });

  const storagePath = resolveProjectAttachmentStoragePath(existing);
  const storageWarning = await cleanupUnusedUpload(storagePath, deleteProjectAttachment);

  return { attachmentId, storageWarning };
}

export async function softDeleteAttachmentsForProject(projectId) {
  const attachments = await getDocuments(COLLECTIONS.PROJECT_ATTACHMENTS, [
    where('projectId', '==', projectId),
  ]);

  const timestamp = serverTimestamp();
  await Promise.all(
    attachments.map((attachment) =>
      updateDoc(doc(db, COLLECTIONS.PROJECT_ATTACHMENTS, attachment.id), {
        deletedAt: timestamp,
      })),
  );

  return attachments.filter((attachment) => !attachment.deletedAt);
}
