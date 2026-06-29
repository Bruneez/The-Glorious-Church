import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { canAccessRoute, canPerformAction } from '@/config/permissions';

export function useRoleAccess() {
  const { role } = useAuth();

  return useMemo(
    () => ({
      role,
      canAccessRoute: (pathname) => canAccessRoute(role, pathname),
      canPerformAction: (action) => canPerformAction(role, action),
    }),
    [role],
  );
}
