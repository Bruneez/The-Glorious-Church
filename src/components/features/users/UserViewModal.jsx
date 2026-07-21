import { User } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import UserAvatar from '@/components/ui/UserAvatar';
import RoleBadge from '@/components/ui/RoleBadge';
import { formatDate } from '@/utils/formatters';
import { formatLastSeen, isUserOnline } from '@/utils/lastSeen';

function DetailField({ label, value, children }) {
  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-4 md:p-5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">{label}</p>
      <div className="text-sm md:text-base font-medium text-white">{children ?? value ?? '—'}</div>
    </div>
  );
}

function formatTimestamp(value) {
  if (!value) return '—';

  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return formatDate(date.toISOString(), 'short');
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Staff User Profile"
      icon={User}
      maxWidth="max-w-4xl"
      panelClassName="p-6 md:p-8 space-y-6"
    >
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-5 pb-5 md:pb-6 border-b border-slate-700/70">
          <UserAvatar name={fullName} photo={user.photo} size="xl" />
          <div className="min-w-0">
            <p className="text-base md:text-lg font-semibold text-white">{fullName}</p>
            <p className="text-sm text-slate-400 mt-1">{user.email || '—'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <DetailField label="Full Name" value={fullName} />
          <DetailField label="Email" value={user.email || '—'} />
          <DetailField label="Role">
            <RoleBadge role={user.role} />
          </DetailField>
          <DetailField label="Status">
            <StatusBadge status={user.status} />
          </DetailField>
          <DetailField label="Last Seen">
            <span className={isUserOnline(user.lastSeenAt) ? 'text-emerald-400' : ''}>
              {formatLastSeen(user.lastSeenAt)}
            </span>
          </DetailField>
          <DetailField label="Created Date" value={formatTimestamp(user.createdAt)} />
          {createdByLabel && <DetailField label="Created By" value={createdByLabel} />}
        </div>

        <div className="flex justify-end pt-4 md:pt-6 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
