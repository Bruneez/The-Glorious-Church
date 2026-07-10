import { Search } from 'lucide-react';

export default function TaskFilters({ searchTerm, onSearchChange }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700/70 p-4">
      <label htmlFor="tasks-search" className="block text-slate-400 mb-1 font-medium text-xs">
        Search
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          id="tasks-search"
          type="text"
          placeholder="Search by user name or task title..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>
  );
}
