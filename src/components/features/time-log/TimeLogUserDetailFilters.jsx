import { Search } from 'lucide-react';
import Select from '@/components/ui/Select';
import {
  TIME_LOG_ACTIVITY_FILTER_OPTIONS,
  TIME_LOG_PERIOD_OPTIONS,
} from '@/config/timeLogOptions';

export default function TimeLogUserDetailFilters({
  searchTerm,
  onSearchChange,
  activityType,
  onActivityTypeChange,
  period,
  onPeriodChange,
}) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700/70 p-4 space-y-4">
      <div>
        <label htmlFor="time-log-detail-search" className="block text-slate-400 mb-1 font-medium text-xs">
          Search
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            id="time-log-detail-search"
            type="text"
            placeholder="Search by title, description, or date..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Activity type"
          value={activityType}
          onChange={(event) => onActivityTypeChange(event.target.value)}
          options={TIME_LOG_ACTIVITY_FILTER_OPTIONS}
          placeholder="All activity types"
        />
        <Select
          label="Period"
          value={period}
          onChange={(event) => onPeriodChange(event.target.value)}
          options={TIME_LOG_PERIOD_OPTIONS}
          placeholder="This week"
        />
      </div>
    </div>
  );
}
