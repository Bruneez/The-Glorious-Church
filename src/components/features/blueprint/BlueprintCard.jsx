export default function BlueprintCard({ section, isSelected = false, onSelect }) {
  if (!section) return null;

  const Icon = section.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(section.id)}
      aria-pressed={isSelected}
      className={`text-left rounded-xl border p-4 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 w-full ${
        isSelected
          ? 'bg-indigo-500/10 border-indigo-500/60 shadow-[0_0_0_1px_rgba(99,102,241,0.25)]'
          : 'bg-slate-900/60 border-slate-700/70 hover:border-indigo-500/30 hover:bg-slate-900/80'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
          isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-indigo-400'
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-white tracking-wide">{section.title}</h3>
      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
        {section.subtitle}
      </p>
    </button>
  );
}
