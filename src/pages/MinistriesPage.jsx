import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import MinistrySummaryCards from '@/components/features/ministries/MinistrySummaryCards';
import MinistryCardGrid from '@/components/features/ministries/MinistryCardGrid';
import MinistryForm from '@/components/features/ministries/MinistryForm';
import MinistryViewModal from '@/components/features/ministries/MinistryViewModal';
import MinistryDeleteModal from '@/components/features/ministries/MinistryDeleteModal';
import {
  useMinistries,
  createMinistry,
  updateMinistry,
  deleteMinistry,
} from '@/services/ministriesService';
import { filterMinistries } from '@/config/ministriesOptions';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';

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

export default function MinistriesPage() {
  const { data: ministries = [], loading, error } = useMinistries();
  const { staffProfile, firebaseUser } = useAuth();
  const { canPerformAction } = useRoleAccess();
  const canManage = canPerformAction('MANAGE_MINISTRIES');

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState(null);
  const [viewingMinistry, setViewingMinistry] = useState(null);
  const [deletingMinistry, setDeletingMinistry] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const filteredMinistries = useMemo(
    () => filterMinistries(ministries, searchTerm),
    [ministries, searchTerm],
  );

  const createdBy =
    staffProfile?.fullName ||
    staffProfile?.name ||
    firebaseUser?.displayName ||
    firebaseUser?.email ||
    'Admin';

  const emptyMessage = searchTerm.trim()
    ? 'No matching ministries found.'
    : 'No ministries found. Admins can add ministries using the Add Ministry button.';

  const handleAddMinistry = () => {
    setEditingMinistry(null);
    setIsFormOpen(true);
  };

  const handleEditMinistry = (ministry) => {
    if (!canManage) return;
    setViewingMinistry(null);
    setEditingMinistry(ministry);
    setIsFormOpen(true);
  };

  const handleViewMinistry = (ministry) => {
    setViewingMinistry(ministry);
  };

  const handleDeletePrompt = (ministry) => {
    if (!canManage) return;
    setViewingMinistry(null);
    setDeletingMinistry(ministry);
  };

  const handleFormSubmit = async (formData) => {
    if (!canManage) {
      throw new Error('You do not have permission to manage ministries.');
    }

    if (editingMinistry) {
      await updateMinistry(editingMinistry.id, formData, editingMinistry);
      setFeedback({ type: 'success', message: 'Ministry updated successfully.' });
    } else {
      await createMinistry(formData, createdBy);
      setFeedback({ type: 'success', message: 'Ministry added successfully.' });
    }

    setIsFormOpen(false);
    setEditingMinistry(null);
  };

  const handleDeleteConfirm = async (ministry) => {
    setIsDeleting(true);

    try {
      await deleteMinistry(ministry.id);
      setFeedback({ type: 'success', message: 'Ministry deleted successfully.' });
      setDeletingMinistry(null);
    } catch (deleteError) {
      console.error('Error deleting ministry:', deleteError);
      setFeedback({ type: 'error', message: 'Failed to delete ministry. Please try again.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Ministries</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage church serving ministries and operational departments.
          </p>
        </div>
        {canManage && (
          <Button icon={Plus} onClick={handleAddMinistry} className="shrink-0">
            Add Ministry
          </Button>
        )}
      </div>

      <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback({ type: '', message: '' })} />

      <MinistrySummaryCards ministries={ministries} loading={loading} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search ministry name, leader, description, or status..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-4 text-xs text-rose-400">
          Failed to load ministries. Please refresh and try again.
        </div>
      ) : (
        <MinistryCardGrid
          ministries={filteredMinistries}
          onView={handleViewMinistry}
          onEdit={canManage ? handleEditMinistry : undefined}
          onDelete={canManage ? handleDeletePrompt : undefined}
          canManage={canManage}
          emptyMessage={emptyMessage}
        />
      )}

      {canManage && (
        <>
          <MinistryForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingMinistry(null);
            }}
            onSubmit={handleFormSubmit}
            initialData={editingMinistry}
          />

          <MinistryDeleteModal
            ministry={deletingMinistry}
            isOpen={Boolean(deletingMinistry)}
            onClose={() => setDeletingMinistry(null)}
            onConfirm={handleDeleteConfirm}
            isDeleting={isDeleting}
          />
        </>
      )}

      <MinistryViewModal
        ministry={viewingMinistry}
        isOpen={Boolean(viewingMinistry)}
        onClose={() => setViewingMinistry(null)}
        onEdit={canManage ? handleEditMinistry : undefined}
        canManage={canManage}
      />
    </div>
  );
}
