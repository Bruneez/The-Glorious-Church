import { AlertTriangle } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import {
  getPriorityBadgeClass,
  getStatusBadgeClass,
  isTaskOverdue,
} from '@/config/tasksOptions';

export function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityBadgeClass(priority)}`}
    >
      {priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusBadgeClass(status)}`}
    >
      {status}
    </span>
  );
}

export function OverdueBadge({ task, dateFormat = 'long', overdue }) {
  const isOverdue = overdue ?? isTaskOverdue(task);
  if (!isOverdue) return null;

  return (
    <span className="inline-flex items-start gap-1.5 rounded border px-2 py-1 bg-rose-950/60 text-rose-400 border-rose-500/20">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] font-bold uppercase tracking-wide">Overdue</span>
        {task.dueDate ? (
          <span className="text-[10px] font-medium text-rose-300/90 normal-case tracking-normal">
            Due {formatDate(task.dueDate, dateFormat)}
          </span>
        ) : null}
      </span>
    </span>
  );
}

export function TaskDueDateDisplay({ task, dateFormat = 'short' }) {
  const overdue = isTaskOverdue(task);

  if (overdue) {
    return (
      <div className="mt-2">
        <OverdueBadge task={task} dateFormat="long" overdue />
      </div>
    );
  }

  return (
    <p className="text-[11px] mt-1 text-slate-400">
      Due: {task.dueDate ? formatDate(task.dueDate, dateFormat) : '—'}
    </p>
  );
}

export function TaskDueDateDetail({ task }) {
  const overdue = isTaskOverdue(task);

  if (!task?.dueDate) return '—';
  if (overdue) return <OverdueBadge task={task} dateFormat="long" overdue />;

  return formatDate(task.dueDate, 'long');
}
