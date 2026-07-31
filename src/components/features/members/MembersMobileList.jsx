import { Eye, Edit2, Trash2 } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import {
  getMemberFullName,
  getOccupationDisplay,
  getMemberProfileImageUrl,
} from '@/config/memberOptions';
import {
  getMemberTableCreativeArtsLabel,
  getMemberTableMinistryLabel,
} from '@/config/memberTableOptions';

function MemberAvatar({ member, size = 'md' }) {
  return (
    <UserAvatar
      name={getMemberFullName(member)}
      photo={getMemberProfileImageUrl(member)}
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
  creativeArtsTeams = [],
  ministries = [],
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
        const canManage = canManageRow(member);
        const fullName = getMemberFullName(member);
        const { primary, secondary } = getOccupationDisplay(member);
        const creativeArtsName = getMemberTableCreativeArtsLabel(member, creativeArtsTeams);
        const ministryName = getMemberTableMinistryLabel(member, ministries);

        return (
          <div
            key={member.id}
            className="bg-slate-900/60 border border-slate-700/70 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <MemberAvatar member={member} size="lg" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white">{fullName || '-'}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{member.phone || 'No phone'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Occupation</p>
                <p className="text-slate-200 mt-0.5">{primary || '-'}</p>
                {secondary && (
                  <p className="text-[10px] text-slate-500 mt-0.5">{secondary}</p>
                )}
              </div>
              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Creative Arts</p>
                <p className="text-slate-200 mt-0.5">{creativeArtsName}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Ministries</p>
                <p className="text-slate-200 mt-0.5">{ministryName}</p>
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
