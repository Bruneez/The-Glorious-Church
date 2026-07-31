import { Loader2 } from 'lucide-react';
import { PROJECT_TILE_STATE } from '@/config/projectsDisplay';

const ACTION_BUTTON_CLASSES = {
  [PROJECT_TILE_STATE.JOIN]:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20',
  [PROJECT_TILE_STATE.REQUEST]:
    'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20',
  [PROJECT_TILE_STATE.PENDING]:
    'border-amber-500/30 bg-amber-500/10 text-amber-300',
  [PROJECT_TILE_STATE.JOINED]:
    'border-slate-600/50 bg-slate-800/80 text-slate-300 hover:bg-slate-700/80',
  [PROJECT_TILE_STATE.PROJECT_LEADER]:
    'border-sky-500/30 bg-sky-500/10 text-sky-300',
};

function getActionLabel(tileState) {
  if (!tileState) return null;

  switch (tileState.key) {
    case PROJECT_TILE_STATE.JOIN:
      return 'Join Project';
    case PROJECT_TILE_STATE.REQUEST:
      return 'Request to Join';
    case PROJECT_TILE_STATE.PENDING:
      return tileState.canCancel ? 'Cancel Request' : 'Pending Approval';
    case PROJECT_TILE_STATE.JOINED:
      return tileState.canLeave ? 'Leave Project' : 'Joined';
    case PROJECT_TILE_STATE.PROJECT_LEADER:
      return 'Project Leader';
    default:
      return tileState.label;
  }
}

export default function ProjectMembershipActions({
  project,
  tileState,
  loading = false,
  onAction,
}) {
  if (!tileState) return null;

  const label = getActionLabel(tileState);
  const toneClass = ACTION_BUTTON_CLASSES[tileState.key]
    || 'border-slate-600/50 bg-slate-800/80 text-slate-300';
  const isInteractive = Boolean(tileState.action) && !loading;
  const isDisabled = loading
    || (tileState.key === PROJECT_TILE_STATE.PENDING && !tileState.canCancel)
    || (tileState.key === PROJECT_TILE_STATE.JOINED && !tileState.canLeave)
    || tileState.key === PROJECT_TILE_STATE.PROJECT_LEADER;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => {
        if (!isInteractive || !onAction) return;
        onAction(project, tileState);
      }}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition disabled:cursor-default disabled:opacity-80 ${toneClass}`}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
      <span>{label}</span>
    </button>
  );
}
