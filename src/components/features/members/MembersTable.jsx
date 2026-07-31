import { Eye, Edit2, Trash2 } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import Table from '@/components/ui/Table';
import TableColumnSortControls from '@/components/ui/TableColumnSortControls';
import {
  getMemberFullName,
  getOccupationDisplay,
  getMemberProfileImageUrl,
} from '@/config/memberOptions';
import {
  getMemberTableCreativeArtsLabel,
  getMemberTableMinistryLabel,
} from '@/config/memberTableOptions';

function SortableHeader({
  label,
  columnKey,
  activeColumn,
  activeDirection,
  onSort,
  ascendingLabel,
  descendingLabel,
}) {
  return (
    <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap">
      <span className="leading-tight">{label}</span>
      <TableColumnSortControls
        columnKey={columnKey}
        activeColumn={activeColumn}
        activeDirection={activeDirection}
        onSort={onSort}
        ascendingLabel={ascendingLabel}
        descendingLabel={descendingLabel}
        className="ml-0.5"
      />
    </span>
  );
}

function MemberAvatar({ member }) {
  return (
    <UserAvatar
      name={getMemberFullName(member)}
      photo={getMemberProfileImageUrl(member)}
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
  sortColumn = null,
  sortDirection = null,
  onSortChange,
  creativeArtsTeams = [],
  ministries = [],
}) {
  const sortProps = {
    activeColumn: sortColumn,
    activeDirection: sortDirection,
    onSort: onSortChange,
  };

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
      headerRender: () => (
        <SortableHeader
          label="Full Name"
          columnKey="fullName"
          ascendingLabel="Sort full name A to Z"
          descendingLabel="Sort full name Z to A"
          {...sortProps}
        />
      ),
      render: (_, row) => (
        <span className="font-medium text-slate-100 whitespace-nowrap">
          {getMemberFullName(row) || '-'}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone Number',
      headerRender: () => (
        <SortableHeader
          label="Phone Number"
          columnKey="phone"
          ascendingLabel="Sort phone number ascending"
          descendingLabel="Sort phone number descending"
          {...sortProps}
        />
      ),
      render: (value) => <span className="whitespace-nowrap">{value || '-'}</span>,
    },
    {
      key: 'occupation',
      label: 'Occupation',
      headerRender: () => (
        <SortableHeader
          label="Occupation"
          columnKey="occupation"
          ascendingLabel="Sort occupation A to Z"
          descendingLabel="Sort occupation Z to A"
          {...sortProps}
        />
      ),
      render: (_, row) => <OccupationCell member={row} />,
    },
    {
      key: 'creativeArts',
      label: 'Creative Arts',
      headerRender: () => (
        <SortableHeader
          label="Creative Arts"
          columnKey="creativeArts"
          ascendingLabel="Sort Creative Arts A to Z"
          descendingLabel="Sort Creative Arts Z to A"
          {...sortProps}
        />
      ),
      render: (_, row) => (
        <span className="whitespace-nowrap text-slate-200">
          {getMemberTableCreativeArtsLabel(row, creativeArtsTeams)}
        </span>
      ),
    },
    {
      key: 'ministries',
      label: 'Ministries',
      headerRender: () => (
        <SortableHeader
          label="Ministries"
          columnKey="ministries"
          ascendingLabel="Sort ministries A to Z"
          descendingLabel="Sort ministries Z to A"
          {...sortProps}
        />
      ),
      render: (_, row) => (
        <span className="whitespace-nowrap text-slate-200">
          {getMemberTableMinistryLabel(row, ministries)}
        </span>
      ),
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
