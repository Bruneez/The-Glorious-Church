import { useCallback, useEffect, useRef, useState } from 'react';
import { registerUnsavedChangesGuard } from '@/utils/unsavedChangesRegistry';
import { logStability } from '@/utils/stabilityDebug';

export function useUnsavedChangesGuard({
  active = false,
  isDirty = false,
  onDiscard,
  onPopStateDiscard,
  formId = '',
} = {}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const pendingActionRef = useRef(null);
  const isDirtyRef = useRef(isDirty);
  const activeRef = useRef(active);
  const onDiscardRef = useRef(onDiscard);
  const onPopStateDiscardRef = useRef(onPopStateDiscard);
  const historyTrapRef = useRef(false);

  useEffect(() => {
    isDirtyRef.current = isDirty;
    activeRef.current = active;
    onDiscardRef.current = onDiscard;
    onPopStateDiscardRef.current = onPopStateDiscard;
  }, [isDirty, active, onDiscard, onPopStateDiscard]);

  const continueEditing = useCallback(() => {
    setIsConfirmOpen(false);
    pendingActionRef.current = null;
  }, []);

  const confirmDiscard = useCallback(() => {
    setIsConfirmOpen(false);
    onDiscardRef.current?.();
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  }, []);

  const requestAction = useCallback((action) => {
    if (!activeRef.current) {
      action?.();
      return;
    }

    if (!isDirtyRef.current) {
      action?.();
      return;
    }

    pendingActionRef.current = action;
    setIsConfirmOpen(true);
  }, []);

  const requestLeave = useCallback((proceed) => {
    requestAction(proceed);
  }, [requestAction]);

  useEffect(() => {
    if (!active) return undefined;

    return registerUnsavedChangesGuard({
      isActive: () => activeRef.current,
      isDirty: () => isDirtyRef.current,
      requestLeave,
    });
  }, [active, requestLeave]);

  useEffect(() => {
    if (!active || !isDirty) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [active, isDirty]);

  useEffect(() => {
    if (!active || !isDirty) {
      historyTrapRef.current = false;
      return undefined;
    }

    const trapState = { tgcUnsavedGuard: true };
    window.history.pushState(trapState, '');
    historyTrapRef.current = true;

    const handlePopState = () => {
      if (!activeRef.current || !isDirtyRef.current) return;

      window.history.pushState(trapState, '');
      pendingActionRef.current = () => {
        historyTrapRef.current = false;
        onPopStateDiscardRef.current?.();
        window.history.back();
      };
      setIsConfirmOpen(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (historyTrapRef.current) {
        historyTrapRef.current = false;
        window.history.back();
      }
    };
  }, [active, isDirty]);

  useEffect(() => {
    return () => {
      if (activeRef.current && isDirtyRef.current) {
        logStability('form.unmount.dirty', {
          formId: formId || 'unknown',
        });
      }
    };
  }, [formId]);

  return {
    isConfirmOpen,
    continueEditing,
    confirmDiscard,
    requestAction,
    requestLeave,
  };
}
