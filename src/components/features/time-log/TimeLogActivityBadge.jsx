import { TIME_LOG_ACTIVITY_TYPE } from '@/config/timeLogOptions';

export default function TimeLogActivityBadge({ activityType }) {
  const isSpiritual = activityType === TIME_LOG_ACTIVITY_TYPE.SPIRITUAL;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
        isSpiritual
          ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/20'
          : 'bg-amber-950/60 text-amber-400 border border-amber-500/20'
      }`}
    >
      {isSpiritual ? 'Spiritual' : 'Natural'}
    </span>
  );
}
