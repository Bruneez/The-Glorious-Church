import { useMemo } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import { db } from '@/config/firebase';
import {
  buildServiceProgramDocId,
  buildServiceProgramPayload,
} from '@/config/serviceProgramOptions';
import { useDocument } from '@/hooks/useFirestore';

export function useServiceProgram(serviceDate, serviceType, refreshKey = 0) {
  const docId = useMemo(() => {
    if (!serviceDate || !serviceType) return null;
    return buildServiceProgramDocId(serviceDate, serviceType);
  }, [serviceDate, serviceType]);

  return useDocument(COLLECTIONS.SERVICE_PROGRAMS, docId, refreshKey);
}

export async function saveServiceProgram({
  serviceDate,
  serviceType,
  rows,
  createdBy = '',
  existingProgram = null,
}) {
  if (!serviceDate) {
    throw new Error('Service date is required.');
  }

  if (!serviceType) {
    throw new Error('Service type is required.');
  }

  const timestamp = new Date().toISOString();
  const docId = existingProgram?.id || buildServiceProgramDocId(serviceDate, serviceType);
  const docRef = doc(db, COLLECTIONS.SERVICE_PROGRAMS, docId);
  const existingSnapshot = await getDoc(docRef);

  const actor = String(createdBy || '').trim();

  if (existingSnapshot.exists()) {
    const existingData = existingSnapshot.data();
    const payload = {
      serviceDate,
      serviceType,
      rows: buildServiceProgramPayload({ serviceDate, serviceType, rows }).rows,
      updatedAt: timestamp,
      updatedBy: actor,
      createdBy: existingData.createdBy || actor,
      createdAt: existingData.createdAt || timestamp,
    };

    await updateDoc(docRef, payload);
    return { id: docId, ...payload };
  }

  const payload = buildServiceProgramPayload({
    serviceDate,
    serviceType,
    rows,
    createdBy: actor,
    createdAt: timestamp,
    updatedAt: timestamp,
    updatedBy: actor,
  });

  await setDoc(docRef, payload);
  return { id: docId, ...payload };
}
