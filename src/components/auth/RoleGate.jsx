import { useAuth } from '@/hooks/useAuth';

export default function RoleGate({ allowedRoles, children, fallback = null }) {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    return fallback;
  }

  return children;
}
