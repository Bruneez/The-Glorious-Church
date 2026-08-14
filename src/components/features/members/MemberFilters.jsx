import { Search, UserPlus, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import { CHURCH_FILTER_OPTIONS, STATUS_OPTIONS } from '@/config/memberOptions';

export default function MemberFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterChurch,
  onFilterChurchChange,
  onAddMember,
  totalCount = 0,
  filteredCount = 0,
  isLoading = false,
}) {
  const showFilteredSummary =
    !isLoading && filteredCount !== totalCount;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3 min-w-0">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider shrink-0">
          Members Directory
        </span>

        <div className="flex flex-col items-end gap-0.5 shrink-0 text-right">
          <div
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-400"
            aria-live="polite"
            aria-atomic="true"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" aria-hidden="true" />
            {isLoading ? (
              <span className="text-slate-500">Members: —</span>
            ) : (
              <span>
                <span className="text-slate-500">Members:</span>{' '}
                <span className="font-semibold text-slate-200 tabular-nums">{totalCount}</span>
              </span>
            )}
          </div>

          {showFilteredSummary ? (
            <p className="text-[10px] text-slate-500 leading-tight">
              Showing {filteredCount} of {totalCount} members
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search name, phone, church, occupation, school..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={filterChurch}
          onChange={(e) => onFilterChurchChange(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none cursor-pointer"
        >
          {CHURCH_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none cursor-pointer"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {onAddMember && (
          <Button icon={UserPlus} onClick={onAddMember} className="hidden md:flex py-1.5 px-3">
            Add Member
          </Button>
        )}
      </div>
    </div>
  );
}
