import Button from '@/components/ui/Button';

export default function StaffProfileErrorBanner({
  message,
  onRetry,
  isRetrying = false,
  onDismiss,
}) {
  if (!message) return null;

  return (
    <div
      className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100"
      role="status"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>{message}</p>
        <div className="flex flex-wrap gap-2 shrink-0">
          {onRetry ? (
            <Button type="button" variant="secondary" onClick={onRetry} isLoading={isRetrying}>
              Retry Profile Load
            </Button>
          ) : null}
          {onDismiss ? (
            <Button type="button" variant="outline" onClick={onDismiss}>
              Dismiss
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
