import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { AuthContext } from '@/hooks/useAuth';
import { resolveStaffProfile } from '@/services/staffService';
import { signIn as authSignIn, signOut as authSignOut, signUp as authSignUp } from '@/services/authService';

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [staffDocId, setStaffDocId] = useState(null);
  const [staffProfile, setStaffProfile] = useState(null);
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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
    return true;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!authInitialized) {
        setAuthInitialized(true);
        setIsLoading(false);
      }

      if (!user) {
        clearStaffSession();
        return;
      }

      loadStaffSession(user).catch((error) => {
        console.error('Staff profile resolution failed:', error);
        clearStaffSession();
      });
    });

    return unsubscribe;
  }, [authInitialized, clearStaffSession, loadStaffSession]);

  const signIn = useCallback(async (email, password) => {
    setAuthError(null);
    const user = await authSignIn(email, password);
    loadStaffSession(user).catch((error) => {
      console.error('Staff profile resolution failed after sign-in:', error);
    });
    return user;
  }, [loadStaffSession]);

  const signUp = useCallback(async (email, password) => {
    setAuthError(null);
    const user = await authSignUp(email, password);
    loadStaffSession(user).catch((error) => {
      console.error('Staff profile resolution failed after sign-up:', error);
    });
    return user;
  }, [loadStaffSession]);

  const signOut = useCallback(async () => {
    await authSignOut();
    clearStaffSession();
  }, [clearStaffSession]);

  const refreshStaffProfile = useCallback(async () => {
    if (!firebaseUser) return;
    await loadStaffSession(firebaseUser);
  }, [firebaseUser, loadStaffSession]);

  const value = useMemo(
    () => ({
      firebaseUser,
      staffDocId,
      staffProfile,
      role,
      isAuthenticated: Boolean(firebaseUser),
      isLoading,
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
      authError,
      signIn,
      signUp,
      signOut,
      refreshStaffProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
