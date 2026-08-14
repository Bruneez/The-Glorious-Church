import Button from '@/components/ui/Button';

export default function DataQueryErrorState({
  message = 'Could not load data. Please try again.',
  onRetry,
  isRetrying = false,
}) {
  return (
    <div className="p-6 text-center">
      <p className="text-rose-400 text-xs">{message}</p>
      {onRetry ? (
        <div className="mt-4">
          <Button type="button" variant="secondary" onClick={onRetry} isLoading={isRetrying}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}
