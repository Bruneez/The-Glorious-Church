import { Eye, Edit2, Trash2 } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import { getMemberFullName, getOccupationDisplay, MEMBER_STATUS } from '@/config/memberOptions';

function MemberAvatar({ member, size = 'md' }) {
  return (
    <UserAvatar
      name={getMemberFullName(member)}
      photo={member.photo}
      size={size}
    />
  );
}

export default function MembersMobileList({
  members,
  onView,
  onEdit,
  onDelete,
  canManageRow = () => false,
}) {
  if (!members.length) {
    return (
      <div className="py-8 text-center md:hidden">
        <p className="text-slate-500 text-xs">No members found. Add your first member to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {members.map((member) => {
        const status = member.status || MEMBER_STATUS.ACTIVE;
        const isActive = status === MEMBER_STATUS.ACTIVE;
        const canManage = canManageRow(member);
        const fullName = getMemberFullName(member);
        const { primary, secondary } = getOccupationDisplay(member);

        return (
          <div
            key={member.id}
            className="bg-slate-900/60 border border-slate-700/70 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <MemberAvatar member={member} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{fullName || '-'}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{member.phone || 'No phone'}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      isActive
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-600/20'
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Gender</p>
                <p className="text-slate-200 mt-0.5">{member.gender || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Occupation</p>
                <p className="text-slate-200 mt-0.5">{primary || '-'}</p>
                {secondary && (
                  <p className="text-[10px] text-slate-500 mt-0.5">{secondary}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-700/70">
              <button
                type="button"
                onClick={() => onView(member)}
                className="text-[11px] font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" />
                View
              </button>
              {canManage && onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(member)}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 px-2.5 py-1.5 rounded-lg hover:bg-indigo-500/10 transition"
                >
                  <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                  Edit
                </button>
              )}
              {canManage && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(member)}
                  className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
