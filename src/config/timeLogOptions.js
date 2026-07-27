export const TIME_LOG_SUMMARY_CARD_KEYS = {
  TOTAL_HOURS: 'totalHours',
  SPIRITUAL_HOURS: 'spiritualHours',
  NATURAL_HOURS: 'naturalHours',
  TOTAL_ENTRIES: 'totalEntries',
};

export const TIME_LOG_ACTIVITY_TYPE = {
  SPIRITUAL: 'spiritual',
  NATURAL: 'natural',
};

export const TIME_LOG_ACTIVITY_OPTIONS = [
  { value: TIME_LOG_ACTIVITY_TYPE.SPIRITUAL, label: 'Spiritual' },
  { value: TIME_LOG_ACTIVITY_TYPE.NATURAL, label: 'Natural' },
];

export const TIME_LOG_PERIOD_FILTER = {
  WEEK: 'week',
  ALL: 'all',
};

export const TIME_LOG_PERIOD_OPTIONS = [
  { value: TIME_LOG_PERIOD_FILTER.WEEK, label: 'This week' },
  { value: TIME_LOG_PERIOD_FILTER.ALL, label: 'All entries' },
];

export const TIME_LOG_ACTIVITY_FILTER_ALL = 'all';

export const TIME_LOG_ACTIVITY_FILTER_OPTIONS = [
  { value: TIME_LOG_ACTIVITY_FILTER_ALL, label: 'All activity types' },
  ...TIME_LOG_ACTIVITY_OPTIONS,
];

const EMPTY_SUMMARY = {
  totalMinutes: 0,
  spiritualMinutes: 0,
  naturalMinutes: 0,
  totalEntries: 0,
  totalHours: 0,
  spiritualHours: 0,
  naturalHours: 0,
};

export function parseTimeLogDateTime(date, time) {
  if (!date || !time) return null;

  const timeValue = String(time).trim();
  if (timeValue.includes('T')) {
    const parsed = new Date(timeValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const normalizedTime = timeValue.length === 5 ? `${timeValue}:00` : timeValue;
  const parsed = new Date(`${date}T${normalizedTime}`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function computeDurationMinutes({ date, startTime, endTime }) {
  const start = parseTimeLogDateTime(date, startTime);
  const end = parseTimeLogDateTime(date, endTime);

  if (!start || !end) {
    return 0;
  }

  const differenceMs = end.getTime() - start.getTime();
  if (differenceMs <= 0) {
    return 0;
  }

  return Math.round(differenceMs / 60000);
}

export function formatDurationHours(totalMinutes = 0) {
  return Math.round((Number(totalMinutes) / 60) * 10) / 10;
}

export function formatDateOnly(referenceDate = new Date()) {
  const date = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCalendarWeekBounds(referenceDate = new Date()) {
  const date = referenceDate instanceof Date ? new Date(referenceDate) : new Date(referenceDate);

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid reference date for week calculation.');
  }

  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);

  const day = normalized.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;

  const weekStartDate = new Date(normalized);
  weekStartDate.setDate(normalized.getDate() - daysFromMonday);

  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);

  return {
    weekStart: formatDateOnly(weekStartDate),
    weekEnd: formatDateOnly(weekEndDate),
  };
}

export function isDateWithinInclusiveRange(dateValue, startDate, endDate) {
  if (!dateValue || !startDate || !endDate) return false;
  return dateValue >= startDate && dateValue <= endDate;
}

export function validateTimeLogForm(formData) {
  if (!formData?.date?.trim()) {
    return 'Date is required.';
  }

  if (!formData?.startTime?.trim()) {
    return 'Start time is required.';
  }

  if (!formData?.endTime?.trim()) {
    return 'End time is required.';
  }

  if (!formData?.activityType) {
    return 'Activity type is required.';
  }

  if (!formData?.title?.trim()) {
    return 'Title is required.';
  }

  const durationMinutes = computeDurationMinutes({
    date: formData.date,
    startTime: formData.startTime,
    endTime: formData.endTime,
  });

  if (durationMinutes <= 0) {
    return 'End time must be after start time.';
  }

  return '';
}

export function buildTimeLogPayload(
  formData,
  { userId, userName = '', recordedBy = '', existingRecord = null } = {},
) {
  const date = formData.date.trim();
  const startTime = formData.startTime.trim();
  const endTime = formData.endTime.trim();
  const durationMinutes = computeDurationMinutes({ date, startTime, endTime });

  return {
    userId: String(userId || existingRecord?.userId || '').trim(),
    userName: String(userName || existingRecord?.userName || '').trim(),
    activityType: formData.activityType,
    date,
    startTime,
    endTime,
    durationMinutes,
    title: formData.title.trim(),
    description: formData.description?.trim() || '',
    recordedBy: String(existingRecord?.recordedBy || recordedBy || userId || '').trim(),
  };
}

export function computeTimeLogSummary(logs = []) {
  if (!logs.length) {
    return { ...EMPTY_SUMMARY };
  }

  const summary = logs.reduce(
    (accumulator, log) => {
      const durationMinutes = Number(log?.durationMinutes) || 0;

      accumulator.totalMinutes += durationMinutes;
      accumulator.totalEntries += 1;

      if (log?.activityType === TIME_LOG_ACTIVITY_TYPE.SPIRITUAL) {
        accumulator.spiritualMinutes += durationMinutes;
      }

      if (log?.activityType === TIME_LOG_ACTIVITY_TYPE.NATURAL) {
        accumulator.naturalMinutes += durationMinutes;
      }

      return accumulator;
    },
    {
      totalMinutes: 0,
      spiritualMinutes: 0,
      naturalMinutes: 0,
      totalEntries: 0,
    },
  );

  return {
    ...summary,
    totalHours: formatDurationHours(summary.totalMinutes),
    spiritualHours: formatDurationHours(summary.spiritualMinutes),
    naturalHours: formatDurationHours(summary.naturalMinutes),
  };
}

export function getTimeLogSummaryCards(summary = EMPTY_SUMMARY) {
  return [
    {
      key: TIME_LOG_SUMMARY_CARD_KEYS.TOTAL_HOURS,
      label: 'Total Hours',
      value: summary.totalHours,
    },
    {
      key: TIME_LOG_SUMMARY_CARD_KEYS.SPIRITUAL_HOURS,
      label: 'Spiritual Hours',
      value: summary.spiritualHours,
    },
    {
      key: TIME_LOG_SUMMARY_CARD_KEYS.NATURAL_HOURS,
      label: 'Natural Hours',
      value: summary.naturalHours,
    },
    {
      key: TIME_LOG_SUMMARY_CARD_KEYS.TOTAL_ENTRIES,
      label: 'Total Entries',
      value: summary.totalEntries,
    },
  ];
}

export function filterTimeLogsForWeek(logs = [], referenceDate = new Date()) {
  const { weekStart, weekEnd } = getCalendarWeekBounds(referenceDate);

  return logs.filter((log) => isDateWithinInclusiveRange(log?.date, weekStart, weekEnd));
}

export function getCurrentWeekKey(referenceDate = new Date()) {
  return getCalendarWeekBounds(referenceDate).weekStart;
}

export function getTimeLogWeekReferenceDate(weekStart) {
  if (!weekStart) {
    return new Date();
  }

  const [year, month, day] = weekStart.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function msUntilNextCalendarWeekStart(referenceDate = new Date()) {
  const { weekEnd } = getCalendarWeekBounds(referenceDate);
  const [year, month, day] = weekEnd.split('-').map(Number);
  const nextWeekStart = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

  return Math.max(nextWeekStart.getTime() - Date.now(), 0);
}

export function computeCurrentWeekTimeLogSummary(logs = [], referenceDate = new Date()) {
  const { weekStart, weekEnd } = getCalendarWeekBounds(referenceDate);
  const weekLogs = filterTimeLogsForWeek(logs, referenceDate);

  return {
    weekStart,
    weekEnd,
    weekKey: weekStart,
    ...computeTimeLogSummary(weekLogs),
  };
}

export function isTimeLogModuleEligibleStaff(member) {
  if (member?.status === 'Inactive') return false;
  if (member?.timeLogModuleEnabled === false) return false;
  return true;
}

export function filterTimeLogEligibleStaff(staff = []) {
  return staff.filter(isTimeLogModuleEligibleStaff);
}

export function getTimeLogModuleExcludedStaff(staff = []) {
  return staff
    .filter((member) => member?.timeLogModuleEnabled === false)
    .sort((left, right) => {
      const nameA = (left.fullName || left.name || '').toLowerCase();
      const nameB = (right.fullName || right.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
}

export function filterTimeLogsForEligibleStaff(staff = [], logs = []) {
  const eligibleUserIds = new Set(filterTimeLogEligibleStaff(staff).map((member) => member.id));

  return logs.filter((log) => eligibleUserIds.has(log.userId));
}

export function buildStaffTimeLogOverview(
  staff = [],
  logs = [],
  searchTerm = '',
  referenceDate = new Date(),
) {
  const weekLogs = filterTimeLogsForWeek(logs, referenceDate);
  const term = searchTerm.trim().toLowerCase();

  return filterTimeLogEligibleStaff(staff)
    .map((member) => {
      const userLogs = weekLogs.filter((log) => log.userId === member.id);
      const summary = computeTimeLogSummary(userLogs);

      return {
        key: member.id,
        id: member.id,
        userId: member.id,
        name: member.fullName || member.name || 'Unknown',
        role: member.role || '',
        photo: member.photo || '',
        ...summary,
      };
    })
    .filter((entry) => {
      if (!term) return true;

      return entry.name.toLowerCase().includes(term);
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getTimeLogActivityTypeLabel(activityType) {
  const match = TIME_LOG_ACTIVITY_OPTIONS.find((option) => option.value === activityType);
  return match?.label || activityType || 'Unknown';
}

export function formatTimeLogDisplayTime(timeValue) {
  if (!timeValue) return '—';

  const value = String(timeValue).trim();

  if (value.includes('T')) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  return value.length >= 5 ? value.slice(0, 5) : value;
}

export function normalizeTimeLogInputTime(timeValue) {
  if (!timeValue) return '';

  const value = String(timeValue).trim();

  if (value.includes('T')) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      const hours = String(parsed.getHours()).padStart(2, '0');
      const minutes = String(parsed.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  }

  return value.length >= 5 ? value.slice(0, 5) : value;
}

export function buildTimeLogFormDataFromRecord(record) {
  if (!record) return null;

  return {
    activityType: record.activityType || TIME_LOG_ACTIVITY_TYPE.SPIRITUAL,
    date: record.date || '',
    startTime: normalizeTimeLogInputTime(record.startTime),
    endTime: normalizeTimeLogInputTime(record.endTime),
    title: record.title || '',
    description: record.description || '',
  };
}

export function sortTimeLogEntries(logs = []) {
  return [...logs].sort((left, right) => {
    const dateCompare = String(right?.date || '').localeCompare(String(left?.date || ''));

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return String(right?.startTime || '').localeCompare(String(left?.startTime || ''));
  });
}

export function filterUserTimeLogEntries(
  logs = [],
  {
    searchTerm = '',
    activityType = TIME_LOG_ACTIVITY_FILTER_ALL,
    period = TIME_LOG_PERIOD_FILTER.WEEK,
    referenceDate = new Date(),
  } = {},
) {
  const term = searchTerm.trim().toLowerCase();
  let filtered = logs;

  if (period === TIME_LOG_PERIOD_FILTER.WEEK) {
    filtered = filterTimeLogsForWeek(filtered, referenceDate);
  }

  if (activityType && activityType !== TIME_LOG_ACTIVITY_FILTER_ALL) {
    filtered = filtered.filter((log) => log?.activityType === activityType);
  }

  if (!term) {
    return sortTimeLogEntries(filtered);
  }

  return sortTimeLogEntries(
    filtered.filter((log) => {
      const title = String(log?.title || '').toLowerCase();
      const description = String(log?.description || '').toLowerCase();
      const date = String(log?.date || '').toLowerCase();

      return title.includes(term) || description.includes(term) || date.includes(term);
    }),
  );
}
