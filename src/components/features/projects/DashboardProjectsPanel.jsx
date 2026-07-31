import { Link } from 'react-router-dom';
import { FolderKanban } from 'lucide-react';
import {
  buildProjectsDashboardSummary,
  getProjectsDashboardSummaryCards,
} from '@/config/projectsDisplay';

export default function DashboardProjectsPanel({
  projects = [],
  memberships = [],
  userId = '',
  loading = false,
}) {
  const cards = getProjectsDashboardSummaryCards(
    buildProjectsDashboardSummary(projects, { memberships, userId }),
  ).filter((card) => ['total', 'active', 'joined', 'overdue'].includes(card.key));

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm h-full">
      <div className="p-4 md:p-5 border-b border-slate-700/70 bg-slate-800/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <FolderKanban className="w-4 h-4 text-indigo-400 shrink-0" />
          <h2 className="text-sm font-bold text-white tracking-wide">Projects</h2>
        </div>
        <Link
          to="/projects"
          className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition shrink-0"
        >
          View all
        </Link>
      </div>

      <div className="p-4 md:p-5 grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div
            key={card.key}
            className={`rounded-lg border p-3 min-w-0 ${
              card.highlight
                ? 'border-rose-500/30 bg-rose-950/20'
                : 'border-slate-700/70 bg-slate-900/40'
            }`}
          >
            {loading ? (
              <div className="h-7 w-10 rounded bg-slate-800 animate-pulse" aria-hidden="true" />
            ) : (
              <p className={`text-xl font-bold ${card.highlight ? 'text-rose-300' : 'text-indigo-400'}`}>
                {card.value}
              </p>
            )}
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
              {card.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
