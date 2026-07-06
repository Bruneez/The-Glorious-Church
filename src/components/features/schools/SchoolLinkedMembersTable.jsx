import UserAvatar from '@/components/ui/UserAvatar';
import { MEMBER_STATUS } from '@/config/memberOptions';
import { SCHOOL_STATUS } from '@/config/schoolsOptions';
import Table from '@/components/ui/Table';

function MemberAvatar({ member }) {
  const fullName = `${member?.name || ''} ${member?.surname || ''}`.trim();

  return <UserAvatar name={fullName} photo={member?.photo} size="sm" />;
}

function MemberStatusBadge({ status }) {
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

export default function SchoolLinkedMembersTable({
  members = [],
  emptyMessage = 'No members linked to this school.',
}) {
  const columns = [
    {
      key: 'avatar',
      label: 'Avatar',
      className: 'w-[60px]',
      render: (_, row) => <MemberAvatar member={row.raw} />,
    },
    {
      key: 'fullName',
      label: 'Full Name',
      render: (value) => (
        <span className="font-medium text-slate-100 whitespace-nowrap">{value}</span>
      ),
    },
    {
      key: 'occupation',
      label: 'Occupation',
      render: (value) => value || '—',
    },
    {
      key: 'grade',
      label: 'Grade',
      render: (value) => value || '—',
    },
    {
      key: 'course',
      label: 'Course',
      render: (value) => value || '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <MemberStatusBadge status={value} />,
    },
  ];

  return (
    <Table
      columns={columns}
      data={members}
      emptyMessage={emptyMessage}
      className="bg-transparent border-0"
    />
  );
}

export function SchoolStatusBadge({ status }) {
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
