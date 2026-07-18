import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import TravellingCardGrid from '@/components/features/travelling/TravellingCardGrid';
import TravellingForm from '@/components/features/travelling/TravellingForm';
import TravellingViewModal from '@/components/features/travelling/TravellingViewModal';
import TravellingDeleteModal from '@/components/features/travelling/TravellingDeleteModal';
import {
  TRAVEL_EXTENT,
  filterTravelDestinations,
  getEmptyTravelMessage,
} from '@/config/travellingOptions';
import {
  createTravelDestination,
  deleteTravelDestination,
  updateTravelDestination,
  useTravelDestinations,
} from '@/services/travellingService';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';

const TRAVEL_TABS = [
  {
    id: TRAVEL_EXTENT.INTERNATIONAL,
    label: 'International',
    searchPlaceholder: 'Search by country...',
  },
  {
    id: TRAVEL_EXTENT.NATIONAL,
    label: 'National',
    searchPlaceholder: 'Search by town or city...',
  },
];

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

export default function TravellingPage() {
  const { data: destinations = [], loading, error } = useTravelDestinations();
  const { staffProfile, firebaseUser, role } = useAuth();
  const { canPerformAction } = useRoleAccess();
  const canManage = canPerformAction('MANAGE_TRAVELLING');

  const [activeTab, setActiveTab] = useState(TRAVEL_EXTENT.INTERNATIONAL);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [viewingDestination, setViewingDestination] = useState(null);
  const [deletingDestination, setDeletingDestination] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const activeTabConfig = TRAVEL_TABS.find((tab) => tab.id === activeTab) || TRAVEL_TABS[0];

  const handleTabKeyDown = (event, tabId) => {
    const tabIds = TRAVEL_TABS.map((tab) => tab.id);
    const currentIndex = tabIds.indexOf(tabId);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabIds.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabIds.length) % tabIds.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = tabIds.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextTabId = tabIds[nextIndex];
    setActiveTab(nextTabId);
    setSearchTerm('');
    document.getElementById(`travelling-tab-${nextTabId}`)?.focus();
  };

  const filteredDestinations = useMemo(
    () =>
      filterTravelDestinations(destinations, {
        searchTerm,
        travelExtent: activeTab,
      }),
    [activeTab, destinations, searchTerm],
  );

  const emptyMessage = getEmptyTravelMessage(activeTab, Boolean(searchTerm.trim()));

  const createdBy =
    staffProfile?.fullName ||
    staffProfile?.name ||
    firebaseUser?.displayName ||
    firebaseUser?.email ||
    'Admin';

  const handleAddLocation = () => {
    setEditingDestination(null);
    setIsFormOpen(true);
  };

  const handleEditDestination = (destination) => {
    if (!canManage) return;
    setViewingDestination(null);
    setEditingDestination(destination);
    setIsFormOpen(true);
  };

  const handleViewDestination = (destination) => {
    setViewingDestination(destination);
  };

  const handleDeletePrompt = (destination) => {
    if (!canManage) return;
    setViewingDestination(null);
    setDeletingDestination(destination);
  };

  const handleFormSubmit = async ({ formData, imageFile, removeImage }) => {
    if (!canManage) {
      throw new Error('Only administrators can manage travel destinations.');
    }

    if (editingDestination) {
      await updateTravelDestination(editingDestination.id, formData, {
        role,
        createdBy,
        initialData: editingDestination,
        imageFile,
        removeImage,
      });
      setFeedback({ type: 'success', message: 'Travel location updated successfully.' });
    } else {
      await createTravelDestination(formData, {
        role,
        createdBy,
        imageFile,
      });
      setFeedback({ type: 'success', message: 'Travel location added successfully.' });
    }

    setIsFormOpen(false);
    setEditingDestination(null);
  };

  const handleDeleteConfirm = async (destination) => {
    setIsDeleting(true);

    try {
      await deleteTravelDestination(destination.id, {
        role,
        initialData: destination,
      });
      setFeedback({ type: 'success', message: 'Travel location deleted successfully.' });
      setDeletingDestination(null);
    } catch (deleteError) {
      console.error('Error deleting travel destination:', deleteError);
      setFeedback({
        type: 'error',
        message: deleteError?.message || 'Failed to delete travel location. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-root">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-white tracking-wide">Travelling</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage and view national and international travel information.
          </p>
        </div>
        {canManage && (
          <Button icon={Plus} onClick={handleAddLocation} className="shrink-0 w-full sm:w-auto">
            Add Location
          </Button>
        )}
      </div>

      <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback({ type: '', message: '' })} />

      <div className="bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm">
        <div
          className="flex overflow-x-auto border-b border-slate-700/70"
          role="tablist"
          aria-label="Travel destination categories"
        >
          {TRAVEL_TABS.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`travelling-panel-${tab.id}`}
                id={`travelling-tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm('');
                }}
                onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
                tabIndex={isActive ? 0 : -1}
                className={`shrink-0 px-4 py-3 text-xs font-semibold transition border-b-2 ${
                  isActive
                    ? 'text-white border-indigo-500 bg-indigo-600/10'
                    : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-700/40'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="search"
              placeholder={activeTabConfig.searchPlaceholder}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              aria-label={activeTabConfig.searchPlaceholder}
            />
          </div>

          <div
            role="tabpanel"
            id={`travelling-panel-${activeTab}`}
            aria-labelledby={`travelling-tab-${activeTab}`}
          >
            {loading ? (
              <div className="flex justify-center py-12" role="status" aria-live="polite">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                <span className="sr-only">Loading travel destinations...</span>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-4 text-xs text-rose-400">
                {error.message || 'Failed to load travel destinations. Please refresh and try again.'}
              </div>
            ) : (
              <TravellingCardGrid
                destinations={filteredDestinations}
                onView={handleViewDestination}
                onEdit={canManage ? handleEditDestination : undefined}
                onDelete={canManage ? handleDeletePrompt : undefined}
                canManage={canManage}
                emptyMessage={emptyMessage}
                isInternational={activeTab === TRAVEL_EXTENT.INTERNATIONAL}
              />
            )}
          </div>
        </div>
      </div>

      {canManage && (
        <>
          <TravellingForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingDestination(null);
            }}
            onSubmit={handleFormSubmit}
            initialData={editingDestination}
            defaultTravelExtent={activeTab}
          />

          <TravellingDeleteModal
            destination={deletingDestination}
            isOpen={Boolean(deletingDestination)}
            onClose={() => setDeletingDestination(null)}
            onConfirm={handleDeleteConfirm}
            isDeleting={isDeleting}
          />
        </>
      )}

      <TravellingViewModal
        destination={viewingDestination}
        isOpen={Boolean(viewingDestination)}
        onClose={() => setViewingDestination(null)}
        onEdit={canManage ? handleEditDestination : undefined}
        canManage={canManage}
      />
    </div>
  );
}
