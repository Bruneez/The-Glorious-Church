import { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import {
  buildAttendanceDistributionSeries,
  hasAttendanceDistributionData,
} from '@/config/attendanceAnalytics';
import {
  ChartEmptyState,
  ChartFigure,
  ChartLoadingState,
  ChartTooltipShell,
} from '@/components/features/attendance/analytics/chartStates';
import { CHART_COLORS } from '@/components/features/attendance/analytics/chartTheme';
import { useChartLayout } from '@/components/features/attendance/analytics/useChartLayout';

function AttendanceDistributionTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const { serviceDateLabel, totalAttendance, fill } = payload[0].payload;
  const percent = payload[0].percent ? Math.round(payload[0].percent * 100) : 0;

  return (
    <ChartTooltipShell label={serviceDateLabel}>
      <p className="mt-0.5" style={{ color: fill }}>
        Attendance: <span className="font-semibold">{totalAttendance}</span>
      </p>
      <p className="text-slate-400 mt-0.5">{percent}% of total</p>
    </ChartTooltipShell>
  );
}

function renderLegendText(value) {
  return <span className="text-slate-400">{value}</span>;
}

export default function AttendanceDistributionChart({ records = [], loading = false }) {
  const layout = useChartLayout();
  const series = useMemo(() => buildAttendanceDistributionSeries(records), [records]);
  const hasData = hasAttendanceDistributionData(series);

  if (loading) {
    return <ChartLoadingState />;
  }

  if (!hasData) {
    return (
      <ChartEmptyState message="No attendance distribution data yet. Record services with attendance totals to see this chart." />
    );
  }

  return (
    <ChartFigure
      title="Attendance Distribution"
      description="Pie chart showing how total attendance is distributed across recorded services."
    >
      <div className="min-h-[240px] w-full">
        <ResponsiveContainer width="100%" height={layout.height}>
          <PieChart>
            <Pie
              data={series}
              dataKey="totalAttendance"
              nameKey="serviceDateLabel"
              cx="50%"
              cy={layout.pieCenterY}
              innerRadius={0}
              outerRadius={layout.pieOuterRadius}
              paddingAngle={2}
              stroke="#1e293b"
              strokeWidth={2}
              isAnimationActive
              animationDuration={800}
            >
              {series.map((entry) => (
                <Cell key={entry.date} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<AttendanceDistributionTooltip />} />
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
