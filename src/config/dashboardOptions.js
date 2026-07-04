import { getMemberDepartment } from '@/config/memberOptions';
import { getUpcomingBirthdays } from '@/utils/birthdayEvents';

export const CREATIVE_ARTS_OVERVIEW_DEPARTMENTS = [
  'Choir',
  'Worshippers',
  'Dancing Stars',
];

export function getUpcomingEventsAndBirthdays(
  events = [],
  members = [],
  limit = 5,
  referenceDate = new Date(),
) {
  const today = referenceDate.toISOString().split('T')[0];

  const eventItems = events
    .filter((event) => event?.date && event.date >= today)
    .map((event) => ({
      id: `event-${event.id}`,
      type: 'Event',
      title: event.title || 'Untitled Event',
      date: event.date,
      time: event.time || '',
      sortTime: event.time || '23:59',
    }));

  const birthdayItems = getUpcomingBirthdays(members, members.length, referenceDate).map((entry) => ({
    id: `birthday-${entry.id}-${entry.birthday}`,
    type: 'Birthday',
    title: entry.name,
    date: entry.birthday,
    time: '',
    sortTime: '23:59',
  }));

  return [...eventItems, ...birthdayItems]
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.sortTime.localeCompare(b.sortTime);
    })
    .slice(0, limit);
}

export function computeCreativeArtsOverview(members = []) {
  return CREATIVE_ARTS_OVERVIEW_DEPARTMENTS.map((name) => ({
    name,
    memberCount: members.filter((member) => getMemberDepartment(member) === name).length,
  }));
}
