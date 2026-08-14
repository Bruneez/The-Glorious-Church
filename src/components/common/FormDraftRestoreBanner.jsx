import Button from '@/components/ui/Button';

function formatDraftSavedAt(savedAt) {
  if (!savedAt) return 'earlier';

  try {
    return new Date(savedAt).toLocaleString();
  } catch {
    return 'earlier';
  }
}

export default function FormDraftRestoreBanner({
  savedAt = '',
  onRestore,
  onDismiss,
}) {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100">
      <p className="font-medium text-amber-200">
        Unsaved draft found from {formatDraftSavedAt(savedAt)}.
      </p>
      <p className="mt-1 text-amber-100/90">
        Restore your previous entries, or discard the draft and start fresh.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={onRestore}>
          Restore Draft
        </Button>
        <Button type="button" variant="outline" onClick={onDismiss}>
          Discard Draft
        </Button>
      </div>
    </div>
  );
}
