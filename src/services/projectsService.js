import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import {
  buildProjectFirestoreDocument,
  buildProjectPayload,
  isProjectDeleted,
  isProjectStatus,
  normalizeProjectProgress,
  validateProjectForm,
} from '@/config/projectsOptions';
import { db } from '@/config/firebase';
import { getDocument, getDocuments } from '@/hooks/useFirestore';
import { resolveProjectCoverStoragePath } from '@/utils/storagePathUtils';
import { PROJECT_UPDATE_TYPE } from '@/config/projectsConstants';
import {
  assertCanChangeProjectStatus,
  assertCanCreateProject,
  assertCanDeleteProject,
  assertCanManageProject,
  assertCanUpdateProgress,
  assertCanViewProject,
  assertCanViewProjects,
} from '@/services/projectGuards';
import { createOwnerMembership, softDeleteMembershipsForProject } from '@/services/projectMembershipService';
import { softDeleteAttachmentsForProject } from '@/services/projectAttachmentService';
import { createProjectUpdate, softDeleteUpdatesForProject } from '@/services/projectUpdateService';
import {
  notifyProjectStatusChanged,
} from '@/services/projectNotificationService';
import {
  cleanupUnusedUpload,
  prepareProjectCoverUpload,
  resolvePreviousProjectCoverPath,
} from '@/services/projectStorageLifecycle';
import { deleteProjectAttachment, deleteProjectCover, uploadProjectCover } from '@/services/storageService';
import {
  getProjectsQueryConstraints,
  normalizeProjects,
} from '@/services/projectsQueryUtils';
import { loadProject } from '@/services/projectLoader';

async function fetchProjectsFromFirestore({ role, userId = '' } = {}) {
  assertCanViewProjects(role);

  const constraints = getProjectsQueryConstraints();
  const documents = await getDocuments(COLLECTIONS.PROJECTS, constraints);
  return normalizeProjects(documents, role, userId);
}

export {
  getProjectsQueryConstraints,
  normalizeProjects,
  sortProjects,
} from '@/services/projectsQueryUtils';

export async function listProjects({ role, userId = '' } = {}) {
  return fetchProjectsFromFirestore({ role, userId });
}

export async function getProject(projectId, { role, userId = '' } = {}) {
  return loadProject(projectId, { role, userId });
}

export async function createProject(
  formData,
  {
    role,
    createdByUserId = '',
    createdByStaffId = '',
    createdByName = '',
    coverFile = null,
  } = {},
) {
  assertCanCreateProject(role);

  const validationMessage = validateProjectForm(formData);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const docRef = doc(collection(db, COLLECTIONS.PROJECTS));
  const projectId = docRef.id;

  let coverUrl = null;
  let coverStoragePath = null;

  if (coverFile) {
    const prepared = prepareProjectCoverUpload(projectId, coverFile);
    const uploadResult = await uploadProjectCover(coverFile, projectId, {
      storagePath: prepared.coverStoragePath,
      contentType: prepared.contentType,
    });
    coverUrl = uploadResult.coverUrl;
    coverStoragePath = uploadResult.coverStoragePath;
  }

  const payload = buildProjectPayload(
    {
      ...formData,
      coverUrl,
      coverStoragePath,
      createdByStaffId,
      createdByName,
      memberCount: 1,
    },
    { createdByUserId, projectId },
  );

  const document = buildProjectFirestoreDocument(payload, {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    deletedAt: null,
  });

  try {
    await setDoc(docRef, document);
    await createOwnerMembership(projectId, {
      role,
      userId: createdByUserId,
      staffId: createdByStaffId,
      memberName: createdByName,
    });

    await createProjectUpdate(
      projectId,
      {
        updateType: PROJECT_UPDATE_TYPE.PROJECT_CREATED,
        message: `${createdByName || 'A leader'} created the project.`,
      },
      { role, createdByUserId, createdByName },
    );

    return {
      project: { id: projectId, ...document },
    };
  } catch (error) {
    if (coverStoragePath) {
      await cleanupUnusedUpload(coverStoragePath, deleteProjectCover);
    }
    throw error;
  }
}

export async function updateProject(
  projectId,
  formData,
  {
    role,
    userId = '',
    initialData = null,
    coverFile = null,
  } = {},
) {
  if (!projectId) {
    throw new Error('Project ID is required.');
  }

  const existing = initialData || (await getDocument(COLLECTIONS.PROJECTS, projectId));
  if (!existing || isProjectDeleted(existing)) {
    throw new Error('Project not found.');
  }

  assertCanManageProject(role, existing, userId);

  const validationMessage = validateProjectForm(formData);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  let coverUrl = existing.coverUrl ?? null;
  let coverStoragePath = existing.coverStoragePath ?? null;
  const previousCoverPath = resolvePreviousProjectCoverPath(formData, existing);

  if (formData.removeCover && !coverFile) {
    coverUrl = null;
    coverStoragePath = null;
    if (previousCoverPath) {
      await cleanupUnusedUpload(previousCoverPath, deleteProjectCover);
    }
  } else if (coverFile) {
    const prepared = prepareProjectCoverUpload(projectId, coverFile, {
      previousPath: previousCoverPath,
    });
    const uploadResult = await uploadProjectCover(coverFile, projectId, {
      storagePath: prepared.coverStoragePath,
      contentType: prepared.contentType,
    });
    coverUrl = uploadResult.coverUrl;
    coverStoragePath = uploadResult.coverStoragePath;

    if (prepared.shouldCleanupPrevious) {
      await cleanupUnusedUpload(prepared.previousPath, deleteProjectCover);
    }
  }

  const payload = buildProjectPayload(
    {
      ...existing,
      ...formData,
      coverUrl,
      coverStoragePath,
      memberCount: existing.memberCount,
      createdByStaffId: existing.createdByStaffId,
      createdByName: existing.createdByName,
      createdByUserId: existing.createdByUserId,
    },
    { createdByUserId: existing.createdByUserId, projectId },
  );

  const document = buildProjectFirestoreDocument(payload, {
    createdAt: existing.createdAt ?? null,
    updatedAt: serverTimestamp(),
    deletedAt: existing.deletedAt ?? null,
  });

  await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), {
    ...document,
    updatedAt: serverTimestamp(),
  });

  await createProjectUpdate(
    projectId,
    {
      updateType: PROJECT_UPDATE_TYPE.PROJECT_EDITED,
      message: 'Project details were updated.',
    },
    { role, createdByUserId: userId, createdByName: existing.createdByName || '' },
  );

  return {
    project: { id: projectId, ...document },
  };
}

export async function changeProjectProgress(
  projectId,
  progress,
  {
    role,
    userId = '',
    memberName = '',
    membership = null,
    initialData = null,
  } = {},
) {
  if (!projectId) {
    throw new Error('Project ID is required.');
  }

  const existing = initialData || (await getDocument(COLLECTIONS.PROJECTS, projectId));
  if (!existing || isProjectDeleted(existing)) {
    throw new Error('Project not found.');
  }

  assertCanUpdateProgress(role, existing, userId, membership);

  const newProgress = normalizeProjectProgress(progress);
  const previousProgress = normalizeProjectProgress(existing.progress ?? 0);

  if (newProgress === previousProgress) {
    return { project: { id: projectId, ...existing } };
  }

  await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), {
    progress: newProgress,
    updatedAt: serverTimestamp(),
  });

  await createProjectUpdate(
    projectId,
    {
      updateType: PROJECT_UPDATE_TYPE.PROGRESS_CHANGE,
      message: `Progress updated from ${previousProgress}% to ${newProgress}%.`,
      previousProgress,
      newProgress,
    },
    { role, createdByUserId: userId, createdByName: memberName },
  );

  return {
    project: {
      id: projectId,
      ...existing,
      progress: newProgress,
    },
  };
}

export async function changeProjectStatus(
  projectId,
  status,
  {
    role,
    userId = '',
    memberName = '',
    membership = null,
    initialData = null,
  } = {},
) {
  if (!projectId) {
    throw new Error('Project ID is required.');
  }

  const nextStatus = String(status || '').trim();
  if (!isProjectStatus(nextStatus)) {
    throw new Error('Status is invalid.');
  }

  const existing = initialData || (await getDocument(COLLECTIONS.PROJECTS, projectId));
  if (!existing || isProjectDeleted(existing)) {
    throw new Error('Project not found.');
  }

  assertCanChangeProjectStatus(role, existing, userId, membership);

  const previousStatus = String(existing.status || '').trim();
  if (previousStatus === nextStatus) {
    return { project: { id: projectId, ...existing } };
  }

  const payload = buildProjectPayload(
    {
      ...existing,
      status: nextStatus,
    },
    { createdByUserId: existing.createdByUserId, projectId },
  );

  const document = buildProjectFirestoreDocument(payload, {
    createdAt: existing.createdAt ?? null,
    updatedAt: serverTimestamp(),
    deletedAt: existing.deletedAt ?? null,
  });

  await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), {
    ...document,
    updatedAt: serverTimestamp(),
  });

  await createProjectUpdate(
    projectId,
    {
      updateType: PROJECT_UPDATE_TYPE.STATUS_CHANGE,
      message: `Status changed from ${previousStatus || 'unknown'} to ${nextStatus}.`,
      previousStatus,
      newStatus: nextStatus,
    },
    { role, createdByUserId: userId, createdByName: memberName },
  );

  await notifyProjectStatusChanged({
    project: existing,
    previousStatus,
    nextStatus,
    actorName: memberName,
    excludeStaffId: '',
  }).catch((notificationError) => {
    console.error('Failed to send project status notification:', notificationError);
  });

  return {
    project: { id: projectId, ...document },
  };
}

export async function deleteProject(
  projectId,
  { role, userId = '', initialData = null } = {},
) {
  if (!projectId) {
    throw new Error('Project ID is required.');
  }

  const existing = initialData || (await getDocument(COLLECTIONS.PROJECTS, projectId));
  if (!existing || isProjectDeleted(existing)) {
    throw new Error('Project not found.');
  }

  assertCanDeleteProject(role, existing, userId);

  await createProjectUpdate(
    projectId,
    {
      updateType: PROJECT_UPDATE_TYPE.PROJECT_DELETED,
      message: 'Project was deleted.',
    },
    { role, createdByUserId: userId, createdByName: existing.createdByName || '' },
  );

  const [attachments] = await Promise.all([
    softDeleteAttachmentsForProject(projectId),
    softDeleteUpdatesForProject(projectId),
    softDeleteMembershipsForProject(projectId),
  ]);

  await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const storageWarnings = [];
  const coverPath = resolveProjectCoverStoragePath(existing);
  const coverWarning = await cleanupUnusedUpload(coverPath, deleteProjectCover);
  if (coverWarning) storageWarnings.push(coverWarning);

  for (const attachment of attachments) {
    const attachmentPath = attachment.fileStoragePath;
    const warning = await cleanupUnusedUpload(attachmentPath, deleteProjectAttachment);
    if (warning) storageWarnings.push(warning);
  }

  return { projectId, storageWarnings };
}
