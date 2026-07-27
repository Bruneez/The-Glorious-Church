import { useEffect, useMemo, useState } from 'react';
import { Clock, Plus } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import UserAvatar from '@/components/ui/UserAvatar';
import TimeLogSummaryCards from '@/components/features/time-log/TimeLogSummaryCards';
import TimeLogUserDetailFilters from '@/components/features/time-log/TimeLogUserDetailFilters';
import TimeLogEntriesTable from '@/components/features/time-log/TimeLogEntriesTable';
import TimeLogForm from '@/components/features/time-log/TimeLogForm';
import TimeLogDeleteModal from '@/components/features/time-log/TimeLogDeleteModal';
import {
  createTimeLog,
  deleteTimeLog,
  updateTimeLog,
  useTimeLogs,
} from '@/services/timeLogsService';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentCalendarWeek } from '@/hooks/useCurrentCalendarWeek';
import { getRoleLabel } from '@/config/roles';
import {
  TIME_LOG_ACTIVITY_FILTER_ALL,
  TIME_LOG_PERIOD_FILTER,
  computeCurrentWeekTimeLogSummary,
  filterUserTimeLogEntries,
  getTimeLogWeekReferenceDate,
} from '@/config/timeLogOptions';
import { formatDate } from '@/utils/formatters';

export default function TimeLogUserDetailModal({
  staffMember,
  isOpen,
  onClose,
  canManageTimeLog = false,
}) {
  const userId = staffMember?.userId || staffMember?.id || '';
  const name = staffMember?.name || staffMember?.fullName || 'Staff Member';
  const { staffDocId, firebaseUser } = useAuth();
  const { weekStart, weekEnd } = useCurrentCalendarWeek();

  const weekReferenceDate = useMemo(
    () => getTimeLogWeekReferenceDate(weekStart),
    [weekStart],
  );

  const { data: userTimeLogs = [], loading, error } = useTimeLogs(
    userId ? { userId } : {},
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [activityType, setActivityType] = useState(TIME_LOG_ACTIVITY_FILTER_ALL);
  const [period, setPeriod] = useState(TIME_LOG_PERIOD_FILTER.WEEK);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setActivityType(TIME_LOG_ACTIVITY_FILTER_ALL);
      setPeriod(TIME_LOG_PERIOD_FILTER.WEEK);
      setIsFormOpen(false);
      setEditingEntry(null);
      setDeletingEntry(null);
      setIsDeleting(false);
      setActionError('');
    }
  }, [isOpen]);

  const handleCreateTimeLog = async (formData) => {
    await createTimeLog(formData, {
      userId,
      userName: name,
      recordedBy: staffDocId || firebaseUser?.uid || '',
    });
  };

  const handleUpdateTimeLog = async (formData) => {
    if (!editingEntry?.id) {
      throw new Error('Time log entry not found.');
    }

    await updateTimeLog(editingEntry.id, formData, {
      userId,
      userName: name,
      existingRecord: editingEntry,
    });
  };

  const handleDeleteConfirm = async (entry) => {
    if (!entry?.id) return;

    setIsDeleting(true);
    setActionError('');

    try {
      await deleteTimeLog(entry.id);
      setDeletingEntry(null);
    } catch (deleteError) {
      console.error('Error deleting time log:', deleteError);
      setActionError('Failed to delete time log. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenCreateForm = () => {
    setEditingEntry(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (entry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEntry(null);
  };

  const weekSummary = useMemo(
    () => computeCurrentWeekTimeLogSummary(userTimeLogs, weekReferenceDate),
    [userTimeLogs, weekReferenceDate],
  );

  const filteredEntries = useMemo(
    () =>
      filterUserTimeLogEntries(userTimeLogs, {
        searchTerm,
        activityType,
        period,
        referenceDate: weekReferenceDate,
      }),
    [userTimeLogs, searchTerm, activityType, period, weekReferenceDate],
  );

  const hasSearchTerm = searchTerm.trim() !== '';
  const entriesLabel =
    filteredEntries.length === 1 ? '1 entry' : `${filteredEntries.length} entries`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${name} — Time Log`}
      icon={Clock}
      maxWidth="max-w-4xl"
      panelClassName="p-4 sm:p-5 space-y-4 sm:space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <UserAvatar name={name} photo={staffMember.photo} size="lg" />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white tracking-wide truncate">{name}</h3>
            {staffMember.role ? (
              <p className="text-[11px] text-indigo-400/90 font-medium mt-0.5">
                {getRoleLabel(staffMember.role)}
              </p>
            ) : null}
            <p className="text-[11px] text-slate-400 mt-1.5">
              Current week: {formatDate(weekStart, 'short')} – {formatDate(weekEnd, 'short')}
            </p>
          </div>
        </div>

        {canManageTimeLog ? (
          <Button
            type="button"
            icon={Plus}
            className="w-full sm:w-auto shrink-0"
            onClick={handleOpenCreateForm}
          >
            New Time Log
          </Button>
        ) : null}
      </div>

      {actionError ? (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {actionError}
        </div>
      ) : null}

      <TimeLogSummaryCards summary={weekSummary} loading={loading} />

      {!loading && !error ? (
        <TimeLogUserDetailFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activityType={activityType}
          onActivityTypeChange={setActivityType}
          period={period}
          onPeriodChange={setPeriod}
        />
      ) : null}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          Failed to load time log entries. Please try again.
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Time Log Entries
            </h4>
            <p className="text-[11px] text-slate-500">{entriesLabel}</p>
          </div>

          <TimeLogEntriesTable
            entries={filteredEntries}
            canManageEntry={canManageTimeLog}
            onEditEntry={handleOpenEditForm}
            onDeleteEntry={setDeletingEntry}
            emptyMessage={
              hasSearchTerm || activityType !== TIME_LOG_ACTIVITY_FILTER_ALL
                ? 'No matching time log entries found.'
                : period === TIME_LOG_PERIOD_FILTER.WEEK
                  ? 'No time log entries recorded for the current week.'
                  : 'No time log entries recorded yet.'
            }
          />
        </>
      )}

      <div className="flex justify-end pt-2 border-t border-slate-700">
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>

      <TimeLogForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingEntry ? handleUpdateTimeLog : handleCreateTimeLog}
        initialData={editingEntry}
        staffMemberName={name}
      />

      <TimeLogDeleteModal
        entry={deletingEntry}
        isOpen={Boolean(deletingEntry)}
        onClose={() => setDeletingEntry(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </Modal>
  );
}
