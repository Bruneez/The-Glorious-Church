import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import AppFixManagementSummaryCards from '@/components/features/app-fixes/AppFixManagementSummaryCards';
import AppFixManagementRequestGroups from '@/components/features/app-fixes/AppFixManagementRequestGroups';
import AppFixManagementViewModal from '@/components/features/app-fixes/AppFixManagementViewModal';
import {
  APP_FIX_GROUP_MODES,
  APP_FIX_GROUP_MODE_OPTIONS,
} from '@/config/appFixesConstants';
import {
  applyManagementRequestFilters,
  buildStaffLookupMap,
} from '@/config/appFixesManagementOptions';
import { getAppFixErrorMessage } from '@/config/appFixesErrorMessages';
import { useCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/config/collections';
import { useAuth } from '@/hooks/useAuth';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAppFixManagementRequests } from '@/services/appFixesService';

function RequestSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="rounded-xl border border-slate-700/70 bg-slate-900/40 h-48 animate-pulse"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function EmptyResults({ hasFilters }) {
  return (
    <div className="py-14 px-6 text-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30">
      <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
        {hasFilters
          ? 'No requests match your search.'
          : 'No app-fix requests have been submitted yet.'}
      </p>
    </div>
  );
}

export default function AppFixManagementDashboard({ enabled = true, onFeedback }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupMode, setGroupMode] = useState(APP_FIX_GROUP_MODES.ALL);
  const [viewingRequest, setViewingRequest] = useState(null);

  const { firebaseUser, staffProfile, staffDocId } = useAuth();
  const { role } = useRoleAccess();
  const createdByUserId = firebaseUser?.uid || '';
  const createdByName = staffProfile?.name
    || staffProfile?.fullName
    || firebaseUser?.displayName
    || '';

  const { data: staff = [] } = useCollection(COLLECTIONS.STAFF);
  const { allRequests, loading, error } = useAppFixManagementRequests({ enabled });

  const staffByUserId = useMemo(() => buildStaffLookupMap(staff), [staff]);

  const filteredRequests = useMemo(
    () => applyManagementRequestFilters(allRequests, {
      searchTerm,
      staffByUserId,
    }),
    [allRequests, searchTerm, staffByUserId],
  );

  const hasActiveFilters = Boolean(searchTerm.trim());

  const showFeedback = (type, message) => {
    onFeedback?.(type, message);
  };

  return (
    <div className="space-y-4 min-w-0">
      <AppFixManagementSummaryCards requests={allRequests} loading={loading} />

      <div className="relative max-w-xl min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search title, description, user, module, error, reference..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          aria-label="Search requests"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {APP_FIX_GROUP_MODE_OPTIONS.map((option) => {
          const isActive = groupMode === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setGroupMode(option.value)}
              aria-pressed={isActive}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                isActive
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200'
                  : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-4 text-xs text-rose-400">
          {getAppFixErrorMessage(error, 'Failed to load requests. Please refresh and try again.')}
        </div>
      ) : null}

      {loading ? (
        <RequestSkeletonGrid />
      ) : filteredRequests.length ? (
        <AppFixManagementRequestGroups
          requests={filteredRequests}
          groupMode={groupMode}
          staffByUserId={staffByUserId}
          onOpenRequest={setViewingRequest}
        />
      ) : (
        <EmptyResults hasFilters={hasActiveFilters || allRequests.length > 0} />
      )}

      <AppFixManagementViewModal
        request={viewingRequest}
        isOpen={Boolean(viewingRequest)}
        onClose={() => setViewingRequest(null)}
        onSaved={(message) => showFeedback('success', message)}
        onDeleted={(message) => {
          showFeedback('success', message);
          setViewingRequest(null);
        }}
        onDuplicated={(message, duplicatedRequest) => {
          showFeedback('success', message);
          setViewingRequest(duplicatedRequest);
        }}
        staff={staff}
        role={role}
        createdByUserId={createdByUserId}
        createdByName={createdByName}
        actorStaffId={staffDocId || staffProfile?.id || ''}
      />
    </div>
  );
}
