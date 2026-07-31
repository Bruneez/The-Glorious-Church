import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import { PROJECT_UPDATE_TYPE } from '@/config/projectsConstants';
import {
  buildProjectUpdateFirestoreDocument,
  buildProjectUpdatePayload,
  isProjectUpdateDeleted,
  validateProjectUpdateForm,
} from '@/config/projectsOptions';
import { db } from '@/config/firebase';
import { getDocument, getDocuments } from '@/hooks/useFirestore';
import {
  assertCanAddProjectUpdate,
  assertCanEditProjectUpdate,
} from '@/services/projectGuards';
import { getMembershipForUser } from '@/services/projectMembershipService';
import {
  getProjectUpdatesQueryConstraints,
} from '@/services/projectsQueryUtils';
import { loadProject } from '@/services/projectLoader';

export async function listUpdatesForProject(projectId, { role, userId = '' } = {}) {
  await loadProject(projectId, { role, userId });

  const updates = await getDocuments(
    COLLECTIONS.PROJECT_UPDATES,
    getProjectUpdatesQueryConstraints(projectId),
  );

  return updates.filter((update) => !isProjectUpdateDeleted(update));
}

export async function createProjectUpdate(
  projectId,
  input,
  { role, createdByUserId = '', createdByName = '' } = {},
) {
  await loadProject(projectId, { role, userId: createdByUserId });

  const payload = buildProjectUpdatePayload(
    {
      projectId,
      ...input,
    },
    { createdByUserId, createdByName },
  );

  const validationMessage = validateProjectUpdateForm(payload);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const docRef = doc(collection(db, COLLECTIONS.PROJECT_UPDATES));
  const document = buildProjectUpdateFirestoreDocument(payload, {
    createdAt: serverTimestamp(),
    updatedAt: null,
    deletedAt: null,
  });

  await setDoc(docRef, document);

  return {
    update: { id: docRef.id, ...document },
  };
}

export async function createProjectComment(
  projectId,
  message,
  { role, userId = '', memberName = '', membership = null } = {},
) {
  const project = await loadProject(projectId, { role, userId });
  const resolvedMembership = membership || await getMembershipForUser(projectId, userId, {
    role,
    currentUserId: userId,
  });

  assertCanAddProjectUpdate(role, project, userId, resolvedMembership);

  return createProjectUpdate(
    projectId,
    {
      updateType: PROJECT_UPDATE_TYPE.COMMENT,
      message,
    },
    { role, createdByUserId: userId, createdByName: memberName },
  );
}

export async function updateProjectComment(
  updateId,
  message,
  { role, userId = '' } = {},
) {
  if (!updateId) {
    throw new Error('Update ID is required.');
  }

  const existing = await getDocument(COLLECTIONS.PROJECT_UPDATES, updateId);

  if (!existing || isProjectUpdateDeleted(existing)) {
    throw new Error('Update not found.');
  }

  await loadProject(existing.projectId, { role, userId });
  assertCanEditProjectUpdate(existing, userId);

  const trimmedMessage = String(message || '').trim();
  if (!trimmedMessage) {
    throw new Error('Message is required.');
  }

  await updateDoc(doc(db, COLLECTIONS.PROJECT_UPDATES, updateId), {
    message: trimmedMessage,
    updatedAt: serverTimestamp(),
  });

  return {
    update: {
      ...existing,
      message: trimmedMessage,
    },
  };
}

export async function deleteProjectUpdate(
  updateId,
  { role, userId = '' } = {},
) {
  if (!updateId) {
    throw new Error('Update ID is required.');
  }

  const existing = await getDocument(COLLECTIONS.PROJECT_UPDATES, updateId);

  if (!existing || isProjectUpdateDeleted(existing)) {
    throw new Error('Update not found.');
  }

  await loadProject(existing.projectId, { role, userId });

  await updateDoc(doc(db, COLLECTIONS.PROJECT_UPDATES, updateId), {
    deletedAt: serverTimestamp(),
  });

  return { updateId };
}

export async function softDeleteUpdatesForProject(projectId) {
  const updates = await getDocuments(COLLECTIONS.PROJECT_UPDATES, [
    where('projectId', '==', projectId),
  ]);

  const timestamp = serverTimestamp();
  await Promise.all(
    updates.map((update) =>
      updateDoc(doc(db, COLLECTIONS.PROJECT_UPDATES, update.id), {
        deletedAt: timestamp,
      })),
  );

  return updates;
}
