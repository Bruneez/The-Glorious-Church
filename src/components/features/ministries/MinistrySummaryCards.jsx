import { Church } from 'lucide-react';
import { getMinistrySummaryCards } from '@/config/ministriesOptions';

function SummaryCard({ label, value, loading }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/70 shadow-sm">
      <h3 className="text-2xl md:text-3xl font-bold text-indigo-400">
        {loading ? '—' : value}
      </h3>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
        {label}
      </p>
    </div>
  );
}

export default function MinistrySummaryCards({ ministries = [], loading = false }) {
  const cards = getMinistrySummaryCards(ministries);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <SummaryCard key={card.key} label={card.label} value={card.value} loading={loading} />
      ))}
    </div>
  );
}
