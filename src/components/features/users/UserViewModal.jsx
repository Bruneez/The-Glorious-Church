import { User } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatDate } from '@/utils/formatters';
import { ROLES } from '@/config/roles';

function DetailField({ label, value, children }) {
  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <div className="text-sm font-medium text-white mt-1">{children ?? value ?? '—'}</div>
    </div>
  );
}

function formatTimestamp(value) {
  if (!value) return '—';

  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return formatDate(date.toISOString(), 'short');
}

function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
        role === ROLES.ADMIN
          ? 'bg-rose-950/60 text-rose-400 border border-rose-500/20'
          : role === ROLES.PASTOR
          ? 'bg-amber-950/60 text-amber-400 border border-amber-500/20'
          : 'bg-blue-950/60 text-blue-400 border border-blue-500/20'
      }`}
    >
      {role || 'Unknown'}
    </span>
  );
}

function StatusBadge({ status }) {
  const isActive = status !== 'Inactive';

  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
        isActive
          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
          : 'bg-slate-800 text-slate-400 border border-slate-600/40'
      }`}
    >
      {status || 'Active'}
    </span>
  );
}

export function resolveStaffCreatedByLabel(staffDirectory = [], createdBy) {
  if (!createdBy) return null;

  const match = staffDirectory.find(
    (member) => member.uid === createdBy || member.id === createdBy,
  );

  return match?.fullName || match?.name || createdBy;
}

export default function UserViewModal({ user, staffDirectory = [], isOpen, onClose }) {
  if (!user) return null;

  const fullName = user.fullName || user.name || '—';
  const createdByLabel = resolveStaffCreatedByLabel(staffDirectory, user.createdBy);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Staff User Profile" icon={User}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailField label="Full Name" value={fullName} />
          <DetailField label="Email" value={user.email || '—'} />
          <DetailField label="Role">
            <RoleBadge role={user.role} />
          </DetailField>
          <DetailField label="Status">
            <StatusBadge status={user.status} />
          </DetailField>
          <DetailField label="Created Date" value={formatTimestamp(user.createdAt)} />
          {createdByLabel && (
            <DetailField label="Created By" value={createdByLabel} />
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
