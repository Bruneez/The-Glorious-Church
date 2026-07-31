import { RotateCcw, Search, X } from 'lucide-react';
import Select from '@/components/ui/Select';
import {
  PROJECT_PRIORITY_FILTER_OPTIONS,
  PROJECT_SORT_OPTIONS,
  PROJECT_STATUS_FILTER_OPTIONS,
} from '@/config/projectsDisplay';

export default function ProjectsSearchFilters({
  searchTerm = '',
  statusFilter = '',
  priorityFilter = '',
  sortBy = 'updated-desc',
  resultCount = 0,
  totalCount = 0,
  hasActiveFilters = false,
  onSearchTermChange,
  onStatusFilterChange,
  onPriorityFilterChange,
  onSortByChange,
  onClearFilters,
}) {
  return (
    <div className="space-y-3 min-w-0">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between min-w-0">
        <div className="relative flex-1 max-w-xl min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search title, summary, leader, status..."
            value={searchTerm}
            onChange={(event) => onSearchTermChange?.(event.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            aria-label="Search projects"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 min-w-0 xl:min-w-[36rem]">
          <Select
            label="Status"
            name="project-status-filter"
            value={statusFilter}
            onChange={(event) => onStatusFilterChange?.(event.target.value)}
            options={PROJECT_STATUS_FILTER_OPTIONS}
            placeholder="All Statuses"
          />
          <Select
            label="Priority"
            name="project-priority-filter"
            value={priorityFilter}
            onChange={(event) => onPriorityFilterChange?.(event.target.value)}
            options={PROJECT_PRIORITY_FILTER_OPTIONS}
            placeholder="All Priorities"
          />
          <Select
            label="Sort By"
            name="project-sort-by"
            value={sortBy}
            onChange={(event) => onSortByChange?.(event.target.value)}
            options={PROJECT_SORT_OPTIONS}
            placeholder="Recently Updated"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <p className="text-[11px] text-slate-500">
          Showing {resultCount} of {totalCount} project{totalCount === 1 ? '' : 's'}
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 self-start rounded-lg border border-slate-700/70 bg-slate-900/70 px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 hover:text-white transition"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Clear Filters
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function ProjectsLoadErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-4 space-y-3"
    >
      <p className="text-xs text-rose-400">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-[10px] font-semibold text-rose-300 hover:bg-rose-500/20 transition"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Try Again
        </button>
      ) : null}
    </div>
  );
}
