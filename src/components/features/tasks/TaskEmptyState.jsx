import { ListTodo } from 'lucide-react';

export default function TaskEmptyState({
  canManageTasks = false,
  hasFilters = false,
  noSearchMatches = false,
}) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700/70 p-10 md:p-14 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 border border-slate-700">
        <ListTodo className="h-7 w-7 text-slate-500" />
      </div>
      <h2 className="text-sm font-semibold text-white">
        {noSearchMatches
          ? 'No matching users or tasks found.'
          : hasFilters
            ? 'No matching tasks'
            : 'No tasks yet'}
      </h2>
      <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
        {noSearchMatches
          ? 'Try a different user name or task title.'
          : hasFilters
            ? 'Try adjusting your search to find users or tasks.'
            : canManageTasks
              ? 'Tasks assigned to staff will appear here. Admins can create tasks using the New Task button.'
              : 'Staff workload summaries will appear here once tasks are assigned.'}
      </p>
    </div>
  );
}
