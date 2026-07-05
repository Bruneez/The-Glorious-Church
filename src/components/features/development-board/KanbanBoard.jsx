import { KanbanSquare } from 'lucide-react';
import DevelopmentTaskCard from './DevelopmentTaskCard';

export default function KanbanBoard({
  groupedTasks,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  updatingTaskId = '',
}) {
  return (
    <div className="w-full max-w-none min-w-0">
      <div className="overflow-x-auto lg:overflow-x-visible pb-2">
        <div className="flex flex-col lg:flex-row gap-3 w-full min-w-0">
          {Object.entries(groupedTasks).map(([status, tasks]) => (
            <div
              key={status}
              className="w-full shrink-0 lg:flex-1 lg:min-w-0 lg:basis-0 bg-slate-800/50 border border-slate-700/70 rounded-xl flex flex-col max-h-[70vh]"
            >
              <div className="px-3 py-2.5 border-b border-slate-700/70 flex items-center justify-between shrink-0">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  {status}
                </h3>
                <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  {tasks.length}
                </span>
              </div>

              <div className="p-3 space-y-3 overflow-y-auto flex-1 min-w-0">
                {tasks.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-700/80 p-4 text-center">
                    <KanbanSquare className="w-4 h-4 text-slate-600 mx-auto mb-1.5" />
                    <p className="text-[10px] text-slate-500">No tasks in this column</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <DevelopmentTaskCard
                      key={task.id}
                      task={task}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                      isUpdatingStatus={updatingTaskId === task.id}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
