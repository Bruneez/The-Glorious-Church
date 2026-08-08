export function AppFixesLoadingState() {
  return (
    <div className="page-root">
      <div className="min-w-0">
        <div className="h-7 w-32 rounded bg-slate-800 animate-pulse" aria-hidden="true" />
        <div className="h-4 w-80 max-w-full rounded bg-slate-800/80 animate-pulse mt-2" aria-hidden="true" />
      </div>

      <div className="mt-4 bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm min-w-0 p-4 space-y-4">
        <div className="h-5 w-40 rounded bg-slate-900 animate-pulse" aria-hidden="true" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-20 rounded-xl border border-slate-700/70 bg-slate-900/40 animate-pulse"
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="h-10 rounded-lg bg-slate-900 animate-pulse" aria-hidden="true" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-48 rounded-xl border border-slate-700/70 bg-slate-900/40 animate-pulse"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      <p className="sr-only" role="status">Loading App Fixes…</p>
    </div>
  );
}

export function AppFixesAccessDeniedState() {
  return (
    <div className="page-root">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-white tracking-wide">App Fixes</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Report app problems and track your submitted requests.
        </p>
      </div>

      <div
        role="alert"
        className="mt-4 rounded-xl border border-amber-500/20 bg-amber-950/20 p-5 text-xs text-amber-200 max-w-2xl"
      >
        You do not have permission to access App Fixes. If you believe this is a mistake, please
        contact an administrator.
      </div>
    </div>
  );
}
