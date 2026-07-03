export default function MapPanel({ icon: Icon, title, badge, badgeClassName = '', children }) {
  return (
    <div className="bg-slate-800 border border-slate-700/70 rounded-xl overflow-hidden shadow-xl flex-1 flex flex-col relative min-h-0">
      <div className="p-3 border-b border-slate-700/70 bg-slate-800/40 flex justify-between items-center shrink-0 z-10">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          {Icon ? <Icon className="w-3.5 h-3.5 text-indigo-400" /> : null}
          {title}
        </span>
        {badge ? (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${badgeClassName}`}>
            {badge}
          </span>
        ) : null}
      </div>
      <div className="w-full flex-1 min-h-[420px] z-0 bg-slate-950">{children}</div>
    </div>
  );
}
