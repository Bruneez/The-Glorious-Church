import { COLLECTIONS } from '@/config/collections';
import { createAttendanceRecordedNotification } from '@/services/notificationService';
import { 
  getDocuments, 
  addDocument, 
  updateDocument, 
  deleteDocument,
  useCollection,
  useDocument
} from '@/hooks/useFirestore';
import { where, orderBy } from 'firebase/firestore';

export function useAttendance(filters = {}) {
  const constraints = [];

  if (filters.date) {
    constraints.push(where('date', '==', filters.date));
  }

  if (filters.group) {
    constraints.push(where('group', '==', filters.group));
  }

  if (filters.campus) {
    constraints.push(where('campus', '==', filters.campus));
  }

  constraints.push(orderBy('date', 'desc'));

  return useCollection(COLLECTIONS.ATTENDANCE, { constraints });
}

export function useAttendanceRecord(recordId) {
  return useDocument(COLLECTIONS.ATTENDANCE, recordId);
}

export async function getAttendance(filters = {}) {
  const constraints = [];

  if (filters.date) {
    constraints.push(where('date', '==', filters.date));
  }

  if (filters.group) {
    constraints.push(where('group', '==', filters.group));
  }

  if (filters.startDate && filters.endDate) {
    constraints.push(where('date', '>=', filters.startDate));
    constraints.push(where('date', '<=', filters.endDate));
  }

  constraints.push(orderBy('date', 'desc'));

  return getDocuments(COLLECTIONS.ATTENDANCE, constraints);
}

export async function getAttendanceRecord(recordId) {
  const { getDocument } = await import('@/hooks/useFirestore');
  return getDocument(COLLECTIONS.ATTENDANCE, recordId);
}

export async function createAttendanceRecord(attendanceData) {
  const timestamp = new Date().toISOString();
  const createdRecord = await addDocument(COLLECTIONS.ATTENDANCE, {
    ...attendanceData,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  const sessionLabel = attendanceData.departmentName
    || attendanceData.group
    || (attendanceData.type === 'service' ? 'Service' : 'Department');

  await createAttendanceRecordedNotification({
    recordId: createdRecord.id,
    sessionLabel,
    departmentId: attendanceData.departmentId || '',
    departmentName: attendanceData.departmentName || '',
  }).catch((error) => {
    console.error('Failed to create attendance notification:', error);
  });

  return createdRecord;
}

export async function updateAttendanceRecord(recordId, attendanceData) {
  return updateDocument(COLLECTIONS.ATTENDANCE, recordId, {
    ...attendanceData,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteAttendanceRecord(recordId) {
  return deleteDocument(COLLECTIONS.ATTENDANCE, recordId);
}

export async function getAttendanceByDate(date) {
  return getAttendance({ date });
}

export async function getAttendanceByGroup(group, limit = 10) {
  const records = await getAttendance({ group });
  return records.slice(0, limit);
}

export function calculateAttendancePercentage(present, total) {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
}
