import { formatDate } from '../utils/formatters.js';

const ATTENDANCE_RECORD_TYPE = {
  SERVICE: 'service',
  DEPARTMENT: 'department',
};

const LEGACY_RECORD_TYPES = {
  SERVICE: 'service-summary',
  DEPARTMENT: 'department-rollcall',
};

export const ATTENDANCE_TREND_MIN_POINTS = 2;

function getRecordMembers(record) {
  if (!record) return [];
  if (Array.isArray(record.members)) return record.members;
  if (Array.isArray(record.entries)) return record.entries;
  return [];
}

function getRecordType(record) {
  return record?.type || record?.recordType || '';
}

function getAttendanceDate(record) {
  return record?.attendanceDate || record?.serviceDate || record?.date || '';
}

function isServiceAttendanceRecord(record) {
  if (!record) return false;

  const recordType = getRecordType(record);
  if (recordType === ATTENDANCE_RECORD_TYPE.SERVICE || recordType === LEGACY_RECORD_TYPES.SERVICE) {
    return true;
  }
  if (
    recordType === ATTENDANCE_RECORD_TYPE.DEPARTMENT ||
    recordType === LEGACY_RECORD_TYPES.DEPARTMENT
  ) {
    return false;
  }

  const hasMembers = getRecordMembers(record).length > 0;
  return !hasMembers && (record.totalAttendance != null || record.visitors != null);
}

function getRecordTotalAttendance(record) {
  const value = record?.totalAttendance ?? record?.totalPresent ?? record?.present ?? 0;
  return Number(value) || 0;
}

function getRecordVisitors(record) {
  return Number(record?.visitors) || 0;
}

function getRecordSalvations(record) {
  return Number(record?.salvations) || 0;
}

function buildServiceDateSeries(records, getValue) {
  return records
    .filter(isServiceAttendanceRecord)
    .map((record) => {
      const date = getAttendanceDate(record);
      const parsedDate = date ? new Date(date) : null;

      if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
        return null;
      }

      return {
        date,
        serviceDateLabel: formatDate(date, 'short'),
        value: getValue(record),
        sortKey: parsedDate.getTime(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ date, serviceDateLabel, value }) => ({
      date,
      serviceDateLabel,
      value,
    }));
}

export function buildAttendanceTrendSeries(records = []) {
  return buildServiceDateSeries(records, getRecordTotalAttendance).map(
    ({ date, serviceDateLabel, value }) => ({
      date,
      serviceDateLabel,
      totalAttendance: value,
    }),
  );
}

export function hasSufficientAttendanceTrendData(series = []) {
  return series.length >= ATTENDANCE_TREND_MIN_POINTS;
}

export function buildAttendancePerServiceSeries(records = []) {
  return buildAttendanceTrendSeries(records).map((point, index) => ({
    ...point,
    fill: getAttendanceBarColor(index),
  }));
}

export function hasAttendancePerServiceData(series = []) {
  return series.length > 0;
}

export const VISITOR_GROWTH_MIN_POINTS = 2;

export function buildVisitorGrowthSeries(records = []) {
  return buildServiceDateSeries(records, getRecordVisitors).map(
    ({ date, serviceDateLabel, value }) => ({
      date,
      serviceDateLabel,
      visitors: value,
    }),
  );
}

export function hasVisitorGrowthData(series = []) {
  return series.length >= VISITOR_GROWTH_MIN_POINTS;
}

export function buildSalvationsPerServiceSeries(records = []) {
  return buildServiceDateSeries(records, getRecordSalvations).map(
    ({ date, serviceDateLabel, value }) => ({
      date,
      serviceDateLabel,
      salvations: value,
    }),
  );
}

export function hasSalvationsPerServiceData(series = []) {
  return series.some((point) => point.salvations > 0);
}

export function buildAttendanceDistributionSeries(records = []) {
  return buildAttendanceTrendSeries(records).map((point, index) => ({
    ...point,
    name: point.serviceDateLabel,
    fill: getAttendanceBarColor(index),
  }));
}

export function hasAttendanceDistributionData(series = []) {
  return series.length > 0 && series.some((point) => point.totalAttendance > 0);
}

function getAttendanceBarColor(index) {
  const colors = ['#818cf8', '#a78bfa', '#22d3ee', '#34d399', '#f472b6', '#fb923c'];
  return colors[index % colors.length];
}
