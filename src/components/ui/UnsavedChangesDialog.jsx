import { createPortal } from 'react-dom';
import Button from '@/components/ui/Button';

export default function UnsavedChangesDialog({
  isOpen,
  onContinueEditing,
  onDiscard,
}) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center px-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="unsaved-changes-title"
      aria-describedby="unsaved-changes-description"
    >
      <div
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onContinueEditing}
      />

      <div className="relative z-10 w-full max-w-sm rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-xl">
        <h2 id="unsaved-changes-title" className="text-sm font-bold text-white">
          Discard unsaved changes?
        </h2>
        <p id="unsaved-changes-description" className="mt-2 text-xs text-slate-300">
          The information you entered has not been saved.
        </p>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onContinueEditing}>
            Continue Editing
          </Button>
          <Button type="button" variant="danger" onClick={onDiscard}>
            Discard Changes
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
