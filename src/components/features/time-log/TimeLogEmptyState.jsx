import { Clock } from 'lucide-react';

export default function TimeLogEmptyState({
  canViewAllTimeLogs = false,
  noSearchMatches = false,
}) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700/70 p-10 md:p-14 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 border border-slate-700">
        <Clock className="h-7 w-7 text-slate-500" />
      </div>
      <h2 className="text-sm font-semibold text-white">
        {noSearchMatches ? 'No matching users or time logs found.' : 'No time logs yet'}
      </h2>
      <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
        {noSearchMatches
          ? 'Try a different user name or activity title.'
          : canViewAllTimeLogs
            ? 'No eligible staff members are available for time logging.'
            : 'Your time log summary will appear here once your account is set up.'}
      </p>
    </div>
  );
}
