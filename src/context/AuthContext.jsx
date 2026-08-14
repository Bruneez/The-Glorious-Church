import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { AuthContext } from '@/hooks/useAuth';
import { resolveStaffProfile } from '@/services/staffService';
import { recordStaffLastSeen } from '@/services/lastSeenService';
import { signIn as authSignIn, signOut as authSignOut, signUp as authSignUp } from '@/services/authService';
import { recoverSessionAfterReconnect } from '@/services/authTokenService';
import { useSessionResilience } from '@/hooks/useSessionResilience';
import { resolveAuthStatus } from '@/utils/authSessionState';
import {
  createSingleFlight,
  getStaffProfileErrorMessage,
  isConfirmedInvalidAuthSession,
} from '@/utils/sessionResilience';
import { notifyFirestoreReconnect } from '@/utils/firestoreReconnect';
import { logStability } from '@/utils/stabilityDebug';

function buildPlaceholderStaffProfile(user) {
  return {
    id: null,
    email: user?.email || '',
    name: user?.displayName || 'Staff Member',
    role: '',
  };
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [staffDocId, setStaffDocId] = useState(null);
  const [staffProfile, setStaffProfile] = useState(null);
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStaffSessionLoading, setIsStaffSessionLoading] = useState(false);
  const [staffProfileError, setStaffProfileError] = useState(null);
  const [authError, setAuthError] = useState(null);

  const authBootstrapCompleteRef = useRef(false);
  const staffSessionRef = useRef({ staffDocId: null, staffProfile: null, role: '' });
  const firebaseUserRef = useRef(null);
  const previousAuthUidRef = useRef(null);
  const intentionalSignOutRef = useRef(false);

  const syncStaffSessionRef = useCallback((nextSession) => {
    staffSessionRef.current = {
      staffDocId: nextSession.staffDocId ?? null,
      staffProfile: nextSession.staffProfile ?? null,
      role: nextSession.role ?? '',
    };
  }, []);

  const clearStaffSession = useCallback(() => {
    setStaffDocId(null);
    setStaffProfile(null);
    setRole('');
    setStaffProfileError(null);
    syncStaffSessionRef({ staffDocId: null, staffProfile: null, role: '' });
  }, [syncStaffSessionRef]);

  const applyStaffSession = useCallback((resolved, user) => {
    if (!resolved) {
      const placeholderProfile = buildPlaceholderStaffProfile(user);
      setStaffDocId(null);
      setStaffProfile(placeholderProfile);
      setRole('');
      syncStaffSessionRef({ staffDocId: null, staffProfile: placeholderProfile, role: '' });
      return;
    }

    setStaffDocId(resolved.staffDocId);
    setStaffProfile(resolved.staffProfile);
    setRole(resolved.role);
    syncStaffSessionRef({
      staffDocId: resolved.staffDocId,
      staffProfile: resolved.staffProfile,
      role: resolved.role,
    });

    recordStaffLastSeen(resolved.staffDocId, { force: true }).catch((error) => {
      console.error('Failed to record staff last seen on login:', error);
    });
  }, [syncStaffSessionRef]);

  const loadStaffSession = useCallback(async (user) => {
    const resolved = await resolveStaffProfile(user);

    if (user?.uid !== firebaseUserRef.current?.uid) {
      return null;
    }

    setStaffProfileError(null);
    applyStaffSession(resolved, user);
    return resolved;
  }, [applyStaffSession]);

  const restoreStaffSessionFromRef = useCallback(() => {
    const cached = staffSessionRef.current;
    setStaffDocId(cached.staffDocId);
    setStaffProfile(cached.staffProfile);
    setRole(cached.role);
  }, []);

  const loadStaffSessionSingleFlight = useMemo(
    () => createSingleFlight(async (user) => loadStaffSession(user)),
    [loadStaffSession],
  );

  const runStaffSessionLoad = useCallback(async (user) => {
    if (user?.uid !== firebaseUserRef.current?.uid) {
      return;
    }

    setIsStaffSessionLoading(true);

    try {
      await loadStaffSessionSingleFlight(user);

      if (user?.uid !== firebaseUserRef.current?.uid) {
        return;
      }
    } catch (error) {
      if (user?.uid !== firebaseUserRef.current?.uid) {
        return;
      }

      console.error('Staff profile resolution failed:', error);
      logStability('auth.profile.fetch_failed', {
        uid: user.uid,
        code: error?.code || 'unknown',
        invalidSession: isConfirmedInvalidAuthSession(error),
      });

      if (staffSessionRef.current.staffDocId) {
        restoreStaffSessionFromRef();
      } else {
        setStaffDocId(null);
        setStaffProfile(buildPlaceholderStaffProfile(user));
        setRole('');
      }

      setStaffProfileError(getStaffProfileErrorMessage(error));
    } finally {
      if (user?.uid === firebaseUserRef.current?.uid) {
        setIsStaffSessionLoading(false);
      }
    }
  }, [loadStaffSessionSingleFlight, restoreStaffSessionFromRef]);

  useEffect(() => {
    firebaseUserRef.current = firebaseUser;
  }, [firebaseUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const previousUid = previousAuthUidRef.current;
      const nextUid = user?.uid || null;

      if (
        authBootstrapCompleteRef.current
        && previousUid
        && !nextUid
        && !intentionalSignOutRef.current
      ) {
        logStability('auth.unexpected_sign_out', { uid: previousUid });
      } else if (previousUid && nextUid && previousUid !== nextUid) {
        logStability('auth.unexpected_user_change', {
          fromUid: previousUid,
          toUid: nextUid,
        });
      }

      previousAuthUidRef.current = nextUid;
      intentionalSignOutRef.current = false;

      setFirebaseUser(user);
      setAuthError(null);

      if (!user) {
        clearStaffSession();
        setIsStaffSessionLoading(false);

        if (!authBootstrapCompleteRef.current) {
          authBootstrapCompleteRef.current = true;
          setIsLoading(false);
        }
        return;
      }

      await runStaffSessionLoad(user);

      if (user.uid !== firebaseUserRef.current?.uid) {
        return;
      }

      if (!authBootstrapCompleteRef.current) {
        authBootstrapCompleteRef.current = true;
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [clearStaffSession, runStaffSessionLoad]);

  const signIn = useCallback(async (email, password) => {
    setAuthError(null);
    setStaffProfileError(null);
    const user = await authSignIn(email, password);
    setFirebaseUser(user);
    return user;
  }, []);

  const signUp = useCallback(async (email, password) => {
    setAuthError(null);
    setStaffProfileError(null);
    const user = await authSignUp(email, password);
    setFirebaseUser(user);
    return user;
  }, []);

  const signOut = useCallback(async () => {
    intentionalSignOutRef.current = true;
    await authSignOut();
    clearStaffSession();
    setIsStaffSessionLoading(false);
    setFirebaseUser(null);
  }, [clearStaffSession]);

  const refreshStaffProfile = useCallback(async () => {
    const user = firebaseUserRef.current;
    if (!user) return;
    await runStaffSessionLoad(user);
  }, [runStaffSessionLoad]);

  const handleSessionReconnect = useCallback(async (source) => {
    const user = firebaseUserRef.current;
    if (!user) return;

    const recovery = await recoverSessionAfterReconnect();
    if (recovery.shouldSignOut) {
      logStability('auth.session.invalid', {
        source,
        code: recovery.error?.code || 'unknown',
      });
      await signOut();
      return;
    }

    if (!recovery.tokenRefreshed) {
      logStability('auth.token.refresh_unresolved', {
        source,
        kind: recovery.kind,
        code: recovery.error?.code || recovery.reason || 'unknown',
      });
    }

    const shouldRefreshStaffProfile =
      Boolean(staffProfileError)
      || !staffSessionRef.current.staffDocId;

    if (shouldRefreshStaffProfile) {
      await runStaffSessionLoad(user);
    }

    notifyFirestoreReconnect();
  }, [runStaffSessionLoad, signOut, staffProfileError]);

  useSessionResilience({
    enabled: Boolean(firebaseUser),
    onReconnect: handleSessionReconnect,
  });

  const authStatus = resolveAuthStatus({ isLoading, firebaseUser });

  const value = useMemo(
    () => ({
      firebaseUser,
      staffDocId,
      staffProfile,
      role,
      authStatus,
      isAuthenticated: authStatus === 'authenticated',
      isLoading,
      isStaffSessionLoading,
      staffProfileError,
      authError,
      setAuthError,
      signIn,
      signUp,
      signOut,
      refreshStaffProfile,
    }),
    [
      firebaseUser,
      staffDocId,
      staffProfile,
      role,
      authStatus,
      isLoading,
      isStaffSessionLoading,
      staffProfileError,
      authError,
      signIn,
      signUp,
      signOut,
      refreshStaffProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
