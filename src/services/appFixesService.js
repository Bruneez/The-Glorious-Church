import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import { canPerformAction } from '@/config/permissions';
import {
  buildAppFixAttachmentFirestoreDocument,
  buildAppFixAttachmentPayload,
} from '@/config/appFixesAttachmentOptions';
import {
  buildAppFixRequestFirestoreDocument,
  buildAppFixRequestPayload,
  validateAppFixRequestForm,
} from '@/config/appFixesRequestOptions';
import {
  buildAppFixUpdateFirestoreDocument,
  buildAppFixUpdatePayload,
  isAppFixUpdateDeleted,
} from '@/config/appFixesUpdateOptions';
import { APP_FIX_UPDATE_TYPE } from '@/config/appFixesConstants';
import { toAppFixError } from '@/config/appFixesErrorMessages';
import { APP_FIX_MANAGEMENT_ACTIONS } from '@/config/appFixesManagementOptions';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/config/firebase';
import { getDocument, getDocuments } from '@/hooks/useFirestore';
import { resolveAppFixAttachmentStoragePath } from '@/utils/storagePathUtils';
import {
  assertCanCreateRequest,
  assertCanDeleteRequest,
  assertCanEditRequest,
  assertCanManageAppFixes,
  assertCanUserEditRequestContent,
  assertCanViewAppFixes,
  assertCanViewRequest,
  canManageRequest,
  VIEW_DENIED_MESSAGE,
} from '@/services/appFixesGuards';
import { cleanupUnusedUpload } from '@/services/appFixesStorageLifecycle';
import { deleteAppFixAttachment, uploadAppFixAttachment } from '@/services/storageService';
import {
  notifyAfterDuplicate,
  notifyAfterManagementUpdate,
  notifyAfterRequestSubmitted,
  notifyAfterUserAdditionalInfo,
} from '@/services/appFixesNotifications';
import {
  applyAppFixRequestSearch,
  getAppFixAttachmentsQueryConstraints,
  getAppFixRequestsQueryConstraints,
  getAppFixUpdatesQueryConstraints,
  normalizeAppFixRequests,
} from '@/services/appFixesQueryUtils';

async function fetchRequestsFromFirestore({ role, createdByUserId = '' } = {}) {
  assertCanViewAppFixes(role);

  const constraints = getAppFixRequestsQueryConstraints({ role, createdByUserId });
  const documents = await getDocuments(COLLECTIONS.APP_FIX_REQUESTS, constraints);
  return normalizeAppFixRequests(documents, role, createdByUserId);
}

export {
  applyAppFixRequestSearch,
  getAppFixRequestsQueryConstraints,
  normalizeAppFixRequests,
} from '@/services/appFixesQueryUtils';

function filterVisibleUpdates(updates = [], role) {
  if (canManageRequest(role)) {
    return updates.filter((update) => !isAppFixUpdateDeleted(update));
  }

  return updates.filter((update) => !isAppFixUpdateDeleted(update) && !update.isInternal);
}

async function softDeleteRelatedRecords(requestId) {
  const [updates, attachments] = await Promise.all([
    getDocuments(COLLECTIONS.APP_FIX_UPDATES, [where('requestId', '==', requestId)]),
    getDocuments(COLLECTIONS.APP_FIX_ATTACHMENTS, [where('requestId', '==', requestId)]),
  ]);

  const timestamp = serverTimestamp();
  const relatedDocs = [
    ...updates.map((update) => ({ collection: COLLECTIONS.APP_FIX_UPDATES, id: update.id })),
    ...attachments.map((attachment) => ({
      collection: COLLECTIONS.APP_FIX_ATTACHMENTS,
      id: attachment.id,
    })),
  ];

  await Promise.all(
    relatedDocs.map(({ collection: collectionName, id }) =>
      updateDoc(doc(db, collectionName, id), {
        deletedAt: timestamp,
      })),
  );

  return attachments.filter((attachment) => !attachment.deletedAt);
}

async function createAttachmentRecord(requestId, uploadResult, { uploadedByUserId = '' } = {}) {
  const docRef = doc(collection(db, COLLECTIONS.APP_FIX_ATTACHMENTS));
  const payload = buildAppFixAttachmentPayload(
    {
      requestId,
      fileName: uploadResult.fileName,
      fileUrl: uploadResult.fileUrl,
      fileStoragePath: uploadResult.fileStoragePath,
      contentType: uploadResult.contentType,
      fileSizeBytes: uploadResult.fileSizeBytes,
    },
    { uploadedByUserId },
  );

  const document = buildAppFixAttachmentFirestoreDocument(payload, {
    createdAt: serverTimestamp(),
    deletedAt: null,
  });

  await setDoc(docRef, document);

  return {
    attachment: { id: docRef.id, ...document },
  };
}

async function createRequestUpdate(
  requestId,
  input,
  { role, createdByUserId = '', createdByName = '' } = {},
) {
  assertCanViewRequest(role, await getRequest(requestId, { role, createdByUserId }), createdByUserId);

  const docRef = doc(collection(db, COLLECTIONS.APP_FIX_UPDATES));
  const payload = buildAppFixUpdatePayload(
    {
      requestId,
      ...input,
    },
    { createdByUserId, createdByName },
  );

  const document = buildAppFixUpdateFirestoreDocument(payload, {
    createdAt: serverTimestamp(),
    deletedAt: null,
  });

  await setDoc(docRef, document);

  return {
    update: { id: docRef.id, ...document },
  };
}

async function uploadAttachmentsForRequest(
  requestId,
  attachmentFiles = [],
  {
    uploadedByUserId = '',
    onFileProgress,
  } = {},
) {
  const uploadedAttachments = [];

  for (let index = 0; index < attachmentFiles.length; index += 1) {
    const file = attachmentFiles[index];
    const uploadResult = await uploadAppFixAttachment(file, requestId, {
      onProgress: (progress) => {
        if (typeof onFileProgress === 'function') {
          onFileProgress(index, progress);
        }
      },
    });

    const { attachment } = await createAttachmentRecord(requestId, uploadResult, {
      uploadedByUserId,
    });
    uploadedAttachments.push(attachment);
  }

  return uploadedAttachments;
}

export function useAppFixRequests(
  {
    searchTerm = '',
    statusFilter = '',
    priorityFilter = '',
    categoryFilter = '',
  } = {},
) {
  const { role, firebaseUser } = useAuth();
  const createdByUserId = firebaseUser?.uid || '';
  const canView = canPerformAction(role, 'VIEW_APP_FIXES');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!canView || !createdByUserId) {
      setData([]);
      setLoading(false);
      setError(canView ? null : new Error(VIEW_DENIED_MESSAGE));
      return undefined;
    }

    setLoading(true);
    setError(null);

    const constraints = getAppFixRequestsQueryConstraints({
      role,
      createdByUserId: canManageRequest(role) ? '' : createdByUserId,
    });
    const q = query(collection(db, COLLECTIONS.APP_FIX_REQUESTS), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const snapshotRequests = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));

        setData(normalizeAppFixRequests(snapshotRequests, role, createdByUserId));
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        console.error('useAppFixRequests subscription error:', snapshotError);
        setError(snapshotError);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [canView, createdByUserId, role]);

  const requests = useMemo(
    () => applyAppFixRequestSearch(data, {
      searchTerm,
      statusFilter,
      priorityFilter,
      categoryFilter,
      createdByUserId: canManageRequest(role) ? '' : createdByUserId,
    }),
    [data, role, createdByUserId, searchTerm, statusFilter, priorityFilter, categoryFilter],
  );

  return { requests, allRequests: data, loading, error, canView, createdByUserId };
}

export function useAppFixRequestDetails(requestId, { enabled = true } = {}) {
  const { role, firebaseUser } = useAuth();
  const createdByUserId = firebaseUser?.uid || '';
  const [updates, setUpdates] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !requestId || !createdByUserId) {
      setUpdates([]);
      setAttachments([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);

    const updatesQuery = query(
      collection(db, COLLECTIONS.APP_FIX_UPDATES),
      ...getAppFixUpdatesQueryConstraints(requestId),
    );
    const attachmentsQuery = query(
      collection(db, COLLECTIONS.APP_FIX_ATTACHMENTS),
      ...getAppFixAttachmentsQueryConstraints(requestId),
    );

    let pending = 2;
    let updatesSnapshot = [];
    let attachmentsSnapshot = [];

    const finishIfReady = () => {
      pending -= 1;
      if (pending > 0) return;

      setUpdates(filterVisibleUpdates(updatesSnapshot, role));
      setAttachments(attachmentsSnapshot.filter((attachment) => !attachment.deletedAt));
      setLoading(false);
    };

    const unsubscribeUpdates = onSnapshot(
      updatesQuery,
      (snapshot) => {
        updatesSnapshot = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));
        finishIfReady();
      },
      (snapshotError) => {
        setError(snapshotError);
        setLoading(false);
      },
    );

    const unsubscribeAttachments = onSnapshot(
      attachmentsQuery,
      (snapshot) => {
        attachmentsSnapshot = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));
        finishIfReady();
      },
      (snapshotError) => {
        setError(snapshotError);
        setLoading(false);
      },
    );

    return () => {
      unsubscribeUpdates();
      unsubscribeAttachments();
    };
  }, [createdByUserId, enabled, requestId, role]);

  return { updates, attachments, loading, error, createdByUserId };
}

export async function listRequests({ role, createdByUserId = '' } = {}) {
  return fetchRequestsFromFirestore({ role, createdByUserId });
}

export async function getRequest(requestId, { role, createdByUserId = '' } = {}) {
  assertCanViewAppFixes(role);

  if (!requestId) {
    throw new Error('Request ID is required.');
  }

  const request = await getDocument(COLLECTIONS.APP_FIX_REQUESTS, requestId);
  if (!request) {
    throw new Error('Request not found.');
  }

  assertCanViewRequest(role, request, createdByUserId);
  return request;
}

export async function listUpdatesForRequest(requestId, { role, createdByUserId = '' } = {}) {
  const request = await getRequest(requestId, { role, createdByUserId });
  const updates = await getDocuments(
    COLLECTIONS.APP_FIX_UPDATES,
    getAppFixUpdatesQueryConstraints(requestId),
  );

  assertCanViewRequest(role, request, createdByUserId);
  return filterVisibleUpdates(updates, role);
}

export async function listAttachmentsForRequest(requestId, { role, createdByUserId = '' } = {}) {
  const request = await getRequest(requestId, { role, createdByUserId });
  const attachments = await getDocuments(
    COLLECTIONS.APP_FIX_ATTACHMENTS,
    getAppFixAttachmentsQueryConstraints(requestId),
  );

  assertCanViewRequest(role, request, createdByUserId);
  return attachments.filter((attachment) => !attachment.deletedAt);
}

export async function createRequest(
  formData,
  { role, createdByUserId = '', createdByStaffId = '', createdByName = '' } = {},
) {
  assertCanCreateRequest(role);

  const validationMessage = validateAppFixRequestForm(formData);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const docRef = doc(collection(db, COLLECTIONS.APP_FIX_REQUESTS));
  const requestId = docRef.id;

  const payload = buildAppFixRequestPayload(
    {
      ...formData,
      createdByStaffId,
      createdByName,
    },
    { createdByUserId, requestId },
  );

  const document = buildAppFixRequestFirestoreDocument(payload, {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    deletedAt: null,
  });

  await setDoc(docRef, document);

  return {
    request: { id: requestId, ...document },
  };
}

export async function submitRequestWithAttachments(
  formData,
  attachmentFiles = [],
  {
    role,
    createdByUserId = '',
    createdByStaffId = '',
    createdByName = '',
    onFileProgress,
  } = {},
) {
  const { request } = await createRequest(formData, {
    role,
    createdByUserId,
    createdByStaffId,
    createdByName,
  });

  let uploadedAttachments = [];
  try {
    uploadedAttachments = await uploadAttachmentsForRequest(
      request.id,
      attachmentFiles,
      { uploadedByUserId: createdByUserId, onFileProgress },
    );

    if (uploadedAttachments.length) {
      await updateDoc(doc(db, COLLECTIONS.APP_FIX_REQUESTS, request.id), {
        attachmentCount: uploadedAttachments.length,
        updatedAt: serverTimestamp(),
      });
    }

    await createRequestUpdate(
      request.id,
      {
        updateType: APP_FIX_UPDATE_TYPE.COMMENT,
        message: 'Request submitted.',
        isInternal: false,
      },
      { role, createdByUserId, createdByName },
    );

    await notifyAfterRequestSubmitted(
      {
        ...request,
        attachmentCount: uploadedAttachments.length,
        createdByStaffId,
        createdByName,
        priority: formData.priority || request.priority,
      },
      { excludeStaffId: createdByStaffId },
    );

    return {
      request: {
        ...request,
        attachmentCount: uploadedAttachments.length,
      },
      attachments: uploadedAttachments,
    };
  } catch (error) {
    for (const attachment of uploadedAttachments) {
      const path = resolveAppFixAttachmentStoragePath(attachment);
      await cleanupUnusedUpload(path, deleteAppFixAttachment);
    }
    throw toAppFixError(error, 'Your request could not be submitted. Please try again.');
  }
}

export async function updateRequest(
  requestId,
  formData,
  {
    role,
    createdByUserId = '',
    initialData = null,
    attachmentFiles = [],
    onFileProgress,
    createdByName = '',
  } = {},
) {
  if (!requestId) {
    throw new Error('Request ID is required.');
  }

  const validationMessage = validateAppFixRequestForm(formData);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const existing = initialData || (await getDocument(COLLECTIONS.APP_FIX_REQUESTS, requestId));
  if (!existing) {
    throw new Error('Request not found.');
  }

  if (canManageRequest(role)) {
    assertCanEditRequest(role, existing, createdByUserId);
  } else {
    assertCanUserEditRequestContent(role, existing, createdByUserId);
  }

  const uploadedAttachments = attachmentFiles.length
    ? await uploadAttachmentsForRequest(requestId, attachmentFiles, {
      uploadedByUserId: createdByUserId,
      onFileProgress,
    })
    : [];

  const payload = buildAppFixRequestPayload(
    {
      ...formData,
      attachmentCount: Number(existing.attachmentCount || 0) + uploadedAttachments.length,
      createdByStaffId: existing.createdByStaffId,
      createdByName: existing.createdByName,
      createdByUserId: existing.createdByUserId,
      status: existing.status,
      referenceNumber: existing.referenceNumber,
    },
    { createdByUserId: existing.createdByUserId, requestId },
  );

  const document = buildAppFixRequestFirestoreDocument(payload, {
    createdAt: existing.createdAt ?? null,
    updatedAt: serverTimestamp(),
    deletedAt: existing.deletedAt ?? null,
  });

  await updateDoc(doc(db, COLLECTIONS.APP_FIX_REQUESTS, requestId), {
    ...document,
    updatedAt: serverTimestamp(),
  });

  if (uploadedAttachments.length) {
    await createRequestUpdate(
      requestId,
      {
        updateType: APP_FIX_UPDATE_TYPE.COMMENT,
        message: 'Additional information added by the requester.',
        isInternal: false,
      },
      { role, createdByUserId, createdByName },
    );

    await notifyAfterUserAdditionalInfo(
      { ...existing, id: requestId },
      { excludeStaffId: existing.createdByStaffId || '' },
    );
  }

  return {
    request: { id: requestId, ...document },
    attachments: uploadedAttachments,
  };
}

export async function deleteRequest(
  requestId,
  { role, createdByUserId = '', initialData = null } = {},
) {
  if (!requestId) {
    throw new Error('Request ID is required.');
  }

  const existing = initialData || (await getDocument(COLLECTIONS.APP_FIX_REQUESTS, requestId));
  if (!existing) {
    throw new Error('Request not found.');
  }

  assertCanDeleteRequest(role, existing, createdByUserId);

  const attachments = await softDeleteRelatedRecords(requestId);

  await updateDoc(doc(db, COLLECTIONS.APP_FIX_REQUESTS, requestId), {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const storageWarnings = [];
  for (const attachment of attachments) {
    const attachmentPath = resolveAppFixAttachmentStoragePath(attachment);
    const warning = await cleanupUnusedUpload(attachmentPath, deleteAppFixAttachment);
    if (warning) storageWarnings.push(warning);
  }

  return { requestId, storageWarnings };
}

export async function searchRequests(
  {
    role,
    createdByUserId = '',
    searchTerm = '',
    statusFilter = '',
    priorityFilter = '',
    categoryFilter = '',
  } = {},
) {
  const requests = await listRequests({ role, createdByUserId });
  return applyAppFixRequestSearch(requests, {
    searchTerm,
    statusFilter,
    priorityFilter,
    categoryFilter,
    createdByUserId: canManageRequest(role) ? '' : createdByUserId,
  });
}

async function recordManagementTimelineEntries(
  requestId,
  existing,
  nextValues,
  { role, createdByUserId = '', createdByName = '' },
) {
  const entries = [];

  if (nextValues.status && nextValues.status !== existing.status) {
    entries.push({
      updateType: APP_FIX_UPDATE_TYPE.STATUS_CHANGE,
      message: `Status changed from ${existing.status || 'unknown'} to ${nextValues.status}.`,
      previousStatus: existing.status || null,
      newStatus: nextValues.status,
      isInternal: false,
    });
  }

  if (nextValues.priority && nextValues.priority !== existing.priority) {
    entries.push({
      updateType: APP_FIX_UPDATE_TYPE.PRIORITY_CHANGE,
      message: `Priority changed from ${existing.priority || 'unknown'} to ${nextValues.priority}.`,
      previousPriority: existing.priority || null,
      newPriority: nextValues.priority,
      isInternal: false,
    });
  }

  if (nextValues.assignedToUserId !== undefined
    && String(nextValues.assignedToUserId || '') !== String(existing.assignedToUserId || '')) {
    entries.push({
      updateType: APP_FIX_UPDATE_TYPE.ASSIGNMENT,
      message: nextValues.assignedToName
        ? `Assigned to ${nextValues.assignedToName}.`
        : 'Assignment cleared.',
      assignedToUserId: nextValues.assignedToUserId || null,
      assignedToName: nextValues.assignedToName || null,
      isInternal: false,
    });
  }

  if (String(nextValues.internalNotes || '').trim()
    && String(nextValues.internalNotes || '').trim() !== String(existing.internalNotes || '').trim()) {
    entries.push({
      updateType: APP_FIX_UPDATE_TYPE.COMMENT,
      message: String(nextValues.internalNotes || '').trim(),
      isInternal: true,
    });
  }

  if (String(nextValues.developerNotes || '').trim()
    && String(nextValues.developerNotes || '').trim() !== String(existing.developerNotes || '').trim()) {
    entries.push({
      updateType: APP_FIX_UPDATE_TYPE.COMMENT,
      message: `Developer notes updated: ${String(nextValues.developerNotes || '').trim()}`,
      isInternal: true,
    });
  }

  if (String(nextValues.resolutionSummary || '').trim()
    && String(nextValues.resolutionSummary || '').trim() !== String(existing.resolutionSummary || '').trim()) {
    entries.push({
      updateType: APP_FIX_UPDATE_TYPE.COMMENT,
      message: `Resolution summary updated: ${String(nextValues.resolutionSummary || '').trim()}`,
      isInternal: false,
    });
  }

  for (const entry of entries) {
    await createRequestUpdate(requestId, entry, { role, createdByUserId, createdByName });
  }
}

export async function updateManagementRequest(
  requestId,
  formData,
  { role, createdByUserId = '', initialData = null, createdByName = '', actorStaffId = '' } = {},
) {
  assertCanManageAppFixes(role);

  if (!requestId) {
    throw new Error('Request ID is required.');
  }

  const existing = initialData || (await getDocument(COLLECTIONS.APP_FIX_REQUESTS, requestId));
  if (!existing) {
    throw new Error('Request not found.');
  }

  assertCanEditRequest(role, existing, createdByUserId);

  const payload = buildAppFixRequestPayload(
    {
      ...existing,
      ...formData,
      attachmentCount: existing.attachmentCount,
      createdByStaffId: existing.createdByStaffId,
      createdByName: existing.createdByName,
      createdByUserId: existing.createdByUserId,
      referenceNumber: existing.referenceNumber,
    },
    { createdByUserId: existing.createdByUserId, requestId },
  );

  await recordManagementTimelineEntries(
    requestId,
    existing,
    payload,
    { role, createdByUserId, createdByName },
  );

  const document = buildAppFixRequestFirestoreDocument(payload, {
    createdAt: existing.createdAt ?? null,
    updatedAt: serverTimestamp(),
    deletedAt: existing.deletedAt ?? null,
  });

  await updateDoc(doc(db, COLLECTIONS.APP_FIX_REQUESTS, requestId), {
    ...document,
    updatedAt: serverTimestamp(),
  });

  await notifyAfterManagementUpdate(existing, payload, {
    excludeStaffId: actorStaffId,
  });

  return {
    request: { id: requestId, ...document },
  };
}

export async function applyManagementAction(
  requestId,
  actionKey,
  { role, createdByUserId = '', initialData = null, createdByName = '', actorStaffId = '' } = {},
) {
  const action = APP_FIX_MANAGEMENT_ACTIONS[actionKey];
  if (!action) {
    throw new Error('Invalid management action.');
  }

  const existing = initialData || (await getRequest(requestId, { role, createdByUserId }));

  return updateManagementRequest(
    requestId,
    { status: action.status },
    {
      role,
      createdByUserId,
      initialData: existing,
      createdByName,
      actorStaffId,
    },
  );
}

export async function addManagementComment(
  requestId,
  { message, isInternal = false },
  { role, createdByUserId = '', createdByName = '' } = {},
) {
  assertCanManageAppFixes(role);

  if (!String(message || '').trim()) {
    throw new Error('Comment is required.');
  }

  await getRequest(requestId, { role, createdByUserId });

  return createRequestUpdate(
    requestId,
    {
      updateType: APP_FIX_UPDATE_TYPE.COMMENT,
      message: String(message).trim(),
      isInternal,
    },
    { role, createdByUserId, createdByName },
  );
}

export async function duplicateRequest(
  requestId,
  { role, createdByUserId = '', createdByName = '', actorStaffId = '' } = {},
) {
  assertCanManageAppFixes(role);

  const existing = await getRequest(requestId, { role, createdByUserId });
  const docRef = doc(collection(db, COLLECTIONS.APP_FIX_REQUESTS));
  const newRequestId = docRef.id;

  const payload = buildAppFixRequestPayload(
    {
      ...existing,
      status: APP_FIX_MANAGEMENT_ACTIONS.REOPEN.status,
      attachmentCount: 0,
      internalNotes: null,
      developerNotes: null,
      resolutionSummary: null,
      assignedToUserId: null,
      assignedToName: null,
    },
    {
      createdByUserId: existing.createdByUserId,
      requestId: newRequestId,
    },
  );

  const document = buildAppFixRequestFirestoreDocument(payload, {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    deletedAt: null,
  });

  await setDoc(docRef, document);

  await createRequestUpdate(
    newRequestId,
    {
      updateType: APP_FIX_UPDATE_TYPE.COMMENT,
      message: `Duplicated from ${existing.referenceNumber || requestId}.`,
      isInternal: true,
    },
    { role, createdByUserId, createdByName },
  );

  await notifyAfterDuplicate(existing, newRequestId, { excludeStaffId: actorStaffId });

  return {
    request: { id: newRequestId, ...document },
  };
}
