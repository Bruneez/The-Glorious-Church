import { Eye, Edit2, Trash2, Church, Users } from 'lucide-react';
import MinistryAvatar from '@/components/features/ministries/MinistryAvatar';
import { getMinistryMemberCount } from '@/config/ministriesOptions';
import { MinistryStatusBadge } from '@/components/features/ministries/MinistryViewModal';

function MinistryOverviewCard({
  ministry,
  onView,
  onEdit,
  onDelete,
  canManage = false,
}) {
  const memberCount = getMinistryMemberCount(ministry);
  const leader = ministry.ministryLeader?.trim() || 'Not assigned';
  const description = ministry.description?.trim() || 'No description provided.';

  return (
    <article className="bg-slate-900/60 border border-slate-700/70 rounded-xl p-4 flex flex-col gap-4 hover:border-indigo-500/40 hover:bg-slate-900/80 transition shadow-sm">
      <div className="flex items-start gap-3">
        <MinistryAvatar ministry={ministry} size="lg" />

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white tracking-wide truncate">
            {ministry.ministryName || 'Unnamed Ministry'}
          </h3>
          <p className="text-[11px] text-indigo-400/90 font-medium mt-0.5 truncate">
            Leader: {leader}
          </p>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">{description}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Total Members
          </p>
          <p className="text-lg font-bold text-white mt-0.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            {memberCount}
          </p>
        </div>

        <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Status
          </p>
          <div className="mt-1.5">
            <MinistryStatusBadge status={ministry.status} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/60">
        <button
          type="button"
          onClick={() => onView?.(ministry)}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
        {canManage && onEdit && (
          <button
            type="button"
            onClick={() => onEdit?.(ministry)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-2.5 py-1.5 rounded-lg hover:bg-indigo-500/10 transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
        {canManage && onDelete && (
          <button
            type="button"
            onClick={() => onDelete?.(ministry)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        )}
      </div>
    </article>
  );
}

export default function MinistryCardGrid({
  ministries = [],
  onView,
  onEdit,
  onDelete,
  canManage = false,
  emptyMessage = 'No ministries found yet.',
}) {
  if (!ministries.length) {
    return (
      <div className="py-12 text-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30">
        <Church className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {ministries.map((ministry) => (
        <MinistryOverviewCard
          key={ministry.id}
          ministry={ministry}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          canManage={canManage}
        />
      ))}
    </div>
  );
}
