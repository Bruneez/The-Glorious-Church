import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

const TONE_STYLES = {
  success: {
    container: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    icon: CheckCircle2,
  },
  warning: {
    container: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    icon: AlertTriangle,
  },
  error: {
    container: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
    icon: AlertTriangle,
  },
};

export default function FeedbackToast({
  feedback,
  onDismiss,
  autoDismissMs = 5000,
  fixed = false,
}) {
  useEffect(() => {
    if (!feedback?.message || !autoDismissMs || !onDismiss) return undefined;

    const timer = window.setTimeout(onDismiss, autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [feedback, autoDismissMs, onDismiss]);

  if (!feedback?.message) return null;

  const tone = TONE_STYLES[feedback.type] || TONE_STYLES.error;
  const Icon = tone.icon;

  return (
    <div
      role={feedback.type === 'error' ? 'alert' : 'status'}
      className={`${fixed ? 'fixed top-4 right-4 z-[70] max-w-sm shadow-lg' : ''} rounded-lg border p-3 text-xs font-medium flex items-start gap-2 ${tone.container}`}
    >
      <Icon className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
      <span className="flex-1 min-w-0">{feedback.message}</span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="text-current hover:opacity-80 shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
