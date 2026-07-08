import {
  getPriorityBadgeClass,
  getStatusBadgeClass,
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
