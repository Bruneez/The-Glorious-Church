import { getCalendarEventStyle } from '@/config/calendarOptions';

export function CalendarEventBar({
  event,
  showTitle = true,
  continuesBefore = false,
  continuesAfter = false,
  className = '',
}) {
  const style = getCalendarEventStyle(event);
  const radiusClasses = [
    continuesBefore ? 'rounded-l-none' : 'rounded-l-md',
    continuesAfter ? 'rounded-r-none' : 'rounded-r-md',
  ].join(' ');

  return (
    <div
      className={`flex min-w-0 items-center gap-0.5 border px-1 py-0.5 text-[8px] font-semibold leading-tight sm:gap-1 sm:px-1.5 sm:text-[9px] ${style.barClass} ${radiusClasses} ${className}`}
      title={event.title}
    >
      <span className={`h-1 w-1 shrink-0 rounded-full sm:h-1.5 sm:w-1.5 ${style.accentClass}`} aria-hidden="true" />
      {showTitle ? (
        <>
          <span className="shrink-0" aria-hidden="true">
            {style.icon}
          </span>
          <span className="truncate">{event.title}</span>
        </>
      ) : (
        <span className="sr-only">{event.title}</span>
      )}
    </div>
  );
}
