import { useRef } from 'react';
import DownloadChartButton from '@/components/features/attendance/analytics/DownloadChartButton';
import { CHART_EXPORT_BACKGROUND } from '@/utils/chartExportUtils';

export default function ChartCard({ title, children, disableDownload = false }) {
  const exportRef = useRef(null);

  return (
    <section className="bg-slate-800 rounded-xl border border-slate-700/70 p-4 md:p-5 space-y-4 h-full shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
        <h3 className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </h3>
        <DownloadChartButton targetRef={exportRef} title={title} disabled={disableDownload} />
      </div>

      <div
        ref={exportRef}
        data-chart-export="true"
        className="rounded-lg border border-slate-700/50 p-3 md:p-4"
        style={{ backgroundColor: CHART_EXPORT_BACKGROUND }}
      >
        {children}
      </div>
    </section>
  );
}
