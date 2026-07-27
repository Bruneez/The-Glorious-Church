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
  buildAttendanceTrendSeries,
  hasSufficientAttendanceTrendData,
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

function AttendanceTrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <ChartTooltipShell label={label}>
      <p className="text-indigo-400 mt-0.5">
        Total Attendance: <span className="font-semibold">{payload[0].value}</span>
      </p>
    </ChartTooltipShell>
  );
}

export default function AttendanceTrendChart({ records = [], loading = false }) {
  const layout = useChartLayout();
  const series = useMemo(() => buildAttendanceTrendSeries(records), [records]);
  const hasEnoughData = hasSufficientAttendanceTrendData(series);

  if (loading) {
    return <ChartLoadingState />;
  }

  if (!hasEnoughData) {
    return (
      <ChartEmptyState message="Insufficient data to display attendance trends. Record at least two services to see this chart." />
    );
  }

  return (
    <ChartFigure
      title="Attendance Trend Over Time"
      description="Line chart showing total attendance for each recorded service over time."
    >
      <div className="min-h-[240px] w-full">
        <ResponsiveContainer width="100%" height={layout.height}>
          <LineChart data={series} margin={CHART_MARGINS}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="serviceDateLabel" {...getResponsiveXAxisProps(layout)} />
            <YAxis {...getResponsiveYAxisProps(layout, 'Total Attendance', 'totalAttendance')} />
            <Tooltip content={<AttendanceTrendTooltip />} />
            <Line
              type="monotone"
              dataKey="totalAttendance"
              stroke={CHART_COLORS.line}
              strokeWidth={2}
              dot={{ r: 4, fill: CHART_COLORS.line, stroke: '#1e293b', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: CHART_COLORS.line, stroke: '#e2e8f0', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartFigure>
  );
}
