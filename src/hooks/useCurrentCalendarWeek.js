import { useEffect, useState } from 'react';
import {
  getCalendarWeekBounds,
  msUntilNextCalendarWeekStart,
} from '@/config/timeLogOptions';

function buildWeekState(referenceDate = new Date()) {
  const { weekStart, weekEnd } = getCalendarWeekBounds(referenceDate);

  return {
    weekStart,
    weekEnd,
    weekKey: weekStart,
  };
}

export function useCurrentCalendarWeek() {
  const [weekState, setWeekState] = useState(() => buildWeekState());

  useEffect(() => {
    let timeoutId;

    const syncWeek = () => {
      setWeekState((current) => {
        const next = buildWeekState();
        return current.weekKey === next.weekKey ? current : next;
      });
    };

    const scheduleWeekRollover = () => {
      timeoutId = window.setTimeout(() => {
        syncWeek();
        scheduleWeekRollover();
      }, Math.max(msUntilNextCalendarWeekStart(), 1000));
    };

    const intervalId = window.setInterval(syncWeek, 60_000);
    scheduleWeekRollover();

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  return weekState;
}
