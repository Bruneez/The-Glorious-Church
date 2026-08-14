import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { AuthContext } from '@/hooks/useAuth';
import { resolveStaffProfile } from '@/services/staffService';
import { recordStaffLastSeen } from '@/services/lastSeenService';
import { signIn as authSignIn, signOut as authSignOut, signUp as authSignUp } from '@/services/authService';

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [staffDocId, setStaffDocId] = useState(null);
  const [staffProfile, setStaffProfile] = useState(null);
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStaffSessionLoading, setIsStaffSessionLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [authError, setAuthError] = useState(null);

  const clearStaffSession = useCallback(() => {
    setStaffDocId(null);
    setStaffProfile(null);
    setRole('');
  }, []);

  const loadStaffSession = useCallback(async (user) => {
    const resolved = await resolveStaffProfile(user);
    if (!resolved) {
      setStaffDocId(null);
      setStaffProfile({
        id: null,
        email: user.email,
        name: user.displayName || 'Staff Member',
        role: '',
      });
      setRole('');
      return true;
    }

    setStaffDocId(resolved.staffDocId);
    setStaffProfile(resolved.staffProfile);
    setRole(resolved.role);

    recordStaffLastSeen(resolved.staffDocId, { force: true }).catch((error) => {
      console.error('Failed to record staff last seen on login:', error);
    });

    return true;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        clearStaffSession();
        setIsStaffSessionLoading(false);

        if (!authInitialized) {
          setAuthInitialized(true);
          setIsLoading(false);
        }
        return;
      }

      setIsStaffSessionLoading(true);

      try {
        await loadStaffSession(user);
      } catch (error) {
        console.error('Staff profile resolution failed:', error);
        clearStaffSession();
      } finally {
        setIsStaffSessionLoading(false);

        if (!authInitialized) {
          setAuthInitialized(true);
          setIsLoading(false);
        }
      }
    });

    return unsubscribe;
  }, [authInitialized, clearStaffSession, loadStaffSession]);

  const signIn = useCallback(async (email, password) => {
    setAuthError(null);
    const user = await authSignIn(email, password);
    setIsStaffSessionLoading(true);

    try {
      await loadStaffSession(user);
    } catch (error) {
      console.error('Staff profile resolution failed after sign-in:', error);
      clearStaffSession();
    } finally {
      setIsStaffSessionLoading(false);
    }

    return user;
  }, [clearStaffSession, loadStaffSession]);

  const signUp = useCallback(async (email, password) => {
    setAuthError(null);
    const user = await authSignUp(email, password);
    setIsStaffSessionLoading(true);

    try {
      await loadStaffSession(user);
    } catch (error) {
      console.error('Staff profile resolution failed after sign-up:', error);
      clearStaffSession();
    } finally {
      setIsStaffSessionLoading(false);
    }

    return user;
  }, [clearStaffSession, loadStaffSession]);

  const signOut = useCallback(async () => {
    await authSignOut();
    clearStaffSession();
    setIsStaffSessionLoading(false);
  }, [clearStaffSession]);

  const refreshStaffProfile = useCallback(async () => {
    if (!firebaseUser) return;
    setIsStaffSessionLoading(true);

    try {
      await loadStaffSession(firebaseUser);
    } finally {
      setIsStaffSessionLoading(false);
    }
  }, [firebaseUser, loadStaffSession]);

  const value = useMemo(
    () => ({
      firebaseUser,
      staffDocId,
      staffProfile,
      role,
      isAuthenticated: Boolean(firebaseUser),
      isLoading,
      isStaffSessionLoading,
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
      isLoading,
      isStaffSessionLoading,
      authError,
      signIn,
      signUp,
      signOut,
      refreshStaffProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
