import { COLLECTIONS } from '@/config/collections';
import { createOfferingRecordedNotification } from '@/services/notificationService';
import { 
  getDocuments, 
  addDocument, 
  updateDocument, 
  deleteDocument,
  useCollection,
  useDocument
} from '@/hooks/useFirestore';
import { where, orderBy } from 'firebase/firestore';

export function useOfferings(filters = {}) {
  const constraints = [];

  if (filters.year) {
    constraints.push(where('year', '==', filters.year));
  }

  if (filters.month) {
    constraints.push(where('month', '==', filters.month));
  }

  if (filters.type) {
    constraints.push(where('type', '==', filters.type));
  }

  if (filters.campus) {
    constraints.push(where('campus', '==', filters.campus));
  }

  constraints.push(orderBy('createdAt', 'desc'));

  return useCollection(COLLECTIONS.OFFERINGS, { constraints });
}

export function useOffering(offeringId) {
  return useDocument(COLLECTIONS.OFFERINGS, offeringId);
}

export async function getOfferings(filters = {}) {
  const constraints = [];

  if (filters.year) {
    constraints.push(where('year', '==', filters.year));
  }

  if (filters.month) {
    constraints.push(where('month', '==', filters.month));
  }

  if (filters.startDate && filters.endDate) {
    constraints.push(where('date', '>=', filters.startDate));
    constraints.push(where('date', '<=', filters.endDate));
  }

  constraints.push(orderBy('date', 'desc'));

  return getDocuments(COLLECTIONS.OFFERINGS, constraints);
}

export async function getOffering(offeringId) {
  const { getDocument } = await import('@/hooks/useFirestore');
  return getDocument(COLLECTIONS.OFFERINGS, offeringId);
}

export async function createOffering(offeringData) {
  const timestamp = new Date().toISOString();
  const createdOffering = await addDocument(COLLECTIONS.OFFERINGS, {
    ...offeringData,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const amount = createdOffering.totalAmount ?? createdOffering.amount ?? offeringData.totalAmount ?? offeringData.amount;
  const amountLabel = amount != null ? `R ${Number(amount).toLocaleString()}` : 'An offering';

  await createOfferingRecordedNotification({
    offeringId: createdOffering.id,
    amountLabel,
    offeringType: createdOffering.type || offeringData.type || '',
  }).catch((error) => {
    console.error('Failed to create offering notification:', error);
  });

  return createdOffering;
}

export async function updateOffering(offeringId, offeringData) {
  return updateDocument(COLLECTIONS.OFFERINGS, offeringId, {
    ...offeringData,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteOffering(offeringId) {
  return deleteDocument(COLLECTIONS.OFFERINGS, offeringId);
}

export async function getTotalOfferings(filters = {}) {
  const offerings = await getOfferings(filters);
  return offerings.reduce((sum, offering) => sum + (parseFloat(offering.amount) || 0), 0);
}

export async function getOfferingsByYear(year) {
  return getOfferings({ year });
}

export async function getOfferingsByMonth(year, month) {
  return getOfferings({ year, month });
}
