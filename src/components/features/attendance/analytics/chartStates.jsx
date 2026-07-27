export function ChartEmptyState({ message }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center min-h-[240px] rounded-lg bg-slate-900/40 px-4"
    >
      <p className="text-xs text-slate-500 text-center">{message}</p>
    </div>
  );
}

export function ChartLoadingState() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading chart data"
      className="flex items-center justify-center min-h-[240px]"
    >
      <div
        className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"
        aria-hidden="true"
      />
    </div>
  );
}

export function ChartFigure({ title, description, children }) {
  return (
    <figure className="space-y-3" aria-label={title}>
      <figcaption className="text-sm font-semibold text-white tracking-wide">{title}</figcaption>
      {description ? <p className="sr-only">{description}</p> : null}
      <div className="w-full min-w-0 overflow-hidden">{children}</div>
    </figure>
  );
}

export function ChartTooltipShell({ label, children }) {
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-lg"
      style={{
        backgroundColor: '#0f172a',
        borderColor: '#475569',
        color: '#e2e8f0',
      }}
    >
      {label ? <p className="font-medium text-slate-200">{label}</p> : null}
      {children}
    </div>
  );
}
