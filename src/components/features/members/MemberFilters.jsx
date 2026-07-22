import { Search, UserPlus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { CHURCH_FILTER_OPTIONS, STATUS_OPTIONS } from '@/config/memberOptions';

export default function MemberFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterChurch,
  onFilterChurchChange,
  onSortToggle,
  sortDirection,
  onAddMember,
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Members Directory</span>
        <button
          type="button"
          onClick={onSortToggle}
          className="bg-slate-900 text-[11px] text-slate-300 px-2.5 py-1.5 border border-slate-700 rounded-lg hover:text-white flex items-center gap-1 cursor-pointer"
        >
          Sort Name ({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})
        </button>
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
