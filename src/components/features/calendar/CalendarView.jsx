import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CalendarEventBar } from '@/components/features/calendar/CalendarEventBar';
import { getBirthdayEventsForMonth, mergeCalendarEvents } from '@/utils/birthdayEvents';
import {
  MAX_MULTI_DAY_LANES,
  buildEventsByDate,
  buildWeekSpanPlacements,
  formatDateKey,
  getVisibleEventSummary,
  splitCellsIntoWeeks,
} from '@/utils/calendarEventLayout';

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function buildMonthGrid(year, monthIndex) {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();
  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevYear = monthIndex === 0 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevYear, prevMonthIndex + 1, 0).getDate();
  const cells = [];

  for (let index = 0; index < startDayOfWeek; index += 1) {
    const day = daysInPrevMonth - startDayOfWeek + index + 1;
    cells.push({
      day,
      date: formatDateKey(prevYear, prevMonthIndex, day),
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      date: formatDateKey(year, monthIndex, day),
      isCurrentMonth: true,
    });
  }

  let nextMonthDay = 1;
  const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
  const nextYear = monthIndex === 11 ? year + 1 : year;

  while (cells.length < 42) {
    cells.push({
      day: nextMonthDay,
      date: formatDateKey(nextYear, nextMonthIndex, nextMonthDay),
      isCurrentMonth: false,
    });
    nextMonthDay += 1;
  }

  return cells;
}

function WeekSpanOverlay({ week, placements }) {
  if (!placements.length) return null;

  const laneCount = Math.min(
    MAX_MULTI_DAY_LANES,
    Math.max(...placements.map((placement) => placement.lane)) + 1,
  );

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-6 z-10 grid grid-cols-7 gap-x-0 px-0.5 sm:top-8 sm:px-1"
      style={{ height: `${laneCount * 1 + (laneCount - 1) * 0.125}rem` }}
    >
      {placements.map((placement) => (
        <div
          key={`${placement.event.id}-${week[0].date}-${placement.lane}`}
          className="min-w-0 px-0.5"
          style={{
            gridColumnStart: placement.colStart + 1,
            gridColumnEnd: placement.colEnd + 2,
            gridRowStart: placement.lane + 1,
          }}
        >
          <CalendarEventBar
            event={placement.event}
            showTitle={placement.showTitle}
            continuesBefore={placement.continuesBefore}
            continuesAfter={placement.continuesAfter}
            className="h-3.5 w-full sm:h-4"
          />
        </div>
      ))}
    </div>
  );
}

export default function CalendarView({
  events,
  members = [],
  onDateClick,
  selectedDate,
  onAddEvent,
  canAddEvent = false,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const todayKey = formatDateKey(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );

  const monthEvents = useMemo(() => {
    const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
    const prevYear = monthIndex === 0 ? year - 1 : year;
    const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
    const nextYear = monthIndex === 11 ? year + 1 : year;

    return mergeCalendarEvents(events, [
      ...getBirthdayEventsForMonth(members, prevYear, prevMonthIndex),
      ...getBirthdayEventsForMonth(members, year, monthIndex),
      ...getBirthdayEventsForMonth(members, nextYear, nextMonthIndex),
    ]);
  }, [events, members, monthIndex, year]);

  const eventsByDate = useMemo(
    () => buildEventsByDate(monthEvents),
    [monthEvents],
  );

  const calendarWeeks = useMemo(() => {
    const cells = buildMonthGrid(year, monthIndex).map((cell) => ({
      ...cell,
      events: eventsByDate[cell.date] || [],
      isToday: cell.date === todayKey,
      isSelected: selectedDate === cell.date,
    }));

    return splitCellsIntoWeeks(cells).map((week) => ({
      week,
      placements: buildWeekSpanPlacements(week, monthEvents),
    }));
  }, [eventsByDate, monthEvents, monthIndex, selectedDate, todayKey, year]);

  const shiftMonth = (delta) => {
    setCurrentDate(new Date(year, monthIndex + delta, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateClick?.(todayKey);
  };

  return (
    <div className="min-w-0 w-full">
      <Card className="flex flex-col overflow-hidden !p-0">
        <div className="flex flex-col gap-2 border-b border-slate-700/70 bg-slate-800/60 p-3 sm:gap-3 sm:p-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">{monthName}</h2>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-300 transition hover:border-indigo-500/40 hover:text-white cursor-pointer sm:p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={jumpToToday}
              className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 transition hover:border-indigo-500/40 hover:text-white cursor-pointer sm:px-3 sm:py-2 sm:text-[11px]"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-300 transition hover:border-indigo-500/40 hover:text-white cursor-pointer sm:p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {canAddEvent && onAddEvent ? (
              <Button icon={PlusCircle} onClick={onAddEvent} className="shrink-0">
                Add Event
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-700/70 bg-slate-900/50">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="border-r border-slate-700/50 px-1 py-1.5 text-center text-[9px] font-semibold uppercase tracking-wider text-slate-500 last:border-r-0 sm:px-2 sm:py-2.5 sm:text-[10px]"
            >
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{day.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        <div className="flex min-h-[22rem] flex-1 flex-col sm:min-h-[26rem] md:min-h-[30rem] lg:min-h-[32rem]">
          {calendarWeeks.map(({ week, placements }) => (
            <div
              key={week[0].date}
              className="relative grid min-h-[3.75rem] flex-1 grid-cols-7 border-b border-slate-700/50 last:border-b-0 sm:min-h-[4.75rem] md:min-h-[5.5rem]"
            >
              <WeekSpanOverlay week={week} placements={placements} />

              {week.map((cell, columnIndex) => {
                const multiDayCount = placements.filter(
                  (placement) => placement.colStart <= columnIndex && placement.colEnd >= columnIndex,
                ).length;
                const { visibleSingleDay, hiddenCount } = getVisibleEventSummary(
                  cell.events,
                  multiDayCount,
                );

                return (
                  <button
                    key={cell.date}
                    type="button"
                    onClick={() => onDateClick?.(cell.date)}
                    className={`
                      relative flex min-h-[3.75rem] flex-col border-r border-slate-700/50 p-1 pt-1 text-left transition
                      last:border-r-0 sm:min-h-[4.75rem] sm:p-2 sm:pt-2 md:min-h-[5.5rem]
                      ${cell.isCurrentMonth ? 'bg-slate-900/30 hover:bg-slate-800/50' : 'bg-slate-950/70 hover:bg-slate-900/60'}
                      ${cell.isToday && !cell.isSelected ? 'bg-indigo-950/35 ring-1 ring-inset ring-indigo-400/60' : ''}
                      ${cell.isSelected ? 'bg-indigo-600/20 ring-2 ring-inset ring-indigo-500' : ''}
                    `}
                  >
                    <div className="mb-0.5 flex h-5 shrink-0 items-start justify-between gap-0.5 sm:mb-1 sm:h-6 sm:gap-1">
                      <span
                        className={`
                          inline-flex h-5 min-w-5 items-center justify-center rounded-full px-0.5 text-[10px] font-semibold sm:h-6 sm:min-w-6 sm:px-1 sm:text-xs
                          ${cell.isSelected ? 'bg-indigo-600 text-white' : ''}
                          ${cell.isToday && !cell.isSelected ? 'bg-indigo-500/20 text-indigo-300' : ''}
                          ${!cell.isSelected && !cell.isToday && cell.isCurrentMonth ? 'text-slate-200' : ''}
                          ${!cell.isCurrentMonth ? 'text-slate-600' : ''}
                        `}
                      >
                        {cell.day}
                      </span>
                      {cell.isToday ? (
                        <span className="hidden rounded-full bg-indigo-500/15 px-1 py-0.5 text-[7px] font-bold uppercase tracking-wider text-indigo-300 sm:inline sm:px-1.5 sm:text-[8px]">
                          Today
                        </span>
                      ) : null}
                    </div>

                    <div
                      className="flex flex-1 flex-col gap-0.5 overflow-hidden"
                      style={{
                        paddingTop: multiDayCount > 0 ? `${multiDayCount * 1}rem` : undefined,
                      }}
                    >
                      {visibleSingleDay.map((event) => (
                        <CalendarEventBar
                          key={`${event.id}-${cell.date}`}
                          event={event}
                          className="h-3.5 w-full sm:h-4"
                        />
                      ))}
                      {hiddenCount > 0 ? (
                        <span className="text-[8px] font-medium text-slate-500 sm:text-[9px]">
                          +{hiddenCount} more
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
