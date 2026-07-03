import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import OfferingForm from '@/components/features/offerings/OfferingForm';
import OfferingsTable from '@/components/features/offerings/OfferingsTable';
import OfferingsMobileList from '@/components/features/offerings/OfferingsMobileList';
import OfferingViewModal from '@/components/features/offerings/OfferingViewModal';
import OfferingDeleteModal from '@/components/features/offerings/OfferingDeleteModal';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAuth } from '@/hooks/useAuth';
import {
  useOfferings,
  createOffering,
  updateOffering,
  deleteOffering,
} from '@/services/offeringsService';
import {
  buildOfferingPayload,
  computeOfferingStats,
  filterOfferings,
  mapOfferingForTable,
} from '@/config/offeringsOptions';
import { formatCurrencySimple } from '@/utils/formatters';

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

export default function OfferingsPage() {
  const { data: offerings = [], loading } = useOfferings();
  const { canPerformAction } = useRoleAccess();
  const { staffProfile, firebaseUser } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState(null);
  const [viewingOffering, setViewingOffering] = useState(null);
  const [deletingOffering, setDeletingOffering] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const canManageOfferings = canPerformAction('MANAGE_OFFERINGS');

  const tableOfferings = useMemo(
    () => offerings.map(mapOfferingForTable),
    [offerings],
  );

  const filteredOfferings = useMemo(
    () => filterOfferings(tableOfferings, searchTerm),
    [tableOfferings, searchTerm],
  );

  const emptyMessage = tableOfferings.length === 0
    ? 'No offerings recorded.'
    : 'No matching offerings found.';

  const stats = useMemo(
    () => computeOfferingStats(offerings),
    [offerings],
  );

  const getRecordedByName = () =>
    staffProfile?.name || firebaseUser?.displayName || firebaseUser?.email || 'Staff Member';

  const findOfferingById = (tableOffering) =>
    offerings.find((item) => item.id === tableOffering?.id);

  const handleAddOffering = () => {
    setEditingOffering(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    const recordedBy = editingOffering?.recordedBy || getRecordedByName();
    const payload = buildOfferingPayload(formData, recordedBy);

    if (editingOffering?.id) {
      await updateOffering(editingOffering.id, payload);
      setFeedback({ type: 'success', message: 'Offering updated successfully.' });
    } else {
      await createOffering(payload);
      setFeedback({ type: 'success', message: 'Offering saved successfully.' });
    }

    setIsFormOpen(false);
    setEditingOffering(null);
  };

  const handleViewOffering = (tableOffering) => {
    const offering = findOfferingById(tableOffering);
    if (offering) {
      setViewingOffering(offering);
    }
  };

  const handleEditOffering = (tableOffering) => {
    if (!canManageOfferings) return;

    const offering = findOfferingById(tableOffering);
    if (!offering) return;

    setEditingOffering(offering);
    setIsFormOpen(true);
  };

  const handleDeleteOffering = (tableOffering) => {
    if (!canManageOfferings) return;
    setDeletingOffering(tableOffering);
  };

  const handleConfirmDelete = async (tableOffering) => {
    setIsDeleting(true);

    try {
      await deleteOffering(tableOffering.id);
      setDeletingOffering(null);
      setFeedback({ type: 'success', message: 'Offering deleted successfully.' });
    } catch (error) {
      console.error('Error deleting offering:', error);
      setFeedback({ type: 'error', message: 'Failed to delete offering. Please try again.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const formInitialData = editingOffering
    ? {
        id: editingOffering.id,
        serviceDate: editingOffering.serviceDate || editingOffering.date || '',
        totalAmount: editingOffering.totalAmount ?? editingOffering.amount ?? '',
      }
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Offerings Log</h1>
          <p className="text-sm text-slate-400 mt-1">
            Record and track church offering collections.
          </p>
        </div>
        {canManageOfferings && (
          <Button
            icon={Plus}
            onClick={handleAddOffering}
            className="shrink-0 w-full sm:w-auto"
          >
            Add Offering
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
        <SummaryCard
          label="Total Offering"
          value={formatCurrencySimple(stats.total)}
          loading={loading}
        />
        <SummaryCard
          label="Average Offering"
          value={formatCurrencySimple(stats.average)}
          loading={loading}
        />
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-700/70 bg-slate-800/40 space-y-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Offerings Records</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Saved offering collections and service dates.
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search date, amount, or recorded by..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <>
            <div className="hidden md:block p-4 pt-0">
              <OfferingsTable
                offerings={filteredOfferings}
                onView={handleViewOffering}
                onEdit={canManageOfferings ? handleEditOffering : undefined}
                onDelete={canManageOfferings ? handleDeleteOffering : undefined}
                canManage={canManageOfferings}
                emptyMessage={emptyMessage}
              />
            </div>

            <div className="p-4 pt-0 md:hidden">
              <OfferingsMobileList
                offerings={filteredOfferings}
                onView={handleViewOffering}
                onEdit={canManageOfferings ? handleEditOffering : undefined}
                onDelete={canManageOfferings ? handleDeleteOffering : undefined}
                canManage={canManageOfferings}
                emptyMessage={emptyMessage}
              />
            </div>
          </>
        )}
      </div>

      <OfferingForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingOffering(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={formInitialData}
      />

      <OfferingViewModal
        offering={viewingOffering}
        isOpen={Boolean(viewingOffering)}
        onClose={() => setViewingOffering(null)}
      />

      <OfferingDeleteModal
        offering={deletingOffering}
        isOpen={Boolean(deletingOffering)}
        onClose={() => setDeletingOffering(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
