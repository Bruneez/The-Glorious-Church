/**
 * offeringsAnalytics.js
 *
 * Pure data-transformation functions for Offerings Analytics.
 * All functions accept raw offering records from the real-time
 * Firestore subscription and return derived data for charts and
 * summary cards.
 *
 * Rules followed:
 *  - Use SERVICE DATE (serviceDate / date field) — never createdAt.
 *  - Parse dates without timezone shifts (treat YYYY-MM-DD as local).
 *  - All amounts treated as numbers; null/invalid amounts → 0.
 *  - No Firestore calls — analytics are computed client-side.
 */

import { formatDate } from '../utils/formatters.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const MONTH_FULL_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const QUARTER_LABELS = ['Q1', 'Q2', 'Q3', 'Q4'];

/** Minimum records required before showing trend/MoM data. */
export const OFFERINGS_TREND_MIN_POINTS = 2;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Parse a YYYY-MM-DD (or ISO) date string into a local Date object
 * without timezone shift.  Returns null when invalid.
 */
function parseLocalDate(value) {
  if (!value) return null;
  const text = String(value).trim();

  // Fast-path for YYYY-MM-DD
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1; // 0-indexed
    const day = Number(isoMatch[3]);
    const d = new Date(year, month, day);
    if (Number.isNaN(d.getTime())) return null;
    // Guard against JS rolling over invalid days (e.g. Feb 31)
    if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
    return d;
  }

  const d = new Date(text);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Normalise a raw offering record into a canonical analytics shape.
 * Returns null when the record has no usable service date or amount.
 */
function normaliseOffering(record) {
  if (!record) return null;

  const rawDate = String(record.serviceDate || record.date || '').trim();
  if (!rawDate) return null;

  const dateObj = parseLocalDate(rawDate);
  if (!dateObj) return null;

  const amount = Number(record.totalAmount ?? record.amount ?? 0);
  if (Number.isNaN(amount) || amount < 0) return null;

  return {
    id: record.id || '',
    serviceDate: rawDate,
    dateObj,
    year: dateObj.getFullYear(),
    monthIndex: dateObj.getMonth(), // 0-based
    amount,
    recordedBy: String(record.recordedBy || '').trim(),
  };
}

/**
 * Sort normalised offerings chronologically (ascending).
 */
function sortByDate(items) {
  return [...items].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
}

// ---------------------------------------------------------------------------
// Year / date-range utilities
// ---------------------------------------------------------------------------

/**
 * Return a sorted array of distinct years present in the records.
 * Most recent year first.
 */
export function getOfferingYears(records = []) {
  const years = new Set();
  for (const record of records) {
    const n = normaliseOffering(record);
    if (n) years.add(n.year);
  }
  return [...years].sort((a, b) => b - a);
}

/**
 * Filter raw offering records to the specified year.
 * Pass year = null to skip year filtering.
 */
export function filterOfferingsByYear(records = [], year) {
  if (year == null) return records;
  const y = Number(year);
  return records.filter((record) => {
    const n = normaliseOffering(record);
    return n && n.year === y;
  });
}

/**
 * Filter raw offering records to a date range [startDate, endDate].
 * Both are YYYY-MM-DD strings.  Either may be null/empty.
 */
export function filterOfferingsByDateRange(records = [], startDate, endDate) {
  const start = startDate ? parseLocalDate(startDate) : null;
  const end = endDate ? parseLocalDate(endDate) : null;

  return records.filter((record) => {
    const n = normaliseOffering(record);
    if (!n) return false;
    if (start && n.dateObj < start) return false;
    if (end && n.dateObj > end) return false;
    return true;
  });
}

/**
 * Apply year + optional date-range filter.
 * dateRange = { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' } | null
 */
export function applyOfferingsFilter(records = [], { year, dateRange } = {}) {
  let result = records;
  if (year != null) result = filterOfferingsByYear(result, year);
  if (dateRange?.start || dateRange?.end) {
    result = filterOfferingsByDateRange(result, dateRange.start, dateRange.end);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Summary card computations
// ---------------------------------------------------------------------------

/**
 * Compute all summary-card values for the filtered record set.
 *
 * Returns:
 *  total, average, highest, highest.date, lowest, lowest.date,
 *  bestMonth, bestMonthTotal, momChange, recordCount
 */
export function computeOfferingsAnalyticsStats(records = []) {
  const items = sortByDate(records.map(normaliseOffering).filter(Boolean));

  if (!items.length) {
    return {
      total: 0,
      average: 0,
      highest: 0,
      highestDate: '',
      lowest: 0,
      lowestDate: '',
      bestMonth: '',
      bestMonthTotal: 0,
      momChange: null,
      recordCount: 0,
    };
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const average = total / items.length;

  let highestItem = items[0];
  let lowestItem = items[0];

  for (const item of items) {
    if (item.amount > highestItem.amount) highestItem = item;
    if (item.amount < lowestItem.amount) lowestItem = item;
  }

  // Monthly totals
  const monthTotals = {};
  for (const item of items) {
    const key = `${item.year}-${String(item.monthIndex + 1).padStart(2, '0')}`;
    monthTotals[key] = (monthTotals[key] || 0) + item.amount;
  }

  let bestMonthKey = '';
  let bestMonthTotal = 0;
  for (const [key, value] of Object.entries(monthTotals)) {
    if (value > bestMonthTotal) {
      bestMonthTotal = value;
      bestMonthKey = key;
    }
  }

  let bestMonth = '';
  if (bestMonthKey) {
    const [y, m] = bestMonthKey.split('-');
    bestMonth = `${MONTH_FULL_LABELS[Number(m) - 1]} ${y}`;
  }

  // Month-on-month change: compare last two distinct calendar months
  const monthKeys = Object.keys(monthTotals).sort();
  let momChange = null;
  if (monthKeys.length >= 2) {
    const prev = monthTotals[monthKeys[monthKeys.length - 2]];
    const curr = monthTotals[monthKeys[monthKeys.length - 1]];
    if (prev > 0) {
      momChange = ((curr - prev) / prev) * 100;
    } else if (curr > 0) {
      momChange = null; // can't express as percentage
    }
  }

  return {
    total,
    average,
    highest: highestItem.amount,
    highestDate: highestItem.serviceDate,
    lowest: lowestItem.amount,
    lowestDate: lowestItem.serviceDate,
    bestMonth,
    bestMonthTotal,
    momChange,
    recordCount: items.length,
  };
}

// ---------------------------------------------------------------------------
// Chart series builders
// ---------------------------------------------------------------------------

/**
 * Offering Trend — one point per offering record, chronological.
 * Used by the line chart.
 */
export function buildOfferingTrendSeries(records = []) {
  return sortByDate(records.map(normaliseOffering).filter(Boolean)).map((item) => ({
    serviceDate: item.serviceDate,
    serviceDateLabel: formatDate(item.serviceDate, 'short'),
    amount: item.amount,
    recordedBy: item.recordedBy,
  }));
}

export function hasSufficientOfferingTrendData(series = []) {
  return series.length >= OFFERINGS_TREND_MIN_POINTS;
}

/**
 * Monthly Totals — 12 months Jan–Dec for the given series.
 * Months with no records show 0.
 * Used by the bar chart.
 */
export function buildMonthlyTotalsSeries(records = []) {
  const items = records.map(normaliseOffering).filter(Boolean);

  const monthData = MONTH_LABELS.map((label, index) => ({
    month: label,
    monthFull: MONTH_FULL_LABELS[index],
    monthIndex: index,
    total: 0,
    serviceCount: 0,
  }));

  for (const item of items) {
    monthData[item.monthIndex].total += item.amount;
    monthData[item.monthIndex].serviceCount += 1;
  }

  return monthData.map((m) => ({
    ...m,
    average: m.serviceCount > 0 ? m.total / m.serviceCount : 0,
  }));
}

export function hasMonthlyTotalsData(series = []) {
  return series.some((m) => m.total > 0);
}

/**
 * Monthly Contribution — doughnut slices, one per non-empty month.
 * Used by the pie/doughnut chart.
 */
const DOUGHNUT_COLORS = [
  '#818cf8', '#a78bfa', '#22d3ee', '#34d399',
  '#f472b6', '#fb923c', '#facc15', '#4ade80',
  '#60a5fa', '#e879f9', '#f87171', '#38bdf8',
];

export function buildMonthlyContributionSeries(records = []) {
  const monthly = buildMonthlyTotalsSeries(records);
  const grandTotal = monthly.reduce((sum, m) => sum + m.total, 0);

  return monthly
    .filter((m) => m.total > 0)
    .map((m, index) => ({
      month: m.month,
      monthFull: m.monthFull,
      monthIndex: m.monthIndex,
      total: m.total,
      percentage: grandTotal > 0 ? (m.total / grandTotal) * 100 : 0,
      fill: DOUGHNUT_COLORS[m.monthIndex % DOUGHNUT_COLORS.length],
      name: m.monthFull,
    }));
}

export function hasMonthlyContributionData(series = []) {
  return series.length > 0;
}

/**
 * Average Per Service — monthly averages (total / service count).
 * Also includes quarterly comparison data.
 */
export function buildAveragePerServiceSeries(records = []) {
  return buildMonthlyTotalsSeries(records).map((m, index) => ({
    ...m,
    fill: DOUGHNUT_COLORS[index % DOUGHNUT_COLORS.length],
  }));
}

/**
 * Quarterly comparison series — Q1–Q4 totals and averages.
 */
export function buildQuarterlySeries(records = []) {
  const monthly = buildMonthlyTotalsSeries(records);

  return QUARTER_LABELS.map((label, qi) => {
    const startMonth = qi * 3;
    const months = monthly.slice(startMonth, startMonth + 3);
    const total = months.reduce((sum, m) => sum + m.total, 0);
    const serviceCount = months.reduce((sum, m) => sum + m.serviceCount, 0);
    return {
      quarter: label,
      total,
      serviceCount,
      average: serviceCount > 0 ? total / serviceCount : 0,
      fill: DOUGHNUT_COLORS[qi],
    };
  });
}

export function hasAveragePerServiceData(series = []) {
  return series.some((m) => m.serviceCount > 0);
}

export function hasQuarterlyData(series = []) {
  return series.some((q) => q.serviceCount > 0);
}
