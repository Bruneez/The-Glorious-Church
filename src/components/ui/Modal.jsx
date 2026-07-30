import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const COMPACT_MODAL_WIDTHS = new Set(['max-w-sm', 'max-w-md']);
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function handleBackdropClick(event, onClose) {
  if (event.target === event.currentTarget) {
    onClose();
  }
}

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1);
}

export default function Modal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  maxWidth = 'max-w-sm',
  panelClassName = 'p-4 space-y-4',
  preventClose = false,
}) {
  const alignCenter = COMPACT_MODAL_WIDTHS.has(maxWidth);
  const titleId = useId();
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !preventClose) {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusableElements = getFocusableElements(panelRef.current);
      if (!focusableElements.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, preventClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.requestAnimationFrame(() => {
      if (!panelRef.current) return;
      const focusableElements = getFocusableElements(panelRef.current);
      (focusableElements[0] || panelRef.current).focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocusRef.current?.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-slate-950/80 backdrop-blur-sm text-xs"
      onClick={(event) => {
        if (!preventClose) {
          handleBackdropClick(event, onClose);
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className={`flex min-h-[100vh] min-h-[100dvh] w-full justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] ${
          alignCenter ? 'items-center' : 'items-start'
        }`}
        onClick={(event) => {
          if (!preventClose) {
            handleBackdropClick(event, onClose);
          }
        }}
      >
        <div
          ref={panelRef}
          tabIndex={-1}
          className={`bg-slate-800 border border-slate-700 rounded-xl w-full ${maxWidth} shadow-xl flex max-h-[min(calc(100dvh-2rem),calc(100vh-2rem))] flex-col overflow-hidden outline-none`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-700 bg-slate-800 px-4 pb-2 pt-4">
            <h3 id={titleId} className="font-bold text-white text-sm flex items-center gap-1.5">
              {Icon ? <Icon className="text-indigo-400 w-4 h-4" aria-hidden="true" /> : null}
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              disabled={preventClose}
              className="text-slate-400 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className={`min-h-0 flex-1 overflow-y-auto ${panelClassName}`}>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
