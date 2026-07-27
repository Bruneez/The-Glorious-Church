import { getTimeLogSummaryCards } from '@/config/timeLogOptions';

function SummaryCard({ label, value, loading }) {
  return (
    <div className="p-4 md:p-5 rounded-xl border shadow-sm bg-slate-800 border-slate-700/70">
      <h3 className="text-2xl md:text-3xl font-bold text-indigo-400">
        {loading ? '—' : value}
      </h3>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
        {label}
      </p>
    </div>
  );
}

export default function TimeLogSummaryCards({ summary, loading = false }) {
  const cards = getTimeLogSummaryCards(summary);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {cards.map((card) => (
        <SummaryCard key={card.key} label={card.label} value={card.value} loading={loading} />
      ))}
    </div>
  );
}
