import { useEffect, useState } from 'react';
import {
  collection,
  deleteField,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import { canPerformAction } from '@/config/permissions';
import {
  buildTravelDestinationPayload,
  getTravelDestinationFieldClears,
  isPermanentImageUrl,
  validateTravelDestinationForm,
  validateTravelImageFile,
} from '@/config/travellingOptions';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/config/firebase';
import { deleteDocument, getDocument } from '@/hooks/useFirestore';
import {
  assertCanManageTravelling,
  assertCanViewTravelling,
  VIEW_DENIED_MESSAGE,
} from '@/services/travellingGuards';
import {
  deleteTravelDestinationImage,
  uploadTravelDestinationImage,
} from '@/services/storageService';

function buildUpdatePayload(formData, { createdBy = '' } = {}) {
  const payload = buildTravelDestinationPayload(formData, { createdBy });
  const clears = getTravelDestinationFieldClears(payload.travelExtent).reduce((acc, field) => {
    acc[field] = deleteField();
    return acc;
  }, {});

  return {
    ...payload,
    ...clears,
    updatedAt: serverTimestamp(),
  };
}

async function cleanupUploadedImage(imageStoragePath) {
  if (!imageStoragePath) return;

  try {
    await deleteTravelDestinationImage(imageStoragePath);
  } catch (error) {
    console.warn('Failed to clean up unused travel destination image:', error);
  }
}

export function useTravelDestinations() {
  const { role } = useAuth();
  const canView = canPerformAction(role, 'VIEW_TRAVELLING');
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

    const q = query(
      collection(db, COLLECTIONS.TRAVEL_DESTINATIONS),
      orderBy('updatedAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() })));
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        console.error('useTravelDestinations subscription error:', snapshotError);
        setError(snapshotError);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [canView]);

  return { data, loading, error, canView };
}

export async function createTravelDestination(formData, { role, createdBy = '', imageFile = null } = {}) {
  assertCanManageTravelling(role);

  const validationMessage = validateTravelDestinationForm(formData);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  if (imageFile) {
    const imageValidationMessage = validateTravelImageFile(imageFile);
    if (imageValidationMessage) {
      throw new Error(imageValidationMessage);
    }
  }

  const docRef = doc(collection(db, COLLECTIONS.TRAVEL_DESTINATIONS));
  const destinationId = docRef.id;

  let uploadedImage = null;

  if (imageFile) {
    uploadedImage = await uploadTravelDestinationImage(imageFile, destinationId);
  }

  const payload = buildTravelDestinationPayload(
    {
      ...formData,
      imageUrl: uploadedImage?.imageUrl || '',
      imageStoragePath: uploadedImage?.imageStoragePath || '',
    },
    { createdBy },
  );

  try {
    await setDoc(docRef, {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: destinationId, ...payload };
  } catch (error) {
    await cleanupUploadedImage(uploadedImage?.imageStoragePath);
    throw error;
  }
}

export async function updateTravelDestination(
  destinationId,
  formData,
  { role, createdBy = '', initialData = null, imageFile = null, removeImage = false } = {},
) {
  assertCanManageTravelling(role);

  if (!destinationId) {
    throw new Error('Travel destination ID is required.');
  }

  const validationMessage = validateTravelDestinationForm(formData);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  if (imageFile) {
    const imageValidationMessage = validateTravelImageFile(imageFile);
    if (imageValidationMessage) {
      throw new Error(imageValidationMessage);
    }
  }

  const existing = initialData || (await getDocument(COLLECTIONS.TRAVEL_DESTINATIONS, destinationId));
  if (!existing) {
    throw new Error('Travel destination not found.');
  }

  const previousImagePath = existing.imageStoragePath || '';
  let replacementImage = null;

  let nextImageUrl = isPermanentImageUrl(formData.imageUrl)
    ? String(formData.imageUrl).trim()
    : existing.imageUrl || '';
  let nextImagePath = String(formData.imageStoragePath || existing.imageStoragePath || '').trim();

  if (removeImage) {
    nextImageUrl = '';
    nextImagePath = '';
  } else if (imageFile) {
    replacementImage = await uploadTravelDestinationImage(imageFile, destinationId);
    nextImageUrl = replacementImage.imageUrl;
    nextImagePath = replacementImage.imageStoragePath;
  }

  const payload = buildUpdatePayload(
    {
      ...formData,
      imageUrl: nextImageUrl,
      imageStoragePath: nextImagePath,
      createdBy: existing.createdBy || createdBy,
    },
    { createdBy: existing.createdBy || createdBy },
  );

  try {
    await updateDoc(doc(db, COLLECTIONS.TRAVEL_DESTINATIONS, destinationId), payload);

    const shouldDeletePrevious =
      previousImagePath &&
      previousImagePath !== nextImagePath &&
      (removeImage || Boolean(imageFile));

    if (shouldDeletePrevious) {
      await cleanupUploadedImage(previousImagePath);
    }

    return { id: destinationId, ...payload };
  } catch (error) {
    await cleanupUploadedImage(replacementImage?.imageStoragePath);
    throw error;
  }
}

export async function deleteTravelDestination(destinationId, { role, initialData = null } = {}) {
  assertCanManageTravelling(role);

  if (!destinationId) {
    throw new Error('Travel destination ID is required.');
  }

  const existing = initialData || (await getDocument(COLLECTIONS.TRAVEL_DESTINATIONS, destinationId));
  if (!existing) {
    throw new Error('Travel destination not found.');
  }

  await deleteDocument(COLLECTIONS.TRAVEL_DESTINATIONS, destinationId);

  if (existing.imageStoragePath) {
    await cleanupUploadedImage(existing.imageStoragePath);
  }

  return destinationId;
}

export async function replaceTravelDestinationImage(
  destinationId,
  imageFile,
  { role, initialData = null } = {},
) {
  assertCanManageTravelling(role);

  if (!destinationId) {
    throw new Error('Travel destination ID is required.');
  }

  const imageValidationMessage = validateTravelImageFile(imageFile);
  if (imageValidationMessage) {
    throw new Error(imageValidationMessage);
  }

  const existing = initialData || (await getDocument(COLLECTIONS.TRAVEL_DESTINATIONS, destinationId));
  if (!existing) {
    throw new Error('Travel destination not found.');
  }

  const previousImagePath = existing.imageStoragePath || '';
  const replacementImage = await uploadTravelDestinationImage(imageFile, destinationId);

  try {
    await updateDoc(doc(db, COLLECTIONS.TRAVEL_DESTINATIONS, destinationId), {
      imageUrl: replacementImage.imageUrl,
      imageStoragePath: replacementImage.imageStoragePath,
      updatedAt: serverTimestamp(),
    });

    if (previousImagePath && previousImagePath !== replacementImage.imageStoragePath) {
      await cleanupUploadedImage(previousImagePath);
    }

    return replacementImage;
  } catch (error) {
    await cleanupUploadedImage(replacementImage.imageStoragePath);
    throw error;
  }
}
