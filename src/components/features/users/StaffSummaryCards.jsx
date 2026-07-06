import { getStaffSummaryCards } from '@/config/staffOptions';

function SummaryCard({ label, value, loading, highlight = false }) {
  return (
    <div
      className={`p-4 rounded-xl border shadow-sm ${
        highlight
          ? 'bg-indigo-950/30 border-indigo-500/30'
          : 'bg-slate-800 border-slate-700/70'
      }`}
    >
      <h3
        className={`text-2xl md:text-3xl font-bold ${
          highlight ? 'text-indigo-300' : 'text-indigo-400'
        }`}
      >
        {loading ? '—' : value}
      </h3>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
        {label}
      </p>
    </div>
  );
}

export default function StaffSummaryCards({ staff = [], loading = false }) {
  const cards = getStaffSummaryCards(staff);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card) => (
        <SummaryCard
          key={card.key}
          label={card.label}
          value={card.value}
          loading={loading}
          highlight={card.highlight}
        />
      ))}
    </div>
  );
}
