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

export function useEvents(filters = {}) {
  const constraints = [];

  if (filters.type) {
    constraints.push(where('type', '==', filters.type));
  }

  if (filters.campus) {
    constraints.push(where('campus', '==', filters.campus));
  }

  if (filters.startDate) {
    constraints.push(where('date', '>=', filters.startDate));
  }

  constraints.push(orderBy('date', 'asc'));

  return useCollection(COLLECTIONS.EVENTS, { constraints });
}

export function useEvent(eventId) {
  return useDocument(COLLECTIONS.EVENTS, eventId);
}

export async function getEvents(filters = {}) {
  const constraints = [];

  if (filters.type) {
    constraints.push(where('type', '==', filters.type));
  }

  if (filters.campus) {
    constraints.push(where('campus', '==', filters.campus));
  }

  if (filters.startDate && filters.endDate) {
    constraints.push(where('date', '>=', filters.startDate));
    constraints.push(where('date', '<=', filters.endDate));
  }

  constraints.push(orderBy('date', 'asc'));

  return getDocuments(COLLECTIONS.EVENTS, constraints);
}

export async function getEvent(eventId) {
  const { getDocument } = await import('@/hooks/useFirestore');
  return getDocument(COLLECTIONS.EVENTS, eventId);
}

export async function createEvent(eventData) {
  const timestamp = new Date().toISOString();
  return addDocument(COLLECTIONS.EVENTS, {
    ...eventData,
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

export async function updateEvent(eventId, eventData) {
  return updateDocument(COLLECTIONS.EVENTS, eventId, {
    ...eventData,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteEvent(eventId) {
  return deleteDocument(COLLECTIONS.EVENTS, eventId);
}

export async function getUpcomingEvents(limit = 10) {
  const today = new Date().toISOString().split('T')[0];
  const events = await getEvents({ startDate: today });
  return events.slice(0, limit);
}

export async function getEventsByMonth(year, month) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  return getEvents({ startDate, endDate });
}

export async function getEventsByType(type) {
  return getEvents({ type });
}
