/**
 * MonthlyTotalsChart.jsx
 *
 * Bar chart showing Jan–Dec monthly offering totals.
 * Months with no records show a zero bar.
 * Tooltip: month name, total, number of services, monthly average.
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
  buildMonthlyTotalsSeries,
  hasMonthlyTotalsData,
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
  CHART_BAR_COLORS,
  getResponsiveXAxisProps,
} from '@/components/features/attendance/analytics/chartTheme';
import { useChartLayout } from '@/components/features/attendance/analytics/useChartLayout';
import { formatCurrencySimple } from '@/utils/formatters';

function formatAmountTick(value) {
  if (value >= 1_000_000) return `R${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R${(value / 1_000).toFixed(0)}k`;
  return `R${value}`;
}

function MonthlyTotalsTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const m = payload[0].payload;

  return (
    <ChartTooltipShell label={m.monthFull}>
      <p className="font-semibold mt-0.5" style={{ color: payload[0].fill || CHART_COLORS.line }}>
        Total: {formatCurrencySimple(m.total)}
      </p>
      <p className="text-slate-400 mt-0.5 text-[11px]">
        Services: {m.serviceCount}
      </p>
      {m.serviceCount > 0 ? (
        <p className="text-slate-400 text-[11px]">
          Avg per service: {formatCurrencySimple(m.average)}
        </p>
      ) : null}
    </ChartTooltipShell>
  );
}

export default function MonthlyTotalsChart({ records = [], loading = false }) {
  const layout = useChartLayout();
  const series = useMemo(() => buildMonthlyTotalsSeries(records), [records]);
  const hasData = hasMonthlyTotalsData(series);

  if (loading) return <ChartLoadingState />;

  if (!hasData) {
    return (
      <ChartEmptyState message="No offering data is available for this period." />
    );
  }

  const yAxisProps = {
    allowDecimals: false,
    tick: { fill: CHART_COLORS.axis, fontSize: layout.fontSize },
    tickLine: { stroke: CHART_COLORS.grid },
    axisLine: { stroke: CHART_COLORS.grid },
    width: layout.yAxisWidth + 14,
    tickFormatter: formatAmountTick,
    label: {
      value: 'Total (ZAR)',
      angle: -90,
      position: 'insideLeft',
      fill: CHART_COLORS.axisLabel,
      fontSize: layout.fontSize,
      style: { textAnchor: 'middle' },
    },
  };

  return (
    <ChartFigure
      title="Monthly Offering Totals"
      description="Bar chart showing total offering collected per calendar month."
    >
      <div className="min-h-[240px] w-full">
        <ResponsiveContainer width="100%" height={layout.height}>
          <BarChart data={series} margin={CHART_MARGINS}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" {...getResponsiveXAxisProps(layout, 'Month')} />
            <YAxis {...yAxisProps} />
            <Tooltip
              content={<MonthlyTotalsTooltip />}
              cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
            />
            <Bar
              dataKey="total"
              radius={[6, 6, 0, 0]}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            >
              {series.map((entry, index) => (
                <Cell
                  key={entry.month}
                  fill={
                    entry.serviceCount > 0
                      ? CHART_BAR_COLORS[index % CHART_BAR_COLORS.length]
                      : '#1e293b'
                  }
                  opacity={entry.serviceCount > 0 ? 1 : 0.25}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartFigure>
  );
}
