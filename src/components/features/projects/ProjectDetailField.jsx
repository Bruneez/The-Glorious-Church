export default function ProjectDetailField({ label, value, children, className = '' }) {
  return (
    <div className={`rounded-xl bg-slate-900/50 border border-slate-700/60 p-3.5 min-w-0 ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <div className="text-sm font-medium text-white mt-1 break-words">
        {children ?? value ?? '—'}
      </div>
    </div>
  );
}

export function ProjectDetailSection({ title, children, className = '', action = null }) {
  return (
    <section className={`space-y-3 min-w-0 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
