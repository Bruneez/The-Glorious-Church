import { Search, ArrowUpDown } from 'lucide-react';

export default function TransportFilters({ 
  searchTerm, 
  onSearchChange, 
  filterStatus, 
  onFilterStatusChange,
  onSortToggle,
  sortDirection
}) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      <div className="relative sm:col-span-2">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search drivers by name, phone number, or vehicle registration..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500 transition"
        />
      </div>
      <div className="flex gap-2">
        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
        >
          <option value="all">All Operational Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button
          onClick={onSortToggle}
          className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition cursor-pointer shrink-0"
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>{sortDirection === 'asc' ? 'Asc' : 'Desc'}</span>
        </button>
      </div>
    </section>
  );
}
