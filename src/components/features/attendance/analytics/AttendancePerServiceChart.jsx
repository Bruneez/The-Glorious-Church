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
  buildAttendancePerServiceSeries,
  hasAttendancePerServiceData,
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

function AttendancePerServiceTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const barColor = payload[0]?.payload?.fill || CHART_COLORS.line;

  return (
    <ChartTooltipShell label={label}>
      <p className="mt-0.5 font-semibold" style={{ color: barColor }}>
        Attendance: {payload[0].value}
      </p>
    </ChartTooltipShell>
  );
}

export default function AttendancePerServiceChart({ records = [], loading = false }) {
  const layout = useChartLayout();
  const series = useMemo(() => buildAttendancePerServiceSeries(records), [records]);
  const hasData = hasAttendancePerServiceData(series);

  if (loading) {
    return <ChartLoadingState />;
  }

  if (!hasData) {
    return (
      <ChartEmptyState message="No service attendance records yet. Record a service to see attendance per service." />
    );
  }

  return (
    <ChartFigure
      title="Attendance Per Service"
      description="Bar chart showing total attendance for each recorded service."
    >
      <div className="min-h-[240px] w-full">
        <ResponsiveContainer width="100%" height={layout.height}>
          <BarChart data={series} margin={CHART_MARGINS}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="serviceDateLabel" {...getResponsiveXAxisProps(layout)} />
            <YAxis {...getResponsiveYAxisProps(layout, 'Total Attendance', 'totalAttendance')} />
            <Tooltip
              content={<AttendancePerServiceTooltip />}
              cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
            />
            <Bar
              dataKey="totalAttendance"
              radius={[6, 6, 0, 0]}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            >
              {series.map((entry) => (
                <Cell key={entry.date} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartFigure>
  );
}
