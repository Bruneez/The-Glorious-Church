export default function ShepherdingToolsEmptyState({ message }) {
  return (
    <div className="py-14 px-6 text-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/30">
      <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">{message}</p>
    </div>
  );
}
