import { COLLECTIONS } from '@/config/collections';
import { addDocument } from '@/hooks/useFirestore';

export const NOTIFICATION_TYPE = {
  TASK_ASSIGNED: 'task_assigned',
};

export async function createTaskAssignedNotification({ userId, taskTitle, taskId }) {
  const normalizedUserId = String(userId || '').trim();
  const normalizedTaskId = String(taskId || '').trim();

  if (!normalizedUserId || !normalizedTaskId) {
    return null;
  }

  return addDocument(COLLECTIONS.NOTIFICATIONS, {
    userId: normalizedUserId,
    title: 'New Task Assigned',
    message: `You have been assigned:\n${String(taskTitle || 'Untitled task').trim()}`,
    isRead: false,
    type: NOTIFICATION_TYPE.TASK_ASSIGNED,
    createdAt: new Date().toISOString(),
    relatedTaskId: normalizedTaskId,
  });
}
