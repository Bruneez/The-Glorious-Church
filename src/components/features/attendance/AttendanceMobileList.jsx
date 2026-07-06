import { Eye, Edit2, Trash2 } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

function formatCreatedAt(value) {
  if (!value) return '—';
  return formatDate(value, 'short');
}

export default function AttendanceMobileList({
  records = [],
  onView,
  onEdit,
  onDelete,
  canManage = false,
  emptyMessage = 'No attendance records found.',
  viewMode = 'service',
}) {
  const isDepartmentView = viewMode === 'department' || viewMode === 'rollcall';

  if (!records.length) {
    return (
      <div className="py-8 text-center md:hidden">
        <p className="text-slate-500 text-xs">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {records.map((record) => (
        <div
          key={record.id}
          className="bg-slate-900/60 border border-slate-700/70 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">
                {record.attendanceDate ? formatDate(record.attendanceDate) : '—'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Created {formatCreatedAt(record.createdAt)}
              </p>
            </div>
            {isDepartmentView ? (
              <div className="text-right text-[11px]">
                <p className="text-indigo-400 font-semibold">
                  Total: {record.totalAttendance ?? '—'}
                </p>
                <p className="text-slate-400 mt-0.5">Visitors: {record.visitors ?? '—'}</p>
              </div>
            ) : (
              <div className="text-right text-[11px]">
                <p className="text-emerald-400 font-semibold">Present: {record.present ?? '—'}</p>
                <p className="text-rose-400 font-semibold mt-0.5">Absent: {record.absent ?? '—'}</p>
              </div>
            )}
          </div>

          {isDepartmentView && record.departmentName && (
            <p className="text-[11px] text-indigo-400">{record.departmentName}</p>
          )}

          {!isDepartmentView && (
            <p className="text-[11px] text-slate-500">
              Salvations:{' '}
              <span className="text-slate-300 font-medium">{record.salvations ?? '—'}</span>
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-700/70">
            <button
              type="button"
              onClick={() => onView?.(record)}
              className="text-[11px] font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" />
              View
            </button>
            {canManage && onEdit && (
              <button
                type="button"
                onClick={() => onEdit?.(record)}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-2.5 py-1.5 rounded-lg hover:bg-indigo-500/10 transition"
              >
                <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                Edit
              </button>
            )}
            {canManage && onDelete && (
              <button
                type="button"
                onClick={() => onDelete?.(record)}
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
