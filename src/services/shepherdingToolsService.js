import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import { canPerformAction } from '@/config/permissions';
import { PUBLISHED_STATUS } from '@/config/shepherdingToolsConstants';
import {
  buildShepherdingResourceFirestoreDocument,
  buildShepherdingResourcePayload,
  isPermanentCoverUrl,
  validateShepherdingResourceForm,
  validateShepherdingCoverFile,
} from '@/config/shepherdingToolsResourceOptions';
import { resolveShepherdingCoverStoragePath } from '@/utils/storagePathUtils';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/config/firebase';
import { getDocument, getDocuments } from '@/hooks/useFirestore';
import {
  assertCanDeleteResource,
  assertCanEditResource,
  assertCanManageResource,
  assertCanPublishResource,
  assertCanViewResource,
  assertCanViewShepherdingTools,
  VIEW_DENIED_MESSAGE,
} from '@/services/shepherdingToolsGuards';
import {
  cleanupUnusedUpload,
  resolvePreviousShepherdingCoverPath,
  shouldCleanupPreviousShepherdingCover,
} from '@/services/shepherdingToolsStorageLifecycle';
import { deleteShepherdingCoverImage, uploadShepherdingCoverImage } from '@/services/storageService';

import {
  applyShepherdingToolsSearch,
  getShepherdingToolsQueryConstraints,
  normalizeShepherdingToolsResources,
} from '@/services/shepherdingToolsQueryUtils';

async function fetchResourcesFromFirestore({ role, resourceType = '' } = {}) {
  assertCanViewShepherdingTools(role);

  const constraints = getShepherdingToolsQueryConstraints({ resourceType });
  const documents = await getDocuments(COLLECTIONS.SHEPHERDING_TOOLS, constraints);
  return normalizeShepherdingToolsResources(documents, role);
}

export {
  applyShepherdingToolsSearch,
  getShepherdingToolsQueryConstraints,
  normalizeShepherdingToolsResources,
} from '@/services/shepherdingToolsQueryUtils';

async function rollbackCoverUpload(coverStoragePath) {
  if (!coverStoragePath) return;

  try {
    await deleteShepherdingCoverImage(coverStoragePath);
  } catch {
    // Non-blocking rollback failure.
  }
}

export function useShepherdingToolsResources(
  resourceType,
  {
    searchTerm = '',
    categoryFilter = '',
    platformFilter = '',
    publishedStatusFilter = 'all',
  } = {},
) {
  const { role } = useAuth();
  const canView = canPerformAction(role, 'VIEW_SHEPHERDING_TOOLS');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!canView) {
      setData([]);
      setLoading(false);
      setError(new Error(VIEW_DENIED_MESSAGE));
      return undefined;
    }

    setLoading(true);
    setError(null);

    const constraints = getShepherdingToolsQueryConstraints({ resourceType });
    const q = query(collection(db, COLLECTIONS.SHEPHERDING_TOOLS), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const snapshotResources = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));

        setData(normalizeShepherdingToolsResources(snapshotResources, role));
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        console.error('useShepherdingToolsResources subscription error:', snapshotError);
        setError(snapshotError);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [canView, role, resourceType]);

  const resources = useMemo(
    () => applyShepherdingToolsSearch(data, {
      role,
      resourceType,
      searchTerm,
      categoryFilter,
      platformFilter,
      publishedStatusFilter,
    }),
    [data, role, resourceType, searchTerm, categoryFilter, platformFilter, publishedStatusFilter],
  );

  return { resources, loading, error, canView };
}

export async function listResources({ role, resourceType = '' } = {}) {
  const resources = await fetchResourcesFromFirestore({ role, resourceType });
  return resources;
}

export async function getResource(resourceId, { role } = {}) {
  assertCanViewShepherdingTools(role);

  if (!resourceId) {
    throw new Error('Resource ID is required.');
  }

  const resource = await getDocument(COLLECTIONS.SHEPHERDING_TOOLS, resourceId);
  if (!resource) {
    throw new Error('Resource not found.');
  }

  assertCanViewResource(role, resource);
  return resource;
}

export async function createResource(
  formData,
  { role, createdByUserId = '', coverFile = null } = {},
) {
  assertCanManageResource(role);

  if (coverFile) {
    const coverValidationMessage = validateShepherdingCoverFile(coverFile);
    if (coverValidationMessage) {
      throw new Error(coverValidationMessage);
    }
  }

  const validationMessage = validateShepherdingResourceForm(formData);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const docRef = doc(collection(db, COLLECTIONS.SHEPHERDING_TOOLS));
  const resourceId = docRef.id;
  let uploadedCover = null;

  if (coverFile) {
    uploadedCover = await uploadShepherdingCoverImage(coverFile, resourceId);
  }

  const payload = buildShepherdingResourcePayload(
    {
      ...formData,
      coverImageUrl: uploadedCover?.coverImageUrl || formData.coverImageUrl || '',
      coverImageStoragePath: uploadedCover?.coverImageStoragePath || formData.coverImageStoragePath || '',
    },
    { createdByUserId },
  );

  const document = buildShepherdingResourceFirestoreDocument(payload, {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    deletedAt: null,
  });

  try {
    await setDoc(docRef, document);

    return {
      resource: { id: resourceId, ...document },
      storageWarnings: [],
    };
  } catch (error) {
    await rollbackCoverUpload(uploadedCover?.coverImageStoragePath);
    throw error;
  }
}

export async function updateResource(
  resourceId,
  formData,
  {
    role,
    createdByUserId = '',
    initialData = null,
    coverFile = null,
    removeCover = false,
  } = {},
) {
  assertCanManageResource(role);

  if (!resourceId) {
    throw new Error('Resource ID is required.');
  }

  if (coverFile) {
    const coverValidationMessage = validateShepherdingCoverFile(coverFile);
    if (coverValidationMessage) {
      throw new Error(coverValidationMessage);
    }
  }

  const validationMessage = validateShepherdingResourceForm(formData);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const existing = initialData || (await getDocument(COLLECTIONS.SHEPHERDING_TOOLS, resourceId));
  if (!existing) {
    throw new Error('Resource not found.');
  }

  assertCanEditResource(role, existing);

  const previousCoverPath = resolvePreviousShepherdingCoverPath(formData, existing);
  let replacementCover = null;

  let nextCoverUrl = isPermanentCoverUrl(formData.coverImageUrl)
    ? String(formData.coverImageUrl).trim()
    : existing.coverImageUrl || '';
  let nextCoverPath = String(formData.coverImageStoragePath || existing.coverImageStoragePath || '').trim();

  if (removeCover) {
    nextCoverUrl = '';
    nextCoverPath = '';
  } else if (coverFile) {
    replacementCover = await uploadShepherdingCoverImage(coverFile, resourceId);
    nextCoverUrl = replacementCover.coverImageUrl;
    nextCoverPath = replacementCover.coverImageStoragePath;
  }

  const payload = buildShepherdingResourcePayload(
    {
      ...formData,
      coverImageUrl: nextCoverUrl,
      coverImageStoragePath: nextCoverPath,
      createdByUserId: existing.createdByUserId || createdByUserId,
    },
    { createdByUserId: existing.createdByUserId || createdByUserId },
  );

  const document = buildShepherdingResourceFirestoreDocument(payload, {
    createdAt: existing.createdAt ?? null,
    updatedAt: serverTimestamp(),
    deletedAt: existing.deletedAt ?? null,
  });

  try {
    await updateDoc(doc(db, COLLECTIONS.SHEPHERDING_TOOLS, resourceId), {
      ...document,
      updatedAt: serverTimestamp(),
    });

    const storageWarnings = await cleanupShepherdingCoverOnReplace(
      { previousCoverPath },
      existing,
      nextCoverPath,
    );

    return {
      resource: { id: resourceId, ...document },
      storageWarnings,
    };
  } catch (error) {
    await rollbackCoverUpload(replacementCover?.coverImageStoragePath);
    throw error;
  }
}

export async function deleteResource(resourceId, { role, initialData = null } = {}) {
  assertCanManageResource(role);

  if (!resourceId) {
    throw new Error('Resource ID is required.');
  }

  const existing = initialData || (await getDocument(COLLECTIONS.SHEPHERDING_TOOLS, resourceId));
  if (!existing) {
    throw new Error('Resource not found.');
  }

  assertCanDeleteResource(role, existing);

  const coverPath = resolveShepherdingResourceCoverPath(existing);

  await updateDoc(doc(db, COLLECTIONS.SHEPHERDING_TOOLS, resourceId), {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const storageWarnings = [];
  const warning = await cleanupUnusedUpload(coverPath, deleteShepherdingCoverImage);
  if (warning) storageWarnings.push(warning);

  return { resourceId, storageWarnings };
}

export async function publishResource(resourceId, { role, initialData = null } = {}) {
  assertCanManageResource(role);

  if (!resourceId) {
    throw new Error('Resource ID is required.');
  }

  const existing = initialData || (await getDocument(COLLECTIONS.SHEPHERDING_TOOLS, resourceId));
  if (!existing) {
    throw new Error('Resource not found.');
  }

  assertCanPublishResource(role, existing);

  await updateDoc(doc(db, COLLECTIONS.SHEPHERDING_TOOLS, resourceId), {
    publishedStatus: PUBLISHED_STATUS.PUBLISHED,
    updatedAt: serverTimestamp(),
  });

  return {
    resource: {
      ...existing,
      id: resourceId,
      publishedStatus: PUBLISHED_STATUS.PUBLISHED,
    },
  };
}

export async function unpublishResource(resourceId, { role, initialData = null } = {}) {
  assertCanManageResource(role);

  if (!resourceId) {
    throw new Error('Resource ID is required.');
  }

  const existing = initialData || (await getDocument(COLLECTIONS.SHEPHERDING_TOOLS, resourceId));
  if (!existing) {
    throw new Error('Resource not found.');
  }

  assertCanPublishResource(role, existing);

  await updateDoc(doc(db, COLLECTIONS.SHEPHERDING_TOOLS, resourceId), {
    publishedStatus: PUBLISHED_STATUS.DRAFT,
    updatedAt: serverTimestamp(),
  });

  return {
    resource: {
      ...existing,
      id: resourceId,
      publishedStatus: PUBLISHED_STATUS.DRAFT,
    },
  };
}

export async function searchResources(
  { role, resourceType = '', searchTerm = '' } = {},
) {
  const resources = await listResources({ role, resourceType });
  return applyShepherdingToolsSearch(resources, { role, resourceType, searchTerm });
}

export async function cleanupShepherdingCoverOnReplace(
  formData,
  initialData,
  nextCoverPath,
  deleteFn = deleteShepherdingCoverImage,
) {
  const previousPath = resolvePreviousShepherdingCoverPath(formData, initialData);

  if (!shouldCleanupPreviousShepherdingCover(previousPath, nextCoverPath)) {
    return [];
  }

  const warning = await cleanupUnusedUpload(previousPath, deleteFn);
  return warning ? [warning] : [];
}

export function resolveShepherdingResourceCoverPath(resource = {}) {
  return resolveShepherdingCoverStoragePath(resource);
}
