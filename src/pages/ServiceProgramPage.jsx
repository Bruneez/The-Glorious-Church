import { useEffect, useState } from 'react';
import { Plus, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import ServiceProgramControls from '@/components/features/service-program/ServiceProgramControls';
import ServiceProgramTable from '@/components/features/service-program/ServiceProgramTable';
import {
  DEFAULT_SERVICE_TYPE,
  createEmptyProgramRow,
  getDefaultServiceDate,
  mapServiceProgramRowsFromFirestore,
  moveProgramRow,
} from '@/config/serviceProgramOptions';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { saveServiceProgram, useServiceProgram } from '@/services/serviceProgramService';

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

export default function ServiceProgramPage() {
  const { staffProfile, firebaseUser } = useAuth();
  const { canPerformAction } = useRoleAccess();
  const canManage = canPerformAction('MANAGE_SERVICE_PROGRAM');

  const [serviceDate, setServiceDate] = useState(getDefaultServiceDate);
  const [serviceType, setServiceType] = useState(DEFAULT_SERVICE_TYPE);
  const [rows, setRows] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const { data: program, loading, error } = useServiceProgram(serviceDate, serviceType);

  const createdBy =
    staffProfile?.fullName ||
    staffProfile?.name ||
    firebaseUser?.displayName ||
    firebaseUser?.email ||
    'Staff';

  useEffect(() => {
    if (loading) return;
    setRows(mapServiceProgramRowsFromFirestore(program?.rows || []));
  }, [program, loading, serviceDate, serviceType]);

  const handleServiceDateChange = (event) => {
    setServiceDate(event.target.value);
  };

  const handleServiceTypeChange = (event) => {
    setServiceType(event.target.value);
  };

  const handleAddRow = () => {
    setRows((currentRows) => [...currentRows, createEmptyProgramRow(currentRows.length)]);
  };

  const handleRowChange = (rowId, field, value) => {
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
  };

  const handleMoveUp = (rowIndex) => {
    setRows((currentRows) => moveProgramRow(currentRows, rowIndex, -1));
  };

  const handleMoveDown = (rowIndex) => {
    setRows((currentRows) => moveProgramRow(currentRows, rowIndex, 1));
  };

  const handleDeleteRow = (rowIndex) => {
    setRows((currentRows) => currentRows.filter((_, index) => index !== rowIndex));
  };

  const handleSaveProgram = async () => {
    if (!canManage) {
      setFeedback({ type: 'error', message: 'You do not have permission to save service programs.' });
      return;
    }

    setIsSaving(true);

    try {
      await saveServiceProgram({
        serviceDate,
        serviceType,
        rows,
        createdBy,
        existingProgram: program,
      });
      setFeedback({ type: 'success', message: 'Service program saved successfully.' });
    } catch (saveError) {
      console.error('Error saving service program:', saveError);
      setFeedback({
        type: 'error',
        message: saveError?.message || 'Failed to save service program. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-root">
      <header>
        <h1 className="text-xl font-bold text-white tracking-wide">Service Program</h1>
        <p className="text-sm text-slate-400 mt-1">Create and manage service running orders.</p>
      </header>

      <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback({ type: '', message: '' })} />

      {error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-4 text-xs text-rose-400">
          Failed to load service program. Please refresh and try again.
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Button icon={Plus} onClick={handleAddRow} disabled={loading}>
            Add Row
          </Button>
          <Button
            icon={Save}
            onClick={handleSaveProgram}
            isLoading={isSaving}
            disabled={isSaving || loading}
          >
            Save Program
          </Button>
        </div>
      ) : null}

      {loading ? (
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
