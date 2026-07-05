import { orderBy } from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import { buildTaskPayload, TASK_STATUS } from '@/config/developmentBoardOptions';
import {
  useCollection,
  addDocument,
  updateDocument,
  deleteDocument,
} from '@/hooks/useFirestore';

export function useDevelopmentTasks() {
  return useCollection(COLLECTIONS.DEVELOPMENT_TASKS, {
    constraints: [orderBy('updatedAt', 'desc')],
  });
}

export async function createDevelopmentTask(taskData, createdBy = '') {
  const timestamp = new Date().toISOString();
  const payload = buildTaskPayload({
    ...taskData,
    status: taskData.status || TASK_STATUS.OPEN,
  });

  if (!payload.title) {
    throw new Error('Task title is required.');
  }

  if (!payload.priority) {
    throw new Error('Priority is required.');
  }

  return addDocument(COLLECTIONS.DEVELOPMENT_TASKS, {
    ...payload,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: String(createdBy || '').trim(),
  });
}

export async function updateDevelopmentTask(taskId, taskData) {
  const payload = buildTaskPayload(taskData);

  if (!payload.title) {
    throw new Error('Task title is required.');
  }

  if (!payload.priority) {
    throw new Error('Priority is required.');
  }

  return updateDocument(COLLECTIONS.DEVELOPMENT_TASKS, taskId, {
    ...payload,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateDevelopmentTaskStatus(taskId, status) {
  return updateDocument(COLLECTIONS.DEVELOPMENT_TASKS, taskId, {
    status,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteDevelopmentTask(taskId) {
  return deleteDocument(COLLECTIONS.DEVELOPMENT_TASKS, taskId);
}
