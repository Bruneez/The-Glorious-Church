import { Eye, Edit2, Trash2 } from 'lucide-react';
import { SCHOOL_STATUS } from '@/config/schoolsOptions';

function StatusBadge({ status }) {
  if (!status || status === '—') {
    return <span className="text-slate-500">—</span>;
  }

  const isActive = status === SCHOOL_STATUS.ACTIVE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
        isActive
          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
          : 'bg-rose-950/60 text-rose-400 border border-rose-500/20'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
      {status}
    </span>
  );
}

export default function SchoolsMobileList({
  schools = [],
  onView,
  onEdit,
  onDelete,
  canManage = false,
  emptyMessage = 'No schools found.',
}) {
  if (!schools.length) {
    return (
      <div className="py-8 text-center md:hidden">
        <p className="text-slate-500 text-xs">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {schools.map((school) => (
        <div
          key={school.id}
          className="bg-slate-900/60 border border-slate-700/70 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">{school.schoolName}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{school.schoolType}</p>
            </div>
            <StatusBadge status={school.status} />
          </div>

          <p className="text-[11px] text-slate-500">
            Total Members:{' '}
            <span className="text-slate-300 font-medium">{school.totalMembers ?? 0}</span>
          </p>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-700/70">
            <button
              type="button"
              onClick={() => onView?.(school)}
              className="text-[11px] font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" />
              View
            </button>
            {canManage && onEdit && (
              <button
                type="button"
                onClick={() => onEdit?.(school)}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-2.5 py-1.5 rounded-lg hover:bg-indigo-500/10 transition"
              >
                <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                Edit
              </button>
            )}
            {canManage && onDelete && (
              <button
                type="button"
                onClick={() => onDelete?.(school)}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition"
              >
                <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
