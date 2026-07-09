import { COLLECTIONS } from '@/config/collections';
import { createTransportUpdatedNotification } from '@/services/notificationService';
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
  const createdRoute = await addDocument(COLLECTIONS.TRANSPORT, {
    ...routeData,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await createTransportUpdatedNotification({
    transportId: createdRoute.id,
    transportLabel: createdRoute.name || routeData.name || 'Transport route',
    action: 'created',
  }).catch((error) => {
    console.error('Failed to create transport notification:', error);
  });

  return createdRoute;
}

export async function updateTransportRoute(routeId, routeData) {
  const updatedRoute = await updateDocument(COLLECTIONS.TRANSPORT, routeId, {
    ...routeData,
    updatedAt: new Date().toISOString(),
  });

  await createTransportUpdatedNotification({
    transportId: routeId,
    transportLabel: routeData.name || updatedRoute.name || 'Transport route',
    action: 'updated',
  }).catch((error) => {
    console.error('Failed to create transport notification:', error);
  });

  return updatedRoute;
}

export async function deleteTransportRoute(routeId) {
  return deleteDocument(COLLECTIONS.TRANSPORT, routeId);
}

export async function createTransportAssignment(assignmentData) {
  const timestamp = new Date().toISOString();
  const createdAssignment = await addDocument(COLLECTIONS.TRANSPORT_ASSIGNMENTS, {
    ...assignmentData,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  await createTransportUpdatedNotification({
    transportId: createdAssignment.id,
    transportLabel: assignmentData.routeName || assignmentData.date || 'Transport assignment',
    action: 'created',
  }).catch((error) => {
    console.error('Failed to create transport assignment notification:', error);
  });

  return createdAssignment;
}

export async function updateTransportAssignment(assignmentId, assignmentData) {
  const updatedAssignment = await updateDocument(COLLECTIONS.TRANSPORT_ASSIGNMENTS, assignmentId, {
    ...assignmentData,
    updatedAt: new Date().toISOString()
  });

  await createTransportUpdatedNotification({
    transportId: assignmentId,
    transportLabel: assignmentData.routeName || assignmentData.date || 'Transport assignment',
    action: 'updated',
  }).catch((error) => {
    console.error('Failed to create transport assignment notification:', error);
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
