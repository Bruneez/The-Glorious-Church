import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TIME_LOG_ACTIVITY_TYPE,
  TIME_LOG_ACTIVITY_FILTER_ALL,
  TIME_LOG_PERIOD_FILTER,
  buildStaffTimeLogOverview,
  buildTimeLogFormDataFromRecord,
  buildTimeLogPayload,
  computeCurrentWeekTimeLogSummary,
  computeDurationMinutes,
  computeTimeLogSummary,
  filterTimeLogsForEligibleStaff,
  filterTimeLogsForWeek,
  filterUserTimeLogEntries,
  formatDurationHours,
  getCalendarWeekBounds,
  getCurrentWeekKey,
  getTimeLogModuleExcludedStaff,
  msUntilNextCalendarWeekStart,
  validateTimeLogForm,
} from './timeLogOptions.js';

test('computeDurationMinutes calculates minutes between start and end time', () => {
  assert.equal(
    computeDurationMinutes({
      date: '2026-07-27',
      startTime: '09:00',
      endTime: '11:30',
    }),
    150,
  );
});

test('buildTimeLogPayload stores computed duration and normalized fields', () => {
  const payload = buildTimeLogPayload(
    {
      date: '2026-07-27',
      startTime: '09:00',
      endTime: '10:00',
      activityType: TIME_LOG_ACTIVITY_TYPE.SPIRITUAL,
      title: 'Prayer',
      description: 'Morning prayer',
    },
    { userId: 'staff-1', userName: 'Jane Doe', recordedBy: 'staff-1' },
  );

  assert.equal(payload.userId, 'staff-1');
  assert.equal(payload.durationMinutes, 60);
  assert.equal(payload.activityType, TIME_LOG_ACTIVITY_TYPE.SPIRITUAL);
  assert.equal(payload.title, 'Prayer');
});

test('validateTimeLogForm rejects end time before start time', () => {
  const message = validateTimeLogForm({
    date: '2026-07-27',
    startTime: '12:00',
    endTime: '11:00',
    activityType: TIME_LOG_ACTIVITY_TYPE.NATURAL,
    title: 'Admin',
  });

  assert.equal(message, 'End time must be after start time.');
});

test('computeTimeLogSummary aggregates weekly totals by activity type', () => {
  const summary = computeTimeLogSummary([
    {
      activityType: TIME_LOG_ACTIVITY_TYPE.SPIRITUAL,
      durationMinutes: 60,
    },
    {
      activityType: TIME_LOG_ACTIVITY_TYPE.NATURAL,
      durationMinutes: 90,
    },
    {
      activityType: TIME_LOG_ACTIVITY_TYPE.SPIRITUAL,
      durationMinutes: 30,
    },
  ]);

  assert.equal(summary.totalEntries, 3);
  assert.equal(summary.totalMinutes, 180);
  assert.equal(summary.spiritualMinutes, 90);
  assert.equal(summary.naturalMinutes, 90);
  assert.equal(summary.totalHours, formatDurationHours(180));
});

test('getCalendarWeekBounds returns Monday through Sunday range', () => {
  const bounds = getCalendarWeekBounds(new Date('2026-07-27T12:00:00'));

  assert.equal(bounds.weekStart, '2026-07-27');
  assert.equal(bounds.weekEnd, '2026-08-02');
});

test('filterTimeLogsForWeek keeps only logs within the current week', () => {
  const logs = filterTimeLogsForWeek(
    [
      { date: '2026-07-26', durationMinutes: 30 },
      { date: '2026-07-27', durationMinutes: 60 },
      { date: '2026-08-03', durationMinutes: 45 },
    ],
    new Date('2026-07-27T12:00:00'),
  );

  assert.equal(logs.length, 1);
  assert.equal(logs[0].durationMinutes, 60);
});

test('buildStaffTimeLogOverview aggregates current week stats per eligible staff member', () => {
  const referenceDate = new Date('2026-07-27T12:00:00');
  const overview = buildStaffTimeLogOverview(
    [
      { id: 'staff-1', fullName: 'Jane Doe', role: 'Pastor', status: 'Active' },
      { id: 'staff-2', fullName: 'John Smith', role: 'Admin', status: 'Inactive' },
      { id: 'staff-3', fullName: 'Hidden User', role: 'Admin', timeLogModuleEnabled: false },
    ],
    [
      {
        userId: 'staff-1',
        date: '2026-07-27',
        activityType: TIME_LOG_ACTIVITY_TYPE.SPIRITUAL,
        durationMinutes: 60,
      },
      {
        userId: 'staff-1',
        date: '2026-07-28',
        activityType: TIME_LOG_ACTIVITY_TYPE.NATURAL,
        durationMinutes: 30,
      },
      {
        userId: 'staff-2',
        date: '2026-07-27',
        activityType: TIME_LOG_ACTIVITY_TYPE.NATURAL,
        durationMinutes: 120,
      },
      {
        userId: 'staff-1',
        date: '2026-08-03',
        activityType: TIME_LOG_ACTIVITY_TYPE.SPIRITUAL,
        durationMinutes: 45,
      },
    ],
    '',
    referenceDate,
  );

  assert.equal(overview.length, 1);
  assert.equal(overview[0].name, 'Jane Doe');
  assert.equal(overview[0].totalEntries, 2);
  assert.equal(overview[0].totalMinutes, 90);
  assert.equal(overview[0].spiritualMinutes, 60);
  assert.equal(overview[0].naturalMinutes, 30);
});

test('getTimeLogModuleExcludedStaff returns staff hidden from the Time Log module', () => {
  const excluded = getTimeLogModuleExcludedStaff([
    { id: 'staff-1', fullName: 'Jane Doe', timeLogModuleEnabled: true },
    { id: 'staff-2', fullName: 'Hidden User', timeLogModuleEnabled: false },
  ]);

  assert.equal(excluded.length, 1);
  assert.equal(excluded[0].id, 'staff-2');
});

test('filterTimeLogsForEligibleStaff keeps logs for module participants only', () => {
  const staff = [
    { id: 'staff-1', status: 'Active' },
    { id: 'staff-2', status: 'Active', timeLogModuleEnabled: false },
  ];
  const logs = [
    { userId: 'staff-1', durationMinutes: 60 },
    { userId: 'staff-2', durationMinutes: 30 },
  ];

  const filtered = filterTimeLogsForEligibleStaff(staff, logs);

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].userId, 'staff-1');
});

test('filterUserTimeLogEntries applies search, activity, and period filters', () => {
  const logs = [
    {
      date: '2026-07-27',
      title: 'Prayer',
      activityType: TIME_LOG_ACTIVITY_TYPE.SPIRITUAL,
      startTime: '09:00',
    },
    {
      date: '2026-07-28',
      title: 'Admin work',
      activityType: TIME_LOG_ACTIVITY_TYPE.NATURAL,
      startTime: '10:00',
    },
    {
      date: '2026-08-03',
      title: 'Next week',
      activityType: TIME_LOG_ACTIVITY_TYPE.SPIRITUAL,
      startTime: '08:00',
    },
  ];

  const weekOnly = filterUserTimeLogEntries(logs, {
    period: TIME_LOG_PERIOD_FILTER.WEEK,
    referenceDate: new Date('2026-07-27T12:00:00'),
  });

  assert.equal(weekOnly.length, 2);

  const spiritualOnly = filterUserTimeLogEntries(logs, {
    period: TIME_LOG_PERIOD_FILTER.ALL,
    activityType: TIME_LOG_ACTIVITY_TYPE.SPIRITUAL,
  });

  assert.equal(spiritualOnly.length, 2);

  const searchMatches = filterUserTimeLogEntries(logs, {
    period: TIME_LOG_PERIOD_FILTER.ALL,
    searchTerm: 'admin',
  });

  assert.equal(searchMatches.length, 1);
  assert.equal(searchMatches[0].title, 'Admin work');
});

test('buildTimeLogFormDataFromRecord normalizes stored times for form inputs', () => {
  const formData = buildTimeLogFormDataFromRecord({
    activityType: TIME_LOG_ACTIVITY_TYPE.NATURAL,
    date: '2026-07-27',
    startTime: '09:00:00',
    endTime: '2026-07-27T11:30:00',
    title: 'Admin work',
    description: 'Weekly planning',
  });

  assert.equal(formData.activityType, TIME_LOG_ACTIVITY_TYPE.NATURAL);
  assert.equal(formData.date, '2026-07-27');
  assert.equal(formData.startTime, '09:00');
  assert.match(formData.endTime, /^11:30$/);
  assert.equal(formData.title, 'Admin work');
  assert.equal(formData.description, 'Weekly planning');
});

test('computeCurrentWeekTimeLogSummary calculates current week totals only', () => {
  const logs = [
    {
      date: '2026-07-27',
      activityType: TIME_LOG_ACTIVITY_TYPE.SPIRITUAL,
      durationMinutes: 60,
    },
    {
      date: '2026-07-28',
      activityType: TIME_LOG_ACTIVITY_TYPE.NATURAL,
      durationMinutes: 30,
    },
    {
      date: '2026-08-03',
      activityType: TIME_LOG_ACTIVITY_TYPE.NATURAL,
      durationMinutes: 45,
    },
  ];

  const currentWeek = computeCurrentWeekTimeLogSummary(
    logs,
    new Date('2026-07-28T12:00:00'),
  );

  assert.equal(currentWeek.weekStart, '2026-07-27');
  assert.equal(currentWeek.weekEnd, '2026-08-02');
  assert.equal(currentWeek.totalEntries, 2);
  assert.equal(currentWeek.totalMinutes, 90);
  assert.equal(currentWeek.spiritualHours, formatDurationHours(60));
  assert.equal(currentWeek.naturalHours, formatDurationHours(30));
});

test('computeCurrentWeekTimeLogSummary rolls over automatically for a new calendar week', () => {
  const logs = [
    {
      date: '2026-07-27',
      activityType: TIME_LOG_ACTIVITY_TYPE.SPIRITUAL,
      durationMinutes: 60,
    },
    {
      date: '2026-08-03',
      activityType: TIME_LOG_ACTIVITY_TYPE.NATURAL,
      durationMinutes: 45,
    },
  ];

  const previousWeek = computeCurrentWeekTimeLogSummary(
    logs,
    new Date('2026-07-28T12:00:00'),
  );
  const nextWeek = computeCurrentWeekTimeLogSummary(
    logs,
    new Date('2026-08-04T12:00:00'),
  );

  assert.equal(previousWeek.totalEntries, 1);
  assert.equal(previousWeek.totalMinutes, 60);
  assert.equal(nextWeek.weekStart, '2026-08-03');
  assert.equal(nextWeek.totalEntries, 1);
  assert.equal(nextWeek.totalMinutes, 45);
  assert.equal(logs.length, 2);
});

test('getCurrentWeekKey tracks the active Monday-start week', () => {
  assert.equal(getCurrentWeekKey(new Date('2026-07-27T12:00:00')), '2026-07-27');
  assert.equal(getCurrentWeekKey(new Date('2026-08-04T12:00:00')), '2026-08-03');
});

test('msUntilNextCalendarWeekStart schedules rollover at the next Monday', () => {
  const referenceDate = new Date('2026-08-02T12:00:00');
  const originalNow = Date.now;

  Date.now = () => new Date('2026-08-02T23:30:00').getTime();

  try {
    assert.equal(msUntilNextCalendarWeekStart(referenceDate), 30 * 60 * 1000);
  } finally {
    Date.now = originalNow;
  }
});
