import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildFormDraftStorageKey,
  clearFormDraft,
  hasRestorableDraft,
  readFormDraft,
  sanitizeDraftValues,
  writeFormDraft,
} from '@/utils/formDraftStorage';
import { areFormValuesEqual } from '@/utils/formDirtyState';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

export function useFormDraft({
  enabled = false,
  userId = '',
  formId = '',
  recordKey = 'new',
  values,
  baselineValues,
  debounceMs = 500,
  excludeFields = [],
} = {}) {
  const storageKey = useMemo(
    () => buildFormDraftStorageKey({ userId, formId, recordKey }),
    [userId, formId, recordKey],
  );

  const [pendingDraft, setPendingDraft] = useState(null);
  const latestValuesRef = useRef(values);
  const hasCheckedDraftRef = useRef(false);

  useEffect(() => {
    latestValuesRef.current = values;
  }, [values]);

  useEffect(() => {
    hasCheckedDraftRef.current = false;
    setPendingDraft(null);
  }, [storageKey]);

  useEffect(() => {
    if (!enabled) {
      hasCheckedDraftRef.current = false;
      return;
    }

    if (hasCheckedDraftRef.current) return;
    hasCheckedDraftRef.current = true;

    const draft = readFormDraft(storageKey);
    if (hasRestorableDraft(draft, baselineValues)) {
      setPendingDraft(draft);
    } else if (draft) {
      clearFormDraft(storageKey);
      setPendingDraft(null);
    }
  }, [enabled, storageKey, baselineValues]);

  useEffect(() => {
    if (!enabled || pendingDraft) return undefined;
    if (areFormValuesEqual(values, baselineValues)) return undefined;

    const timeoutId = window.setTimeout(() => {
      writeFormDraft(storageKey, {
        recordKey,
        values: sanitizeDraftValues(latestValuesRef.current, { excludeFields }),
      });
    }, debounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [
    baselineValues,
    debounceMs,
    enabled,
    excludeFields,
    pendingDraft,
    recordKey,
    storageKey,
    values,
  ]);

  const clearDraft = useCallback(() => {
    clearFormDraft(storageKey);
    setPendingDraft(null);
  }, [storageKey]);

  const restoreDraft = useCallback(() => {
    if (!pendingDraft?.values) return null;
    const restoredValues = pendingDraft.values;
    setPendingDraft(null);
    return restoredValues;
  }, [pendingDraft]);

  const dismissDraft = useCallback(() => {
    clearDraft();
  }, [clearDraft]);

  return {
    pendingDraft,
    restoreDraft,
    dismissDraft,
    clearDraft,
  };
}

export function useFormUnsavedGuard({
  isOpen = false,
  isSubmitting = false,
  userId = '',
  formId = '',
  recordKey = 'new',
  values,
  baselineValues,
  attachmentDirty = false,
  onClose,
  onDiscard,
  draftEnabled = false,
  draftDebounceMs = 500,
  excludeDraftFields = [],
} = {}) {
  const isDirty = useMemo(() => {
    if (!isOpen || isSubmitting) return false;
    if (attachmentDirty) return true;
    return !areFormValuesEqual(baselineValues, values);
  }, [attachmentDirty, baselineValues, isOpen, isSubmitting, values]);

  const draft = useFormDraft({
    enabled: draftEnabled && isOpen && Boolean(userId),
    userId,
    formId,
    recordKey,
    values,
    baselineValues,
    debounceMs: draftDebounceMs,
    excludeFields: excludeDraftFields,
  });

  const handleDiscard = useCallback(() => {
    draft.clearDraft();
    onDiscard?.();
  }, [draft, onDiscard]);

  const guard = useUnsavedChangesGuard({
    active: isOpen,
    isDirty,
    onDiscard: handleDiscard,
    onPopStateDiscard: onClose,
    formId,
  });

  const requestClose = useCallback(() => {
    guard.requestAction(onClose);
  }, [guard, onClose]);

  return {
    isDirty,
    isConfirmOpen: guard.isConfirmOpen,
    continueEditing: guard.continueEditing,
    confirmDiscard: guard.confirmDiscard,
    requestClose,
    pendingDraft: draft.pendingDraft,
    restoreDraft: draft.restoreDraft,
    dismissDraft: draft.dismissDraft,
    clearDraft: draft.clearDraft,
  };
}
