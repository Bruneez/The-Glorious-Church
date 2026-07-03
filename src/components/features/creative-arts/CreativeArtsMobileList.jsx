import { Eye, Edit2, Trash2 } from 'lucide-react';
import { DEPARTMENT_STATUS, getMemberCount } from '@/config/creativeArtsOptions';
import DepartmentAvatar from '@/components/features/creative-arts/DepartmentAvatar';

function StatusBadge({ status }) {
  const isActive = (status || DEPARTMENT_STATUS.ACTIVE) === DEPARTMENT_STATUS.ACTIVE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
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

export default function CreativeArtsMobileList({
  departments,
  onView,
  onEdit,
  onDelete,
  canManageRow = () => false,
}) {
  if (!departments.length) {
    return (
      <div className="py-8 text-center md:hidden">
        <p className="text-slate-500 text-xs">No departments found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {departments.map((department) => {
        const canManage = canManageRow(department);

        return (
          <div
            key={department.id}
            className="bg-slate-900/60 border border-slate-700/70 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <DepartmentAvatar department={department} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{department.name}</h3>
                    <p className="text-[11px] text-indigo-400 mt-0.5">
                      {department.leader || 'Not assigned'}
                    </p>
                  </div>
                  <StatusBadge status={department.status} />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 line-clamp-3">
              {department.description || 'Not provided'}
            </p>

            <p className="text-[11px] text-slate-500">
              Total Members:{' '}
              <span className="text-slate-200 font-semibold">{getMemberCount(department)}</span>
            </p>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-700/70">
              <button
                type="button"
                onClick={() => onView(department)}
                className="text-[11px] font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" />
                View
              </button>
              {canManage && onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(department)}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-2.5 py-1.5 rounded-lg hover:bg-indigo-500/10 transition"
                >
                  <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                  Edit
                </button>
              )}
              {canManage && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(department)}
                  className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
