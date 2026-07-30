const FIRESTORE_CODE_MESSAGES = {
  'permission-denied': 'You do not have permission to perform this action.',
  unavailable: 'Unable to reach the server. Please check your connection and try again.',
  'failed-precondition': 'Unable to complete this action due to a configuration issue. Please contact an administrator.',
  'resource-exhausted': 'The service is temporarily unavailable. Please try again later.',
  'deadline-exceeded': 'The request timed out. Please check your connection and try again.',
  cancelled: 'The request was cancelled. Please try again.',
  'not-found': 'The requested item could not be found.',
  'already-exists': 'This item already exists.',
};

const STORAGE_CODE_MESSAGES = {
  'storage/unauthorized': 'You do not have permission to upload or access this file.',
  'storage/canceled': 'The upload was cancelled. Please try again.',
  'storage/quota-exceeded': 'Storage limit reached. Please contact an administrator.',
  'storage/retry-limit-exceeded': 'The upload failed after several attempts. Please try again.',
  'storage/invalid-checksum': 'The file could not be verified after upload. Please try again.',
  'storage/object-not-found': 'The attachment could not be found.',
};

function isInternalErrorMessage(message = '') {
  const normalized = String(message || '').trim().toLowerCase();

  return normalized.includes('firebase')
    || normalized.includes('firestore')
    || normalized.includes('storage/')
    || normalized.includes('missing or insufficient permissions')
    || normalized.startsWith('internal');
}

export function getAppFixErrorMessage(
  error,
  fallback = 'Something went wrong. Please try again.',
) {
  const code = String(error?.code || '').trim();
  const message = String(error?.message || '').trim();

  if (FIRESTORE_CODE_MESSAGES[code]) {
    return FIRESTORE_CODE_MESSAGES[code];
  }

  if (STORAGE_CODE_MESSAGES[code]) {
    return STORAGE_CODE_MESSAGES[code];
  }

  if (code.startsWith('firestore/') || code.startsWith('storage/')) {
    return fallback;
  }

  if (message && !isInternalErrorMessage(message)) {
    return message;
  }

  return fallback;
}

export function toAppFixError(
  error,
  fallback = 'Something went wrong. Please try again.',
) {
  const friendlyMessage = getAppFixErrorMessage(error, fallback);
  const appFixError = new Error(friendlyMessage);
  appFixError.code = error?.code;
  return appFixError;
}
