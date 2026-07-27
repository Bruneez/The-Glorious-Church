import ChartCard from '@/components/features/attendance/analytics/ChartCard';
import AttendanceTrendChart from '@/components/features/attendance/analytics/AttendanceTrendChart';
import AttendancePerServiceChart from '@/components/features/attendance/analytics/AttendancePerServiceChart';
import VisitorGrowthChart from '@/components/features/attendance/analytics/VisitorGrowthChart';
import SalvationsPerServiceChart from '@/components/features/attendance/analytics/SalvationsPerServiceChart';
import AttendanceDistributionChart from '@/components/features/attendance/analytics/AttendanceDistributionChart';

const DEPARTMENT_CHART_PLACEHOLDERS = [
  { title: 'Attendance Trend' },
  { title: 'Present vs Absent' },
  { title: 'Attendance Distribution' },
];

function ChartPlaceholder() {
  return (
    <div className="flex items-center justify-center min-h-[240px] rounded-lg border border-dashed border-slate-700/70 bg-slate-900/40">
      <p className="text-xs text-slate-500">Chart coming soon.</p>
    </div>
  );
}

export default function AttendanceAnalyticsSection({
  records = [],
  loading = false,
  viewMode = 'service',
}) {
  const chartPlaceholders =
    viewMode === 'department' ? DEPARTMENT_CHART_PLACEHOLDERS : [];

  return (
    <section className="space-y-4" aria-labelledby="attendance-analytics-heading">
      <div>
        <h2 id="attendance-analytics-heading" className="text-sm font-bold text-white tracking-wide">
          Attendance Analytics
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Visual insights into church attendance trends and statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {viewMode === 'service' ? (
          <>
            <ChartCard title="Attendance Trend">
              <AttendanceTrendChart records={records} loading={loading} />
            </ChartCard>
            <ChartCard title="Attendance Per Service">
              <AttendancePerServiceChart records={records} loading={loading} />
            </ChartCard>
            <ChartCard title="Visitor Growth">
              <VisitorGrowthChart records={records} loading={loading} />
            </ChartCard>
            <ChartCard title="Salvations Per Service">
              <SalvationsPerServiceChart records={records} loading={loading} />
            </ChartCard>
            <ChartCard title="Attendance Distribution">
              <AttendanceDistributionChart records={records} loading={loading} />
            </ChartCard>
          </>
        ) : (
          <ChartCard title={DEPARTMENT_CHART_PLACEHOLDERS[0].title}>
            <ChartPlaceholder />
          </ChartCard>
        )}

        {chartPlaceholders.map((chart) => (
          <ChartCard key={chart.title} title={chart.title}>
            <ChartPlaceholder />
          </ChartCard>
        ))}
      </div>
    </section>
  );
}
