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
  buildVisitorGrowthSeries,
  hasVisitorGrowthData,
} from '@/config/attendanceAnalytics';
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
  getResponsiveYAxisProps,
} from '@/components/features/attendance/analytics/chartTheme';
import { useChartLayout } from '@/components/features/attendance/analytics/useChartLayout';

function VisitorGrowthTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <ChartTooltipShell label={label}>
      <p className="mt-0.5" style={{ color: CHART_COLORS.visitors }}>
        Visitors: <span className="font-semibold">{payload[0].value}</span>
      </p>
    </ChartTooltipShell>
  );
}

export default function VisitorGrowthChart({ records = [], loading = false }) {
  const layout = useChartLayout();
  const series = useMemo(() => buildVisitorGrowthSeries(records), [records]);
  const hasEnoughData = hasVisitorGrowthData(series);

  if (loading) {
    return <ChartLoadingState />;
  }

  if (!hasEnoughData) {
    return (
      <ChartEmptyState message="Insufficient data to display visitor growth. Record at least two services with visitor totals to see this chart." />
    );
  }

  return (
    <ChartFigure
      title="Visitor Growth"
      description="Line chart showing visitor totals for each recorded service over time."
    >
      <div className="min-h-[240px] w-full">
        <ResponsiveContainer width="100%" height={layout.height}>
          <LineChart data={series} margin={CHART_MARGINS}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="serviceDateLabel" {...getResponsiveXAxisProps(layout)} />
            <YAxis {...getResponsiveYAxisProps(layout, 'Visitors', 'visitors')} />
            <Tooltip content={<VisitorGrowthTooltip />} />
            <Line
              type="monotone"
              dataKey="visitors"
              stroke={CHART_COLORS.visitors}
              strokeWidth={2}
              dot={{ r: 4, fill: CHART_COLORS.visitors, stroke: '#1e293b', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: CHART_COLORS.visitors, stroke: '#e2e8f0', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartFigure>
  );
}
