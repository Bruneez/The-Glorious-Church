import { Eye, Edit2, Trash2 } from 'lucide-react';
import { DEPARTMENT_STATUS, getMemberCount } from '@/config/creativeArtsOptions';
import DepartmentAvatar from '@/components/features/creative-arts/DepartmentAvatar';
import Table from '@/components/ui/Table';

function StatusBadge({ status }) {
  const isActive = (status || DEPARTMENT_STATUS.ACTIVE) === DEPARTMENT_STATUS.ACTIVE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
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

export default function CreativeArtsTable({
  departments,
  onView,
  onEdit,
  onDelete,
  canManageRow = () => false,
}) {
  const columns = [
    {
      key: 'avatar',
      label: 'Avatar',
      className: 'w-[60px]',
      render: (_, row) => <DepartmentAvatar department={row} />,
    },
    {
      key: 'name',
      label: 'Department Name',
      render: (value) => <span className="font-medium text-slate-100">{value || '-'}</span>,
    },
    {
      key: 'leader',
      label: 'Department Leader',
      render: (value) => value || 'Not assigned',
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => (
        <span className="line-clamp-2 max-w-xs">{value || 'Not provided'}</span>
      ),
    },
    {
      key: 'members',
      label: 'Total Members',
      render: (_, row) => getMemberCount(row),
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
      render: (_, row) => {
        const canManage = canManageRow(row);

        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onView(row)}
              className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-700/30 transition"
              title="View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            {canManage && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(row)}
                className="text-indigo-400 hover:text-indigo-300 p-1 rounded hover:bg-indigo-500/10 transition"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {canManage && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(row)}
                className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      data={departments}
      emptyMessage="No departments found."
      className="bg-transparent border-0"
    />
  );
}
