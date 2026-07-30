import {
  APP_FIX_COMPLETED_STATUSES,
  APP_FIX_PRIORITY,
  APP_FIX_STATUS,
} from '../config/appFixesConstants.js';
import { getAppFixStatusLabel } from '../config/appFixesDisplay.js';
import { buildAppFixReferenceNumber } from '../config/appFixesOptions.js';
import { NOTIFICATION_TYPE } from '../config/notificationOptions.js';
import {
  createAppFixManagerNotification,
  createAppFixSubmitterNotification,
} from './notificationService.js';

function getRequestLabel(request = {}) {
  const reference = request.referenceNumber || buildAppFixReferenceNumber(request.id);
  const title = String(request.title || 'App fix request').trim();
  return `${reference}: ${title}`;
}

function getSubmitterStaffDocId(request = {}) {
  return String(request.createdByStaffId || '').trim();
}

function wasReopened(previousStatus = '', nextStatus = '') {
  if (nextStatus !== APP_FIX_STATUS.OPEN) return false;

  return APP_FIX_COMPLETED_STATUSES.includes(previousStatus)
    || previousStatus === APP_FIX_STATUS.REJECTED;
}

async function notifyManagersSafely(payload) {
  try {
    await createAppFixManagerNotification(payload);
  } catch (error) {
    console.error('Failed to create App Fixes manager notification:', error);
  }
}

async function notifySubmitterSafely(payload) {
  try {
    await createAppFixSubmitterNotification(payload);
  } catch (error) {
    console.error('Failed to create App Fixes submitter notification:', error);
  }
}

export async function notifyAfterRequestSubmitted(request = {}, { excludeStaffId = '' } = {}) {
  const label = getRequestLabel(request);
  const submitter = String(request.createdByName || 'A user').trim();

  await notifyManagersSafely({
    title: 'New App Fix Request',
    description: `${submitter} submitted ${label}.`,
    type: NOTIFICATION_TYPE.APP_FIX_NEW_REQUEST,
    requestId: request.id,
    excludeStaffId,
  });

  if (request.priority === APP_FIX_PRIORITY.URGENT) {
    await notifyManagersSafely({
      title: 'Critical App Fix Request',
      description: `${label} was marked as urgent.`,
      type: NOTIFICATION_TYPE.APP_FIX_CRITICAL_REQUEST,
      requestId: request.id,
      excludeStaffId,
    });
  }
}

export async function notifyAfterUserAdditionalInfo(request = {}, { excludeStaffId = '' } = {}) {
  await notifyManagersSafely({
    title: 'Additional App Fix Information',
    description: `${String(request.createdByName || 'A user').trim()} added information to ${getRequestLabel(request)}.`,
    type: NOTIFICATION_TYPE.APP_FIX_ADDITIONAL_INFO,
    requestId: request.id,
    excludeStaffId,
  });
}

export async function notifyAfterManagementUpdate(
  existing = {},
  nextValues = {},
  { excludeStaffId = '' } = {},
) {
  const previousStatus = String(existing.status || '').trim();
  const nextStatus = String(nextValues.status ?? existing.status ?? '').trim();
  const previousPriority = String(existing.priority || '').trim();
  const nextPriority = String(nextValues.priority ?? existing.priority ?? '').trim();
  const label = getRequestLabel(existing);
  const staffDocId = getSubmitterStaffDocId(existing);

  if (nextStatus && nextStatus !== previousStatus) {
    if (wasReopened(previousStatus, nextStatus)) {
      await notifyManagersSafely({
        title: 'App Fix Request Reopened',
        description: `${label} was reopened.`,
        type: NOTIFICATION_TYPE.APP_FIX_REOPENED,
        requestId: existing.id,
        excludeStaffId,
      });
    }

    if (staffDocId) {
      if (nextStatus === APP_FIX_STATUS.WAITING_FOR_USER) {
        await notifySubmitterSafely({
          staffDocId,
          title: 'More Information Requested',
          description: `Please provide more information for ${label}.`,
          type: NOTIFICATION_TYPE.APP_FIX_INFO_REQUESTED,
          requestId: existing.id,
        });
      } else if (APP_FIX_COMPLETED_STATUSES.includes(nextStatus)) {
        await notifySubmitterSafely({
          staffDocId,
          title: 'App Fix Request Completed',
          description: `${label} has been marked as completed.`,
          type: NOTIFICATION_TYPE.APP_FIX_COMPLETED,
          requestId: existing.id,
        });
      } else if (nextStatus === APP_FIX_STATUS.REJECTED) {
        await notifySubmitterSafely({
          staffDocId,
          title: 'App Fix Request Rejected',
          description: `${label} was rejected.`,
          type: NOTIFICATION_TYPE.APP_FIX_REJECTED,
          requestId: existing.id,
        });
      } else {
        await notifySubmitterSafely({
          staffDocId,
          title: 'App Fix Status Updated',
          description: `${label} is now ${getAppFixStatusLabel(nextStatus)}.`,
          type: NOTIFICATION_TYPE.APP_FIX_STATUS_CHANGED,
          requestId: existing.id,
        });
      }
    }
  }

  if (nextPriority === APP_FIX_PRIORITY.URGENT && previousPriority !== APP_FIX_PRIORITY.URGENT) {
    await notifyManagersSafely({
      title: 'Critical App Fix Request',
      description: `${label} was marked as urgent.`,
      type: NOTIFICATION_TYPE.APP_FIX_CRITICAL_REQUEST,
      requestId: existing.id,
      excludeStaffId,
    });
  }
}

export async function notifyAfterDuplicate(
  originalRequest = {},
  duplicatedRequestId = '',
  { excludeStaffId = '' } = {},
) {
  const staffDocId = getSubmitterStaffDocId(originalRequest);

  if (staffDocId) {
    await notifySubmitterSafely({
      staffDocId,
      title: 'App Fix Request Duplicated',
      description: `A copy of ${getRequestLabel(originalRequest)} was created for follow-up.`,
      type: NOTIFICATION_TYPE.APP_FIX_DUPLICATED,
      requestId: duplicatedRequestId || originalRequest.id,
    });
  }

  await notifyManagersSafely({
    title: 'App Fix Request Duplicated',
    description: `${getRequestLabel(originalRequest)} was duplicated.`,
    type: NOTIFICATION_TYPE.APP_FIX_DUPLICATED,
    requestId: duplicatedRequestId || originalRequest.id,
    excludeStaffId,
  });
}
