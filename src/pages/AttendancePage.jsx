import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import AttendanceForm from '@/components/features/attendance/AttendanceForm';
import AttendanceSummaryForm from '@/components/features/attendance/AttendanceSummaryForm';
import AttendanceMarkingScreen from '@/components/features/attendance/AttendanceMarkingScreen';
import AttendanceViewModal from '@/components/features/attendance/AttendanceViewModal';
import AttendanceDeleteModal from '@/components/features/attendance/AttendanceDeleteModal';
import AttendanceTable from '@/components/features/attendance/AttendanceTable';
import AttendanceMobileList from '@/components/features/attendance/AttendanceMobileList';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAuth } from '@/hooks/useAuth';
import { isChurchWideStaff, isCALeader, isElderRole, normalizeRole } from '@/config/roles';
import {
  useAttendance,
  createAttendanceRecord,
  updateAttendanceRecord,
  deleteAttendanceRecord,
} from '@/services/attendanceService';
import {
  buildAttendanceRecordPayload,
  buildServiceSummaryPayload,
  computeAttendanceStats,
  computeDepartmentAttendanceStats,
  filterAttendanceRecordsForSearch,
  filterRecordsForRole,
  getAttendanceDate,
  getRecordMembers,
  isDepartmentAttendanceRecord,
  isServiceAttendanceRecord,
  mapAttendanceRecordForTable,
  mapServiceSummaryToFormData,
  membersToMarkings,
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
  const { role, canPerformAction } = useRoleAccess();
  const { staffProfile, firebaseUser } = useAuth();

  const effectiveRole = normalizeRole(role || staffProfile?.role || '');
  const isChurchWideUser = isChurchWideStaff(effectiveRole);
  const isElderViewer = isElderRole(effectiveRole);
  const canViewChurchAttendance = isChurchWideUser || isElderViewer;
  const isDepartmentLeader = isCALeader(effectiveRole);

  const canRecordChurchAttendance = isChurchWideUser && canPerformAction('MANAGE_ATTENDANCE');
  const canRecordDepartmentAttendance =
    isDepartmentLeader && canPerformAction('RECORD_DEPARTMENT_ATTENDANCE');
  const canCreateAttendance = canRecordChurchAttendance || canRecordDepartmentAttendance;
  const canManageRecords = canRecordChurchAttendance || canRecordDepartmentAttendance;

  const departmentScope = useMemo(() => {
    if (!isDepartmentLeader) return null;

    const departmentName =
      staffProfile?.departmentName ||
      staffProfile?.department ||
      staffProfile?.creativeArts ||
      '';

    return {
      lockToDepartment: true,
      departmentId: staffProfile?.departmentId || '',
      departmentName,
      staffProfile,
    };
  }, [isDepartmentLeader, staffProfile]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isMarkingOpen, setIsMarkingOpen] = useState(false);
  const [attendanceSession, setAttendanceSession] = useState(null);
  const [summaryInitialData, setSummaryInitialData] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const visibleRecords = useMemo(
    () =>
      filterRecordsForRole(attendanceRecords, {
        isChurchWideUser: canViewChurchAttendance,
        staffProfile,
      }),
    [attendanceRecords, canViewChurchAttendance, staffProfile],
  );

  const tableViewMode = canViewChurchAttendance ? 'service' : 'department';

  const records = useMemo(
    () =>
      visibleRecords.map((record) =>
        mapAttendanceRecordForTable(record, { viewMode: tableViewMode }),
      ),
    [visibleRecords, tableViewMode],
  );

  const filteredRecords = useMemo(
    () => filterAttendanceRecordsForSearch(records, searchTerm),
    [records, searchTerm],
  );

  const recordsEmptyMessage = searchTerm.trim()
    ? 'No matching attendance records found.'
    : 'No attendance records found.';

  const stats = useMemo(() => {
    if (canViewChurchAttendance) {
      return computeAttendanceStats(visibleRecords, { summaryOnly: true });
    }
    return computeDepartmentAttendanceStats(visibleRecords);
  }, [visibleRecords, canViewChurchAttendance]);

  const getRecordedByName = () =>
    staffProfile?.name ||
    staffProfile?.fullName ||
    firebaseUser?.displayName ||
    firebaseUser?.email ||
    'Staff Member';

  const findRecordById = (tableRecord) =>
    attendanceRecords.find((item) => item.id === tableRecord?.id);

  const handleNewAttendance = () => {
    setAttendanceSession(null);
    setSummaryInitialData(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (session) => {
    const attendanceDate = session.attendanceDate || session.serviceDate;

    if (canRecordChurchAttendance) {
      setAttendanceSession({ attendanceDate, recordId: null });
      setSummaryInitialData(null);
      setIsFormOpen(false);
      setIsSummaryOpen(true);
      return;
    }

    setAttendanceSession({
      attendanceDate,
      recordId: null,
      initialMarkings: {},
      departmentId: departmentScope?.departmentId || '',
      departmentName: departmentScope?.departmentName || '',
    });
    setIsFormOpen(false);
    setIsMarkingOpen(true);
  };

  const handleSummarySubmit = async (formData) => {
    const existingRecord = attendanceSession?.recordId
      ? attendanceRecords.find((record) => record.id === attendanceSession.recordId)
      : null;

    const payload = buildServiceSummaryPayload(
      attendanceSession,
      formData,
      getRecordedByName(),
      existingRecord,
    );

    if (attendanceSession?.recordId) {
      await updateAttendanceRecord(attendanceSession.recordId, payload);
      setFeedback({ type: 'success', message: 'Attendance record updated successfully.' });
    } else {
      await createAttendanceRecord(payload);
      setFeedback({ type: 'success', message: 'Attendance record saved successfully.' });
    }

    setIsSummaryOpen(false);
    setAttendanceSession(null);
    setSummaryInitialData(null);
  };

  const handleSaveDepartmentAttendance = async (session, markings, recordedBy) => {
    const existingRecord = session.recordId
      ? attendanceRecords.find((record) => record.id === session.recordId)
      : null;

    const payload = buildAttendanceRecordPayload(
      {
        ...session,
        departmentId: departmentScope?.departmentId || session.departmentId,
        departmentName: departmentScope?.departmentName || session.departmentName,
      },
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

  const handleViewRecord = (tableRecord) => {
    const record = findRecordById(tableRecord);
    if (record) {
      setViewingRecord(record);
    }
  };

  const handleEditRecord = (tableRecord) => {
    if (!canManageRecords) return;

    const record = findRecordById(tableRecord);
    if (!record) return;

    if (isServiceAttendanceRecord(record) && canRecordChurchAttendance) {
      setAttendanceSession({
        attendanceDate: getAttendanceDate(record),
        recordId: record.id,
      });
      setSummaryInitialData({
        recordId: record.id,
        ...mapServiceSummaryToFormData(record),
      });
      setIsSummaryOpen(true);
      return;
    }

    if (isDepartmentAttendanceRecord(record) && canRecordDepartmentAttendance) {
      setAttendanceSession({
        attendanceDate: getAttendanceDate(record),
        recordId: record.id,
        initialMarkings: membersToMarkings(getRecordMembers(record)),
        departmentId: record.departmentId || departmentScope?.departmentId || '',
        departmentName: record.departmentName || departmentScope?.departmentName || '',
      });
      setIsMarkingOpen(true);
    }
  };

  const handleDeleteRecord = (tableRecord) => {
    if (!canManageRecords) return;
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
      setFeedback({
        type: 'error',
        message: 'Failed to delete attendance record. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-root">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Attendance Tracker</h1>
          <p className="text-sm text-slate-400 mt-1">
            {isChurchWideUser
              ? 'Record overall church service attendance and participation statistics.'
              : 'Mark present or absent for members in your Creative Arts department.'}
          </p>
          {isDepartmentLeader && departmentScope?.departmentName && (
            <p className="text-[11px] text-indigo-400 mt-1">
              Department: {departmentScope.departmentName}
            </p>
          )}
        </div>
        {canCreateAttendance && (
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

      {isChurchWideUser ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
          <SummaryCard label="Highest Attendance" value={stats.highest} loading={recordsLoading} />
          <SummaryCard label="Average Attendance" value={stats.average} loading={recordsLoading} />
          <SummaryCard
            label="Total Services Recorded"
            value={stats.totalServices}
            loading={recordsLoading}
          />
          <SummaryCard
            label="Total Attendance This Month"
            value={stats.totalThisMonth}
            loading={recordsLoading}
          />
          <SummaryCard
            label="Total Visitors This Month"
            value={stats.visitorsThisMonth}
            loading={recordsLoading}
          />
          <SummaryCard
            label="Total Salvations This Month"
            value={stats.salvationsThisMonth}
            loading={recordsLoading}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SummaryCard label="Highest Attendance" value={stats.highest} loading={recordsLoading} />
          <SummaryCard label="Average Attendance" value={stats.average} loading={recordsLoading} />
        </div>
      )}

      <div className="bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-700/70 bg-slate-800/40 flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Attendance Records</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isChurchWideUser
                ? 'Church-wide service attendance history.'
                : 'Department roll call history for your team.'}
            </p>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder={
                isChurchWideUser
                  ? 'Search by date, attendance, visitors, or salvations...'
                  : 'Search by date, department, present, or absent...'
              }
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {recordsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <>
            <div className="hidden md:block p-4">
              <AttendanceTable
                records={filteredRecords}
                onView={handleViewRecord}
                onEdit={canManageRecords ? handleEditRecord : undefined}
                onDelete={canManageRecords ? handleDeleteRecord : undefined}
                canManage={canManageRecords}
                emptyMessage={recordsEmptyMessage}
                viewMode={tableViewMode}
              />
            </div>

            <div className="p-4 md:hidden">
              <AttendanceMobileList
                records={filteredRecords}
                onView={handleViewRecord}
                onEdit={canManageRecords ? handleEditRecord : undefined}
                onDelete={canManageRecords ? handleDeleteRecord : undefined}
                canManage={canManageRecords}
                emptyMessage={recordsEmptyMessage}
                viewMode={tableViewMode}
              />
            </div>
          </>
        )}
      </div>

      <AttendanceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {canRecordChurchAttendance && (
        <AttendanceSummaryForm
          isOpen={isSummaryOpen}
          onClose={() => {
            setIsSummaryOpen(false);
            setAttendanceSession(null);
            setSummaryInitialData(null);
          }}
          onSubmit={handleSummarySubmit}
          attendanceDate={attendanceSession?.attendanceDate}
          initialData={summaryInitialData}
        />
      )}

      {canRecordDepartmentAttendance && (
        <AttendanceMarkingScreen
          isOpen={isMarkingOpen}
          session={attendanceSession}
          onClose={() => {
            setIsMarkingOpen(false);
            setAttendanceSession(null);
          }}
          onSave={handleSaveDepartmentAttendance}
          departmentScope={departmentScope}
        />
      )}

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
