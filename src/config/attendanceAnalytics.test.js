import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ATTENDANCE_TREND_MIN_POINTS,
  buildAttendancePerServiceSeries,
  buildAttendanceTrendSeries,
  buildVisitorGrowthSeries,
  buildSalvationsPerServiceSeries,
  buildAttendanceDistributionSeries,
  hasAttendancePerServiceData,
  hasAttendanceDistributionData,
  hasSalvationsPerServiceData,
  hasSufficientAttendanceTrendData,
  hasVisitorGrowthData,
  VISITOR_GROWTH_MIN_POINTS,
} from './attendanceAnalytics.js';

test('buildAttendanceTrendSeries maps service records chronologically', () => {
  const series = buildAttendanceTrendSeries([
    {
      type: 'service',
      attendanceDate: '2026-03-15',
      totalAttendance: 120,
    },
    {
      type: 'service',
      attendanceDate: '2026-01-10',
      totalAttendance: 95,
    },
    {
      type: 'department',
      attendanceDate: '2026-02-01',
      members: [{ memberId: '1', status: 'Present' }],
      totalPresent: 8,
    },
  ]);

  assert.equal(series.length, 2);
  assert.equal(series[0].totalAttendance, 95);
  assert.equal(series[1].totalAttendance, 120);
  assert.equal(series[0].serviceDateLabel.includes('2026'), true);
});

test('buildAttendanceTrendSeries skips records with invalid dates', () => {
  const series = buildAttendanceTrendSeries([
    { type: 'service', attendanceDate: 'not-a-date', totalAttendance: 50 },
    { type: 'service', attendanceDate: '2026-04-01', totalAttendance: 60 },
  ]);

  assert.equal(series.length, 1);
  assert.equal(series[0].totalAttendance, 60);
});

test('hasSufficientAttendanceTrendData requires minimum points', () => {
  assert.equal(ATTENDANCE_TREND_MIN_POINTS, 2);
  assert.equal(hasSufficientAttendanceTrendData([]), false);
  assert.equal(hasSufficientAttendanceTrendData([{ totalAttendance: 10 }]), false);
  assert.equal(
    hasSufficientAttendanceTrendData([
      { totalAttendance: 10 },
      { totalAttendance: 20 },
    ]),
    true,
  );
});

test('buildAttendancePerServiceSeries adds coloured fill per service', () => {
  const series = buildAttendancePerServiceSeries([
    { type: 'service', attendanceDate: '2026-01-10', totalAttendance: 95 },
    { type: 'service', attendanceDate: '2026-03-15', totalAttendance: 120 },
  ]);

  assert.equal(series.length, 2);
  assert.equal(series[0].totalAttendance, 95);
  assert.equal(series[1].totalAttendance, 120);
  assert.equal(typeof series[0].fill, 'string');
  assert.notEqual(series[0].fill, series[1].fill);
});

test('hasAttendancePerServiceData requires at least one service point', () => {
  assert.equal(hasAttendancePerServiceData([]), false);
  assert.equal(hasAttendancePerServiceData([{ totalAttendance: 10 }]), true);
});

test('buildVisitorGrowthSeries maps visitor totals chronologically', () => {
  const series = buildVisitorGrowthSeries([
    { type: 'service', attendanceDate: '2026-03-15', totalAttendance: 120, visitors: 18 },
    { type: 'service', attendanceDate: '2026-01-10', totalAttendance: 95, visitors: 12 },
    { type: 'department', attendanceDate: '2026-02-01', visitors: 5, members: [{ memberId: '1' }] },
  ]);

  assert.equal(series.length, 2);
  assert.equal(series[0].visitors, 12);
  assert.equal(series[1].visitors, 18);
});

test('hasVisitorGrowthData requires minimum points', () => {
  assert.equal(VISITOR_GROWTH_MIN_POINTS, 2);
  assert.equal(hasVisitorGrowthData([]), false);
  assert.equal(hasVisitorGrowthData([{ visitors: 5 }]), false);
  assert.equal(hasVisitorGrowthData([{ visitors: 5 }, { visitors: 8 }]), true);
});

test('buildSalvationsPerServiceSeries maps salvation totals chronologically', () => {
  const series = buildSalvationsPerServiceSeries([
    { type: 'service', attendanceDate: '2026-03-15', salvations: 3 },
    { type: 'service', attendanceDate: '2026-01-10', salvations: 0 },
    { type: 'service', attendanceDate: '2026-02-01', salvations: 2 },
  ]);

  assert.equal(series.length, 3);
  assert.equal(series[0].salvations, 0);
  assert.equal(series[2].salvations, 3);
});

test('hasSalvationsPerServiceData is true when any service has salvations', () => {
  const series = buildSalvationsPerServiceSeries([
    { type: 'service', attendanceDate: '2026-01-10', salvations: 0 },
    { type: 'service', attendanceDate: '2026-02-01', salvations: 1 },
  ]);

  assert.equal(hasSalvationsPerServiceData([]), false);
  assert.equal(
    hasSalvationsPerServiceData(buildSalvationsPerServiceSeries([
      { type: 'service', attendanceDate: '2026-01-10', salvations: 0 },
    ])),
    false,
  );
  assert.equal(hasSalvationsPerServiceData(series), true);
});

test('buildAttendanceDistributionSeries assigns one slice per service', () => {
  const series = buildAttendanceDistributionSeries([
    { type: 'service', attendanceDate: '2026-01-10', totalAttendance: 95 },
    { type: 'service', attendanceDate: '2026-03-15', totalAttendance: 120 },
  ]);

  assert.equal(series.length, 2);
  assert.equal(series[0].name, series[0].serviceDateLabel);
  assert.equal(series[0].totalAttendance, 95);
  assert.equal(typeof series[0].fill, 'string');
});

test('hasAttendanceDistributionData requires attendance totals', () => {
  assert.equal(hasAttendanceDistributionData([]), false);
  assert.equal(
    hasAttendanceDistributionData([
      { totalAttendance: 0 },
    ]),
    false,
  );
  assert.equal(
    hasAttendanceDistributionData([
      { totalAttendance: 0 },
      { totalAttendance: 50 },
    ]),
    true,
  );
});
