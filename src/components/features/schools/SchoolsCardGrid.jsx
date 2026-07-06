import { Eye, Edit2, Trash2, School, Users } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import { SchoolStatusBadge } from '@/components/features/schools/SchoolLinkedMembersTable';

function SchoolOverviewCard({ school, onView, onEdit, onDelete, canManage = false }) {
  const logo = school.raw?.logo || school.raw?.photo || '';

  const handleCardClick = () => {
    onView?.(school);
  };

  return (
    <article
      className="bg-slate-900/60 border border-slate-700/70 rounded-xl p-4 flex flex-col gap-4 hover:border-indigo-500/40 hover:bg-slate-900/80 transition shadow-sm"
    >
      <button
        type="button"
        onClick={handleCardClick}
        className="flex items-start gap-3 text-left w-full cursor-pointer group"
      >
        <UserAvatar name={school.schoolName} photo={logo} size="lg" />

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white tracking-wide truncate group-hover:text-indigo-200 transition">
            {school.schoolName}
          </h3>
          <p className="text-[11px] text-indigo-400/90 font-medium mt-0.5">{school.schoolType}</p>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Total Members</p>
          <p className="text-lg font-bold text-white mt-0.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            {school.totalMembers ?? 0}
          </p>
        </div>

        <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Status</p>
          <div className="mt-1.5">
            <SchoolStatusBadge status={school.status} />
          </div>
        </div>
      </div>

      {school.raw?.address && (
        <p className="text-[11px] text-slate-500 truncate" title={school.raw.address}>
          {school.raw.address}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/60">
        <button
          type="button"
          onClick={() => onView?.(school)}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
        {canManage && onEdit && (
          <button
            type="button"
            onClick={() => onEdit?.(school)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-2.5 py-1.5 rounded-lg hover:bg-indigo-500/10 transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
        {canManage && onDelete && (
          <button
            type="button"
            onClick={() => onDelete?.(school)}
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

export default function SchoolsCardGrid({
  schools = [],
  onView,
  onEdit,
  onDelete,
  canManage = false,
  emptyMessage = 'No schools found.',
}) {
  if (!schools.length) {
    return (
      <div className="py-12 text-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30">
        <School className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-500 text-xs">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {schools.map((school) => (
        <SchoolOverviewCard
          key={school.id}
          school={school}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          canManage={canManage}
        />
      ))}
    </div>
  );
}
