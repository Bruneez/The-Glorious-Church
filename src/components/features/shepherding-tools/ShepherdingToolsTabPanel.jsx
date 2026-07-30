import { Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import ShepherdingToolsResourceGrid from '@/components/features/shepherding-tools/ShepherdingToolsResourceGrid';
import { getEmptyShepherdingToolsMessage } from '@/config/shepherdingToolsDisplay';
import {
  PUBLISHED_STATUS_FILTER_OPTIONS,
  SHEPHERDING_CATEGORY_OPTIONS,
  SHEPHERDING_PLATFORM_OPTIONS,
  SHEPHERDING_RESOURCE_TYPES,
} from '@/config/shepherdingToolsConstants';
import { useShepherdingToolsResources } from '@/services/shepherdingToolsService';
import { useRoleAccess } from '@/hooks/useRoleAccess';

export default function ShepherdingToolsTabPanel({
  tab,
  searchTerm,
  categoryFilter,
  platformFilter,
  publishedStatusFilter,
  onView,
}) {
  const { resources, loading, error } = useShepherdingToolsResources(tab.id, {
    searchTerm,
    categoryFilter,
    platformFilter,
    publishedStatusFilter,
  });
  const { canPerformAction } = useRoleAccess();
  const canManage = canPerformAction('MANAGE_SHEPHERDING_TOOLS');

  const emptyMessage = getEmptyShepherdingToolsMessage(tab, searchTerm);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-slate-700/70 bg-slate-900/40 h-72 animate-pulse"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-4 text-xs text-rose-400">
        {error.message || 'Failed to load resources. Please refresh and try again.'}
      </div>
    );
  }

  return (
    <ShepherdingToolsResourceGrid
      resources={resources}
      emptyMessage={emptyMessage}
      showDraftStatus={canManage}
      onView={onView}
    />
  );
}

export function ShepherdingToolsToolbar({
  tab,
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  platformFilter,
  onPlatformFilterChange,
  publishedStatusFilter,
  onPublishedStatusFilterChange,
  canManage,
  onAdd,
}) {
  const showCategoryFilter = tab.id !== SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONALS;
  const showPlatformFilter = tab.id !== SHEPHERDING_RESOURCE_TYPES.BOOKS
    && tab.id !== SHEPHERDING_RESOURCE_TYPES.DAILY_DEVOTIONALS;

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 min-w-0">
        <div className="relative max-w-md min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="search"
            placeholder={tab.searchPlaceholder || 'Search resources...'}
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            aria-label={tab.searchPlaceholder || 'Search resources'}
          />
        </div>

        {canManage && onAdd ? (
          <Button icon={Plus} onClick={onAdd} className="shrink-0 w-full lg:w-auto">
            {tab.addLabel}
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 min-w-0">
        {showCategoryFilter ? (
          <Select
            label="Category"
            value={categoryFilter}
            onChange={(event) => onCategoryFilterChange(event.target.value)}
            placeholder="All categories"
            options={SHEPHERDING_CATEGORY_OPTIONS}
            className="sm:max-w-[200px]"
          />
        ) : null}

        {showPlatformFilter ? (
          <Select
            label="Platform"
            value={platformFilter}
            onChange={(event) => onPlatformFilterChange(event.target.value)}
            placeholder="All platforms"
            options={SHEPHERDING_PLATFORM_OPTIONS}
            className="sm:max-w-[200px]"
          />
        ) : null}

        {canManage ? (
          <Select
            label="Status"
            value={publishedStatusFilter}
            onChange={(event) => onPublishedStatusFilterChange(event.target.value)}
            options={PUBLISHED_STATUS_FILTER_OPTIONS}
            className="sm:max-w-[180px]"
          />
        ) : null}
      </div>
    </div>
  );
}
