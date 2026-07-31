import { useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { ROLES, normalizeRole, isChurchWideStaff, isCALeader } from '@/config/roles';
import { getStaffDepartment, memberBelongsToDepartment } from '@/config/memberOptions';

export function useMemberManagementAccess() {
  const { staffProfile, role } = useAuth();
  const { canPerformAction } = useRoleAccess();

  const normalizedRole = normalizeRole(role);
  const isChurchWideUser = isChurchWideStaff(normalizedRole);
  const isCALeaderUser = normalizedRole === ROLES.LEADER;
  const creatorDepartment = getStaffDepartment(staffProfile);
  const canManageMembers = canPerformAction('MANAGE_MEMBERS') || isCALeaderUser;

  const canManageMember = useCallback(
    (member) => {
      if (!canManageMembers || !member) return false;
      if (isChurchWideUser) return true;
      if (isCALeaderUser && creatorDepartment) {
        return memberBelongsToDepartment(member, creatorDepartment);
      }
      return false;
    },
    [canManageMembers, creatorDepartment, isCALeaderUser, isChurchWideUser],
  );

  return useMemo(
    () => ({
      canManageMembers,
      canManageMember,
      creatorDepartment,
      isCALeaderUser,
    }),
    [canManageMember, canManageMembers, creatorDepartment, isCALeaderUser],
  );
}
