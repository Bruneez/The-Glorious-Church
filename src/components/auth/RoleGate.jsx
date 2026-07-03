import { useAuth } from '@/hooks/useAuth';
import { canPerformAction } from '@/config/permissions';
import { normalizeRole } from '@/config/roles';

export default function RoleGate({
  allowedRoles,
  allowedAction,
  children,
  fallback = null,
}) {
  const { role } = useAuth();
  const normalizedRole = normalizeRole(role);

  if (allowedAction) {
    if (!canPerformAction(role, allowedAction)) {
      return fallback;
    }
    return children;
  }

  if (!Array.isArray(allowedRoles)) {
    return fallback;
  }

  if (!normalizedRole) {
    return fallback;
  }

  const normalizedAllowed = allowedRoles.map((entry) => normalizeRole(entry));
  if (!normalizedAllowed.includes(normalizedRole)) {
    return fallback;
  }

  return children;
}
