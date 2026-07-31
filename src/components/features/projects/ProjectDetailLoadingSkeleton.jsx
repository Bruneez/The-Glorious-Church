export default function ProjectDetailLoadingSkeleton() {
  return (
    <div className="space-y-4 min-w-0" aria-hidden="true">
      <div className="rounded-xl border border-slate-700/70 bg-slate-900/40 overflow-hidden animate-pulse">
        <div className="aspect-[21/9] bg-slate-800" />
        <div className="p-5 space-y-3">
          <div className="h-6 w-2/3 rounded bg-slate-800" />
          <div className="h-4 w-1/3 rounded bg-slate-800" />
          <div className="h-16 rounded bg-slate-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="h-40 rounded-xl border border-slate-700/70 bg-slate-900/40 animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="h-32 rounded-xl border border-slate-700/70 bg-slate-900/40 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
