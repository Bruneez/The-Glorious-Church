import { auth } from '@/config/firebase';
import {
  classifySessionError,
  createSingleFlight,
  isConfirmedInvalidAuthSession,
  SESSION_ERROR_KIND,
} from '@/utils/sessionResilience';
import { logStability } from '@/utils/stabilityDebug';

async function fetchAuthIdToken(force = false) {
  const user = auth.currentUser;
  if (!user) {
    return { ok: false, reason: 'no-user', kind: SESSION_ERROR_KIND.UNKNOWN };
  }

  try {
    const token = await user.getIdToken(force);
    return { ok: true, token, force };
  } catch (error) {
    return {
      ok: false,
      error,
      kind: classifySessionError(error),
      force,
    };
  }
}

async function refreshAuthIdTokenInternal({ force = false } = {}) {
  let result = await fetchAuthIdToken(force);

  if (
    !result.ok
    && !force
    && (result.kind === SESSION_ERROR_KIND.TRANSIENT || result.kind === SESSION_ERROR_KIND.NETWORK)
  ) {
    result = await fetchAuthIdToken(true);
  }

  if (result.ok) {
    return result;
  }

  logStability('auth.token.refresh_failed', {
    kind: result.kind,
    code: result.error?.code || 'unknown',
    invalidSession: isConfirmedInvalidAuthSession(result.error),
  });

  return result;
}

export const refreshAuthIdToken = createSingleFlight(refreshAuthIdTokenInternal);

export async function recoverSessionAfterReconnect() {
  const tokenResult = await refreshAuthIdToken({ force: false });

  if (tokenResult.ok) {
    return {
      tokenRefreshed: true,
      shouldSignOut: false,
      kind: null,
      error: null,
    };
  }

  if (tokenResult.reason === 'no-user') {
    return {
      tokenRefreshed: false,
      shouldSignOut: false,
      kind: SESSION_ERROR_KIND.UNKNOWN,
      error: null,
    };
  }

  const shouldSignOut = isConfirmedInvalidAuthSession(tokenResult.error);

  return {
    tokenRefreshed: false,
    shouldSignOut,
    kind: tokenResult.kind,
    error: tokenResult.error || null,
  };
}
