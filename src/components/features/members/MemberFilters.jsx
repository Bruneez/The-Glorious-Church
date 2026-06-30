import { Search } from 'lucide-react';

export default function MemberFilters({ 
  searchTerm, 
  onSearchChange, 
  filterDept, 
  onFilterDeptChange, 
  filterStatus, 
  onFilterStatusChange,
  onSortToggle,
  sortDirection,
  onAddMember
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Roster Control</span>
        <button 
          onClick={onSortToggle}
          className="bg-slate-900 text-[11px] text-slate-300 px-2.5 py-1.5 border border-slate-700 rounded-lg hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          Sort A-Z ({sortDirection === 'asc' ? 'Asc' : 'Desc'})
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search profiles..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        
        <select
          value={filterDept}
          onChange={(e) => onFilterDeptChange(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="all">All Arts Sectors</option>
          <option value="Dance Stars">Dance Stars</option>
          <option value="Choir">The Choir / Worshipers</option>
          <option value="Film Stars">Film Stars</option>
          <option value="">None</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active Only</option>
          <option value="Inactive">Inactive Only</option>
        </select>

        <button
          onClick={onAddMember}
          className="hidden md:flex bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg transition items-center justify-center gap-1.5 cursor-pointer shadow"
        >
          <Search className="w-3.5 h-3.5" />
          Add Member
        </button>
      </div>
    </div>
  );
}
