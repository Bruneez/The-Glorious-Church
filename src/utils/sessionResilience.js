export const SESSION_ERROR_KIND = {
  NETWORK: 'network',
  PERMISSION: 'permission',
  INVALID_SESSION: 'invalid_session',
  TRANSIENT: 'transient',
  UNKNOWN: 'unknown',
};

const INVALID_SESSION_CODES = new Set([
  'auth/invalid-user-token',
  'auth/user-disabled',
  'auth/user-not-found',
]);

const NETWORK_CODES = new Set([
  'auth/network-request-failed',
  'unavailable',
  'firestore/unavailable',
  'deadline-exceeded',
  'cancelled',
]);

const PERMISSION_CODES = new Set([
  'permission-denied',
  'firestore/permission-denied',
  'storage/unauthorized',
]);

const TRANSIENT_AUTH_CODES = new Set([
  'auth/user-token-expired',
  'auth/too-many-requests',
]);

export function normalizeErrorCode(error) {
  const code = String(error?.code || '').trim();
  if (!code) return '';
  if (code.startsWith('firestore/')) return code.replace('firestore/', '');
  if (code.startsWith('storage/') && code === 'storage/unauthorized') return 'storage/unauthorized';
  return code;
}

export function messageIndicatesNetwork(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('network')
    || message.includes('offline')
    || message.includes('failed to fetch')
    || message.includes('connection')
  );
}

export function classifySessionError(error) {
  const code = normalizeErrorCode(error);

  if (INVALID_SESSION_CODES.has(code)) {
    return SESSION_ERROR_KIND.INVALID_SESSION;
  }

  if (PERMISSION_CODES.has(code) || code === 'storage/unauthorized') {
    return SESSION_ERROR_KIND.PERMISSION;
  }

  if (NETWORK_CODES.has(code) || messageIndicatesNetwork(error)) {
    return SESSION_ERROR_KIND.NETWORK;
  }

  if (TRANSIENT_AUTH_CODES.has(code)) {
    return SESSION_ERROR_KIND.TRANSIENT;
  }

  return SESSION_ERROR_KIND.UNKNOWN;
}

export function isConfirmedInvalidAuthSession(error) {
  return classifySessionError(error) === SESSION_ERROR_KIND.INVALID_SESSION;
}

export function isNetworkSessionError(error) {
  return classifySessionError(error) === SESSION_ERROR_KIND.NETWORK;
}

export function isPermissionSessionError(error) {
  return classifySessionError(error) === SESSION_ERROR_KIND.PERMISSION;
}

export function shouldAttemptTokenRefresh(error) {
  const kind = classifySessionError(error);
  return kind === SESSION_ERROR_KIND.TRANSIENT || kind === SESSION_ERROR_KIND.NETWORK;
}

export function getStaffProfileErrorMessage(error) {
  const kind = classifySessionError(error);

  if (kind === SESSION_ERROR_KIND.PERMISSION) {
    return 'Your staff profile could not be loaded because of a permissions error. You remain signed in.';
  }

  if (kind === SESSION_ERROR_KIND.NETWORK) {
    return 'Your staff profile could not be loaded. Check your connection and try again.';
  }

  return 'Your staff profile could not be loaded. You remain signed in.';
}

export function getFirestoreQueryErrorMessage(error) {
  const kind = classifySessionError(error);

  if (kind === SESSION_ERROR_KIND.PERMISSION) {
    return 'You do not have permission to view this data.';
  }

  if (kind === SESSION_ERROR_KIND.NETWORK) {
    return 'Could not load data. Check your connection and try again.';
  }

  return 'Could not load data. Please try again.';
}

export function createSingleFlight(asyncFn) {
  let flight = null;

  return (...args) => {
    if (flight) return flight;

    flight = Promise.resolve()
      .then(() => asyncFn(...args))
      .finally(() => {
        flight = null;
      });

    return flight;
  };
}
