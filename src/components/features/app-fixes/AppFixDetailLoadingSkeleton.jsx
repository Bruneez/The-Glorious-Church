export default function AppFixDetailLoadingSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-lg border border-slate-700/70 bg-slate-900/40 h-16 animate-pulse"
        />
      ))}
    </div>
  );
}
