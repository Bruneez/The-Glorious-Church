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

export function useTransport() {
  return useCollection(COLLECTIONS.TRANSPORT, {
    constraints: [orderBy('createdAt', 'desc')],
  });
}

export function useTransportRoute(routeId) {
  return useDocument(COLLECTIONS.TRANSPORT, routeId);
}

export function useTransportAssignments() {
  return useCollection(COLLECTIONS.TRANSPORT_ASSIGNMENTS, {
    constraints: [orderBy('date', 'desc')]
  });
}

export async function getTransport() {
  return getDocuments(COLLECTIONS.TRANSPORT, [orderBy('createdAt', 'desc')]);
}

export async function getTransportRoute(routeId) {
  const { getDocument } = await import('@/hooks/useFirestore');
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

export async function createTransportRoute(routeData) {
  const timestamp = new Date().toISOString();
  return addDocument(COLLECTIONS.TRANSPORT, {
    ...routeData,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export async function updateTransportRoute(routeId, routeData) {
  return updateDocument(COLLECTIONS.TRANSPORT, routeId, {
    ...routeData,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteTransportRoute(routeId) {
  return deleteDocument(COLLECTIONS.TRANSPORT, routeId);
}

export async function createTransportAssignment(assignmentData) {
  const timestamp = new Date().toISOString();
  return addDocument(COLLECTIONS.TRANSPORT_ASSIGNMENTS, {
    ...assignmentData,
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

export async function updateTransportAssignment(assignmentId, assignmentData) {
  return updateDocument(COLLECTIONS.TRANSPORT_ASSIGNMENTS, assignmentId, {
    ...assignmentData,
    updatedAt: new Date().toISOString()
  });
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
