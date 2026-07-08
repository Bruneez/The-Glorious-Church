import { Edit2, Trash2 } from 'lucide-react';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { formatDate } from '@/utils/formatters';
import {
  getPriorityBadgeClass,
  getStatusBadgeClass,
  isTaskOverdue,
} from '@/config/tasksOptions';

function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityBadgeClass(priority)}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusBadgeClass(status)}`}
    >
      {status}
    </span>
  );
}

export default function TasksTable({ tasks = [], canManage = false, onEdit, onDelete }) {
  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (_, row) => (
        <div>
          <p className="font-medium text-white">{row.title}</p>
          {row.description ? (
            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{row.description}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'assignedUserName',
      label: 'Assigned To',
      render: (value, row) => (
        <div>
          <p>{value || '—'}</p>
          {row.assignedUserRole ? (
            <p className="text-[10px] text-slate-500 mt-0.5">{row.assignedUserRole}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value) => <PriorityBadge priority={value} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (value, row) => {
        if (!value) return '—';

        const overdue = isTaskOverdue(row);
        return (
          <span className={overdue ? 'text-rose-400 font-medium' : undefined}>
            {formatDate(value, 'short')}
            {overdue ? ' (Overdue)' : ''}
          </span>
        );
      },
    },
  ];

  if (canManage) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (_, row) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            icon={Edit2}
            onClick={() => onEdit?.(row)}
            aria-label={`Edit ${row.title}`}
          />
          <Button
            type="button"
            variant="ghost"
            icon={Trash2}
            onClick={() => onDelete?.(row)}
            aria-label={`Delete ${row.title}`}
            className="text-rose-400 hover:text-rose-300"
          />
        </div>
      ),
    });
  }

  return (
    <Table
      columns={columns}
      data={tasks}
      emptyMessage="No tasks found."
    />
  );
}
