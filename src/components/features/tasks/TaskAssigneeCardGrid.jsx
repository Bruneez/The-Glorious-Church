import { CheckCircle2, CircleDot, ListTodo, Lock, UserMinus } from 'lucide-react';
import { getRoleLabel } from '@/config/roles';
import UserAvatar from '@/components/ui/UserAvatar';

function TaskAssigneeCard({ assignee, onClick, onRemoveFromTasks, canOpen, canRemoveFromTasks }) {
  const taskLabel = assignee.total === 1 ? '1 Task' : `${assignee.total} Tasks`;
  const showRemoveControl =
    canRemoveFromTasks && assignee.key !== 'unassigned' && onRemoveFromTasks;

  return (
    <div
      className={`relative w-full bg-slate-900/60 border rounded-xl shadow-sm transition ${
        canOpen
          ? 'border-slate-700/70 hover:border-indigo-500/40 hover:bg-slate-900/80'
          : 'border-slate-700/50 opacity-80 hover:bg-slate-900/50'
      }`}
    >
      {showRemoveControl ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemoveFromTasks(assignee);
          }}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition cursor-pointer"
          aria-label={`Remove ${assignee.name} from Tasks`}
          title="Remove from Tasks"
        >
          <UserMinus className="w-4 h-4" />
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => onClick?.(assignee)}
        className={`w-full text-left p-4 flex flex-col gap-4 ${
          canOpen ? 'cursor-pointer' : 'cursor-not-allowed'
        } ${showRemoveControl ? 'pr-12' : ''}`}
        aria-disabled={!canOpen}
      >
        <div className="flex items-start gap-3">
          <UserAvatar name={assignee.name} photo={assignee.photo} size="lg" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide truncate">{assignee.name}</h3>
              {!canOpen ? <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" /> : null}
            </div>
            {assignee.role ? (
              <p className="text-[11px] text-indigo-400/90 font-medium mt-0.5 truncate">
                {getRoleLabel(assignee.role)}
              </p>
            ) : null}
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
              <ListTodo className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {taskLabel}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Total
            </p>
            <p className="text-lg font-bold text-white mt-0.5">{assignee.total}</p>
          </div>

          <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Completed
            </p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              {assignee.completed}
            </p>
          </div>

          <div className="rounded-lg bg-slate-800/80 border border-slate-700/60 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Outstanding
            </p>
            <p className="text-lg font-bold text-amber-400 mt-0.5 flex items-center gap-1.5">
              <CircleDot className="w-3.5 h-3.5 shrink-0" />
              {assignee.outstanding}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}

export default function TaskAssigneeCardGrid({
  assignees = [],
  onSelectAssignee,
  onRemoveFromTasks,
  canViewAssignee = () => true,
  canRemoveFromTasks = false,
}) {
  if (!assignees.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {assignees.map((assignee) => (
        <TaskAssigneeCard
          key={assignee.key}
          assignee={assignee}
          onClick={onSelectAssignee}
          onRemoveFromTasks={onRemoveFromTasks}
          canOpen={canViewAssignee(assignee)}
          canRemoveFromTasks={canRemoveFromTasks}
        />
      ))}
    </div>
  );
}
