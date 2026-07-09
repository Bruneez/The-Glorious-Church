export const MAX_SINGLE_DAY_EVENTS = 3;
export const MAX_MULTI_DAY_LANES = 2;

export function formatDateKey(year, monthIndex, day) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function normalizeEventSpan(event) {
  const startDate = event?.date || '';
  const rawEndDate = event?.endDate || startDate;
  const endDate = rawEndDate && rawEndDate >= startDate ? rawEndDate : startDate;

  return {
    ...event,
    startDate,
    endDate,
    isMultiDay: !event?.isBirthday && startDate !== endDate,
  };
}

export function isMultiDayEvent(event) {
  return normalizeEventSpan(event).isMultiDay;
}

export function eventOccursOnDate(event, dateKey) {
  const { startDate, endDate } = normalizeEventSpan(event);
  if (!startDate || !dateKey) return false;
  return dateKey >= startDate && dateKey <= endDate;
}

export function getDatesInSpan(startDate, endDate) {
  if (!startDate) return [];

  const dates = [];
  const current = parseDateKey(startDate);
  const end = parseDateKey(endDate || startDate);

  while (current <= end) {
    dates.push(formatDateKey(current.getFullYear(), current.getMonth(), current.getDate()));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function buildEventsByDate(events = []) {
  const map = {};

  events.forEach((event) => {
    const span = normalizeEventSpan(event);
    const dates = span.isBirthday || !span.isMultiDay
      ? [span.startDate]
      : getDatesInSpan(span.startDate, span.endDate);

    dates.forEach((dateKey) => {
      if (!dateKey) return;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(span);
    });
  });

  return map;
}

export function splitCellsIntoWeeks(cells = []) {
  const weeks = [];

  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return weeks;
}

function clampColumnIndex(week, dateKey) {
  const index = week.findIndex((cell) => cell.date === dateKey);
  if (index >= 0) return index;

  if (dateKey < week[0].date) return 0;
  if (dateKey > week[6].date) return 6;
  return 0;
}

export function buildWeekSpanPlacements(week = [], events = []) {
  const weekStart = week[0]?.date;
  const weekEnd = week[6]?.date;

  if (!weekStart || !weekEnd) return [];

  const spanningEvents = events
    .map(normalizeEventSpan)
    .filter((event) => event.isMultiDay && event.startDate <= weekEnd && event.endDate >= weekStart)
    .sort((a, b) => {
      const startCompare = a.startDate.localeCompare(b.startDate);
      if (startCompare !== 0) return startCompare;
      return b.endDate.localeCompare(a.endDate);
    });

  const laneEndColumns = [];
  const placements = [];

  spanningEvents.forEach((event) => {
    const visibleStartDate = event.startDate < weekStart ? weekStart : event.startDate;
    const visibleEndDate = event.endDate > weekEnd ? weekEnd : event.endDate;
    const colStart = clampColumnIndex(week, visibleStartDate);
    const colEnd = clampColumnIndex(week, visibleEndDate);

    let lane = laneEndColumns.findIndex((laneEnd) => laneEnd < colStart);
    if (lane === -1) {
      lane = laneEndColumns.length;
      laneEndColumns.push(colEnd);
    } else {
      laneEndColumns[lane] = colEnd;
    }

    if (lane >= MAX_MULTI_DAY_LANES) {
      return;
    }

    const naturalStartCol = event.startDate < weekStart
      ? 0
      : clampColumnIndex(week, event.startDate);

    placements.push({
      event,
      colStart,
      colEnd,
      lane,
      showTitle: colStart === naturalStartCol,
      continuesBefore: event.startDate < weekStart,
      continuesAfter: event.endDate > weekEnd,
    });
  });

  return placements;
}

export function getSingleDayEventsForCell(events = []) {
  return events.filter((event) => !event.isMultiDay);
}

export function getVisibleEventSummary(events = [], multiDayCount = 0) {
  const singleDayEvents = getSingleDayEventsForCell(events);
  const singleDayVisible = Math.max(0, MAX_SINGLE_DAY_EVENTS - multiDayCount);
  const visibleSingleDay = singleDayEvents.slice(0, singleDayVisible);
  const visibleCount = multiDayCount + visibleSingleDay.length;
  const hiddenCount = Math.max(0, events.length - visibleCount);

  return {
    visibleSingleDay,
    hiddenCount,
  };
}

/** Sorts calendar items by date, then time, with birthdays after timed events on the same day. */
export function sortCalendarEventsChronologically(events = []) {
  return [...events].sort((a, b) => {
    const dateCompare = (a.date || '').localeCompare(b.date || '');
    if (dateCompare !== 0) return dateCompare;

    const timeA = a.time || (a.isBirthday ? '23:59' : '00:00');
    const timeB = b.time || (b.isBirthday ? '23:59' : '00:00');
    const timeCompare = timeA.localeCompare(timeB);
    if (timeCompare !== 0) return timeCompare;

    if (a.isBirthday && !b.isBirthday) return 1;
    if (!a.isBirthday && b.isBirthday) return -1;
    return (a.title || '').localeCompare(b.title || '');
  });
}
