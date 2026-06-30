import { COLLECTIONS } from '@/config/collections';
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

  constraints.push(orderBy('date', 'desc'));

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
  return addDocument(COLLECTIONS.OFFERINGS, {
    ...offeringData,
    amount: parseFloat(offeringData.amount) || 0,
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

export async function updateOffering(offeringId, offeringData) {
  return updateDocument(COLLECTIONS.OFFERINGS, offeringId, {
    ...offeringData,
    amount: parseFloat(offeringData.amount) || 0,
    updatedAt: new Date().toISOString()
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
