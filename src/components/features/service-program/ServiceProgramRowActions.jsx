import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

export default function ServiceProgramRowActions({
  rowIndex,
  totalRows,
  onMoveUp,
  onMoveDown,
  onDelete,
  compact = false,
}) {
  const isFirst = rowIndex === 0;
  const isLast = rowIndex === totalRows - 1;

  return (
    <div className={`flex items-center ${compact ? 'justify-start flex-wrap' : 'justify-end'} gap-1.5`}>
      <button
        type="button"
        onClick={() => onMoveUp?.(rowIndex)}
        disabled={isFirst}
        title="Move up"
        aria-label="Move row up"
        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
      >
        <ArrowUp className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onMoveDown?.(rowIndex)}
        disabled={isLast}
        title="Move down"
        aria-label="Move row down"
        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
      >
        <ArrowDown className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onDelete?.(rowIndex)}
        title="Delete row"
        aria-label="Delete row"
        className={`inline-flex items-center gap-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition ${
          compact ? 'px-2.5 py-1.5 text-[11px] font-semibold' : 'px-2 py-1.5 text-[11px] font-semibold'
        }`}
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete Row
      </button>
    </div>
  );
}
