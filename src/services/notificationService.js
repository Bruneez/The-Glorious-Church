import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where, limit as firestoreLimit } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { COLLECTIONS } from '@/config/collections';
import { isAdminOrPastor, isCALeader, normalizeRole } from '@/config/roles';
import {
  NOTIFICATION_ENTITY_TYPE,
  NOTIFICATION_LIMIT,
  NOTIFICATION_SCOPE,
  NOTIFICATION_TYPE,
} from '@/config/notificationOptions';
import {
  addDocument,
  getDocuments,
  updateDocument,
} from '@/hooks/useFirestore';

export function getNotificationDescription(notification) {
  return notification?.description || notification?.message || '';
}

function normalizeDepartmentName(value) {
  return String(value || '').trim().toLowerCase();
}

function staffMatchesDepartment(staffMember, departmentId = '', departmentName = '') {
  const staffDepartmentId = String(staffMember?.departmentId || '').trim();
  const staffDepartmentName = normalizeDepartmentName(
    staffMember?.departmentName || staffMember?.department || staffMember?.creativeArts,
  );
  const targetDepartmentId = String(departmentId || '').trim();
  const targetDepartmentName = normalizeDepartmentName(departmentName);

  if (targetDepartmentId && staffDepartmentId) {
    return staffDepartmentId === targetDepartmentId;
  }

  if (targetDepartmentName && staffDepartmentName) {
    return staffDepartmentName === targetDepartmentName;
  }

  return false;
}

function getActiveStaffRecipients(staffMembers = [], { scope, departmentId, departmentName, excludeStaffId }) {
  return staffMembers.filter((staffMember) => {
    if (!staffMember?.id) return false;
    if (staffMember.status === 'Inactive') return false;
    if (excludeStaffId && staffMember.id === excludeStaffId) return false;

    const role = normalizeRole(staffMember.role);

    if (scope === NOTIFICATION_SCOPE.SYSTEM) {
      return isAdminOrPastor(role);
    }

    if (scope === NOTIFICATION_SCOPE.DEPARTMENT) {
      if (isAdminOrPastor(role)) return true;
      if (isCALeader(role)) {
        return staffMatchesDepartment(staffMember, departmentId, departmentName);
      }
      return false;
    }

    return false;
  });
}

async function getStaffDirectory() {
  return getDocuments(COLLECTIONS.STAFF);
}

async function resolveActorStaffId(excludeStaffId = '') {
  if (excludeStaffId) return excludeStaffId;

  const actorUid = auth.currentUser?.uid;
  if (!actorUid) return '';

  const staffMembers = await getStaffDirectory();
  const actor = staffMembers.find((staffMember) => staffMember.uid === actorUid);
  return actor?.id || '';
}

export async function createNotification({
  userId,
  title,
  description,
  type,
  relatedEntityId = '',
  relatedEntityType = '',
  departmentId = '',
  departmentName = '',
}) {
  const normalizedUserId = String(userId || '').trim();

  if (!normalizedUserId || !title) {
    return null;
  }

  return addDocument(COLLECTIONS.NOTIFICATIONS, {
    userId: normalizedUserId,
    title: String(title).trim(),
    description: String(description || '').trim(),
    type: type || NOTIFICATION_TYPE.TASK_ASSIGNED,
    isRead: false,
    createdAt: new Date().toISOString(),
    relatedEntityId: String(relatedEntityId || '').trim(),
    relatedEntityType: String(relatedEntityType || '').trim(),
    departmentId: String(departmentId || '').trim(),
    departmentName: String(departmentName || '').trim(),
  });
}

async function createNotificationsForRecipients({
  recipients = [],
  title,
  description,
  type,
  relatedEntityId,
  relatedEntityType,
  departmentId,
  departmentName,
}) {
  if (!recipients.length) return [];

  const results = await Promise.all(
    recipients.map((recipient) =>
      createNotification({
        userId: recipient.id,
        title,
        description,
        type,
        relatedEntityId,
        relatedEntityType,
        departmentId,
        departmentName,
      }),
    ),
  );

  return results.filter(Boolean);
}

async function dispatchScopedNotification({
  scope,
  title,
  description,
  type,
  relatedEntityId,
  relatedEntityType,
  departmentId = '',
  departmentName = '',
  excludeStaffId = '',
}) {
  try {
    const staffMembers = await getStaffDirectory();
    const actorStaffId = await resolveActorStaffId(excludeStaffId);
    const recipients = getActiveStaffRecipients(staffMembers, {
      scope,
      departmentId,
      departmentName,
      excludeStaffId: actorStaffId,
    });

    return createNotificationsForRecipients({
      recipients,
      title,
      description,
      type,
      relatedEntityId,
      relatedEntityType,
      departmentId,
      departmentName,
    });
  } catch (error) {
    console.error('Failed to dispatch notification:', error);
    return [];
  }
}

export async function createTaskAssignedNotification({ userId, taskTitle, taskId }) {
  const normalizedUserId = String(userId || '').trim();
  const normalizedTaskId = String(taskId || '').trim();

  if (!normalizedUserId || !normalizedTaskId) {
    return null;
  }

  return createNotification({
    userId: normalizedUserId,
    title: 'New Task Assigned',
    description: `You have been assigned: ${String(taskTitle || 'Untitled task').trim()}`,
    type: NOTIFICATION_TYPE.TASK_ASSIGNED,
    relatedEntityId: normalizedTaskId,
    relatedEntityType: NOTIFICATION_ENTITY_TYPE.TASK,
  });
}

export async function createMemberAddedNotification({
  memberId,
  memberName,
  department = '',
  departmentId = '',
  excludeStaffId = '',
}) {
  const fullName = String(memberName || 'A new member').trim();

  return dispatchScopedNotification({
    scope: department || departmentId ? NOTIFICATION_SCOPE.DEPARTMENT : NOTIFICATION_SCOPE.SYSTEM,
    title: 'New Member Added',
    description: `${fullName} joined the system.`,
    type: NOTIFICATION_TYPE.MEMBER_ADDED,
    relatedEntityId: memberId,
    relatedEntityType: NOTIFICATION_ENTITY_TYPE.MEMBER,
    departmentId,
    departmentName: department,
    excludeStaffId,
  });
}

export async function createMemberStatusChangedNotification({
  memberId,
  memberName,
  newStatus,
  department = '',
  departmentId = '',
  excludeStaffId = '',
}) {
  const fullName = String(memberName || 'A member').trim();
  const statusLabel = String(newStatus || 'updated').trim();

  return dispatchScopedNotification({
    scope: department || departmentId ? NOTIFICATION_SCOPE.DEPARTMENT : NOTIFICATION_SCOPE.SYSTEM,
    title: 'Member Status Changed',
    description: `${fullName} is now marked as ${statusLabel}.`,
    type: NOTIFICATION_TYPE.MEMBER_STATUS_CHANGED,
    relatedEntityId: memberId,
    relatedEntityType: NOTIFICATION_ENTITY_TYPE.MEMBER,
    departmentId,
    departmentName: department,
    excludeStaffId,
  });
}

export async function createAttendanceRecordedNotification({
  recordId,
  sessionLabel,
  departmentId = '',
  departmentName = '',
  excludeStaffId = '',
}) {
  const label = String(sessionLabel || 'Attendance').trim();

  return dispatchScopedNotification({
    scope: departmentId || departmentName ? NOTIFICATION_SCOPE.DEPARTMENT : NOTIFICATION_SCOPE.SYSTEM,
    title: 'Attendance Recorded',
    description: `${label} attendance has been saved.`,
    type: NOTIFICATION_TYPE.ATTENDANCE_RECORDED,
    relatedEntityId: recordId,
    relatedEntityType: NOTIFICATION_ENTITY_TYPE.ATTENDANCE,
    departmentId,
    departmentName,
    excludeStaffId,
  });
}

export async function createUserCreatedNotification({
  staffDocId,
  staffName,
  role = '',
  excludeStaffId = '',
}) {
  const fullName = String(staffName || 'A new user').trim();
  const roleLabel = String(role || 'Staff').trim();

  return dispatchScopedNotification({
    scope: NOTIFICATION_SCOPE.SYSTEM,
    title: 'New User Created',
    description: `${fullName} was added as ${roleLabel}.`,
    type: NOTIFICATION_TYPE.USER_CREATED,
    relatedEntityId: staffDocId,
    relatedEntityType: NOTIFICATION_ENTITY_TYPE.USER,
    excludeStaffId,
  });
}

export async function createEventAddedNotification({
  eventId,
  eventTitle,
  eventDate = '',
  excludeStaffId = '',
}) {
  const title = String(eventTitle || 'New event').trim();
  const dateSuffix = eventDate ? ` on ${eventDate}` : '';

  return dispatchScopedNotification({
    scope: NOTIFICATION_SCOPE.SYSTEM,
    title: 'New Event Added',
    description: `${title}${dateSuffix} was added to the calendar.`,
    type: NOTIFICATION_TYPE.EVENT_ADDED,
    relatedEntityId: eventId,
    relatedEntityType: NOTIFICATION_ENTITY_TYPE.EVENT,
    excludeStaffId,
  });
}

export async function createTransportUpdatedNotification({
  transportId,
  transportLabel,
  action = 'updated',
  excludeStaffId = '',
}) {
  const label = String(transportLabel || 'Transport record').trim();
  const verb = action === 'created' ? 'added' : 'updated';

  return dispatchScopedNotification({
    scope: NOTIFICATION_SCOPE.SYSTEM,
    title: 'Transport Record Updated',
    description: `${label} was ${verb}.`,
    type: NOTIFICATION_TYPE.TRANSPORT_UPDATED,
    relatedEntityId: transportId,
    relatedEntityType: NOTIFICATION_ENTITY_TYPE.TRANSPORT,
    excludeStaffId,
  });
}

export async function createOfferingRecordedNotification({
  offeringId,
  amountLabel,
  offeringType = '',
  excludeStaffId = '',
}) {
  const amount = String(amountLabel || 'An offering').trim();
  const typeLabel = offeringType ? ` (${offeringType})` : '';

  return dispatchScopedNotification({
    scope: NOTIFICATION_SCOPE.SYSTEM,
    title: 'Offering Recorded',
    description: `${amount}${typeLabel} was recorded.`,
    type: NOTIFICATION_TYPE.OFFERING_RECORDED,
    relatedEntityId: offeringId,
    relatedEntityType: NOTIFICATION_ENTITY_TYPE.OFFERING,
    excludeStaffId,
  });
}

export async function markNotificationAsRead(notificationId) {
  if (!notificationId) return null;
  return updateDocument(COLLECTIONS.NOTIFICATIONS, notificationId, { isRead: true });
}

export async function markAllNotificationsAsRead(userId, notifications = []) {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) return [];

  const unread = notifications.filter(
    (notification) => notification.userId === normalizedUserId && !notification.isRead,
  );

  return Promise.all(unread.map((notification) => markNotificationAsRead(notification.id)));
}

export function useNotifications(userId) {
  const normalizedUserId = String(userId || '').trim();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(Boolean(normalizedUserId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!normalizedUserId) {
      setData([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    const notificationsQuery = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', normalizedUserId),
      firestoreLimit(50),
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const documents = snapshot.docs
          .map((docSnapshot) => ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }))
          .sort((left, right) => {
            const leftTime = new Date(left.createdAt || 0).getTime();
            const rightTime = new Date(right.createdAt || 0).getTime();
            return rightTime - leftTime;
          });
        setData(documents);
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        console.error('useNotifications: failed to load notifications:', snapshotError);
        setError(snapshotError);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [normalizedUserId]);

  const notifications = useMemo(() => data.slice(0, NOTIFICATION_LIMIT), [data]);

  const unreadCount = useMemo(
    () => data.filter((notification) => !notification.isRead).length,
    [data],
  );

  return {
    notifications,
    allNotifications: data,
    unreadCount,
    loading,
    error,
  };
}
