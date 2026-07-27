import { useMemo, useState, useCallback } from 'react';
import { Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import TimeLogSummaryCards from '@/components/features/time-log/TimeLogSummaryCards';
import TimeLogFilters from '@/components/features/time-log/TimeLogFilters';
import TimeLogEmptyState from '@/components/features/time-log/TimeLogEmptyState';
import TimeLogStaffCardGrid from '@/components/features/time-log/TimeLogStaffCardGrid';
import TimeLogUserDetailModal from '@/components/features/time-log/TimeLogUserDetailModal';
import RemoveFromTimeLogModal from '@/components/features/time-log/RemoveFromTimeLogModal';
import ExcludedTimeLogUsersModal from '@/components/features/time-log/ExcludedTimeLogUsersModal';
import { useTimeLogs } from '@/services/timeLogsService';
import {
  excludeStaffFromTimeLogModule,
  restoreStaffToTimeLogModule,
} from '@/services/staffService';
import { useCollection } from '@/hooks/useFirestore';
import { useCurrentCalendarWeek } from '@/hooks/useCurrentCalendarWeek';
import { COLLECTIONS } from '@/config/collections';
import { canViewAssigneeTasks } from '@/config/tasksOptions';
import {
  buildStaffTimeLogOverview,
  computeCurrentWeekTimeLogSummary,
  filterTimeLogsForEligibleStaff,
  getTimeLogModuleExcludedStaff,
  getTimeLogWeekReferenceDate,
} from '@/config/timeLogOptions';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { formatDate } from '@/utils/formatters';

function FeedbackBanner({ feedback, onDismiss }) {
  if (!feedback?.message) return null;

  const isSuccess = feedback.type === 'success';

  return (
    <div
      className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between gap-3 ${
        isSuccess
          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
          : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
      }`}
    >
      <span>{feedback.message}</span>
      <button type="button" onClick={onDismiss} className="text-current hover:opacity-80 shrink-0">
        Dismiss
      </button>
    </div>
  );
}

export default function TimeLogPage() {
  const { canPerformAction, role } = useRoleAccess();
  const { firebaseUser, staffDocId, staffProfile } = useAuth();

  const canViewAllTimeLogs = canPerformAction('VIEW_ALL_TIME_LOGS');
  const canLogOwnTime = canPerformAction('LOG_OWN_TIME');
  const canManageTimeLogs = canPerformAction('MANAGE_TIME_LOGS');
  const canManageParticipation = canPerformAction('MANAGE_TIME_LOG_PARTICIPATION');

  const currentUserId = staffDocId || firebaseUser?.uid || '';

  const { weekStart, weekEnd } = useCurrentCalendarWeek();

  const weekReferenceDate = useMemo(
    () => getTimeLogWeekReferenceDate(weekStart),
    [weekStart],
  );

  const { data: timeLogs = [], loading: logsLoading, error } = useTimeLogs();
  const { data: staff = [], loading: staffLoading } = useCollection(COLLECTIONS.STAFF);

  const loading = logsLoading || staffLoading;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaffMember, setSelectedStaffMember] = useState(null);
  const [removingStaffMember, setRemovingStaffMember] = useState(null);
  const [isRemovingFromTimeLog, setIsRemovingFromTimeLog] = useState(false);
  const [isExcludedUsersOpen, setIsExcludedUsersOpen] = useState(false);
  const [isRestoringToTimeLog, setIsRestoringToTimeLog] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const userContext = useMemo(
    () => ({ staffDocId, staffProfile, firebaseUser }),
    [staffDocId, staffProfile, firebaseUser],
  );

  const eligibleTimeLogs = useMemo(
    () => filterTimeLogsForEligibleStaff(staff, timeLogs),
    [staff, timeLogs],
  );

  const staffSummaries = useMemo(
    () => buildStaffTimeLogOverview(staff, timeLogs, searchTerm, weekReferenceDate),
    [staff, timeLogs, searchTerm, weekReferenceDate],
  );

  const excludedStaff = useMemo(() => getTimeLogModuleExcludedStaff(staff), [staff]);

  const dashboardSummary = useMemo(
    () => computeCurrentWeekTimeLogSummary(eligibleTimeLogs, weekReferenceDate),
    [eligibleTimeLogs, weekReferenceDate],
  );

  const canOpenStaffCard = useCallback(
    (staffSummary) =>
      canViewAssigneeTasks(staffSummary, userContext, { canViewAll: canViewAllTimeLogs }),
    [userContext, canViewAllTimeLogs],
  );

  const authorizedSelectedStaffMember = useMemo(() => {
    if (!selectedStaffMember || !canOpenStaffCard(selectedStaffMember)) {
      return null;
    }

    return selectedStaffMember;
  }, [selectedStaffMember, canOpenStaffCard]);

  const handleSelectStaffMember = (staffSummary) => {
    if (!canOpenStaffCard(staffSummary)) {
      return;
    }

    setSelectedStaffMember(staffSummary);
  };

  const canManageTimeLogForStaff = useCallback(
    (staffSummary) => {
      if (!staffSummary) return false;

      const isOwnCard = staffSummary.userId === currentUserId;

      if (isOwnCard) {
        return canLogOwnTime;
      }

      return canManageTimeLogs;
    },
    [currentUserId, canLogOwnTime, canManageTimeLogs],
  );

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
  };

  const handleRemoveFromTimeLogPrompt = (staffSummary) => {
    if (!canManageParticipation) return;

    setRemovingStaffMember(staffSummary);
  };

  const handleRemoveFromTimeLog = async (staffSummary) => {
    if (!canManageParticipation) return;

    setIsRemovingFromTimeLog(true);

    try {
      await excludeStaffFromTimeLogModule(staffSummary.userId, { role });
      showFeedback(
        'success',
        `${staffSummary.name} was removed from the Time Log module.`,
      );
      setRemovingStaffMember(null);

      if (selectedStaffMember?.userId === staffSummary.userId) {
        setSelectedStaffMember(null);
      }
    } catch (removeError) {
      console.error('Error removing user from Time Log:', removeError);
      showFeedback('error', removeError?.message || 'Failed to remove user from Time Log.');
    } finally {
      setIsRemovingFromTimeLog(false);
    }
  };

  const handleRestoreToTimeLog = async (member) => {
    if (!canManageParticipation) return;

    setIsRestoringToTimeLog(true);

    try {
      await restoreStaffToTimeLogModule(member.id, { role });
      showFeedback(
        'success',
        `${member.fullName || member.name || 'User'} was restored to the Time Log module.`,
      );
    } catch (restoreError) {
      console.error('Error restoring user to Time Log:', restoreError);
      throw restoreError;
    } finally {
      setIsRestoringToTimeLog(false);
    }
  };

  const hasSearchTerm = searchTerm.trim() !== '';

  return (
    <div className="page-root">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Time Log</h1>
          <p className="text-sm text-slate-400 mt-1">
            {canViewAllTimeLogs
              ? 'Track spiritual and natural hours logged by staff for the current week.'
              : canLogOwnTime
                ? 'Review staff time summaries for the current week. You can open your own card to view details.'
                : 'Review time logging summaries for the current week.'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Current week: {formatDate(weekStart, 'short')} – {formatDate(weekEnd, 'short')}
          </p>
        </div>

        {canManageParticipation ? (
          <Button
            variant="secondary"
            icon={Users}
            className="w-full sm:w-auto shrink-0"
            onClick={() => setIsExcludedUsersOpen(true)}
          >
            Excluded Users{excludedStaff.length > 0 ? ` (${excludedStaff.length})` : ''}
          </Button>
        ) : null}
      </div>

      <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback({ type: '', message: '' })} />

      <TimeLogSummaryCards summary={dashboardSummary} loading={loading} />

      {!loading && !error ? (
        <TimeLogFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      ) : null}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          Failed to load time logs. Please try again.
        </div>
      ) : staffSummaries.length === 0 && hasSearchTerm ? (
        <TimeLogEmptyState canViewAllTimeLogs={canViewAllTimeLogs} noSearchMatches />
      ) : staffSummaries.length === 0 ? (
        <TimeLogEmptyState canViewAllTimeLogs={canViewAllTimeLogs} />
      ) : (
        <TimeLogStaffCardGrid
          staffSummaries={staffSummaries}
          onSelectStaff={handleSelectStaffMember}
          onRemoveFromTimeLog={handleRemoveFromTimeLogPrompt}
          canOpenStaffCard={canOpenStaffCard}
          canRemoveFromTimeLog={canManageParticipation}
        />
      )}

      {authorizedSelectedStaffMember ? (
        <TimeLogUserDetailModal
          staffMember={authorizedSelectedStaffMember}
          isOpen
          onClose={() => setSelectedStaffMember(null)}
          canManageTimeLog={canManageTimeLogForStaff(authorizedSelectedStaffMember)}
        />
      ) : null}

      {canManageParticipation ? (
        <>
          <RemoveFromTimeLogModal
            staffSummary={removingStaffMember}
            isOpen={Boolean(removingStaffMember)}
            onClose={() => setRemovingStaffMember(null)}
            onConfirm={handleRemoveFromTimeLog}
            isProcessing={isRemovingFromTimeLog}
          />

          <ExcludedTimeLogUsersModal
            excludedStaff={excludedStaff}
            isOpen={isExcludedUsersOpen}
            onClose={() => setIsExcludedUsersOpen(false)}
            onRestore={handleRestoreToTimeLog}
            isProcessing={isRestoringToTimeLog}
          />
        </>
      ) : null}
    </div>
  );
}
