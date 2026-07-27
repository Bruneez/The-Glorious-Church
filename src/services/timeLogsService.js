import { orderBy, where } from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import {
  buildTimeLogPayload,
  computeCurrentWeekTimeLogSummary,
  getCalendarWeekBounds,
  validateTimeLogForm,
} from '@/config/timeLogOptions';
import {
  addDocument,
  deleteDocument,
  getDocuments,
  updateDocument,
  useCollection,
  useDocument,
} from '@/hooks/useFirestore';

function buildTimeLogConstraints(filters = {}) {
  const constraints = [];

  if (filters.userId) {
    constraints.push(where('userId', '==', filters.userId));
  }

  if (filters.date) {
    constraints.push(where('date', '==', filters.date));
  }

  if (filters.startDate && filters.endDate) {
    constraints.push(where('date', '>=', filters.startDate));
    constraints.push(where('date', '<=', filters.endDate));
  }

  constraints.push(orderBy('date', 'desc'));

  return constraints;
}

export function useTimeLogs(filters = {}) {
  return useCollection(COLLECTIONS.TIME_LOGS, {
    constraints: buildTimeLogConstraints(filters),
  });
}

export function useTimeLog(timeLogId) {
  return useDocument(COLLECTIONS.TIME_LOGS, timeLogId);
}

export async function getTimeLogs(filters = {}) {
  return getDocuments(COLLECTIONS.TIME_LOGS, buildTimeLogConstraints(filters));
}

export async function getTimeLog(timeLogId) {
  const { getDocument } = await import('@/hooks/useFirestore');
  return getDocument(COLLECTIONS.TIME_LOGS, timeLogId);
}

export async function getUserTimeLogs(userId, filters = {}) {
  const normalizedUserId = String(userId || '').trim();

  if (!normalizedUserId) {
    throw new Error('User ID is required.');
  }

  return getTimeLogs({
    ...filters,
    userId: normalizedUserId,
  });
}

export async function getCurrentWeekSummary(userId, referenceDate = new Date()) {
  const normalizedUserId = String(userId || '').trim();

  if (!normalizedUserId) {
    throw new Error('User ID is required.');
  }

  const { weekStart, weekEnd } = getCalendarWeekBounds(referenceDate);
  const logs = await getUserTimeLogs(normalizedUserId, {
    startDate: weekStart,
    endDate: weekEnd,
  });

  return computeCurrentWeekTimeLogSummary(logs, referenceDate);
}

export async function createTimeLog(
  formData,
  { userId, userName = '', recordedBy = '' } = {},
) {
  const validationMessage = validateTimeLogForm(formData);

  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const normalizedUserId = String(userId || '').trim();

  if (!normalizedUserId) {
    throw new Error('User ID is required.');
  }

  const timestamp = new Date().toISOString();
  const payload = buildTimeLogPayload(formData, {
    userId: normalizedUserId,
    userName,
    recordedBy: recordedBy || normalizedUserId,
  });

  return addDocument(COLLECTIONS.TIME_LOGS, {
    ...payload,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export async function updateTimeLog(
  timeLogId,
  formData,
  { userId, userName = '', recordedBy = '', existingRecord = null } = {},
) {
  const validationMessage = validateTimeLogForm(formData);

  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const payload = buildTimeLogPayload(formData, {
    userId: userId || existingRecord?.userId,
    userName: userName || existingRecord?.userName,
    recordedBy: recordedBy || existingRecord?.recordedBy,
    existingRecord,
  });

  return updateDocument(COLLECTIONS.TIME_LOGS, timeLogId, {
    ...payload,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteTimeLog(timeLogId) {
  return deleteDocument(COLLECTIONS.TIME_LOGS, timeLogId);
}
