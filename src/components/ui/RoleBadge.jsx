import { getRoleBadgeClassName, getRoleLabel } from '@/config/roles';

export default function RoleBadge({ role, className = '' }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getRoleBadgeClassName(role)} ${className}`}
    >
      {getRoleLabel(role)}
    </span>
  );
}
