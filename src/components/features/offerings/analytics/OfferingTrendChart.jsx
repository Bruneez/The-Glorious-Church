/**
 * OfferingTrendChart.jsx
 *
 * Line chart showing every offering record chronologically.
 * X-axis = service date label
 * Y-axis = offering amount (ZAR)
 * Tooltip = date, amount, recorded-by
 */

import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  buildOfferingTrendSeries,
  hasSufficientOfferingTrendData,
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

// Y-axis tick formatter — keeps labels short
function formatAmountTick(value) {
  if (value >= 1_000_000) return `R${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R${(value / 1_000).toFixed(0)}k`;
  return `R${value}`;
}

function OfferingTrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;

  return (
    <ChartTooltipShell label={label}>
      <p className="text-emerald-400 mt-0.5 font-semibold">
        {formatCurrencySimple(point.amount)}
      </p>
      {point.recordedBy ? (
        <p className="text-slate-400 mt-0.5 text-[11px]">Recorded by: {point.recordedBy}</p>
      ) : null}
    </ChartTooltipShell>
  );
}

export default function OfferingTrendChart({ records = [], loading = false }) {
  const layout = useChartLayout();
  const series = useMemo(() => buildOfferingTrendSeries(records), [records]);
  const hasEnoughData = hasSufficientOfferingTrendData(series);

  if (loading) return <ChartLoadingState />;

  if (!hasEnoughData) {
    return (
      <ChartEmptyState message="Insufficient data to display offering trends. Record at least two offerings to see this chart." />
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
      value: 'Amount (ZAR)',
      angle: -90,
      position: 'insideLeft',
      fill: CHART_COLORS.axisLabel,
      fontSize: layout.fontSize,
      style: { textAnchor: 'middle' },
    },
  };

  return (
    <ChartFigure
      title="Offering Trend Over Time"
      description="Line chart showing the offering amount for each recorded service date."
    >
      <div className="min-h-[240px] w-full">
        <ResponsiveContainer width="100%" height={layout.height}>
          <LineChart data={series} margin={CHART_MARGINS}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="serviceDateLabel" {...getResponsiveXAxisProps(layout, 'Service Date')} />
            <YAxis {...yAxisProps} />
            <Tooltip content={<OfferingTrendTooltip />} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke={CHART_COLORS.line}
              strokeWidth={2}
              dot={{ r: 4, fill: CHART_COLORS.line, stroke: '#1e293b', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: CHART_COLORS.line, stroke: '#e2e8f0', strokeWidth: 2 }}
              isAnimationActive
              animationDuration={600}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartFigure>
  );
}
