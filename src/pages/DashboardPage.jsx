export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/70 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Roster Members</p>
            <h3 className="text-2xl md:text-3xl font-bold mt-1 text-white">—</h3>
          </div>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/70 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Year Offerings</p>
            <h3 className="text-2xl md:text-3xl font-bold mt-1 text-white">R0.00</h3>
          </div>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/70 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Avg Youth Attendance</p>
            <h3 className="text-2xl md:text-3xl font-bold mt-1 text-white">0%</h3>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/70 shadow-sm">
        <p className="text-xs text-slate-400">
          Dashboard metrics and birthday widgets will be migrated in Phase 2. You are signed in to the React shell.
        </p>
      </div>
    </div>
  );
}
