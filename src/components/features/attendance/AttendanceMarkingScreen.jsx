import { useEffect, useMemo, useRef, useState } from 'react';
import { ClipboardCheck, Search, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useMembers } from '@/services/membersService';
import { useAuth } from '@/hooks/useAuth';
import { getInitials, formatDate } from '@/utils/formatters';
import { getMemberDepartment, getMemberFullName } from '@/config/memberOptions';
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_OPTIONS,
  DEPARTMENT_FILTER_ALL,
  filterMembersForAttendance,
  getDepartmentFilterOptions,
} from '@/config/attendanceOptions';

function MemberAvatar({ member }) {
  const fullName = getMemberFullName(member);

  return (
    <div className="w-9 h-9 rounded-full bg-indigo-600 border border-indigo-400/30 overflow-hidden flex items-center justify-center text-xs font-bold uppercase text-white shrink-0">
      {member.photo ? (
        <img src={member.photo} alt={fullName} className="w-full h-full object-cover" />
      ) : (
        getInitials(fullName) || '?'
      )}
    </div>
  );
}

function AttendanceStatusDropdown({ memberId, value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(memberId, e.target.value)}
      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer min-w-[120px]"
      aria-label="Attendance status"
    >
      {ATTENDANCE_STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default function AttendanceMarkingScreen({ isOpen, session, onClose, onSave }) {
  const { data: members = [], loading } = useMembers();
  const { staffProfile, firebaseUser } = useAuth();
  const initializedFor = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState(DEPARTMENT_FILTER_ALL);
  const [markings, setMarkings] = useState({});
  const [attendanceDate, setAttendanceDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      initializedFor.current = null;
      return;
    }

    setSearchTerm('');
    setDepartmentFilter(DEPARTMENT_FILTER_ALL);
    setError('');
    setIsSaving(false);
    setAttendanceDate(session?.serviceDate || '');
  }, [isOpen, session?.serviceDate, session?.recordId]);

  useEffect(() => {
    if (!isOpen || loading || !session?.serviceDate || members.length === 0) {
      return;
    }

    const sessionKey = session.recordId
      ? `edit-${session.recordId}`
      : `new-${session.serviceDate}`;

    if (initializedFor.current === sessionKey) {
      return;
    }

    initializedFor.current = sessionKey;

    const initialMarkings = session.initialMarkings || {};
    setMarkings(
      Object.fromEntries(
        members.map((member) => [
          member.id,
          initialMarkings[member.id] || ATTENDANCE_STATUS.ABSENT,
        ]),
      ),
    );
  }, [isOpen, loading, members, session?.serviceDate, session?.recordId, session?.initialMarkings]);

  const departmentOptions = useMemo(
    () => getDepartmentFilterOptions(members),
    [members],
  );

  const filteredMembers = useMemo(
    () => filterMembersForAttendance(members, searchTerm, departmentFilter),
    [members, searchTerm, departmentFilter],
  );

  const presentCount = useMemo(
    () => Object.values(markings).filter((status) => status === ATTENDANCE_STATUS.PRESENT).length,
    [markings],
  );

  const absentCount = useMemo(
    () => Object.values(markings).filter((status) => status === ATTENDANCE_STATUS.ABSENT).length,
    [markings],
  );

  const handleStatusChange = (memberId, status) => {
    setMarkings((prev) => ({ ...prev, [memberId]: status }));
  };

  const handleSave = async () => {
    if (members.length === 0) {
      setError('No members available to save attendance for.');
      return;
    }

    if (!attendanceDate) {
      setError('Attendance date is required.');
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      const recordedBy =
        staffProfile?.name || firebaseUser?.displayName || firebaseUser?.email || 'Staff Member';

      await onSave(
        { ...session, serviceDate: attendanceDate },
        markings,
        recordedBy,
      );
      onClose();
    } catch (saveError) {
      setError(saveError?.message || 'Failed to save attendance. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !session) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-5xl shadow-xl max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3 p-4 border-b border-slate-700 shrink-0">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <ClipboardCheck className="text-indigo-400 w-4 h-4" />
              {session.recordId ? 'Edit Attendance' : 'Mark Attendance'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {session.recordId ? 'Update attendance for this service date.' : formatDate(session.serviceDate)}
            </p>
            {session.recordId && (
              <div className="mt-2">
                <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer p-1"
            aria-label="Close attendance marking"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-700/70 bg-slate-800/40 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search members by name or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-[11px] text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer sm:min-w-[180px]"
            >
              {departmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            {presentCount} present · {absentCount} absent · {members.length} total members
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-500 text-xs">No members match your search.</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block bg-slate-900/40 border border-slate-700/70 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-900/60">
                      <th className="px-4 py-3 text-left font-semibold text-slate-300 uppercase tracking-wider w-[60px]">
                        Avatar
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-300 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-300 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-300 uppercase tracking-wider">
                        Present / Absent
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="border-b border-slate-700/50 hover:bg-slate-700/20 transition"
                      >
                        <td className="px-4 py-3">
                          <MemberAvatar member={member} />
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-100">
                          {getMemberFullName(member) || '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {getMemberDepartment(member) || 'Unassigned'}
                        </td>
                        <td className="px-4 py-3">
                          <AttendanceStatusDropdown
                            memberId={member.id}
                            value={markings[member.id] || ATTENDANCE_STATUS.ABSENT}
                            onChange={handleStatusChange}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-slate-900/60 border border-slate-700/70 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <MemberAvatar member={member} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">
                          {getMemberFullName(member) || '-'}
                        </p>
                        <p className="text-[11px] text-indigo-400 mt-0.5">
                          {getMemberDepartment(member) || 'Unassigned'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">
                        Present / Absent
                      </p>
                      <AttendanceStatusDropdown
                        memberId={member.id}
                        value={markings[member.id] || ATTENDANCE_STATUS.ABSENT}
                        onChange={handleStatusChange}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-700 shrink-0 space-y-2">
          {error && <p className="text-rose-400 text-[11px]">{error}</p>}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} isLoading={isSaving}>
              {session.recordId ? 'Update Attendance' : 'Save Attendance'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
