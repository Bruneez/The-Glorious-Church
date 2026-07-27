import { useState } from 'react';
import { Download } from 'lucide-react';
import {
  buildChartExportFileName,
  downloadChartAsPng,
} from '@/utils/chartExportUtils';

export default function DownloadChartButton({ targetRef, title, disabled = false }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (!targetRef?.current || disabled || isExporting) return;

    setIsExporting(true);

    try {
      await downloadChartAsPng(targetRef.current, buildChartExportFileName(title));
    } catch (error) {
      console.error('Failed to export chart:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={disabled || isExporting}
      data-chart-export-skip="true"
      aria-label={`Download ${title} graph`}
      className="inline-flex min-h-11 items-center gap-1.5 shrink-0 rounded-lg border border-slate-600/80 bg-slate-900/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-300 transition-colors hover:border-indigo-500/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      {isExporting ? 'Exporting…' : 'Download Graph'}
    </button>
  );
}
