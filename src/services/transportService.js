import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import { createTransportUpdatedNotification } from '@/services/notificationService';
import {
  buildTransportPayload,
  isPermanentTransportImageUrl,
  validateTransportForm,
  validateTransportImageFile,
} from '@/config/transportOptions';
import {
  normalizeTransportImageUploadResult,
  toTransportImageUploadError,
} from '@/config/transportImageValidation';
import { resolveTransportVehicleImageStoragePath } from '@/utils/storagePathUtils';
import { db } from '@/config/firebase';
import {
  addDocument,
  deleteDocument,
  getDocument,
  getDocuments,
  updateDocument,
  useCollection,
  useDocument,
} from '@/hooks/useFirestore';
import { assertCanManageTransport } from '@/services/transportGuards';
import {
  cleanupTransportVehicleImageStoragePath,
  resolvePreviousTransportVehicleImagePath,
  shouldCleanupPreviousTransportVehicleImage,
} from '@/services/transportStorageLifecycle';
import {
  deleteTransportVehicleImage,
  uploadTransportVehicleImage,
} from '@/services/storageService';

async function rollbackNewUpload(vehicleImageStoragePath) {
  if (!vehicleImageStoragePath) return;

  try {
    await deleteTransportVehicleImage(vehicleImageStoragePath);
  } catch {
    // Non-blocking rollback failure.
  }
}

async function uploadValidatedTransportImage(imageFile, driverId) {
  try {
    const uploadResult = await uploadTransportVehicleImage(imageFile, driverId);
    return normalizeTransportImageUploadResult(uploadResult);
  } catch (error) {
    throw toTransportImageUploadError(error);
  }
}

function getStoredVehicleImageUrl(record = {}) {
  return (
    record.vehicleImageUrl
    || record.vehicleImage
    || record.vehiclePhoto
    || record.photo
    || record.image
    || ''
  );
}

export function useTransport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const q = query(collection(db, COLLECTIONS.TRANSPORT), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() })));
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        console.error('useTransport subscription error:', snapshotError);
        setError(snapshotError);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { data, loading, error };
}

export function useTransportRoute(routeId) {
  return useDocument(COLLECTIONS.TRANSPORT, routeId);
}

export function useTransportAssignments() {
  return useCollection(COLLECTIONS.TRANSPORT_ASSIGNMENTS, {
    constraints: [orderBy('date', 'desc')],
  });
}

export async function getTransport() {
  return getDocuments(COLLECTIONS.TRANSPORT, [orderBy('createdAt', 'desc')]);
}

export async function getTransportRoute(routeId) {
  return getDocument(COLLECTIONS.TRANSPORT, routeId);
}

export async function getTransportAssignments(filters = {}) {
  const constraints = [];

  if (filters.date) {
    constraints.push(where('date', '==', filters.date));
  }

  if (filters.routeId) {
    constraints.push(where('routeId', '==', filters.routeId));
  }

  constraints.push(orderBy('date', 'desc'));

  return getDocuments(COLLECTIONS.TRANSPORT_ASSIGNMENTS, constraints);
}

export async function createTransportRoute(
  formData,
  { role, createdBy = '', imageFile = null } = {},
) {
  assertCanManageTransport(role);

  const validationMessage = validateTransportForm(formData);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  if (imageFile) {
    const imageValidationMessage = validateTransportImageFile(imageFile);
    if (imageValidationMessage) {
      throw new Error(imageValidationMessage);
    }
  }

  const docRef = doc(collection(db, COLLECTIONS.TRANSPORT));
  const driverId = docRef.id;

  let uploadedImage = null;

  if (imageFile) {
    uploadedImage = await uploadValidatedTransportImage(imageFile, driverId);
  }

  const payload = buildTransportPayload(
    {
      ...formData,
      vehicleImageUrl: uploadedImage?.vehicleImageUrl || '',
      vehicleImageStoragePath: uploadedImage?.vehicleImageStoragePath || '',
    },
    createdBy,
  );

  try {
    await setDoc(docRef, {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await createTransportUpdatedNotification({
      transportId: driverId,
      transportLabel: payload.name || 'Transport route',
      action: 'created',
    }).catch((notificationError) => {
      console.error('Failed to create transport notification:', notificationError);
    });

    return {
      route: { id: driverId, ...payload },
      storageWarnings: [],
    };
  } catch (error) {
    await rollbackNewUpload(uploadedImage?.vehicleImageStoragePath);
    throw error;
  }
}

export async function updateTransportRoute(
  routeId,
  formData,
  { role, createdBy = '', initialData = null, imageFile = null, removeImage = false } = {},
) {
  assertCanManageTransport(role);

  if (!routeId) {
    throw new Error('Transport record ID is required.');
  }

  const validationMessage = validateTransportForm(formData);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  if (imageFile) {
    const imageValidationMessage = validateTransportImageFile(imageFile);
    if (imageValidationMessage) {
      throw new Error(imageValidationMessage);
    }
  }

  const existing = initialData || (await getDocument(COLLECTIONS.TRANSPORT, routeId));
  if (!existing) {
    throw new Error('Transport record not found.');
  }

  const previousImagePath = resolvePreviousTransportVehicleImagePath(formData, existing);
  let replacementImage = null;

  let nextVehicleImageUrl = isPermanentTransportImageUrl(formData.vehicleImageUrl)
    ? String(formData.vehicleImageUrl).trim()
    : getStoredVehicleImageUrl(existing);
  let nextVehicleImagePath = String(
    formData.vehicleImageStoragePath || existing.vehicleImageStoragePath || '',
  ).trim();

  if (removeImage) {
    nextVehicleImageUrl = '';
    nextVehicleImagePath = '';
  } else if (imageFile) {
    replacementImage = await uploadValidatedTransportImage(imageFile, routeId);
    nextVehicleImageUrl = replacementImage.vehicleImageUrl;
    nextVehicleImagePath = replacementImage.vehicleImageStoragePath;
  }

  const payload = buildTransportPayload(
    {
      ...formData,
      vehicleImageUrl: nextVehicleImageUrl,
      vehicleImageStoragePath: nextVehicleImagePath,
    },
    existing.createdBy || createdBy,
    existing,
  );

  try {
    await updateDoc(doc(db, COLLECTIONS.TRANSPORT, routeId), {
      ...payload,
      updatedAt: serverTimestamp(),
    });

    const storageWarnings = [];

    if (shouldCleanupPreviousTransportVehicleImage(previousImagePath, nextVehicleImagePath)) {
      const warning = await cleanupTransportVehicleImageStoragePath(
        previousImagePath,
        deleteTransportVehicleImage,
      );
      if (warning) storageWarnings.push(warning);
    }

    await createTransportUpdatedNotification({
      transportId: routeId,
      transportLabel: payload.name || 'Transport route',
      action: 'updated',
    }).catch((notificationError) => {
      console.error('Failed to create transport notification:', notificationError);
    });

    return {
      route: { id: routeId, ...payload },
      storageWarnings,
    };
  } catch (error) {
    await rollbackNewUpload(replacementImage?.vehicleImageStoragePath);
    throw error;
  }
}

export async function deleteTransportRoute(routeId, { role, initialData = null } = {}) {
  assertCanManageTransport(role);

  if (!routeId) {
    throw new Error('Transport record ID is required.');
  }

  const existing = initialData || (await getDocument(COLLECTIONS.TRANSPORT, routeId));
  if (!existing) {
    throw new Error('Transport record not found.');
  }

  const vehicleImageStoragePath = resolveTransportVehicleImageStoragePath(existing);

  await deleteDocument(COLLECTIONS.TRANSPORT, routeId);

  const storageWarnings = [];
  const warning = await cleanupTransportVehicleImageStoragePath(
    vehicleImageStoragePath,
    deleteTransportVehicleImage,
  );
  if (warning) storageWarnings.push(warning);

  return { routeId, storageWarnings };
}

export async function createTransportAssignment(assignmentData) {
  const timestamp = new Date().toISOString();
  const createdAssignment = await addDocument(COLLECTIONS.TRANSPORT_ASSIGNMENTS, {
    ...assignmentData,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await createTransportUpdatedNotification({
    transportId: createdAssignment.id,
    transportLabel: assignmentData.routeName || assignmentData.date || 'Transport assignment',
    action: 'created',
  }).catch((notificationError) => {
    console.error('Failed to create transport assignment notification:', notificationError);
  });

  return createdAssignment;
}

export async function updateTransportAssignment(assignmentId, assignmentData) {
  const updatedAssignment = await updateDocument(COLLECTIONS.TRANSPORT_ASSIGNMENTS, assignmentId, {
    ...assignmentData,
    updatedAt: new Date().toISOString(),
  });

  await createTransportUpdatedNotification({
    transportId: assignmentId,
    transportLabel: assignmentData.routeName || assignmentData.date || 'Transport assignment',
    action: 'updated',
  }).catch((notificationError) => {
    console.error('Failed to create transport assignment notification:', notificationError);
  });

  return updatedAssignment;
}

export async function deleteTransportAssignment(assignmentId) {
  return deleteDocument(COLLECTIONS.TRANSPORT_ASSIGNMENTS, assignmentId);
}

export async function getAssignmentsByDate(date) {
  return getTransportAssignments({ date });
}

export async function getAssignmentsByRoute(routeId) {
  return getTransportAssignments({ routeId });
}
