import { getMemberFullName } from '@/config/memberOptions';

export const BIRTHDAY_EVENT_TYPE = 'Birthday';

export function getMemberDateOfBirth(member) {
  return member?.dob || member?.dateOfBirth || '';
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function parseValidBirthDate(value) {
  if (!value) return null;

  const text = String(value).trim();
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  let year;
  let month;
  let day;

  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    month = parseInt(isoMatch[2], 10);
    day = parseInt(isoMatch[3], 10);
  } else {
    const date = new Date(text);
    if (Number.isNaN(date.getTime())) return null;
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const testDate = new Date(year, month - 1, day);
  if (testDate.getMonth() !== month - 1 || testDate.getDate() !== day) return null;

  return { month, day };
}

function getBirthdayDateForYear(parsed, year) {
  let { month, day } = parsed;

  if (month === 2 && day === 29 && !isLeapYear(year)) {
    day = 28;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function createBirthdayEvent(member, year) {
  const parsed = parseValidBirthDate(getMemberDateOfBirth(member));
  if (!parsed) return null;

  const memberName = getMemberFullName(member) || 'Member';

  return {
    id: `birthday-${member.id}-${year}`,
    title: `${memberName}'s Birthday`,
    type: BIRTHDAY_EVENT_TYPE,
    date: getBirthdayDateForYear(parsed, year),
    isBirthday: true,
    memberId: member.id,
  };
}

export function getBirthdayEventsForYear(members = [], year) {
  return members
    .map((member) => createBirthdayEvent(member, year))
    .filter(Boolean);
}

export function getBirthdayEventsForMonth(members = [], year, monthIndex) {
  const month = monthIndex + 1;

  return getBirthdayEventsForYear(members, year).filter((event) => {
    const eventMonth = parseInt(event.date.split('-')[1], 10);
    return eventMonth === month;
  });
}

export function getBirthdayEventsForDate(members = [], dateStr) {
  if (!dateStr) return [];

  const year = parseInt(dateStr.split('-')[0], 10);
  return getBirthdayEventsForYear(members, year).filter((event) => event.date === dateStr);
}

export function mergeCalendarEvents(firestoreEvents = [], birthdayEvents = []) {
  return [...firestoreEvents, ...birthdayEvents].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    if (a.isBirthday && !b.isBirthday) return 1;
    if (!a.isBirthday && b.isBirthday) return -1;
    return a.title.localeCompare(b.title);
  });
}

export function getUpcomingBirthdays(members = [], limit = 5, referenceDate = new Date()) {
  const todayStart = new Date(referenceDate);
  todayStart.setHours(0, 0, 0, 0);

  const upcoming = members
    .map((member) => {
      const parsed = parseValidBirthDate(getMemberDateOfBirth(member));
      if (!parsed) return null;

      const currentYear = todayStart.getFullYear();
      const nextOccurrence = [currentYear, currentYear + 1]
        .map((year) => ({
          member,
          date: getBirthdayDateForYear(parsed, year),
        }))
        .map(({ member, date }) => ({
          member,
          date,
          dateObj: new Date(`${date}T00:00:00`),
        }))
        .filter(({ dateObj }) => dateObj >= todayStart)
        .sort((a, b) => a.dateObj - b.dateObj)[0];

      if (!nextOccurrence) return null;

      return {
        id: member.id,
        name: getMemberFullName(member) || 'Member',
        photo: member.photo || '',
        birthday: nextOccurrence.date,
        member: nextOccurrence.member,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.birthday.localeCompare(b.birthday))
    .slice(0, limit);

  return upcoming;
}
