import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import Button from '@/components/ui/Button';
import {
  canApplyPwaUpdate,
  getPwaUpdateBlockedMessage,
  shouldDeferPwaUpdate,
} from '@/utils/pwaUpdateGuard';
import { hasDirtyUnsavedChanges, subscribeUnsavedChangesGuardActivity } from '@/utils/unsavedChangesRegistry';

export default function PwaUpdatePrompt() {
  const [blockedMessage, setBlockedMessage] = useState('');
  const [guardRevision, setGuardRevision] = useState(0);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
  });

  useEffect(() => subscribeUnsavedChangesGuardActivity(() => {
    setGuardRevision((value) => value + 1);
  }), []);

  useEffect(() => {
    if (!needRefresh) {
      setBlockedMessage('');
    }
  }, [needRefresh]);

  const hasDirtyForms = hasDirtyUnsavedChanges();
  const isDeferred = shouldDeferPwaUpdate({ needRefresh, hasDirtyForms });

  useEffect(() => {
    if (isDeferred) {
      setBlockedMessage(getPwaUpdateBlockedMessage());
      return;
    }

    if (needRefresh) {
      setBlockedMessage('');
    }
  }, [isDeferred, needRefresh, guardRevision]);

  if (!needRefresh) {
    return null;
  }

  const handleUpdateNow = async () => {
    if (!canApplyPwaUpdate({ hasDirtyForms: hasDirtyUnsavedChanges() })) {
      setBlockedMessage(getPwaUpdateBlockedMessage());
      return;
    }

    setBlockedMessage('');
    await updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
    setBlockedMessage('');
  };

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[85] mx-auto max-w-xl rounded-xl border border-indigo-500/30 bg-slate-900/95 p-4 shadow-xl backdrop-blur-sm sm:left-auto"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-semibold text-white">App update ready</p>
      <p className="mt-1 text-xs text-slate-300">
        A newer version is available. Update when you are ready.
      </p>
      {blockedMessage ? (
        <p className="mt-2 text-xs text-amber-300">{blockedMessage}</p>
      ) : null}
      <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={handleDismiss}>
          Later
        </Button>
        <Button type="button" onClick={handleUpdateNow}>
          Update Now
        </Button>
      </div>
    </div>
  );
}
