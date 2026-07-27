import test from 'node:test';
import assert from 'node:assert/strict';
import { getChartLayout } from '../components/features/attendance/analytics/useChartLayout.js';

test('getChartLayout adapts axis and legend settings by viewport width', () => {
  const mobile = getChartLayout(390);
  const tablet = getChartLayout(768);
  const desktop = getChartLayout(1280);

  assert.equal(mobile.isMobile, true);
  assert.equal(mobile.xAxisAngle, -35);
  assert.equal(mobile.legendLayout, 'vertical');

  assert.equal(tablet.isTablet, true);
  assert.equal(tablet.xAxisAngle, -25);

  assert.equal(desktop.xAxisAngle, 0);
  assert.equal(desktop.legendLayout, 'horizontal');
  assert.ok(desktop.height >= mobile.height);
});
