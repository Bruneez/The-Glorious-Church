import { Eye, Edit2, Trash2 } from 'lucide-react';
import Select from '@/components/ui/Select';
import {
  STATUS_OPTIONS,
  getPriorityBadgeClass,
} from '@/config/developmentBoardOptions';

export default function DevelopmentTaskCard({
  task,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  isUpdatingStatus = false,
}) {
  return (
    <div className="bg-slate-900/70 border border-slate-700/70 rounded-xl p-3 space-y-3 shadow-sm">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-xs font-semibold text-white leading-snug">{task.title}</h4>
          <span
            className={`shrink-0 inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityBadgeClass(task.priority)}`}
          >
            {task.priority}
          </span>
        </div>

        {task.assignedTo ? (
          <p className="text-[10px] text-slate-400">
            Assigned to{' '}
            <span className="text-slate-200 font-medium">{task.assignedTo}</span>
          </p>
        ) : (
          <p className="text-[10px] text-slate-500 italic">Unassigned</p>
        )}
      </div>

      <Select
        label="Status"
        name={`status-${task.id}`}
        value={task.status}
        onChange={(event) => onStatusChange(task, event.target.value)}
        options={STATUS_OPTIONS}
        disabled={isUpdatingStatus}
      />

      <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-700/60">
        <button
          type="button"
          onClick={() => onView(task)}
          className="text-slate-300 hover:text-white p-1.5 rounded hover:bg-slate-700/40 transition"
          title="View"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="text-indigo-400 hover:text-indigo-300 p-1.5 rounded hover:bg-indigo-500/10 transition"
          title="Edit"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="text-rose-400 hover:text-rose-300 p-1.5 rounded hover:bg-rose-500/10 transition"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
