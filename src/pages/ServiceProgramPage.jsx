import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import ServiceProgramControls from '@/components/features/service-program/ServiceProgramControls';
import ServiceProgramTable from '@/components/features/service-program/ServiceProgramTable';
import {
  DEFAULT_SERVICE_TYPE,
  buildServiceProgramDocId,
  canSaveServiceProgram,
  createEmptyProgramRow,
  formatServiceProgramSavedTime,
  getDefaultServiceDate,
  getServiceProgramLoadErrorMessage,
  getServiceProgramSaveErrorMessage,
  moveProgramRow,
  resolveProgramRowsForDisplay,
} from '@/config/serviceProgramOptions';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { saveServiceProgram, useServiceProgram } from '@/services/serviceProgramService';

const SAVE_STATUS = {
  SAVED: 'saved',
  UNSAVED: 'unsaved',
  SAVING: 'saving',
  FAILED: 'failed',
};

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

function SaveStatusIndicator({ status, lastSavedAt }) {
  if (status === SAVE_STATUS.SAVING) {
    return <span className="text-xs text-slate-400">Saving...</span>;
  }

  if (status === SAVE_STATUS.UNSAVED) {
    return <span className="text-xs text-amber-300">Unsaved changes</span>;
  }

  if (status === SAVE_STATUS.FAILED) {
    return <span className="text-xs text-rose-400">Save failed</span>;
  }

  if (status === SAVE_STATUS.SAVED && lastSavedAt) {
    return (
      <span className="text-xs text-emerald-400">
        Saved at {formatServiceProgramSavedTime(lastSavedAt)}
      </span>
    );
  }

  if (status === SAVE_STATUS.SAVED) {
    return <span className="text-xs text-emerald-400">Saved</span>;
  }

  return null;
}

export default function ServiceProgramPage() {
  const { staffProfile, firebaseUser } = useAuth();
  const { canPerformAction } = useRoleAccess();
  const canManage = canPerformAction('MANAGE_SERVICE_PROGRAM');

  const [serviceDate, setServiceDate] = useState(getDefaultServiceDate);
  const [serviceType, setServiceType] = useState(DEFAULT_SERVICE_TYPE);
  const [rows, setRows] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(SAVE_STATUS.UNSAVED);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [retryToken, setRetryToken] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  const isDirtyRef = useRef(false);
  const loadedContextRef = useRef('');
  const rowsRef = useRef([]);

  const programContextKey = buildServiceProgramDocId(serviceDate, serviceType);
  const { data: program, loading, error } = useServiceProgram(serviceDate, serviceType, retryToken);

  const createdBy =
    staffProfile?.fullName ||
    staffProfile?.name ||
    firebaseUser?.displayName ||
    firebaseUser?.email ||
    'Staff';

  const isTableLoading = loading || loadedContextRef.current !== programContextKey;

  const markDirty = useCallback(() => {
    if (!canManage) return;
    isDirtyRef.current = true;
    setIsDirty(true);
    setSaveStatus(SAVE_STATUS.UNSAVED);
  }, [canManage]);

  useEffect(() => {
    if (loading) return;

    const contextChanged = loadedContextRef.current !== programContextKey;

    if (!contextChanged && isDirtyRef.current) {
      return;
    }

    const hasSavedProgram = Boolean(program?.id);
    const resolvedRows = resolveProgramRowsForDisplay(program?.rows || [], {
      hasSavedProgram,
      seedDefaults: canManage && !hasSavedProgram,
    });

    setRows(resolvedRows);
    rowsRef.current = resolvedRows;
    isDirtyRef.current = false;
    setIsDirty(false);
    loadedContextRef.current = programContextKey;
    setLastSavedAt(program?.updatedAt || null);
    setSaveStatus(hasSavedProgram ? SAVE_STATUS.SAVED : SAVE_STATUS.UNSAVED);
  }, [program, loading, programContextKey, canManage]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirtyRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const confirmContextChange = (applyChange) => {
    if (isDirtyRef.current) {
      const confirmed = window.confirm('You have unsaved changes. Leave without saving?');
      if (!confirmed) return;
    }

    isDirtyRef.current = false;
    setIsDirty(false);
    loadedContextRef.current = '';
    applyChange();
  };

  const handleServiceDateChange = (event) => {
    const nextDate = event.target.value;
    if (nextDate === serviceDate) return;
    confirmContextChange(() => setServiceDate(nextDate));
  };

  const handleServiceTypeChange = (event) => {
    const nextType = event.target.value;
    if (nextType === serviceType) return;
    confirmContextChange(() => setServiceType(nextType));
  };

  const handleAddRow = () => {
    setRows((currentRows) => {
      const nextRows = [...currentRows, createEmptyProgramRow(currentRows.length)];
      rowsRef.current = nextRows;
      return nextRows;
    });
    markDirty();
  };

  const handleRowChange = (rowId, field, value) => {
    setRows((currentRows) => {
      const nextRows = currentRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row));
      rowsRef.current = nextRows;
      return nextRows;
    });
    markDirty();
  };

  const handleMoveUp = (rowIndex) => {
    setRows((currentRows) => {
      const nextRows = moveProgramRow(currentRows, rowIndex, -1);
      rowsRef.current = nextRows;
      return nextRows;
    });
    markDirty();
  };

  const handleMoveDown = (rowIndex) => {
    setRows((currentRows) => {
      const nextRows = moveProgramRow(currentRows, rowIndex, 1);
      rowsRef.current = nextRows;
      return nextRows;
    });
    markDirty();
  };

  const handleDeleteRow = (rowIndex) => {
    setRows((currentRows) => {
      const nextRows = currentRows.filter((_, index) => index !== rowIndex);
      rowsRef.current = nextRows;
      return nextRows;
    });
    markDirty();
  };

  const handleRetryLoad = () => {
    loadedContextRef.current = '';
    setRetryToken((current) => current + 1);
  };

  const handleSaveProgram = async () => {
    if (!canManage) {
      setFeedback({
        type: 'error',
        message: 'You do not have permission to save service programs.',
      });
      return;
    }

    setIsSaving(true);
    setSaveStatus(SAVE_STATUS.SAVING);
    setFeedback({ type: '', message: '' });

    try {
      const savedProgram = await saveServiceProgram({
        serviceDate,
        serviceType,
        rows: rowsRef.current,
        createdBy,
      });

      isDirtyRef.current = false;
      setIsDirty(false);
      setSaveStatus(SAVE_STATUS.SAVED);
      setLastSavedAt(savedProgram.updatedAt || new Date().toISOString());
      setFeedback({ type: 'success', message: 'Service program saved successfully.' });
    } catch (saveError) {
      console.error('Error saving service program:', saveError);
      isDirtyRef.current = true;
      setIsDirty(true);
      setSaveStatus(SAVE_STATUS.FAILED);
      setFeedback({
        type: 'error',
        message: getServiceProgramSaveErrorMessage(saveError),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = canSaveServiceProgram({
    canManage,
    isSaving,
    isTableLoading,
    isDirty,
    saveStatus,
  });

  return (
    <div className="page-root">
      <header>
        <h1 className="text-xl font-bold text-white tracking-wide">Service Program</h1>
        <p className="text-sm text-slate-400 mt-1">Create and manage service running orders.</p>
      </header>

      <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback({ type: '', message: '' })} />

      {error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-4 text-xs text-rose-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span>{getServiceProgramLoadErrorMessage()}</span>
          <Button variant="secondary" onClick={handleRetryLoad}>
            Retry
          </Button>
        </div>
      ) : null}

      <section className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-4 md:p-5 space-y-4">
        <h2 className="text-sm font-bold text-white tracking-wide">Program Header</h2>
        <ServiceProgramControls
          serviceDate={serviceDate}
          serviceType={serviceType}
          onServiceDateChange={handleServiceDateChange}
          onServiceTypeChange={handleServiceTypeChange}
          readOnly={!canManage}
        />
      </section>

      {canManage ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button icon={Plus} onClick={handleAddRow} disabled={isTableLoading || isSaving}>
              Add Row
            </Button>
            <Button
              icon={Save}
              onClick={handleSaveProgram}
              isLoading={isSaving}
              disabled={!canSave}
            >
              Save Program
            </Button>
          </div>
          <SaveStatusIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
        </div>
      ) : null}

      {isTableLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : (
        <ServiceProgramTable
          rows={rows}
          canManage={canManage}
          onRowChange={handleRowChange}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onDeleteRow={handleDeleteRow}
        />
      )}
    </div>
  );
}
