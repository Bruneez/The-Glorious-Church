import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import AttendanceForm from '@/components/features/attendance/AttendanceForm';
import AttendanceMarkingScreen from '@/components/features/attendance/AttendanceMarkingScreen';
import AttendanceViewModal from '@/components/features/attendance/AttendanceViewModal';
import AttendanceDeleteModal from '@/components/features/attendance/AttendanceDeleteModal';
import AttendanceTable from '@/components/features/attendance/AttendanceTable';
import AttendanceMobileList from '@/components/features/attendance/AttendanceMobileList';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import {
  useAttendance,
  createAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord,
} from '@/services/attendanceService';
import {
  buildAttendanceRecordPayload,
  computeAttendanceStats,
  entriesToMarkings,
  mapAttendanceRecordForTable,
} from '@/config/attendanceOptions';

function SummaryCard({ label, value, loading }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/70 shadow-sm">
      <h3 className="text-2xl md:text-3xl font-bold text-indigo-400">
        {loading ? '—' : value}
      </h3>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
        {label}
      </p>
    </div>
  );
}

export default function AttendancePage() {
  const { data: attendanceRecords = [], loading: recordsLoading } = useAttendance();
  const { canPerformAction } = useRoleAccess();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMarkingOpen, setIsMarkingOpen] = useState(false);
  const [attendanceSession, setAttendanceSession] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const canManageAttendance = canPerformAction('MANAGE_ATTENDANCE');

  const records = useMemo(
    () => attendanceRecords.map(mapAttendanceRecordForTable),
    [attendanceRecords],
  );

  const stats = useMemo(
    () => computeAttendanceStats(attendanceRecords),
    [attendanceRecords],
  );

  const findRecordById = (tableRecord) =>
    attendanceRecords.find((item) => item.id === tableRecord?.id);

  const handleNewAttendance = () => {
    setAttendanceSession(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (session) => {
    setAttendanceSession({
      serviceDate: session.serviceDate,
      recordId: null,
      initialMarkings: {},
    });
    setIsFormOpen(false);
    setIsMarkingOpen(true);
  };

  const handleSaveAttendance = async (session, markings, recordedBy) => {
    const existingRecord = session.recordId
      ? attendanceRecords.find((record) => record.id === session.recordId)
      : null;

    const payload = buildAttendanceRecordPayload(
      session,
      markings,
      recordedBy,
      existingRecord,
    );

    if (session.recordId) {
      await updateAttendanceRecord(session.recordId, payload);
      setFeedback({ type: 'success', message: 'Attendance record updated successfully.' });
    } else {
      await createAttendanceRecord(payload);
      setFeedback({ type: 'success', message: 'Attendance record saved successfully.' });
    }

    setAttendanceSession(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleCloseMarking = () => {
    setIsMarkingOpen(false);
    setAttendanceSession(null);
  };

  const handleViewRecord = (tableRecord) => {
    const record = findRecordById(tableRecord);
    if (record) {
      setViewingRecord(record);
    }
  };

  const handleEditRecord = (tableRecord) => {
    if (!canManageAttendance) return;

    const record = findRecordById(tableRecord);
    if (!record) return;

    setAttendanceSession({
      serviceDate: record.serviceDate || record.date || '',
      recordId: record.id,
      initialMarkings: entriesToMarkings(record.entries || []),
    });
    setIsMarkingOpen(true);
  };

  const handleDeleteRecord = (tableRecord) => {
    if (!canManageAttendance) return;
    setDeletingRecord(tableRecord);
  };

  const handleConfirmDelete = async (tableRecord) => {
    setIsDeleting(true);

    try {
      await deleteAttendanceRecord(tableRecord.id);
      setDeletingRecord(null);
      setFeedback({ type: 'success', message: 'Attendance record deleted successfully.' });
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      setFeedback({ type: 'error', message: 'Failed to delete attendance record. Please try again.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Attendance Tracker</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track church attendance and service participation.
          </p>
        </div>
        {canManageAttendance && (
          <Button
            icon={Plus}
            onClick={handleNewAttendance}
            className="shrink-0 w-full sm:w-auto"
          >
            New Attendance
          </Button>
        )}
      </div>

      {feedback.message && (
        <div
          className={`p-3 rounded-lg text-xs font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard label="Highest Attendance" value={stats.highest} loading={recordsLoading} />
        <SummaryCard label="Average Attendance" value={stats.average} loading={recordsLoading} />
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-700/70 bg-slate-800/40">
          <h2 className="text-sm font-bold text-white tracking-wide">Attendance Records</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Service attendance logs and participation history.
          </p>
        </div>

        {recordsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <>
            <div className="hidden md:block p-4">
              <AttendanceTable
                records={records}
                onView={handleViewRecord}
                onEdit={canManageAttendance ? handleEditRecord : undefined}
                onDelete={canManageAttendance ? handleDeleteRecord : undefined}
                canManage={canManageAttendance}
              />
            </div>

            <div className="p-4 md:hidden">
              <AttendanceMobileList
                records={records}
                onView={handleViewRecord}
                onEdit={canManageAttendance ? handleEditRecord : undefined}
                onDelete={canManageAttendance ? handleDeleteRecord : undefined}
                canManage={canManageAttendance}
              />
            </div>
          </>
        )}
      </div>

      <AttendanceForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      <AttendanceMarkingScreen
        isOpen={isMarkingOpen}
        session={attendanceSession}
        onClose={handleCloseMarking}
        onSave={handleSaveAttendance}
      />

      <AttendanceViewModal
        record={viewingRecord}
        isOpen={Boolean(viewingRecord)}
        onClose={() => setViewingRecord(null)}
      />

      <AttendanceDeleteModal
        record={deletingRecord}
        isOpen={Boolean(deletingRecord)}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
