import { BIRTHDAY_EVENT_TYPE } from '@/utils/birthdayEvents';

export const CALENDAR_EVENT_TYPE_STYLES = {
  Service: {
    icon: '⛪',
    barClass: 'bg-indigo-500/25 text-indigo-100 border-indigo-400/35',
    accentClass: 'bg-indigo-500',
  },
  Meeting: {
    icon: '🤝',
    barClass: 'bg-violet-500/25 text-violet-100 border-violet-400/35',
    accentClass: 'bg-violet-500',
  },
  Event: {
    icon: '📅',
    barClass: 'bg-sky-500/25 text-sky-100 border-sky-400/35',
    accentClass: 'bg-sky-500',
  },
  Conference: {
    icon: '🎤',
    barClass: 'bg-amber-500/25 text-amber-100 border-amber-400/35',
    accentClass: 'bg-amber-500',
  },
  Outreach: {
    icon: '🌍',
    barClass: 'bg-emerald-500/25 text-emerald-100 border-emerald-400/35',
    accentClass: 'bg-emerald-500',
  },
  [BIRTHDAY_EVENT_TYPE]: {
    icon: '🎂',
    barClass: 'bg-pink-500/25 text-pink-100 border-pink-400/35',
    accentClass: 'bg-pink-500',
  },
};

const DEFAULT_EVENT_STYLE = {
  icon: '📌',
  barClass: 'bg-indigo-500/25 text-indigo-100 border-indigo-400/35',
  accentClass: 'bg-indigo-500',
};

export function getCalendarEventStyle(event) {
  if (event?.isBirthday) {
    return CALENDAR_EVENT_TYPE_STYLES[BIRTHDAY_EVENT_TYPE];
  }

  return CALENDAR_EVENT_TYPE_STYLES[event?.type] || DEFAULT_EVENT_STYLE;
}
