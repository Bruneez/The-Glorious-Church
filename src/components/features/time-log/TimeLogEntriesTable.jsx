import { Edit2, Trash2 } from 'lucide-react';
import Table from '@/components/ui/Table';
import {
  formatDurationHours,
  formatTimeLogDisplayTime,
} from '@/config/timeLogOptions';
import { formatDate } from '@/utils/formatters';
import TimeLogActivityBadge from '@/components/features/time-log/TimeLogActivityBadge';

export default function TimeLogEntriesTable({
  entries = [],
  emptyMessage,
  canManageEntry = false,
  onEditEntry,
  onDeleteEntry,
}) {
  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (value) => (value ? formatDate(value, 'short') : '—'),
    },
    {
      key: 'title',
      label: 'Title',
      cellClassName: 'font-medium text-white',
      render: (value) => value || '—',
    },
    {
      key: 'activityType',
      label: 'Activity',
      render: (value) => <TimeLogActivityBadge activityType={value} />,
    },
    {
      key: 'startTime',
      label: 'Start',
      render: (value) => formatTimeLogDisplayTime(value),
    },
    {
      key: 'endTime',
      label: 'End',
      render: (value) => formatTimeLogDisplayTime(value),
    },
    {
      key: 'durationMinutes',
      label: 'Duration',
      render: (value) => `${formatDurationHours(value)}h`,
    },
    {
      key: 'description',
      label: 'Description',
      className: 'hidden lg:table-cell',
      cellClassName: 'hidden lg:table-cell max-w-xs truncate',
      render: (value) => value || '—',
    },
  ];

  if (canManageEntry) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      className: 'text-right w-[88px]',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onEditEntry?.(row)}
            className="text-indigo-400 hover:text-indigo-300 p-1.5 rounded hover:bg-indigo-500/10 transition"
            title="Edit entry"
            aria-label={`Edit ${row.title || 'time log entry'}`}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteEntry?.(row)}
            className="text-rose-400 hover:text-rose-300 p-1.5 rounded hover:bg-rose-500/10 transition"
            title="Delete entry"
            aria-label={`Delete ${row.title || 'time log entry'}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    });
  }

  return (
    <Table
      columns={columns}
      data={entries}
      emptyMessage={emptyMessage || 'No time log entries found.'}
      className="min-w-0"
    />
  );
}
