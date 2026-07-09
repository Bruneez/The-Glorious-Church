import { Church, Edit2, Users } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import MinistryAvatar from '@/components/features/ministries/MinistryAvatar';
import {
  MINISTRY_STATUS,
  MINISTRY_FUTURE_SECTIONS,
  getMinistryMemberCount,
} from '@/config/ministriesOptions';

function DetailField({ label, value, children }) {
  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <div className="text-sm font-medium text-white mt-1">{children ?? value ?? '—'}</div>
    </div>
  );
}

function FutureSectionPlaceholder({ title }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
      <p className="text-[11px] text-slate-500 mt-1.5">Coming soon — this section will be available in a future update.</p>
    </div>
  );
}

export function MinistryStatusBadge({ status }) {
  const isActive = (status || MINISTRY_STATUS.ACTIVE) === MINISTRY_STATUS.ACTIVE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
        isActive
          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
          : 'bg-rose-950/60 text-rose-400 border border-rose-500/20'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
      {status || MINISTRY_STATUS.ACTIVE}
    </span>
  );
}

export default function MinistryViewModal({
  ministry,
  isOpen,
  onClose,
  onEdit,
  canManage = false,
}) {
  if (!ministry) return null;

  const memberCount = getMinistryMemberCount(ministry);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ministry Details"
      icon={Church}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-slate-700/70">
          <MinistryAvatar ministry={ministry} size="xl" />
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-white tracking-wide">{ministry.ministryName}</h3>
            <p className="text-sm text-indigo-400/90 font-medium mt-1">
              {ministry.ministryLeader || 'Not assigned'}
            </p>
            <div className="mt-2">
              <MinistryStatusBadge status={ministry.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailField label="Ministry Name" value={ministry.ministryName || '—'} />
          <DetailField label="Ministry Leader" value={ministry.ministryLeader || 'Not assigned'} />
          <DetailField label="Total Members">
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              {memberCount}
            </span>
          </DetailField>
          <DetailField label="Status">
            <MinistryStatusBadge status={ministry.status} />
          </DetailField>
        </div>

        <DetailField label="Description" value={ministry.description || 'No description provided.'} />

        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Upcoming Sections
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MINISTRY_FUTURE_SECTIONS.map((section) => (
              <FutureSectionPlaceholder key={section} title={section} />
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-slate-700">
          {canManage && onEdit ? (
            <Button
              type="button"
              variant="primary"
              icon={Edit2}
              onClick={() => {
                onEdit(ministry);
                onClose();
              }}
            >
              Edit Ministry
            </Button>
          ) : null}
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
