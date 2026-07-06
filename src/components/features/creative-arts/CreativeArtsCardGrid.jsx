import { Eye, Edit2, Trash2, Palette, Users } from 'lucide-react';
import { DEPARTMENT_STATUS, getMemberCount } from '@/config/creativeArtsOptions';
import DepartmentAvatar from '@/components/features/creative-arts/DepartmentAvatar';

export function DepartmentStatusBadge({ status }) {
  const isActive = (status || DEPARTMENT_STATUS.ACTIVE) === DEPARTMENT_STATUS.ACTIVE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
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

function DepartmentOverviewCard({
  department,
  onView,
  onEdit,
  onDelete,
  canManage = false,
}) {
  const memberCount = getMemberCount(department);
  const leader = department.leader?.trim() || 'Not assigned';
  const description = department.description?.trim() || 'Not provided';

  return (
    <article className="bg-slate-900/60 border border-slate-700/70 rounded-xl p-4 flex flex-col gap-4 hover:border-indigo-500/40 hover:bg-slate-900/80 transition shadow-sm">
      <div className="flex items-start gap-3">
        <DepartmentAvatar department={department} size="lg" />

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white tracking-wide truncate">
            {department.name || 'Unnamed Department'}
          </h3>
          <p className="text-[11px] text-indigo-400/90 font-medium mt-0.5">
            Leader: {leader}
          </p>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
          Description:{' '}
        </span>
        {description}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Total Members
          </p>
          <p className="text-lg font-bold text-white mt-0.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            {memberCount}
          </p>
        </div>

        <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Status
          </p>
          <div className="mt-1.5">
            <DepartmentStatusBadge status={department.status} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/60">
        <button
          type="button"
          onClick={() => onView?.(department)}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
        {canManage && onEdit && (
          <button
            type="button"
            onClick={() => onEdit?.(department)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-2.5 py-1.5 rounded-lg hover:bg-indigo-500/10 transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
        {canManage && onDelete && (
          <button
            type="button"
            onClick={() => onDelete?.(department)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        )}
      </div>
    </article>
  );
}

export default function CreativeArtsCardGrid({
  departments = [],
  onView,
  onEdit,
  onDelete,
  canManageRow = () => false,
  emptyMessage = 'No departments found.',
}) {
  if (!departments.length) {
    return (
      <div className="py-12 text-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30">
        <Palette className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-500 text-xs">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {departments.map((department) => (
        <DepartmentOverviewCard
          key={department.id}
          department={department}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          canManage={canManageRow(department)}
        />
      ))}
    </div>
  );
}
