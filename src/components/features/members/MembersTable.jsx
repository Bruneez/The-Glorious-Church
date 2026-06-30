import { User, MessageCircle, Edit2, Trash2 } from 'lucide-react';
import { getInitials, formatWhatsAppLink } from '@/utils/formatters';
import Table from '@/components/ui/Table';

export default function MembersTable({ members, onEdit, onDelete }) {
  const columns = [
    {
      key: 'avatar',
      label: 'Avatar',
      className: 'w-[60px]',
      render: (value, row) => (
        <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 overflow-hidden flex items-center justify-center text-xs font-bold uppercase text-white">
          {row.photo ? (
            <img src={row.photo} alt={row.name} className="w-full h-full object-cover" />
          ) : (
            getInitials(row.name)
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Youth Profile Name'
    },
    {
      key: 'phone',
      label: 'Contact',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span>{value}</span>
          <a
            href={formatWhatsAppLink(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300"
            title="WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </a>
        </div>
      )
    },
    {
      key: 'creativeArts',
      label: 'Creative Sector',
      render: (value) => value || '-'
    },
    {
      key: 'occupation',
      label: 'Occupation Context'
    },
    {
      key: 'affiliation',
      label: 'Affiliation Mapping',
      render: (value, row) => row.school || row.institution || '-'
    },
    {
      key: 'status',
      label: 'Roll Call Status',
      render: () => (
        <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
          Active
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (value, row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(row)}
            className="text-indigo-400 hover:text-indigo-300 p-1 rounded hover:bg-slate-700/30 transition"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(row.id)}
            className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      data={members}
      emptyMessage="No members found"
    />
  );
}
