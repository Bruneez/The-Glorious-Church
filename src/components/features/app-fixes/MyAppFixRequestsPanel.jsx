import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import AppFixRequestCard from '@/components/features/app-fixes/AppFixRequestCard';
import AppFixReportForm from '@/components/features/app-fixes/AppFixReportForm';
import AppFixRequestViewModal from '@/components/features/app-fixes/AppFixRequestViewModal';
import { getAppFixErrorMessage } from '@/config/appFixesErrorMessages';
import {
  buildAppFixUserSummary,
  getAppFixUserSummaryCards,
} from '@/config/appFixesUserOptions';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import {
  submitRequestWithAttachments,
  updateRequest,
  useAppFixUserRequests,
} from '@/services/appFixesService';

function AppFixesEmptyState({ message, helperText, action }) {
  return (
    <div className="py-14 px-6 text-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30">
      <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">{message}</p>
      {helperText ? (
        <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed mt-3">{helperText}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

function RequestSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[1, 2].map((item) => (
        <div
          key={item}
          className="rounded-xl border border-slate-700/70 bg-slate-900/40 h-48 animate-pulse"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function UserSummaryCards({ requests = [], loading = false }) {
  const cards = getAppFixUserSummaryCards(buildAppFixUserSummary(requests));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-0">
      {cards.map((card) => (
        <div
          key={card.key}
          className="p-4 rounded-xl border border-slate-700/70 bg-slate-900/50 shadow-sm"
        >
          {loading ? (
            <div className="h-8 w-10 rounded bg-slate-800 animate-pulse" aria-hidden="true" />
          ) : (
            <h3 className="text-2xl font-bold text-indigo-400">{card.value}</h3>
          )}
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function MyAppFixRequestsPanel({ enabled = true, onFeedback }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [viewingRequest, setViewingRequest] = useState(null);
  const [formSessionKey, setFormSessionKey] = useState(0);

  const { firebaseUser, staffProfile } = useAuth();
  const { role } = useRoleAccess();
  const createdByUserId = firebaseUser?.uid || '';
  const createdByStaffId = staffProfile?.id || '';
  const createdByName = staffProfile?.name
    || staffProfile?.fullName
    || firebaseUser?.displayName
    || '';

  const { requests, allRequests, loading, error } = useAppFixUserRequests({
    enabled,
    searchTerm,
  });

  const handleSubmit = async ({ formData, attachmentFiles, onFileProgress }) => {
    if (editingRequest?.id) {
      await updateRequest(editingRequest.id, formData, {
        role,
        createdByUserId,
        initialData: editingRequest,
        attachmentFiles,
        onFileProgress,
        createdByName,
      });
      onFeedback?.('success', 'Your request was updated successfully.');
      setViewingRequest(null);
    } else {
      await submitRequestWithAttachments(formData, attachmentFiles, {
        role,
        createdByUserId,
        createdByStaffId,
        createdByName,
        onFileProgress,
      });
      onFeedback?.('success', 'Your problem report was submitted successfully.');
    }

    setEditingRequest(null);
    setFormSessionKey((previous) => previous + 1);
  };

  return (
    <div className="space-y-4 min-w-0">
      <UserSummaryCards requests={allRequests} loading={loading} />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="relative max-w-md min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search your requests..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            aria-label="Search your requests"
          />
        </div>

        <Button
          icon={Plus}
          onClick={() => {
            setEditingRequest(null);
            setIsFormOpen(true);
          }}
          className="shrink-0 w-full lg:w-auto"
        >
          Report a Problem
        </Button>
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-4 text-xs text-rose-400">
          {getAppFixErrorMessage(error, 'Failed to load your requests. Please refresh and try again.')}
        </div>
      ) : null}

      {loading ? (
        <RequestSkeletonGrid />
      ) : requests.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
          {requests.map((request) => (
            <AppFixRequestCard
              key={request.id}
              request={request}
              onOpen={setViewingRequest}
            />
          ))}
        </div>
      ) : (
        <AppFixesEmptyState
          message="You have not submitted any app-fix requests yet."
          helperText="Use Report a Problem if you experience an error or need technical assistance."
          action={(
            <Button
              icon={Plus}
              onClick={() => {
                setEditingRequest(null);
                setIsFormOpen(true);
              }}
            >
              Report Your First Problem
            </Button>
          )}
        />
      )}

      <AppFixReportForm
        key={`${formSessionKey}-${editingRequest?.id || 'new'}`}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRequest(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingRequest}
        mode={editingRequest ? 'edit' : 'create'}
      />

      <AppFixRequestViewModal
        request={viewingRequest}
        isOpen={Boolean(viewingRequest)}
        onClose={() => setViewingRequest(null)}
        onEdit={(request) => {
          setViewingRequest(null);
          setEditingRequest(request);
          setIsFormOpen(true);
        }}
        canEdit
      />
    </div>
  );
}
