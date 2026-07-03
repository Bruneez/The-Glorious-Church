import { ClipboardList } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useMembers } from '@/services/membersService';
import { getInitials, formatDate } from '@/utils/formatters';
import {
  ATTENDANCE_STATUS,
  getRecordTotalPresent,
  resolveAttendanceEntryMembers,
} from '@/config/attendanceOptions';

function MemberAvatar({ member, fullName }) {
  return (
    <div className="w-8 h-8 rounded-full bg-indigo-600 border border-indigo-400/30 overflow-hidden flex items-center justify-center text-xs font-bold uppercase text-white shrink-0">
      {member?.photo ? (
        <img src={member.photo} alt={fullName} className="w-full h-full object-cover" />
      ) : (
        getInitials(fullName) || '?'
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const isPresent = status === ATTENDANCE_STATUS.PRESENT;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
        isPresent
          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
          : 'bg-rose-950/60 text-rose-400 border border-rose-500/20'
      }`}
    >
      {status || ATTENDANCE_STATUS.ABSENT}
    </span>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-sm font-medium text-white mt-1">{value}</p>
    </div>
  );
}

export default function AttendanceViewModal({ record, isOpen, onClose }) {
  const { data: members = [], loading } = useMembers();

  if (!record) return null;

  const attendanceDate = record.serviceDate || record.date || '';
  const totalPresent = getRecordTotalPresent(record);
  const totalAbsent = record.totalAbsent ?? record.absent ?? 0;
  const entryMembers = resolveAttendanceEntryMembers(record.entries || [], members);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Attendance Details"
      icon={ClipboardList}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailField
            label="Attendance Date"
            value={attendanceDate ? formatDate(attendanceDate) : '-'}
          />
          <DetailField label="Recorded By" value={record.recordedBy || '-'} />
          <DetailField label="Total Present" value={String(totalPresent)} />
          <DetailField label="Total Absent" value={String(totalAbsent)} />
        </div>

        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Members
          </h4>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
            </div>
          ) : entryMembers.length === 0 ? (
            <div className="rounded-xl bg-slate-900/50 border border-slate-700/60 p-6 text-center">
              <p className="text-slate-500 text-xs">No member attendance details saved for this record.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-700/70 overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/60 sticky top-0">
                    <th className="px-3 py-2 text-left font-semibold text-slate-300 uppercase tracking-wider w-[50px]">
                      Avatar
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entryMembers.map((entry) => (
                    <tr key={entry.memberId} className="border-b border-slate-700/50">
                      <td className="px-3 py-2">
                        <MemberAvatar member={entry.member} fullName={entry.fullName} />
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-100">{entry.fullName}</td>
                      <td className="px-3 py-2 text-slate-400">{entry.department}</td>
                      <td className="px-3 py-2">
                        <StatusBadge status={entry.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
