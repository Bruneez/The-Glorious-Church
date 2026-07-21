import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const COMPACT_MODAL_WIDTHS = new Set(['max-w-sm', 'max-w-md']);

function handleBackdropClick(event, onClose) {
  if (event.target === event.currentTarget) {
    onClose();
  }
}

export default function Modal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  maxWidth = 'max-w-sm',
  panelClassName = 'p-4 space-y-4',
}) {
  const alignCenter = COMPACT_MODAL_WIDTHS.has(maxWidth);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-slate-950/80 backdrop-blur-sm text-xs"
      onClick={(event) => handleBackdropClick(event, onClose)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`flex min-h-[100vh] min-h-[100dvh] w-full justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] ${
          alignCenter ? 'items-center' : 'items-start'
        }`}
        onClick={(event) => handleBackdropClick(event, onClose)}
      >
        <div
          className={`bg-slate-800 border border-slate-700 rounded-xl w-full ${maxWidth} shadow-xl flex max-h-[min(calc(100dvh-2rem),calc(100vh-2rem))] flex-col overflow-hidden`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-700 bg-slate-800 px-4 pb-2 pt-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              {Icon ? <Icon className="text-indigo-400 w-4 h-4" /> : null}
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white cursor-pointer"
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
