export const CHART_EXPORT_BACKGROUND = '#0f172a';
export const CHART_EXPORT_PIXEL_RATIO = 3;

export function sanitizeChartFileName(title = 'chart') {
  return (
    String(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'chart'
  );
}

export function buildChartExportFileName(title, date = new Date()) {
  const slug = sanitizeChartFileName(title);
  const dateStamp = date.toISOString().slice(0, 10);
  return `tgc-${slug}-${dateStamp}.png`;
}

export function shouldSkipChartExportNode(node) {
  if (!node || typeof node !== 'object') return false;
  if (node.dataset?.chartExportSkip === 'true') return true;
  return node.classList?.contains('recharts-tooltip-wrapper');
}

export async function downloadChartAsPng(element, fileName) {
  if (!element) {
    throw new Error('Chart export target not found.');
  }

  const { toPng } = await import('html-to-image');

  const dataUrl = await toPng(element, {
    pixelRatio: CHART_EXPORT_PIXEL_RATIO,
    backgroundColor: CHART_EXPORT_BACKGROUND,
    cacheBust: true,
    filter: (node) => !shouldSkipChartExportNode(node),
  });

  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}
