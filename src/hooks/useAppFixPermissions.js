import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { canPerformAction } from '@/config/permissions';
import { resolveAppFixPermissionStatus } from '@/config/appFixesUserOptions';

export { resolveAppFixPermissionStatus } from '@/config/appFixesUserOptions';

export function useAppFixPermissions() {
  const { role, isStaffSessionLoading, firebaseUser, staffDocId } = useAuth();

  return useMemo(() => {
    const status = resolveAppFixPermissionStatus({ role, isStaffSessionLoading });
    const canAccess = status === 'allowed';
    const canManage = canAccess && canPerformAction(role, 'MANAGE_APP_FIXES');

    return {
      status,
      canAccess,
      canManage,
      role,
      userId: firebaseUser?.uid || '',
      staffDocId: staffDocId || '',
      isStaffSessionLoading,
    };
  }, [firebaseUser?.uid, isStaffSessionLoading, role, staffDocId]);
}
