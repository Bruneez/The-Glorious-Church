/**
 * AveragePerServiceChart.jsx
 *
 * Combined chart:
 *  Upper section — bar chart showing average offering per service for each month
 *    (monthly total ÷ number of offering records that month).
 *  Lower section — quarterly comparison bar chart (Q1–Q4 averages).
 */

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  buildAveragePerServiceSeries,
  buildQuarterlySeries,
  hasAveragePerServiceData,
  hasQuarterlyData,
} from '@/config/offeringsAnalytics';
import {
  ChartEmptyState,
  ChartFigure,
  ChartLoadingState,
  ChartTooltipShell,
} from '@/components/features/attendance/analytics/chartStates';
import {
  CHART_COLORS,
  CHART_MARGINS,
  getResponsiveXAxisProps,
} from '@/components/features/attendance/analytics/chartTheme';
import { useChartLayout } from '@/components/features/attendance/analytics/useChartLayout';
import { formatCurrencySimple } from '@/utils/formatters';

function formatAmountTick(value) {
  if (value >= 1_000_000) return `R${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R${(value / 1_000).toFixed(0)}k`;
  return `R${value}`;
}

function MonthlyAverageTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const m = payload[0].payload;

  return (
    <ChartTooltipShell label={m.monthFull}>
      {m.serviceCount > 0 ? (
        <>
          <p className="font-semibold mt-0.5" style={{ color: m.fill || CHART_COLORS.salvations }}>
            Avg: {formatCurrencySimple(m.average)}
          </p>
          <p className="text-slate-400 mt-0.5 text-[11px]">
            Services: {m.serviceCount}
          </p>
          <p className="text-slate-400 text-[11px]">
            Total: {formatCurrencySimple(m.total)}
          </p>
        </>
      ) : (
        <p className="text-slate-500 mt-0.5 text-[11px]">No offerings this month</p>
      )}
    </ChartTooltipShell>
  );
}

function QuarterlyTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const q = payload[0].payload;

  return (
    <ChartTooltipShell label={q.quarter}>
      {q.serviceCount > 0 ? (
        <>
          <p className="font-semibold mt-0.5" style={{ color: q.fill || CHART_COLORS.visitors }}>
            Avg: {formatCurrencySimple(q.average)}
          </p>
          <p className="text-slate-400 mt-0.5 text-[11px]">
            Services: {q.serviceCount}
          </p>
          <p className="text-slate-400 text-[11px]">
            Total: {formatCurrencySimple(q.total)}
          </p>
        </>
      ) : (
        <p className="text-slate-500 mt-0.5 text-[11px]">No offerings this quarter</p>
      )}
    </ChartTooltipShell>
  );
}

function SharedYAxisProps(layout) {
  return {
    allowDecimals: false,
    tick: { fill: CHART_COLORS.axis, fontSize: layout.fontSize },
    tickLine: { stroke: CHART_COLORS.grid },
    axisLine: { stroke: CHART_COLORS.grid },
    width: layout.yAxisWidth + 14,
    tickFormatter: formatAmountTick,
    label: {
      value: 'Avg (ZAR)',
      angle: -90,
      position: 'insideLeft',
      fill: CHART_COLORS.axisLabel,
      fontSize: layout.fontSize,
      style: { textAnchor: 'middle' },
    },
  };
}

export default function AveragePerServiceChart({ records = [], loading = false }) {
  const layout = useChartLayout();
  const monthlySeries = useMemo(() => buildAveragePerServiceSeries(records), [records]);
  const quarterlySeries = useMemo(() => buildQuarterlySeries(records), [records]);

  const hasMonthlyData = hasAveragePerServiceData(monthlySeries);
  const hasQtrData = hasQuarterlyData(quarterlySeries);

  if (loading) return <ChartLoadingState />;

  if (!hasMonthlyData) {
    return (
      <ChartEmptyState message="No offering data is available for this period." />
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly average bar chart */}
      <ChartFigure
        title="Average Offering per Service (Monthly)"
        description="Bar chart showing the average offering amount per service for each calendar month."
      >
        <div className="min-h-[240px] w-full">
          <ResponsiveContainer width="100%" height={layout.height}>
            <BarChart data={monthlySeries} margin={CHART_MARGINS}>
              <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" {...getResponsiveXAxisProps(layout, 'Month')} />
              <YAxis {...SharedYAxisProps(layout)} />
              <Tooltip
                content={<MonthlyAverageTooltip />}
                cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
              />
              <Bar
                dataKey="average"
                radius={[6, 6, 0, 0]}
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-out"
              >
                {monthlySeries.map((entry) => (
                  <Cell
                    key={entry.month}
                    fill={entry.fill}
                    opacity={entry.serviceCount > 0 ? 1 : 0.15}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartFigure>

      {/* Quarterly comparison */}
      {hasQtrData ? (
        <ChartFigure
          title="Quarterly Comparison"
          description="Bar chart comparing average offering per service across Q1, Q2, Q3, and Q4."
        >
          <div className="min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height={layout.isMobile ? 200 : 220}>
              <BarChart data={quarterlySeries} margin={CHART_MARGINS}>
                <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="quarter"
                  tick={{ fill: CHART_COLORS.axis, fontSize: layout.fontSize }}
                  tickLine={{ stroke: CHART_COLORS.grid }}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                />
                <YAxis {...SharedYAxisProps(layout)} />
                <Tooltip
                  content={<QuarterlyTooltip />}
                  cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                />
                <Bar
                  dataKey="average"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {quarterlySeries.map((entry) => (
                    <Cell
                      key={entry.quarter}
                      fill={entry.fill}
                      opacity={entry.serviceCount > 0 ? 1 : 0.15}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartFigure>
      ) : null}
    </div>
  );
}
