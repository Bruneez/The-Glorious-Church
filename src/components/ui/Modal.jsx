import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import UnsavedChangesDialog from '@/components/ui/UnsavedChangesDialog';
import { hasOpenModals, isTopModal, registerModal } from '@/utils/modalStack';
import { logStability } from '@/utils/stabilityDebug';

const COMPACT_MODAL_WIDTHS = new Set(['max-w-sm', 'max-w-md']);
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1);
}

function resolveModalOptions({
  variant = 'default',
  closeOnBackdrop,
  closeOnEscape,
  confirmBeforeClose,
}) {
  const isFormVariant = variant === 'form';

  return {
    closeOnBackdrop: closeOnBackdrop ?? !isFormVariant,
    closeOnEscape: closeOnEscape ?? true,
    confirmBeforeClose: confirmBeforeClose ?? isFormVariant,
  };
}

export default function Modal({
  isOpen,
  onClose,
  onRequestClose,
  title,
  icon: Icon,
  children,
  maxWidth = 'max-w-sm',
  panelClassName = 'p-4 space-y-4',
  variant = 'default',
  preventClose = false,
  closeOnBackdrop,
  closeOnEscape,
  confirmBeforeClose,
  isDirty = false,
}) {
  const modalOptions = resolveModalOptions({
    variant,
    closeOnBackdrop,
    closeOnEscape,
    confirmBeforeClose,
  });

  const alignCenter = COMPACT_MODAL_WIDTHS.has(maxWidth);
  const titleId = useId();
  const modalId = useId();
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);
  const [hasInteraction, setHasInteraction] = useState(false);
  const onCloseRef = useRef(onClose);
  const onRequestCloseRef = useRef(onRequestClose);
  const backdropPointerRef = useRef(null);
  const preventCloseRef = useRef(preventClose);
  const isDirtyRef = useRef(isDirty);
  const hasInteractionRef = useRef(false);
  const confirmBeforeCloseRef = useRef(modalOptions.confirmBeforeClose);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onRequestCloseRef.current = onRequestClose;
  }, [onRequestClose]);

  useEffect(() => {
    preventCloseRef.current = preventClose;
    isDirtyRef.current = isDirty;
    hasInteractionRef.current = hasInteraction;
    confirmBeforeCloseRef.current = modalOptions.confirmBeforeClose;
  }, [preventClose, isDirty, hasInteraction, modalOptions.confirmBeforeClose]);

  useEffect(() => {
    if (!isOpen) {
      setHasInteraction(false);
      setIsDiscardConfirmOpen(false);
      backdropPointerRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (wasOpenRef.current && !isOpen && isDirtyRef.current) {
      logStability('modal.closed_while_dirty', {
        title: title || 'untitled',
        reason: 'external',
      });
    }

    wasOpenRef.current = isOpen;
  }, [isOpen, title]);

  const executeClose = (reason = 'programmatic') => {
    if (typeof onRequestCloseRef.current === 'function') {
      onRequestCloseRef.current();
      return;
    }

    onCloseRef.current?.();
  };

  const requestClose = (reason = 'unknown') => {
    if (preventCloseRef.current) return;

    if (typeof onRequestCloseRef.current === 'function') {
      onRequestCloseRef.current();
      return;
    }

    const shouldConfirm =
      confirmBeforeCloseRef.current && (isDirtyRef.current || hasInteractionRef.current);

    if (shouldConfirm) {
      logStability('modal.close.blocked_dirty', {
        title: title || 'untitled',
        reason,
      });
      setIsDiscardConfirmOpen(true);
      return;
    }

    executeClose(reason);
  };

  const handleContinueEditing = () => {
    setIsDiscardConfirmOpen(false);
  };

  const handleDiscardChanges = () => {
    setIsDiscardConfirmOpen(false);
    executeClose();
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    return registerModal(modalId);
  }, [isOpen, modalId]);

  useEffect(() => {
    if (!isOpen || !modalOptions.closeOnEscape) return undefined;

    function handleKeyDown(event) {
      if (event.key !== 'Escape') return;
      if (!isTopModal(modalId)) return;

      event.preventDefault();
      event.stopPropagation();
      requestClose('escape');
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, modalId, modalOptions.closeOnEscape]);

  useEffect(() => {
    if (!isOpen) return undefined;

    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    window.requestAnimationFrame(() => {
      if (!panelRef.current) return;
      const focusableElements = getFocusableElements(panelRef.current);
      (focusableElements[0] || panelRef.current).focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      if (previousFocusRef.current?.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  const handleBackdropPointerDown = (event) => {
    if (!modalOptions.closeOnBackdrop || preventClose) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    backdropPointerRef.current = {
      pointerId: event.pointerId,
      target: event.currentTarget,
    };
  };

  const handleBackdropPointerUp = (event) => {
    if (!modalOptions.closeOnBackdrop || preventClose) return;

    const start = backdropPointerRef.current;
    backdropPointerRef.current = null;

    if (!start || start.pointerId !== event.pointerId) return;
    if (start.target !== event.currentTarget) return;
    if (event.currentTarget !== event.target) return;

    requestClose('backdrop');
  };

  const handleBackdropPointerCancel = () => {
    backdropPointerRef.current = null;
  };

  const markInteraction = () => {
    if (!hasInteractionRef.current) {
      hasInteractionRef.current = true;
      setHasInteraction(true);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[70] overflow-hidden touch-none text-xs"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        aria-hidden="true"
        onPointerDown={handleBackdropPointerDown}
        onPointerUp={handleBackdropPointerUp}
        onPointerCancel={handleBackdropPointerCancel}
      />

      <div
        className={`relative z-10 flex h-[100dvh] w-full justify-center overflow-hidden px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] ${
          alignCenter ? 'items-center' : 'items-start'
        }`}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div
          ref={panelRef}
          tabIndex={-1}
          className={`bg-slate-800 border border-slate-700 rounded-xl w-full ${maxWidth} shadow-xl flex max-h-[min(calc(100dvh-2rem),calc(100vh-2rem))] flex-col overflow-hidden outline-none touch-auto`}
          onPointerDown={(event) => event.stopPropagation()}
          onInputCapture={markInteraction}
          onChangeCapture={markInteraction}
        >
          <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-700 bg-slate-800 px-4 pb-2 pt-4">
            <h3 id={titleId} className="font-bold text-white text-sm flex items-center gap-1.5">
              {Icon ? <Icon className="text-indigo-400 w-4 h-4" aria-hidden="true" /> : null}
              {title}
            </h3>
            <button
              type="button"
              onClick={() => requestClose('close_button')}
              disabled={preventClose}
              className="text-slate-400 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${panelClassName}`}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {children}
          </div>
        </div>
      </div>
      </div>

      <UnsavedChangesDialog
        isOpen={isDiscardConfirmOpen}
        onContinueEditing={handleContinueEditing}
        onDiscard={handleDiscardChanges}
      />
    </>,
    document.body,
  );
}

export { hasOpenModals };
