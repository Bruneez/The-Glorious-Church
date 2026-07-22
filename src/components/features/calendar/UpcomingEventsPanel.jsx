import { Calendar as CalendarIcon, Clock, Edit2, MapPin, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import UserAvatar from '@/components/ui/UserAvatar';
import { getCalendarEventStyle } from '@/config/calendarOptions';
import { formatDate, formatTime } from '@/utils/formatters';

function ScheduleEventCard({
  event,
  canManageEvent,
  onEdit,
  onDelete,
}) {
  const style = getCalendarEventStyle(event);
  const isBirthday = event.isBirthday;

  return (
    <article
      className={`relative overflow-hidden rounded-lg border transition ${
        isBirthday
          ? 'border-pink-500/20 bg-pink-950/15 hover:border-pink-500/35'
          : 'border-slate-700/60 bg-slate-900/50 hover:border-indigo-500/30'
      }`}
    >
      <div className={`absolute inset-y-0 left-0 w-1 ${style.accentClass}`} aria-hidden="true" />

      <div className="flex items-start justify-between gap-3 p-3 pl-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            {isBirthday ? (
              <UserAvatar
                name={event.memberName || event.title}
                photo={event.photo}
                size="sm"
              />
            ) : null}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="truncate text-sm font-semibold text-white">{event.title}</h4>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${style.barClass}`}
                >
                  <span aria-hidden="true">{style.icon}</span>
                  {event.type || 'Event'}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3 shrink-0 text-indigo-400" />
                  {formatDate(event.date)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3 shrink-0 text-indigo-400" />
                  {event.time ? formatTime(event.time) : isBirthday ? 'All Day' : 'All Day'}
                </span>
              </div>

              {event.location ? (
                <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin className="h-3 w-3 shrink-0 text-slate-500" />
                  <span className="truncate">{event.location}</span>
                </p>
              ) : null}

              {isBirthday ? (
                <div className="mt-2 space-y-0.5 text-[10px] text-slate-400">
                  {event.ageTurning != null ? <p>Turning {event.ageTurning} this year</p> : null}
                  {event.branch ? <p>Branch: {event.branch}</p> : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {canManageEvent?.(event) && !isBirthday ? (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => onEdit?.(event)}
              className="rounded p-1 text-indigo-400 transition hover:bg-indigo-500/10 hover:text-indigo-300"
              aria-label={`Edit ${event.title}`}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(event.id)}
              className="rounded p-1 text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
              aria-label={`Delete ${event.title}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function UpcomingEventsPanel({
  events = [],
  loading = false,
  title = 'Upcoming Events',
  selectedDate = null,
  canManageEvent,
  onEdit,
  onDelete,
  onClearSelection,
}) {
  return (
    <Card className="!p-0 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-700/70 bg-slate-800/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon className="h-4 w-4 shrink-0 text-indigo-400" />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold tracking-wide text-white">{title}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {selectedDate ? 'Events on the selected date' : 'Schedule stream in chronological order'}
            </p>
          </div>
        </div>

        {selectedDate && onClearSelection ? (
          <Button variant="secondary" onClick={onClearSelection} className="shrink-0 w-full sm:w-auto">
            Show Upcoming
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500" />
        </div>
      ) : events.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <p className="text-xs text-slate-500">
            {selectedDate ? 'No events on this date' : 'No upcoming events scheduled'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <ScheduleEventCard
              key={event.id}
              event={event}
              canManageEvent={canManageEvent}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
