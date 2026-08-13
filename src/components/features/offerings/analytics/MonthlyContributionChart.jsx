/**
 * MonthlyContributionChart.jsx
 *
 * Doughnut chart showing each month's percentage contribution to the
 * selected period total.
 * Shows month name, amount and percentage in the tooltip.
 * Empty months are excluded.
 * Zero-total guard: shows empty state when grandTotal is 0.
 */

import { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import {
  buildMonthlyContributionSeries,
  hasMonthlyContributionData,
} from '@/config/offeringsAnalytics';
import {
  ChartEmptyState,
  ChartFigure,
  ChartLoadingState,
  ChartTooltipShell,
} from '@/components/features/attendance/analytics/chartStates';
import { CHART_COLORS } from '@/components/features/attendance/analytics/chartTheme';
import { useChartLayout } from '@/components/features/attendance/analytics/useChartLayout';
import { formatCurrencySimple } from '@/utils/formatters';

function MonthlyContributionTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const slice = payload[0].payload;

  return (
    <ChartTooltipShell label={slice.monthFull}>
      <p className="font-semibold mt-0.5" style={{ color: slice.fill }}>
        {formatCurrencySimple(slice.total)}
      </p>
      <p className="text-slate-400 mt-0.5 text-[11px]">
        {slice.percentage.toFixed(1)}% of period total
      </p>
    </ChartTooltipShell>
  );
}

function renderLegendText(value) {
  return <span className="text-slate-400">{value}</span>;
}

export default function MonthlyContributionChart({ records = [], loading = false }) {
  const layout = useChartLayout();
  const series = useMemo(() => buildMonthlyContributionSeries(records), [records]);
  const hasData = hasMonthlyContributionData(series);

  if (loading) return <ChartLoadingState />;

  if (!hasData) {
    return (
      <ChartEmptyState message="No offering data is available for this period." />
    );
  }

  return (
    <ChartFigure
      title="Monthly Contribution"
      description="Doughnut chart showing each month's percentage share of the total offerings for the selected period."
    >
      <div className="min-h-[240px] w-full">
        <ResponsiveContainer width="100%" height={layout.height}>
          <PieChart>
            <Pie
              data={series}
              dataKey="total"
              nameKey="monthFull"
              cx="50%"
              cy={layout.pieCenterY}
              innerRadius={layout.pieOuterRadius * 0.5}
              outerRadius={layout.pieOuterRadius}
              paddingAngle={2}
              stroke="#1e293b"
              strokeWidth={2}
              isAnimationActive
              animationDuration={800}
            >
              {series.map((entry) => (
                <Cell key={entry.monthFull} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<MonthlyContributionTooltip />} />
            <Legend
              layout={layout.legendLayout}
              align={layout.legendAlign}
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={renderLegendText}
              wrapperStyle={{
                paddingTop: 12,
                fontSize: layout.fontSize,
                color: CHART_COLORS.axisLabel,
                maxHeight: layout.legendMaxHeight,
                overflowY: layout.legendMaxHeight ? 'auto' : 'visible',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartFigure>
  );
}
