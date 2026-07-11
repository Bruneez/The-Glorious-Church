export default function Card({ children, className = '', title, icon: Icon }) {
  return (
    <div className={`bg-slate-800 p-4 md:p-5 rounded-xl border border-slate-700/70 shadow-sm ${className}`}>
      {(title || Icon) && (
        <div className="flex items-center gap-1.5 border-b border-slate-700 pb-2 mb-3">
          {Icon && <Icon className="w-4.5 h-4.5 text-indigo-400" />}
          {title && <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">{title}</h4>}
        </div>
      )}
      {children}
    </div>
  );
}
