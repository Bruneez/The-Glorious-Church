import { Eye, Edit2, Trash2 } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import { getMemberFullName, getOccupationDisplay, MEMBER_STATUS } from '@/config/memberOptions';
import Table from '@/components/ui/Table';

function StatusBadge({ status }) {
  const isActive = (status || MEMBER_STATUS.ACTIVE) === MEMBER_STATUS.ACTIVE;

  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
        isActive
          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
          : 'bg-slate-900/60 text-slate-400 border border-slate-600/20'
      }`}
    >
      {status || MEMBER_STATUS.ACTIVE}
    </span>
  );
}

function MemberAvatar({ member }) {
  return (
    <UserAvatar
      name={getMemberFullName(member)}
      photo={member.photo}
      size="sm"
    />
  );
}

function OccupationCell({ member }) {
  const { primary, secondary } = getOccupationDisplay(member);

  return (
    <div className="min-w-[120px]">
      <span className="text-slate-200">{primary || '-'}</span>
      {secondary && (
        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{secondary}</p>
      )}
    </div>
  );
}

export default function MembersTable({
  members,
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
      render: (_, row) => <MemberAvatar member={row} />,
    },
    {
      key: 'fullName',
      label: 'Full Name',
      render: (_, row) => (
        <span className="font-medium text-slate-100 whitespace-nowrap">
          {getMemberFullName(row) || '-'}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone Number',
      render: (value) => <span className="whitespace-nowrap">{value || '-'}</span>,
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (value) => value || '-',
    },
    {
      key: 'occupation',
      label: 'Occupation',
      render: (_, row) => <OccupationCell member={row} />,
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
      data={members}
      emptyMessage="No members found. Add your first member to get started."
      className="bg-transparent border-0"
    />
  );
}
