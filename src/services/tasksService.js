import { orderBy } from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import { buildTaskPayload, TASK_STATUS } from '@/config/tasksOptions';
import { createTaskAssignedNotification } from '@/services/notificationService';
import {
  useCollection,
  addDocument,
  updateDocument,
  deleteDocument,
} from '@/hooks/useFirestore';

export function useTasks() {
  return useCollection(COLLECTIONS.TASKS, {
    constraints: [orderBy('updatedAt', 'desc')],
  });
}

async function notifyTaskAssignee(taskId, payload, previousAssignedUserId = '') {
  const assigneeId = payload.assignedUserId;

  if (!assigneeId || assigneeId === previousAssignedUserId) {
    return;
  }

  await createTaskAssignedNotification({
    userId: assigneeId,
    taskTitle: payload.title,
    taskId,
  });
}

export async function createTask(taskData, { createdBy = '', createdByName = '' } = {}) {
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

  const createdTask = await addDocument(COLLECTIONS.TASKS, {
    ...payload,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: String(createdBy || '').trim(),
    createdByName: String(createdByName || '').trim(),
  });

  await notifyTaskAssignee(createdTask.id, payload);

  return createdTask;
}

export async function updateTask(taskId, taskData, { previousTask = null } = {}) {
  const payload = buildTaskPayload(taskData);

  if (!payload.title) {
    throw new Error('Task title is required.');
  }

  if (!payload.priority) {
    throw new Error('Priority is required.');
  }

  const updatedTask = await updateDocument(COLLECTIONS.TASKS, taskId, {
    ...payload,
    updatedAt: new Date().toISOString(),
  });

  await notifyTaskAssignee(taskId, payload, previousTask?.assignedUserId || '');

  return updatedTask;
}

export async function updateTaskStatus(taskId, status) {
  return updateDocument(COLLECTIONS.TASKS, taskId, {
    status,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteTask(taskId) {
  return deleteDocument(COLLECTIONS.TASKS, taskId);
}
