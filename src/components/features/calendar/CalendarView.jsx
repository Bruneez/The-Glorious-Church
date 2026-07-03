import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import Card from '@/components/ui/Card';
import { getBirthdayEventsForMonth, mergeCalendarEvents } from '@/utils/birthdayEvents';

export default function CalendarView({ events, members = [], onDateClick, selectedDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const displayEvents = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const birthdayEvents = getBirthdayEventsForMonth(members, year, month);
    return mergeCalendarEvents(events, birthdayEvents);
  }, [currentDate, events, members]);

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const days = [];
    let day = 1;
    
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startingDay) {
          week.push(null);
        } else if (day > totalDays) {
          week.push(null);
        } else {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = displayEvents.filter(e => e.date === dateStr);
          week.push({
            day,
            date: dateStr,
            events: dayEvents,
            isToday: new Date().toDateString() === new Date(year, month, day).toDateString(),
            isSelected: selectedDate === dateStr
          });
          day++;
        }
      }
      days.push(week);
      if (day > totalDays) break;
    }
    
    return { monthName, days };
  }, [currentDate, displayEvents, selectedDate]);

  const shiftMonth = (delta) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="flex flex-col">
      <div className="p-4 border-b border-slate-700/70 bg-slate-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">{calendarData.monthName}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => shiftMonth(-1)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:text-white transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={jumpToToday}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-medium hover:text-white transition cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={() => shiftMonth(1)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:text-white transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 flex-1">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[10px] font-semibold text-slate-500 uppercase">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarData.days.map((week, weekIndex) => (
            week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                onClick={() => day && onDateClick(day.date)}
                className={`
                  aspect-square p-1 rounded-lg text-center cursor-pointer transition
                  ${day ? 'hover:bg-slate-700/50' : ''}
                  ${day?.isToday ? 'bg-indigo-600/20 border border-indigo-500/30' : ''}
                  ${day?.isSelected ? 'bg-indigo-600 border border-indigo-500' : ''}
                `}
              >
                {day ? (
                  <>
                    <span className={`text-xs font-medium ${day.isSelected ? 'text-white' : day.isToday ? 'text-indigo-400' : 'text-slate-300'}`}>
                      {day.day}
                    </span>
                    {day.events.length > 0 && (
                      <div className="flex justify-center gap-0.5 mt-0.5">
                        {day.events.slice(0, 2).map((event, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-full ${
                              event.isBirthday ? 'bg-pink-400' : 'bg-indigo-400'
                            }`}
                          />
                        ))}
                        {day.events.length > 2 && <div className="w-1 h-1 rounded-full bg-slate-500"></div>}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            ))
          ))}
        </div>
      </div>
    </Card>
  );
}
