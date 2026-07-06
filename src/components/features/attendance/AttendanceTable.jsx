import { Eye, Edit2, Trash2 } from 'lucide-react';
import Table from '@/components/ui/Table';
import { formatDate } from '@/utils/formatters';

function formatCreatedAt(value) {
  if (!value) return '-';
  return formatDate(value, 'short');
}

export default function AttendanceTable({
  records = [],
  onView,
  onEdit,
  onDelete,
  canManage = false,
  emptyMessage = 'No attendance records found.',
  viewMode = 'service',
}) {
  const isDepartmentView = viewMode === 'department' || viewMode === 'rollcall';

  const serviceColumns = [
    {
      key: 'attendanceDate',
      label: 'Service Date',
      cellClassName: 'py-4',
      render: (value) => (
        <span className="font-medium text-slate-100">{value ? formatDate(value) : '-'}</span>
      ),
    },
    {
      key: 'totalAttendance',
      label: 'Total Attendance',
      cellClassName: 'py-4',
      render: (value) => (
        <span className="text-indigo-400 font-semibold">{value ?? '-'}</span>
      ),
    },
    {
      key: 'visitors',
      label: 'Visitors',
      cellClassName: 'py-4',
      render: (value) => value ?? '-',
    },
    {
      key: 'salvations',
      label: 'Salvations',
      cellClassName: 'py-4',
      render: (value) => value ?? '-',
    },
    {
      key: 'createdAt',
      label: 'Created At',
      cellClassName: 'py-4',
      render: (value) => formatCreatedAt(value),
    },
  ];

  const departmentColumns = [
    {
      key: 'attendanceDate',
      label: 'Service Date',
      cellClassName: 'py-4',
      render: (value) => (
        <span className="font-medium text-slate-100">{value ? formatDate(value) : '-'}</span>
      ),
    },
    {
      key: 'departmentName',
      label: 'Department',
      cellClassName: 'py-4',
      render: (value) => value || '-',
    },
    {
      key: 'present',
      label: 'Present',
      cellClassName: 'py-4',
      render: (value) => (
        <span className="text-emerald-400 font-semibold">{value ?? '-'}</span>
      ),
    },
    {
      key: 'absent',
      label: 'Absent',
      cellClassName: 'py-4',
      render: (value) => (
        <span className="text-rose-400 font-semibold">{value ?? '-'}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      cellClassName: 'py-4',
      render: (value) => formatCreatedAt(value),
    },
  ];

  const actionColumn = {
    key: 'actions',
    label: 'Actions',
    className: 'text-right',
    cellClassName: 'py-4',
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
  };

  const columns = [...(isDepartmentView ? departmentColumns : serviceColumns), actionColumn];

  return (
    <Table
      columns={columns}
      data={records}
      emptyMessage={emptyMessage}
      className="bg-transparent border-0"
    />
  );
}
