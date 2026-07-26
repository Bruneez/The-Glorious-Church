import { ArrowDown, ArrowUp } from 'lucide-react';
import { SORT_DIRECTION } from '@/utils/tableSort';

function SortDirectionButton({
  direction,
  isActive,
  ariaLabel,
  onClick,
}) {
  const Icon = direction === SORT_DIRECTION.ASC ? ArrowUp : ArrowDown;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      className={`inline-flex items-center justify-center rounded-md touch-manipulation transition-colors
        min-w-11 min-h-11 p-2
        sm:min-w-10 sm:min-h-10 sm:p-1.5
        md:min-w-7 md:min-h-7 md:p-1
        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900
        ${
          isActive
            ? 'text-indigo-400 hover:text-indigo-300'
            : 'text-slate-500 hover:text-slate-300'
        }`}
    >
      <Icon className="w-3.5 h-3.5 md:w-3 md:h-3 shrink-0" aria-hidden="true" />
    </button>
  );
}

export default function TableColumnSortControls({
  columnKey,
  activeColumn,
  activeDirection,
  onSort,
  ascendingLabel = 'Sort ascending',
  descendingLabel = 'Sort descending',
  className = '',
}) {
  const isActiveColumn = activeColumn === columnKey;

  return (
    <span
      className={`inline-flex items-center gap-0.5 shrink-0 align-middle ${className}`.trim()}
    >
      <SortDirectionButton
        direction={SORT_DIRECTION.ASC}
        isActive={isActiveColumn && activeDirection === SORT_DIRECTION.ASC}
        ariaLabel={ascendingLabel}
        onClick={() => onSort(columnKey, SORT_DIRECTION.ASC)}
      />
      <SortDirectionButton
        direction={SORT_DIRECTION.DESC}
        isActive={isActiveColumn && activeDirection === SORT_DIRECTION.DESC}
        ariaLabel={descendingLabel}
        onClick={() => onSort(columnKey, SORT_DIRECTION.DESC)}
      />
    </span>
  );
}
