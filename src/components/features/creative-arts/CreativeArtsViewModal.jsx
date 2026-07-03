import { Palette, Edit2, Trash2, User, Users, Activity } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DepartmentAvatar from '@/components/features/creative-arts/DepartmentAvatar';
import { DEPARTMENT_STATUS, getMemberCount } from '@/config/creativeArtsOptions';

function DetailCard({ icon: Icon, label, children }) {
  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5">
      <div className="flex items-center gap-2 mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      </div>
      <div className="text-sm font-medium text-white">{children}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const isActive = (status || DEPARTMENT_STATUS.ACTIVE) === DEPARTMENT_STATUS.ACTIVE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        isActive
          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
          : 'bg-rose-950/60 text-rose-400 border border-rose-500/20'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
      {status || DEPARTMENT_STATUS.ACTIVE}
    </span>
  );
}

export default function CreativeArtsViewModal({
  department,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  canManage = false,
}) {
  if (!department) return null;

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${department.name}? This cannot be undone.`)) {
      return;
    }

    await onDelete(department);
    onClose();
  };

  const description = department.description?.trim();

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl" title="Department Profile" icon={Palette}>
      {/* Profile hero */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 border-b border-slate-700/70">
        <DepartmentAvatar department={department} size="xl" />
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-white tracking-tight">{department.name}</h3>
            <p className="text-sm text-indigo-400 font-medium mt-1">
              {department.leader || 'Not assigned'}
            </p>
          </div>
          <StatusBadge status={department.status} />
        </div>
      </div>

      {/* Department details */}
      <div className="pt-5 space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-indigo-400" />
          Department Details
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailCard icon={User} label="Department Leader">
            {department.leader || 'Not assigned'}
          </DetailCard>
          <DetailCard icon={Users} label="Total Members">
            {getMemberCount(department)}
          </DetailCard>
          <DetailCard icon={Activity} label="Status">
            <StatusBadge status={department.status} />
          </DetailCard>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-700/70 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Description
          </p>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {description || 'No description provided'}
          </p>
        </div>
      </div>

      {/* Actions footer */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-5 mt-5 border-t border-slate-700/70">
        {canManage && onDelete ? (
          <Button type="button" variant="danger" icon={Trash2} onClick={handleDelete}>
            Delete
          </Button>
        ) : (
          <span className="hidden sm:block" aria-hidden="true" />
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto w-full sm:w-auto">
          <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
          {canManage && onEdit && (
            <Button
              type="button"
              icon={Edit2}
              onClick={() => {
                onEdit(department);
                onClose();
              }}
              className="w-full sm:w-auto"
            >
              Edit
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
