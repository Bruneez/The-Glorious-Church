import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildChartExportFileName,
  CHART_EXPORT_PIXEL_RATIO,
  sanitizeChartFileName,
  shouldSkipChartExportNode,
} from './chartExportUtils.js';

test('sanitizeChartFileName creates filesystem-safe slugs', () => {
  assert.equal(sanitizeChartFileName('Attendance Per Service'), 'attendance-per-service');
  assert.equal(sanitizeChartFileName('Visitor Growth!!!'), 'visitor-growth');
  assert.equal(sanitizeChartFileName(''), 'chart');
});

test('buildChartExportFileName prefixes exports with date stamp', () => {
  const fileName = buildChartExportFileName('Attendance Trend', new Date('2026-07-27T12:00:00.000Z'));
  assert.equal(fileName, 'tgc-attendance-trend-2026-07-27.png');
});

test('chart export uses high-resolution pixel ratio', () => {
  assert.equal(CHART_EXPORT_PIXEL_RATIO, 3);
});

test('shouldSkipChartExportNode ignores export controls and live tooltips', () => {
  assert.equal(
    shouldSkipChartExportNode({ dataset: { chartExportSkip: 'true' }, classList: { contains: () => false } }),
    true,
  );
  assert.equal(
    shouldSkipChartExportNode({ dataset: {}, classList: { contains: (className) => className === 'recharts-tooltip-wrapper' } }),
    true,
  );
  assert.equal(
    shouldSkipChartExportNode({ dataset: {}, classList: { contains: () => false } }),
    false,
  );
});
