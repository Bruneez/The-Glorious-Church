/**
 * OfferingsAnalyticsSection.jsx
 *
 * Offerings Analytics — placed below the Offerings Records table on the
 * Offerings page. Receives the live `offerings` array already subscribed
 * by the parent (OfferingsPage) — zero extra Firestore requests.
 *
 * Features:
 *  • Year selector (all years found in data; latest default)
 *  • Date-range filter (start / end)
 *  • Reset filters button
 *  • Summary cards: total, average, highest, lowest, best month, MoM change
 *  • Offering Trend line chart
 *  • Monthly Totals bar chart
 *  • Monthly Contribution doughnut chart
 *  • Average Per Service + Quarterly Comparison bar charts
 *  • "Download Analytics" PNG export of the complete section
 *
 * Permissions: rendered only when canView={true} is passed.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, RotateCcw, TrendingDown, TrendingUp } from 'lucide-react';
import {
  applyOfferingsFilter,
  computeOfferingsAnalyticsStats,
  getOfferingYears,
} from '@/config/offeringsAnalytics';
import { downloadChartAsPng } from '@/utils/chartExportUtils';
import { formatCurrencySimple, formatDate } from '@/utils/formatters';
import ChartCard from '@/components/features/attendance/analytics/ChartCard';
import OfferingTrendChart from './OfferingTrendChart';
import MonthlyTotalsChart from './MonthlyTotalsChart';
import MonthlyContributionChart from './MonthlyContributionChart';
import AveragePerServiceChart from './AveragePerServiceChart';

// ---------------------------------------------------------------------------
// Small presentational sub-components
// ---------------------------------------------------------------------------

function AnalyticsSummaryCard({ label, value, sub, trend, loading }) {
  const trendColor =
    trend === 'up'
      ? 'text-emerald-400'
      : trend === 'down'
        ? 'text-rose-400'
        : 'text-slate-400';
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-1.5">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
        {label}
      </p>
      <p className="text-xl sm:text-2xl font-bold text-indigo-400 leading-tight break-all">
        {loading ? '—' : value}
      </p>
      {sub ? (
        <p className={`text-[11px] font-medium flex items-center gap-1 ${trendColor}`}>
          {TrendIcon ? (
            <TrendIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
          ) : null}
          {sub}
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Download button for the whole section
// ---------------------------------------------------------------------------

function DownloadAnalyticsButton({ targetRef, selectedYear, dateRange, disabled }) {
  const [isExporting, setIsExporting] = useState(false);

  function buildFileName() {
    if (dateRange?.start && dateRange?.end) {
      return `tgc-offerings-analytics-${dateRange.start}-to-${dateRange.end}.png`;
    }
    const yearPart = selectedYear || new Date().getFullYear();
    return `tgc-offerings-analytics-${yearPart}.png`;
  }

  async function handleDownload() {
    if (!targetRef?.current || isExporting || disabled) return;
    setIsExporting(true);
    try {
      await downloadChartAsPng(targetRef.current, buildFileName());
    } catch (err) {
      console.error('Failed to export offerings analytics:', err);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={disabled || isExporting}
      aria-label="Download offerings analytics as image"
      className="inline-flex min-h-[2.25rem] items-center gap-1.5 shrink-0 rounded-lg border border-slate-600/80 bg-slate-900/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-300 transition-colors hover:border-indigo-500/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      {isExporting ? 'Exporting…' : 'Download Analytics'}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Filters bar
// ---------------------------------------------------------------------------

function FiltersBar({
  years,
  selectedYear,
  setSelectedYear,
  dateRange,
  setDateRange,
  onReset,
  defaultYear,
}) {
  const hasFilters =
    selectedYear !== defaultYear || Boolean(dateRange.start) || Boolean(dateRange.end);

  return (
    <div
      className="flex flex-wrap items-end gap-3"
      role="group"
      aria-label="Offerings analytics filters"
    >
      {/* Year selector */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="offerings-analytics-year"
          className="text-[11px] text-slate-400 font-medium"
        >
          Year
        </label>
        <select
          id="offerings-analytics-year"
          value={selectedYear ?? ''}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : null;
            setSelectedYear(val);
          }}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer min-w-[7rem]"
        >
          {years.length === 0 ? (
            <option value="">No data</option>
          ) : (
            years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))
          )}
        </select>
      </div>

      {/* From date */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="offerings-analytics-start"
          className="text-[11px] text-slate-400 font-medium"
        >
          From
        </label>
        <input
          id="offerings-analytics-start"
          type="date"
          value={dateRange.start}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, start: e.target.value }))
          }
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
        />
      </div>

      {/* To date */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="offerings-analytics-end"
          className="text-[11px] text-slate-400 font-medium"
        >
          To
        </label>
        <input
          id="offerings-analytics-end"
          type="date"
          value={dateRange.end}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, end: e.target.value }))
          }
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
        />
      </div>

      {/* Reset — only shown when a non-default filter is active */}
      {hasFilters ? (
        <button
          type="button"
          onClick={onReset}
          aria-label="Reset analytics filters to defaults"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600/80 bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold text-slate-400 transition hover:border-indigo-500/60 hover:text-white self-end"
        >
          <RotateCcw className="w-3 h-3" aria-hidden="true" />
          Reset
        </button>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildRangeLabel(selectedYear, dateRange) {
  if (dateRange?.start && dateRange?.end) {
    return `${formatDate(dateRange.start, 'short')} – ${formatDate(dateRange.end, 'short')}`;
  }
  if (dateRange?.start) return `From ${formatDate(dateRange.start, 'short')}`;
  if (dateRange?.end) return `Up to ${formatDate(dateRange.end, 'short')}`;
  if (selectedYear) return String(selectedYear);
  return 'All time';
}

function buildMoMInfo(momChange) {
  if (momChange === null || momChange === undefined) {
    return { value: 'Not enough data', sub: null, trend: null };
  }
  const sign = momChange >= 0 ? '+' : '';
  return {
    value: `${sign}${momChange.toFixed(1)}%`,
    sub: 'vs previous month',
    trend: momChange >= 0 ? 'up' : 'down',
  };
}

// ---------------------------------------------------------------------------
// Main component — all hooks are called unconditionally
// ---------------------------------------------------------------------------

function OfferingsAnalyticsSectionInner({ offerings, loading }) {
  const sectionRef = useRef(null);

  // Derive available years from ALL offerings (unfiltered)
  const years = useMemo(() => getOfferingYears(offerings), [offerings]);
  const defaultYear = years[0] ?? null;

  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // When new data arrives (e.g. after add/edit/delete) and selectedYear
  // is still null, lock to the latest year.
  useEffect(() => {
    if (years.length > 0 && selectedYear == null) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  function handleReset() {
    setSelectedYear(defaultYear);
    setDateRange({ start: '', end: '' });
  }

  // Single filtered dataset — shared by every card and chart
  const filteredOfferings = useMemo(() => {
    const hasDateRange = Boolean(dateRange.start || dateRange.end);
    return applyOfferingsFilter(offerings, {
      year: hasDateRange ? null : selectedYear,
      dateRange: hasDateRange ? dateRange : null,
    });
  }, [offerings, selectedYear, dateRange]);

  // One memo for all six summary-card values
  const stats = useMemo(
    () => computeOfferingsAnalyticsStats(filteredOfferings),
    [filteredOfferings],
  );

  const noDataForPeriod = !loading && filteredOfferings.length === 0;
  const rangeLabel = useMemo(
    () => buildRangeLabel(selectedYear, dateRange),
    [selectedYear, dateRange],
  );
  const momInfo = buildMoMInfo(stats.momChange);

  return (
    <section
      ref={sectionRef}
      className="space-y-5"
      aria-labelledby="offerings-analytics-heading"
    >
      {/* ── Header card: title + download + filters ── */}
      <div className="bg-slate-800 rounded-xl border border-slate-700/70 p-4 md:p-5 space-y-4 shadow-sm">
        {/* Title row */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="offerings-analytics-heading"
              className="text-sm font-bold text-white tracking-wide"
            >
              Offerings Analytics
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Visual insights into offering trends and statistics
              {rangeLabel ? ` · ${rangeLabel}` : ''}.
            </p>
          </div>
          <DownloadAnalyticsButton
            targetRef={sectionRef}
            selectedYear={selectedYear}
            dateRange={dateRange}
            disabled={noDataForPeriod}
          />
        </div>

        {/* Filters */}
        <FiltersBar
          years={years}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onReset={handleReset}
          defaultYear={defaultYear}
        />
      </div>

      {/* ── Summary cards ── */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        aria-label="Offerings analytics summary cards"
      >
        <AnalyticsSummaryCard
          label="Total for Period"
          value={formatCurrencySimple(stats.total)}
          loading={loading}
        />
        <AnalyticsSummaryCard
          label="Average Offering"
          value={formatCurrencySimple(stats.average)}
          loading={loading}
        />
        <AnalyticsSummaryCard
          label="Highest Offering"
          value={formatCurrencySimple(stats.highest)}
          sub={stats.highestDate ? formatDate(stats.highestDate, 'short') : null}
          trend="up"
          loading={loading}
        />
        <AnalyticsSummaryCard
          label="Lowest Offering"
          value={formatCurrencySimple(stats.lowest)}
          sub={stats.lowestDate ? formatDate(stats.lowestDate, 'short') : null}
          trend="down"
          loading={loading}
        />
        <AnalyticsSummaryCard
          label="Best Month"
          value={stats.bestMonth || '—'}
          sub={stats.bestMonthTotal ? formatCurrencySimple(stats.bestMonthTotal) : null}
          loading={loading}
        />
        <AnalyticsSummaryCard
          label="Month-on-Month"
          value={noDataForPeriod || loading ? '—' : momInfo.value}
          sub={momInfo.sub}
          trend={momInfo.trend}
          loading={loading}
        />
      </div>

      {/* ── No-data empty state ── */}
      {noDataForPeriod ? (
        <div
          className="flex items-center justify-center rounded-xl border border-dashed border-slate-700/70 bg-slate-800/40 py-16"
          role="status"
          aria-live="polite"
        >
          <p className="text-xs text-slate-500 text-center px-4">
            No offering data is available for this period.
          </p>
        </div>
      ) : (
        <>
          {/* Row 1 — Offering Trend (full width) */}
          <ChartCard title="Offering Trend">
            <OfferingTrendChart records={filteredOfferings} loading={loading} />
          </ChartCard>

          {/* Row 2 — Monthly Totals + Monthly Contribution (side-by-side on md+) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title="Monthly Offering Totals">
              <MonthlyTotalsChart records={filteredOfferings} loading={loading} />
            </ChartCard>
            <ChartCard title="Monthly Contribution">
              <MonthlyContributionChart records={filteredOfferings} loading={loading} />
            </ChartCard>
          </div>

          {/* Row 3 — Average Per Service + Quarterly (full width; component renders both) */}
          <ChartCard title="Average Offering per Service">
            <AveragePerServiceChart records={filteredOfferings} loading={loading} />
          </ChartCard>
        </>
      )}

      {/* Export footer timestamp — visible in PNG export */}
      <p className="text-[10px] text-slate-600 text-right" aria-hidden="true">
        The Glorious Church · Offerings Analytics · Generated{' '}
        {new Date().toLocaleDateString('en-ZA', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </p>
    </section>
  );
}

// Wrapper that enforces the canView gate *outside* the hook-bearing component
// so that all hooks in the inner component are always called.
export default function OfferingsAnalyticsSection({
  offerings = [],
  loading = false,
  canView = false,
}) {
  if (!canView) return null;
  return <OfferingsAnalyticsSectionInner offerings={offerings} loading={loading} />;
}
