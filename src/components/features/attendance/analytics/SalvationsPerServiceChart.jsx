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
  buildSalvationsPerServiceSeries,
  hasSalvationsPerServiceData,
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

function SalvationsPerServiceTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <ChartTooltipShell label={label}>
      <p className="mt-0.5" style={{ color: CHART_COLORS.salvations }}>
        Salvations: <span className="font-semibold">{payload[0].value}</span>
      </p>
    </ChartTooltipShell>
  );
}

export default function SalvationsPerServiceChart({ records = [], loading = false }) {
  const layout = useChartLayout();
  const series = useMemo(() => buildSalvationsPerServiceSeries(records), [records]);
  const hasData = hasSalvationsPerServiceData(series);

  if (loading) {
    return <ChartLoadingState />;
  }

  if (!hasData) {
    return <ChartEmptyState message="No salvation data available yet." />;
  }

  return (
    <ChartFigure
      title="Salvations Per Service"
      description="Line chart showing salvation totals recorded for each service."
    >
      <div className="min-h-[240px] w-full">
        <ResponsiveContainer width="100%" height={layout.height}>
          <LineChart data={series} margin={CHART_MARGINS}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="serviceDateLabel" {...getResponsiveXAxisProps(layout)} />
            <YAxis {...getResponsiveYAxisProps(layout, 'Salvations', 'salvations')} />
            <Tooltip content={<SalvationsPerServiceTooltip />} />
            <Line
              type="monotone"
              dataKey="salvations"
              stroke={CHART_COLORS.salvations}
              strokeWidth={2}
              dot={{ r: 4, fill: CHART_COLORS.salvations, stroke: '#1e293b', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: CHART_COLORS.salvations, stroke: '#e2e8f0', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartFigure>
  );
}
