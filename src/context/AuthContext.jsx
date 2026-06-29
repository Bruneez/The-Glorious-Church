import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { AuthContext } from '@/hooks/useAuth';
import { resolveStaffProfile } from '@/services/staffService';
import { signIn as authSignIn, signOut as authSignOut } from '@/services/authService';

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [staffDocId, setStaffDocId] = useState(null);
  const [staffProfile, setStaffProfile] = useState(null);
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const clearStaffSession = useCallback(() => {
    setStaffDocId(null);
    setStaffProfile(null);
    setRole('');
  }, []);

  const loadStaffSession = useCallback(async (user) => {
    const resolved = await resolveStaffProfile(user);
    if (!resolved) {
      clearStaffSession();
      return false;
    }

    setStaffDocId(resolved.staffDocId);
    setStaffProfile(resolved.staffProfile);
    setRole(resolved.role);
    return true;
  }, [clearStaffSession]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      setFirebaseUser(user);

      if (!user) {
        clearStaffSession();
        setIsLoading(false);
        return;
      }

      try {
        await loadStaffSession(user);
      } catch (error) {
        console.error('Staff profile resolution failed:', error);
        clearStaffSession();
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, [clearStaffSession, loadStaffSession]);

  const signIn = useCallback(async (email, password) => {
    setAuthError(null);
    const user = await authSignIn(email, password);
    const isStaff = await loadStaffSession(user);

    if (!isStaff) {
      await authSignOut();
      const error = new Error('Access Denied. Your email is not registered in the staff database.');
      error.code = 'custom/not-staff';
      throw error;
    }

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
      isAuthenticated: Boolean(firebaseUser && staffProfile),
      isLoading,
      authError,
      setAuthError,
      signIn,
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
      signOut,
      refreshStaffProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
