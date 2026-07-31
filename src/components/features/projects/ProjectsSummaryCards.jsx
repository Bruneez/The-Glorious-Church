import {
  buildProjectsDashboardSummary,
  getProjectsDashboardSummaryCards,
} from '@/config/projectsDisplay';

function SummaryCard({ label, value, loading, highlight = false }) {
  return (
    <div
      className={`p-4 rounded-xl border shadow-sm min-w-0 ${
        highlight
          ? 'bg-rose-950/20 border-rose-500/30'
          : 'bg-slate-900/50 border-slate-700/70'
      }`}
    >
      {loading ? (
        <div className="h-8 w-12 rounded bg-slate-800 animate-pulse" aria-hidden="true" />
      ) : (
        <h3 className={`text-2xl font-bold ${highlight ? 'text-rose-300' : 'text-indigo-400'}`}>
          {value}
        </h3>
      )}
      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1 break-words">
        {label}
      </p>
    </div>
  );
}

export default function ProjectsSummaryCards({
  projects = [],
  memberships = [],
  userId = '',
  loading = false,
}) {
  const cards = getProjectsDashboardSummaryCards(
    buildProjectsDashboardSummary(projects, { memberships, userId }),
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 min-w-0">
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
