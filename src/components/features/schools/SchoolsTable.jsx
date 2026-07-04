import { Eye, Edit2, Trash2 } from 'lucide-react';
import Table from '@/components/ui/Table';
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

export default function SchoolsTable({
  schools = [],
  onView,
  onEdit,
  onDelete,
  canManage = false,
  emptyMessage = 'No schools found.',
}) {
  const columns = [
    {
      key: 'schoolName',
      label: 'School Name',
      render: (value) => (
        <span className="font-medium text-slate-100">{value}</span>
      ),
    },
    {
      key: 'schoolType',
      label: 'School Type',
      render: (value) => value || '—',
    },
    {
      key: 'totalMembers',
      label: 'Total Members',
      render: (value) => (
        <span className="text-slate-300 font-medium">{value ?? 0}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onView?.(row)}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-700/30 transition"
            title="View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {canManage && onEdit && (
            <button
              type="button"
              onClick={() => onEdit?.(row)}
              className="text-indigo-400 hover:text-indigo-300 p-1 rounded hover:bg-indigo-500/10 transition"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {canManage && onDelete && (
            <button
              type="button"
              onClick={() => onDelete?.(row)}
              className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={schools}
      emptyMessage={emptyMessage}
      className="bg-transparent border-0"
    />
  );
}
